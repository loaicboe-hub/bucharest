import pharaonicBg from "@/assets/pharaonic-bg.jpg";

/** Colorful Ancient Egyptian Agricultural & Temple Mural Backdrop.
 *  Clearly displays vivid green date palms, ripe red pomegranates, purple grapes,
 *  turquoise-blue Nile waters, papyrus reeds, and grand painted temple columns. */
export function SectionLeafBg({
  className = "",
  opacity = "opacity-[0.18] sm:opacity-[0.22]",
  darken = false,
}: {
  className?: string;
  opacity?: string;
  darken?: boolean;
}) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${darken ? "bg-stone-950" : ""} ${className}`}
    >
      <div
        className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-300 ${opacity}`}
        style={{
          backgroundImage: `url(${pharaonicBg})`,
          ...(darken ? { filter: "brightness(0.5)" } : {}),
        }}
      />
      {darken ? (
        <div className="absolute inset-0 bg-black/50" />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-b from-background/45 via-transparent to-background/50" />
      )}
    </div>
  );
}
