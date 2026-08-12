import leafBg from "@/assets/leaf-bg.jpg.asset.json";

/** Soft dewy-leaf photo backdrop used across the main content sections. */
export function SectionLeafBg({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 ${className}`}>
      <img
        src={leafBg.url}
        alt=""
        loading="lazy"
        className="h-full w-full object-cover opacity-40"
      />
      <div className="absolute inset-0 bg-background/70" />
    </div>
  );
}
