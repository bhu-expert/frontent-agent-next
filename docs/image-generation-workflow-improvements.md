# Image Generation Workflow — Improvement Pitch

> **Status:** Proposal
> **Scope:** End-to-end — from user intent to finished ad in library
> **Target:** PostGini Content Agent V2

---

## Where We Are Today

The current pipeline is queue-based and mostly invisible to the user:

```
── PHASE 1: LLM (synchronous, returns immediately) ────────────────────────────

[API] POST /agent/ad-ideate  (standard ads)
  → IdeationAgent.generate_ad_variations()
      ├─ fetch_brand_manifest(brand_id)              [LRU cache, 5min TTL]
      ├─ Read Brand/{name}/brand_identities.md       [file on disk; falls back to manifest]
      │    → extract selected_context for context_index
      ├─ get_palette_for_context(brand_id, context_index)   [Supabase query]
      ├─ LLM: Gemini-2.5-Flash (temp=0.8) with structured output → AdVariationsResponse
      │    → runs all ad_types concurrently via asyncio.gather
      │    → 5 ad_types × 5 variations = 25 jobs per context_index
      └─ write_jobs() → generation_jobs.insert() [25 rows, status='queued',
                                                  batch_key='z-turbo|1024x1024']

[API] POST /agent/carousel/generate  (carousel ads)
  → CarouselAgent.generate()
      ├─ fetch_brand_manifest(brand_id)
      ├─ get_palette_for_context(brand_id, context_index)
      ├─ LLM: Gemini-2.5-Flash with structured output
      │    → 3 variations × 5 slides = 15 jobs
      └─ write_jobs() → generation_jobs.insert() [15 rows, status='queued']

Response to frontend: { status: "queued", campaign_id, total, variations_data }


── PHASE 2: Frontend subscribes ────────────────────────────────────────────────

[Frontend] useCampaignPolling.addCampaign(tracker)
  → Open Supabase Realtime channel: jobs:{campaign_id}
  → Subscribe to postgres_changes on generation_jobs WHERE campaign_id=...
  → Fallback: if Realtime stalls >60s → REST poll GET /campaigns/{id}/status


── PHASE 3: Queue dispatch (APScheduler, every 3 seconds) ──────────────────────

[Scheduler] dispatch_pending_jobs()
  → Query: generation_jobs WHERE status='queued'
            AND (retry_after IS NULL OR retry_after <= now)
            ORDER BY created_at ASC  LIMIT 20
  → Group by batch_key, take first BATCH_SIZE=5 jobs from oldest batch_key
  → UPDATE status='running', started_at=now()  [atomic mark]

  → For each job: rewrite_prompt(job.prompt)
      ├─ Fix fusion patterns (e.g. "dog in bathtub" → "dog beside a bathtub")
      ├─ Inject separation language for multi-subject prompts
      └─ Append realism suffix: "photorealistic, natural lighting, sharp focus..."

  → generate_image_batch(jobs) → generate_image_batch_turbo(jobs)
      └─ asyncio.gather(*[generate_one_image_turbo(...) for job in jobs])
           └─ _call_runpod_async(payload)
                POST https://api.runpod.ai/v2/{RUNPOD_Z_TURBO_ENDPOINT_ID}/runsync
                Headers: Authorization: Bearer {RUNPOD_API_KEY}
                Body:    { "input": { "prompt":                <rewritten prompt>,
                                      "size":                  "1024*1024",
                                      "seed":                  -1,
                                      "output_format":         "png",
                                      "enable_safety_checker": true } }

                ├─ status=COMPLETED → return output   [{"cost": 0.005, "result": "https://image.runpod.ai/..."}]
                └─ status=IN_PROGRESS → poll /status/{job_id} every 3s (max 90s total)

           → _extract_image_url(output) → hosted PNG URL (7-day TTL)
           → _download_and_convert_to_webp(url)   [httpx GET → Pillow PNG→WebP quality=90]
           → _upload_to_supabase(webp_bytes, variation_id)
                PUT {SUPABASE_URL}/storage/v1/object/ad-images/ads/{variation_id}.webp
                Returns: public URL

  On success:
    UPDATE generation_jobs SET status='complete', image_url=<supabase_url>, finished_at=now()
    asyncio.create_task(_render_overlay_task(client, full_job))   ← fire-and-forget

  On failure (url is None):
    attempt_count++
    if attempt_count < 5:  UPDATE status='queued', retry_after=now+delay
                           delay: 20s (attempts 1-2), 60s (attempt 3), 120s (attempt 4+)
    else:                  UPDATE status='failed', finished_at=now()  [permanent]


── PHASE 4: Overlay render (fire-and-forget, runs after each successful job) ───

[_render_overlay_task]
  → Fetch brands.logo_url for brand_id  [Supabase query]
  → Inject logo_url into job.variation_data

  → render_and_save_overlay(job)
      If ad_type == "carousel":
        render_carousel_slide_html(...)  viewport: 1080×1080
      Else:
        fmt = FORMAT_BY_VARIATION[variation_index]
            # variation_index 1→feed_4_5, 2→feed_16_9, 3→story_9_16, 4→feed, 5→feed_4_5
        w, h = DIMENSIONS[fmt]
        render_ad_html(image_url, headline, subheadline, cta_text,
                       brand_name, colors, body_text, fmt, logo_url, ...)

      Playwright Chromium (--no-sandbox --disable-gpu):
        browser.new_page(viewport={w, h})
        page.set_content(html, wait_until="networkidle", timeout=8000ms)
        page.wait_for_timeout(1500ms)                   ← settle fonts/images
        page.screenshot(type="png", clip={0,0,w,h})
        browser.close()

      PIL: PNG bytes → WebP (quality=88)

      PUT {SUPABASE_URL}/storage/v1/object/ad-images/ads/{campaign_id}-{variation_id}_overlay.webp

  → UPDATE generation_jobs SET overlay_url=<overlay_url>
  → INSERT library_images { user_id, storage_path, external_url, format, label }
       format: "feed" for carousel, FORMAT_BY_VARIATION[variation_index] for others
       label:  e.g. "Awareness · Feed 4 5" or "Carousel · Slide 3"


── PHASE 5: Frontend completion ────────────────────────────────────────────────

[Supabase Realtime] DB UPDATE on generation_jobs → postgres_changes event
  → useCampaignPolling: update Map<variation_id → status>
  → recalculate complete_count / total
  → when all jobs done: finaliseCampaign()
      → getCampaignAssets(campaign_id)  [GET /campaigns/{id}/assets]
      → close Realtime channel
      → render grid
```

