# Image Generation Workflow — Improvement Pitch

> **Status:** Proposal
> **Scope:** End-to-end — from user intent to finished ad in library
> **Target:** PostGini Content Agent V2

---

## Where We Are Today

The current pipeline is linear and mostly invisible to the user:

```
User clicks Generate
  → LangGraph: context_aggregator → creative_director → visual_engine
  → RunPod FLUX.1-schnell (parallel, 5 per batch)
  → Playwright overlay render
  → Supabase Storage upload
  → library_images row insert
  → Frontend Realtime push → grid appears
```

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

## Tier 3 — Longer Term, High Strategic Value

### 3.1 Style Locking Per Brand

**The idea:** Let users "lock" a template style per ad type for their brand — stored in `brands.style_preferences` JSON column. Every future generation for that brand automatically routes to the locked style, skipping the `_AD_TYPE_STYLE_MAP` defaults. Brands get visual consistency across campaigns without thinking about it.

---

### 3.2 A/B Scoring Pipeline

**The idea:** After rating images (the existing star-rating system), feed the ratings back into the LangGraph `creative_director` as few-shot examples: *"For this brand, Style 6 Lifestyle Card rated 5/5; Style 7 Neon Burst rated 2/5."* The director factors this into future prompt generation. Over time the system learns what works for each brand. No separate ML model needed — just retrieved context in the system prompt.

**Where to hook in:** `context_aggregator` node already receives brand context. Add a `brand_style_feedback` retrieval step that reads top-rated `image_feedback` rows for the brand.

---

### 3.3 Multi-Step Creative Brief Chat

**The idea:** Replace the single-textarea brief with a short 3-step guided chat before generation:

1. **Goal** — "What should this ad achieve?" (dropdown + free text)
2. **Audience** — "Who is seeing this?" (prefilled from brand context, editable)
3. **Hook** — "What's the one thing they should feel or do?" (free text)

Each answer becomes a structured input to `creative_director`, giving the LLM much richer signal than a one-line brief. The chat takes ~30 seconds but dramatically improves prompt quality without extra cost.

---

### 3.4 Automated Post-Scheduling from Generation

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
| 3.1 | Style locking per brand | Small | High (long-term) |
| 3.2 | A/B scoring pipeline | Large | High (long-term) |
| 3.3 | Multi-step creative brief chat | Medium | High (long-term) |
| 3.4 | Automated post-scheduling | Medium | High (long-term) |

---

## Recommended First Batch

If shipping one sprint, the highest return combination is:

1. **1.1 Style Preview** — zero backend cost, removes the biggest UX blindspot
2. **1.4 Per-format Selection** — cuts wasted generation in half for most users
3. **2.4 Prompt Streaming** — makes the wait feel alive and builds trust in the AI

All three are frontend-heavy with minimal backend surface area and can be shipped independently.
