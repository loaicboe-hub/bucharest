import leafBg from "@/assets/leaf-bg.jpg.asset.json";

/** Soft dewy-leaf photo backdrop used across the main content sections.
 *  Uses a fixed background so the image stays subtle, scales cleanly and
 *  does not stretch or repeat as each section scrolls into view. */
export function SectionLeafBg({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 ${className}`}
      style={{ backgroundImage: `url(${leafBg.url})` }}
    >
      <div className="absolute inset-0 bg-background/85" />
    </div>
  );
}