**Parallelism:** Scheduler max 4 concurrent instances × BATCH_SIZE 5 = up to 20 images in flight. All 5 jobs in a batch run via `asyncio.gather` (non-blocking HTTP).

**Retry:** 5 attempts max. Backoff: 20s → 20s → 60s → 120s. After 5 failures: permanent `failed`.

**Key files:**
| Component | File |
|---|---|
| LLM + job creation | `app/agent/ideation_agent.py` |
| Carousel agent | `app/agent/carousel_agent.py` |
| Prompt rewriter | `app/utils/prompt_rewriter.py` |
| RunPod Z-Image-Turbo client | `app/utils/runpod_image_client.py` |
| Queue dispatcher | `app/services/job_queue_service.py` |
| Scheduler (APScheduler) | `app/services/scheduler.py` |
| Playwright overlay | `app/services/overlay_service.py` |
| Frontend Realtime hook | `src/hooks/useCampaignPolling.ts` |

It works. But every step is a black box. The user submits a brief, waits, and either gets ads or doesn't — with no way to steer, preview, or recover mid-flight.

The proposals below are grouped by impact tier. Each one is independent and can be shipped on its own.

---

## Tier 1 — High Impact, Relatively Contained

### 1.1 Pre-Generation Style Preview

**The problem:** Users pick an ad type (Awareness, Launch, etc.) but have no idea what the output will look like until it's done generating.

**The idea:** Before hitting Generate, show a static mockup of the template style that will be used for each selected ad type. Pull the HTML template directly (`render_ad_html` with placeholder content) and render it as a `<iframe>` or screenshot inline. Zero AI cost — purely deterministic.

**Result:** Users pick the right template on the first try instead of regenerating. Removes the biggest source of wasted generation credits.

---

### 1.2 Variation Rejection Before Overlay

**The problem:** Playwright overlay rendering (the slowest step — ~3–8s per image) runs unconditionally on every generated image, even bad ones.

