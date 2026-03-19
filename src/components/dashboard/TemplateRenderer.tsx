"use client";

import { forwardRef } from "react";
import type { ImageFormat } from "@/components/dashboard/templates";

// Full pixel dimensions per Instagram format.
// These match the values expected by html2canvas in useTemplateExport.
const FORMAT_DIMENSIONS: Record<ImageFormat, { w: number; h: number }> = {
  feed_4_5: { w: 1080, h: 1350 }, // 4:5  portrait feed post
  feed:     { w: 1080, h: 1080 }, // 1:1  square feed post
  stories:  { w: 1080, h: 1920 }, // 9:16 Stories / Reels cover
};

interface TemplateRendererProps {
  /** Target Instagram format — determines the pixel canvas size. */
  format: ImageFormat;
  /** The fully-hydrated template component to capture. */
  children: React.ReactNode;
}

/**
 * Renders children at full Instagram resolution inside a visually hidden,
 * off-screen container. Attach the forwarded ref and pass `ref.current` to
 * `exportTemplate()` from `useTemplateExport`.
 *
 * Why off-screen instead of display:none or visibility:hidden?
 * html2canvas requires the element to be part of the DOM layout so that
 * computed styles (fonts, positioning, gradients) are resolved correctly.
 * Hiding via `display:none` removes it from layout; `visibility:hidden`
 * keeps layout but can interfere with some CSS backgrounds. Positioning at
 * (-9999px, -9999px) keeps the element in the paint tree while preventing
 * it from appearing in the viewport.
 *
 * Usage:
 *   const rendererRef = useRef<HTMLDivElement>(null);
 *
 *   <TemplateRenderer ref={rendererRef} format="feed_4_5">
 *     <AwarenessVariation1 {...templateProps} />
 *   </TemplateRenderer>
 *
 *   // Then to export:
 *   await exportTemplate(rendererRef.current!, variationId, "feed_4_5", label);
 */
export const TemplateRenderer = forwardRef<HTMLDivElement, TemplateRendererProps>(
  function TemplateRenderer({ format, children }, ref) {
    const { w, h } = FORMAT_DIMENSIONS[format];

    return (
      <div
        ref={ref}
        aria-hidden="true"
        style={{
          // Keep in layout so computed styles resolve, but never visible.
          position: "fixed",
          top: "-9999px",
          left: "-9999px",
          // Exact pixel dimensions — no scaling needed before canvas capture.
          width: `${w}px`,
          height: `${h}px`,
          overflow: "hidden",
          // Prevent accidental user interaction with the hidden element.
          pointerEvents: "none",
          // Sit behind everything to avoid any z-index stacking conflicts.
          zIndex: -1,
        }}
      >
        {children}
      </div>
    );
  },
);
