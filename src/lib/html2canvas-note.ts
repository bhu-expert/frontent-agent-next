/**
 * html2canvas — client-side DOM-to-canvas rendering
 *
 * Used by `useTemplateExport` to capture a rendered template component as a
 * bitmap before uploading to Supabase Storage.
 *
 * Installation
 * ------------
 *   npm install html2canvas
 *   npm install -D @types/html2canvas
 *
 * The import is intentionally dynamic (`await import("html2canvas")`) inside
 * the hook so that html2canvas is code-split into a separate chunk and never
 * included in the initial page bundle.
 *
 * Known limitations
 * -----------------
 * - External images must be served with CORS headers (Access-Control-Allow-Origin)
 *   for useCORS:true to work. Images without CORS support will be omitted from
 *   the capture unless allowTaint:true is set (which taints the canvas and
 *   prevents toBlob from running).
 * - CSS features with limited html2canvas support: CSS Grid subgrid,
 *   mix-blend-mode on some browsers, SVG filters. Test thoroughly if templates
 *   use these features.
 * - The element must be in the DOM layout (not display:none) at capture time.
 *   TemplateRenderer handles this by positioning the element off-screen.
 */