**The idea:** After the raw AI image is generated and uploaded, show it to the user for a 10-second "quick approval" step before overlay rendering begins. A simple thumbs-up / skip UI. Rejected images skip Playwright entirely — saving ~4s and storage per image. Approved images proceed to overlay.

```
RunPod → raw image → Quick Approval UI (10s window)
    ├── Approved → Playwright overlay → library
    └── Rejected → mark job as skipped, no overlay cost
```

**Backend change:** Add a `status = "pending_approval"` state in `generation_jobs`. A new `/approve` endpoint flips it to `"overlay_queued"`.

---

### 1.3 Prompt Refinement Loop

**The problem:** The user brief travels through `context_aggregator → creative_director → visual_engine` and becomes a FLUX prompt with no visibility. If the brief is vague, the prompt is vague.

**The idea:** Before dispatching to RunPod, expose the generated FLUX prompt to the user in a collapsible "Prompt Preview" panel. Let them edit it inline. One click to regenerate with the refined prompt. Costs one extra LLM call but saves a full RunPod generation cycle if the original prompt was off.

**Where to hook in:** `visual_engine` node in `image_agent.py` already produces the final prompt string. Return it in the campaign creation response alongside `campaign_id`, then display it in the ContentTab before dispatching.

---

### 1.4 Per-Format Selective Generation

**The problem:** Every campaign generates all 5 formats (feed 4:5, feed 1:1, stories 9:16, etc.) regardless of which platforms the user actually posts on. That's 5× the cost for a user who only posts Stories.

**The idea:** Add a format selector in the ContentTab — checkboxes for `Feed 4:5`, `Feed 1:1`, `Stories`. Only selected formats are queued. The `FORMAT_BY_VARIATION` mapping already controls this — just expose it to the user.

**Backend change:** Accept a `formats: string[]` field in the `AdVariationsPayload`. Filter `variation_index` values accordingly in `job_queue_service`.

---

## Tier 2 — Strong UX, Moderate Complexity

### 2.1 Generation History & Re-Run

**The problem:** Once a generation batch is gone from the active session, it's effectively lost. Users can't reproduce a good result or go back to a previous style.

**The idea:** A "History" tab (or collapsible sidebar) that lists all past campaigns with their ad type, date, and a thumbnail of the first asset. Each entry has a "Re-run" button that pre-fills the ContentTab with the same brief, context, and template — so the user can iterate from a known good state.

**Backend:** `listCampaigns` already returns all campaigns. The brief is stored in `generation_jobs.variation_data`. Surface it.

---

### 2.2 Seed Image Upload

**The problem:** FLUX generates from pure text. Users who have existing product photos or brand visuals can't use them as a starting point.

**The idea:** Add an optional "Seed Image" uploader to the ContentTab. The uploaded image is passed to RunPod as `image_url` (FLUX supports image-to-image with a strength parameter). The AI uses it as a compositional anchor while still applying the brand brief.

**UX:** Small drag-drop zone beneath the brief textarea. Toggle between "AI-generated background" and "Use my image."

**Backend:** `generate_one_image_turbo` in `runpod_image_client.py` already sends a JSON payload — add `init_image` and `strength` fields when a seed is provided.

---

### 2.3 Batch Size & Quality Control

**The problem:** All generations run at a fixed quality setting (FLUX.1-schnell, implicit step count). There's no way to trade speed for quality.

**The idea:** Expose a simple "Fast / Balanced / Quality" toggle in the ContentTab.

| Mode | Model | Steps | Cost |
|---|---|---|---|
| Fast | FLUX.1-schnell | 4 | Current |
| Balanced | FLUX.1-schnell | 8 | ~2× |
| Quality | FLUX.1-dev | 20 | ~5× |

The mode is passed into the RunPod payload. The UI makes the tradeoff transparent.

---

### 2.4 Real-Time Prompt Streaming in the Banner

**The problem:** During generation the banner just shows "Generating Assets" with a spinner. The user has no idea what the AI is actually creating.

**The idea:** Stream the FLUX prompt for each variation into the banner as it's produced by `visual_engine`. Show it as a one-line ticker: *"Crafting: Bold lifestyle shot of [brand] product with warm tones…"*

