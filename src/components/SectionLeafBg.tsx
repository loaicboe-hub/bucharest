import pharaonicBg from "@/assets/pharaonic-bg.jpg";

/** Colorful Ancient Egyptian Agricultural & Temple Mural Backdrop.
 *  Clearly displays vivid green date palms, ripe red pomegranates, purple grapes,
 *  turquoise-blue Nile waters, papyrus reeds, and grand painted temple columns. */
export function SectionLeafBg({
  className = "",
  opacity = "opacity-[0.40] sm:opacity-[0.48]",
}: {
  className?: string;
  opacity?: string;
}) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      <div
        className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-300 ${opacity}`}
        style={{
          backgroundImage: `url(${pharaonicBg})`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-transparent to-background/40" />
    </div>
  );
}
