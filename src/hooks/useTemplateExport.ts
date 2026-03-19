"use client";

import { useCallback, useState } from "react";
import { supabase } from "@/lib/supabase";

export type ExportStatus = "idle" | "capturing" | "uploading" | "done" | "error";

interface ExportResult {
  publicUrl: string;
  storagePath: string;
}

/**
 * Hook for capturing a rendered React component as an image and persisting it
 * to Supabase Storage + the library_images table.
 *
 * Lifecycle:
 *   idle -> capturing -> uploading -> done
 *                    \-> error (at any stage)
 *
 * Usage:
 *   const { exportTemplate, status, error, reset } = useTemplateExport();
 *   const result = await exportTemplate(divRef.current!, variationId, "feed_4_5", "Awareness - Layout 1");
 */
export function useTemplateExport() {
  const [status, setStatus] = useState<ExportStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  /**
   * Captures a DOM element as an image and uploads it to Supabase.
   *
   * @param el          - The DOM element containing the rendered template.
   *                      Pass the ref's `.current` value; the element must be
   *                      mounted and visible (or positioned off-screen via
   *                      TemplateRenderer) at the time of the call.
   * @param variationId - Unique ID for this variation, used as the filename.
   *                      Should be stable across re-renders (e.g. a UUID or
   *                      a deterministic slug like "awareness-1").
   * @param format      - Target Instagram format:
   *                        "feed_4_5" => 1080x1350
   *                        "feed"     => 1080x1080
   *                        "stories"  => 1080x1920
   * @param label       - Optional human-readable label stored in the DB
   *                      (e.g. "Awareness - Layout 1").
   * @returns           `{ publicUrl, storagePath }` on success, `null` on error.
   */
  const exportTemplate = useCallback(
    async (
      el: HTMLElement,
      variationId: string,
      format: "feed_4_5" | "feed" | "stories",
      label?: string,
    ): Promise<ExportResult | null> => {
      setStatus("capturing");
      setError(null);

      try {
        // Dynamic import: keeps html2canvas out of the initial JS bundle.
        const html2canvas = (await import("html2canvas")).default;

        const canvas = await html2canvas(el, {
          useCORS: true,       // Fetch cross-origin images via CORS headers
          allowTaint: false,   // Reject tainted canvases to avoid security errors
          scale: 1,            // Element is already rendered at export resolution
          logging: false,
          backgroundColor: null, // Preserve transparent backgrounds
          imageTimeout: 15000,
        });

        // Prefer WebP for smaller file sizes; html2canvas always produces a
        // valid canvas so toBlob should not fail, but we handle the null case.
        const blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob(
            (b) =>
              b
                ? resolve(b)
                : reject(new Error("Canvas.toBlob returned null — browser may not support WebP")),
            "image/webp",
            0.92,
          );
        });

        setStatus("uploading");

        // Require an authenticated session before touching storage.
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        // Storage path: ad-images/{userId}/{format}/{variationId}.webp
        // Using upsert so re-exporting the same variation overwrites cleanly.
        const storagePath = `${user.id}/${format}/${variationId}.webp`;

        const { error: uploadError } = await supabase.storage
          .from("ad-images")
          .upload(storagePath, blob, {
            contentType: "image/webp",
            upsert: true,
          });

        if (uploadError) throw uploadError;

        // Derive the public URL from the storage path (no network call).
        const {
          data: { publicUrl },
        } = supabase.storage.from("ad-images").getPublicUrl(storagePath);

        // Persist metadata. onConflict on storage_path acts as an upsert so
        // repeated exports of the same variation update rather than duplicate.
        const { error: dbError } = await supabase.from("library_images").upsert(
          {
            user_id: user.id,
            storage_path: storagePath,
            external_url: publicUrl,
            format,
            label: label ?? null,
          },
          { onConflict: "storage_path" },
        );

        if (dbError) throw dbError;

        setStatus("done");
        return { publicUrl, storagePath };
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Export failed";
        setError(msg);
        setStatus("error");
        console.error("[useTemplateExport]", err);
        return null;
      }
    },
    [],
  );

  /** Resets status and error back to idle so the hook can be reused. */
  const reset = useCallback(() => {
    setStatus("idle");
    setError(null);
  }, []);

  return { exportTemplate, status, error, reset };
}