**Backend:** The backend already uses `StreamingResponse` for SSE. Add a `prompt_ready` event to the existing campaign SSE stream (or push via Realtime on a `generation_prompts` table row insert).

**Frontend:** Subscribe to `generation_prompts` Realtime channel — same pattern as `generation_jobs`.

---

## Tier 3 — Image Editing & Post-Generation Controls

### 3.1 Background Removal / Replacement

**The problem:** Generated images sometimes have cluttered or off-brand backgrounds that would otherwise be discarded.

**The idea:** Add a one-click "Remove Background" action on each image in the library grid. Backend calls the RunPod endpoint with a `remove_background` post-processing flag (or a dedicated rembg/Photoroom worker). Then offer a "Replace Background" panel with a secondary text prompt — generate a new background and composite it back.

**Backend change:** New `/images/{variation_id}/edit` endpoint. Accepts `action: "remove_bg" | "replace_bg"` + optional `bg_prompt`. Returns a new `variation_id` with the edited image, preserving the original.

---

### 3.2 Image-to-Image Refinement (img2img)

**The problem:** Z-Image-Turbo runs text-to-image only. There's no way to use an existing result as a starting point — good composition gets thrown away on every re-run.

**The idea:** Add a "Refine" button on each generated image. It opens an inline panel with a new prompt field and a `strength` slider (0.3 = subtle tweak, 0.9 = near-total replacement). The selected image is passed as `init_image` in the RunPod payload alongside the new prompt.

**Note:** Z-Image-Turbo's current input schema (`prompt`, `size`, `seed`, `output_format`, `enable_safety_checker`) does not include `init_image`. This may require switching to FLUX.1-dev (img2img-capable) or a separate RunPod worker for the refine path only.

---

### 3.3 Inpainting — Edit a Region

**The problem:** Users want to swap out one element (a background, a product area, text region) without regenerating the entire image.

**The idea:** Click "Edit Region" on a library image to open a canvas overlay. User paints a mask with a brush. The mask + original image + a replacement prompt are sent to an inpainting worker (FLUX Fill or SD Inpaint). The result replaces only the masked area.

**Backend change:** New `/images/{variation_id}/inpaint` endpoint. Accepts `mask_base64` and `inpaint_prompt`. Fires a separate RunPod inpainting worker, uploads result to Supabase, inserts as a new `library_images` row linked to the parent variation.

---

### 3.4 Text-to-Video Generation

**The problem:** Reels and video ads are the highest-performing format on Instagram and TikTok, but PostGini only produces static images. Users have to leave the platform to make video.

**The idea:** Add a "Generate Video" option alongside the existing ad types. Takes the same brand brief + selected style and produces a short (5–10s) video clip. Candidate APIs:

| Provider | Model | Strength | Latency |
|---|---|---|---|
| Runway Gen-4 Turbo | text-to-video | Strong motion, brand-safe | ~30s |
| Kling v2 | text-to-video + img2video | High quality, 10s clips | ~45s |
| Luma Ray 2 | text-to-video | Cinematic, fast | ~20s |
| Pika 2.1 | text-to-video + effects | Easy to steer | ~25s |

**Recommended starting point:** Kling v2 via RunPod — matches the existing RunPod infrastructure, no new vendor auth.

**Pipeline change:** New `video_jobs` table (mirrors `generation_jobs` but adds `duration`, `fps`, `video_url`). New `VideoAgent` that calls `visual_engine` for a video-optimised motion prompt, then dispatches to a `runpod_video_client`. Overlay rendering skips Playwright — text is composited via ffmpeg `drawtext` filter instead.

**Frontend change:** New "Video" tab in ContentTab. Library grid shows video thumbnails with a play button. Export as MP4 or GIF.

---

### 3.5 Animate Still Images (img-to-video)

**The problem:** Users already have great static ads but want to add motion for Stories/Reels without generating from scratch.

**The idea:** "Animate" button on any library image. Sends it to Kling or Runway as `init_image` with a motion prompt (e.g., "gentle product rotation, light bokeh drift"). Returns a 3–5s loop. No new creative brief required — the visual is already approved.

**Backend change:** `/images/{variation_id}/animate` endpoint. Accepts optional `motion_prompt`. Feeds the Supabase WebP URL as `init_image` into the video worker. Result stored in a new `video_url` column on `library_images`.

