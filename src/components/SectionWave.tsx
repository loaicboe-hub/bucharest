type SectionWaveProps = {
  /** "top" sits at the section's top edge, "bottom" flips it to the bottom edge */
  position?: "top" | "bottom";
  /** Use a soft dark-slate -> mint vertical gradient instead of the flat mint tint */
  gradient?: boolean;
  className?: string;
};

/**
 * Soft pastel-mint wave separator used between page sections.
 * Purely decorative — hidden from assistive tech.
 */
export function SectionWave({
  position = "top",
  gradient = false,
  className = "",
}: SectionWaveProps) {
  const id = `wave-grad-${position}-${gradient ? "g" : "f"}`;
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-x-0 z-0 leading-[0] ${
        position === "top" ? "top-0" : "bottom-0 rotate-180"
      } ${className}`}
    >
      <svg
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        className="block h-[60px] w-full md:h-[90px]"
      >
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              stopColor={
                gradient ? "var(--wave-slate)" : "var(--mint)"
              }
            />
            <stop offset="100%" stopColor="var(--mint)" />
          </linearGradient>
        </defs>
        <path
          fill={`url(#${id})`}
          d="M0,32 C240,96 480,0 720,32 C960,64 1200,112 1440,64 L1440,0 L0,0 Z"
        />
      </svg>
    </div>
  );
}

export default SectionWave;
