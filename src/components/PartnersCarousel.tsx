import { useEffect, useState } from "react";
import { loadPartners, PARTNERS_EVENT, type Partner } from "@/lib/admin-partners";

export function PartnersCarousel({ title, subtitle }: { title: string; subtitle?: string }) {
  const [partners, setPartners] = useState<Partner[]>([]);

  useEffect(() => {
    const sync = () => setPartners(loadPartners().filter((p) => p.enabled && p.logo));
    sync();
    window.addEventListener(PARTNERS_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(PARTNERS_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  if (partners.length === 0) return null;

  // Duplicate the list so the -50% translate loop is seamless.
  const loop = [...partners, ...partners];

  return (
    <section id="partners" className="border-t border-border/60 bg-background py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{title}</h2>
          {subtitle && <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">{subtitle}</p>}
        </div>
      </div>

      <div className="group relative mt-10 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
        <div
          className="flex w-max items-center gap-10 sm:gap-14 group-hover:[animation-play-state:paused] motion-reduce:animate-none"
          style={{ animation: `partners-marquee ${Math.max(18, partners.length * 6)}s linear infinite` }}
        >
          {loop.map((p, i) => {
            const img = (
              <img
                src={p.logo}
                alt={p.name ? `${p.name} logo` : "Partner logo"}
                loading="lazy"
                className="h-14 w-36 object-contain opacity-70 grayscale transition duration-300 hover:opacity-100 hover:grayscale-0 sm:h-16 sm:w-44"
              />
            );
            return (
              <div key={`${p.id}-${i}`} className="shrink-0" aria-hidden={i >= partners.length}>
                {p.url ? (
                  <a href={p.url} target="_blank" rel="noopener noreferrer" title={p.name}>
                    {img}
                  </a>
                ) : (
                  img
                )}
              </div>
            );
          })}
        </div>
      </div>

      <style>{`@keyframes partners-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
    </section>
  );
}