---

## Tier 4 — Longer Term, High Strategic Value

### 4.1 Style Locking Per Brand

**The idea:** Let users "lock" a template style per ad type for their brand — stored in `brands.style_preferences` JSON column. Every future generation for that brand automatically routes to the locked style, skipping the `_AD_TYPE_STYLE_MAP` defaults. Brands get visual consistency across campaigns without thinking about it.

---

### 4.2 A/B Scoring Pipeline

**The idea:** After rating images (the existing star-rating system), feed the ratings back into the LangGraph `creative_director` as few-shot examples: *"For this brand, Style 6 Lifestyle Card rated 5/5; Style 7 Neon Burst rated 2/5."* The director factors this into future prompt generation. Over time the system learns what works for each brand. No separate ML model needed — just retrieved context in the system prompt.

**Where to hook in:** `context_aggregator` node already receives brand context. Add a `brand_style_feedback` retrieval step that reads top-rated `image_feedback` rows for the brand.

---

### 4.3 Multi-Step Creative Brief Chat

**The idea:** Replace the single-textarea brief with a short 3-step guided chat before generation:

1. **Goal** — "What should this ad achieve?" (dropdown + free text)
2. **Audience** — "Who is seeing this?" (prefilled from brand context, editable)
3. **Hook** — "What's the one thing they should feel or do?" (free text)

Each answer becomes a structured input to `creative_director`, giving the LLM much richer signal than a one-line brief. The chat takes ~30 seconds but dramatically improves prompt quality without extra cost.

---

### 4.4 Automated Post-Scheduling from Generation

**The idea:** At the end of a generation batch, offer a "Schedule" CTA directly in the "All Assets Ready" banner. One click opens a scheduling modal pre-populated with the generated images in a recommended posting cadence (e.g., one per day over the next week). Posts to the connected Instagram account via the existing `/api/integrations/instagram/schedule` endpoint.

Ties generation directly to distribution — closes the loop from brief to live post in a single session.

---

## Quick-Win Summary

| ID | Idea | Effort | Impact |
|---|---|---|---|
| 1.1 | Pre-generation style preview | Small | High |
| 1.4 | Per-format selective generation | Small | High |
| 1.3 | Prompt refinement loop | Medium | High |
| 1.2 | Variation rejection before overlay | Medium | High |
| 2.4 | Real-time prompt streaming in banner | Small | Medium |
| 2.1 | Generation history & re-run | Medium | Medium |
| 2.2 | Seed image upload | Medium | Medium |
| 2.3 | Batch quality toggle | Small | Medium |
| 3.1 | Background removal / replacement | Medium | High |
| 3.2 | Image-to-image refinement (img2img) | Medium | High |
| 3.3 | Inpainting — edit a region | Large | High |
| 3.4 | Text-to-video generation | Large | Very High |
| 3.5 | Animate still images (img-to-video) | Medium | Very High |
| 4.1 | Style locking per brand | Small | High (long-term) |
| 4.2 | A/B scoring pipeline | Large | High (long-term) |
| 4.3 | Multi-step creative brief chat | Medium | High (long-term) |
| 4.4 | Automated post-scheduling | Medium | High (long-term) |

---

## Recommended First Batch

**Sprint 1 — Visibility & Waste Reduction** (frontend-heavy, low risk):
1. **1.1 Style Preview** — zero backend cost, removes the biggest UX blind spot
2. **1.4 Per-format Selection** — cuts wasted generation in half for most users
3. **2.4 Prompt Streaming** — makes the wait feel alive and builds trust in the AI

**Sprint 2 — Post-Generation Editing** (new backend endpoints, moderate risk):
1. **3.1 Background Removal** — highest utility per effort; reuses existing Supabase storage path
2. **3.2 img2img Refinement** — dramatically reduces full-regeneration cycles
3. **2.1 History & Re-run** — no new infrastructure, just surfacing existing `generation_jobs` data

**Sprint 3 — Video** (new infrastructure, high payoff):
1. **3.5 Animate Still Images** — lowest-effort video entry point; no new creative flow needed
2. **3.4 Text-to-Video** — full video generation; mirrors existing queue architecture with a `video_jobs` table

All items within a sprint are independent and can be shipped individually.
