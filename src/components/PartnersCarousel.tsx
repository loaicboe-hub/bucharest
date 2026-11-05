import { useEffect, useState } from "react";
import { listPartners, PARTNERS_EVENT, type Partner } from "@/lib/admin-partners";

export function PartnersCarousel({ title, subtitle }: { title: string; subtitle?: string }) {
  const [partners, setPartners] = useState<Partner[]>([]);

  useEffect(() => {
    let alive = true;
    const sync = () => {
      listPartners(true)
        .then((list) => {
          if (alive) setPartners(list.filter((p) => p.logo));
        })
        .catch(() => undefined);
    };
    sync();
    window.addEventListener(PARTNERS_EVENT, sync);
    return () => {
      alive = false;
      window.removeEventListener(PARTNERS_EVENT, sync);
    };
  }, []);

  if (partners.length === 0) return null;

  // Duplicate the list so the -50% translate loop is seamless.
  const loop = [...partners, ...partners];

  return (
    <section id="partners" className="border-t border-border/60 bg-background py-10 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl">{title}</h2>
          {subtitle && <p className="mx-auto mt-2 max-w-2xl text-sm text-muted-foreground sm:mt-3 sm:text-base">{subtitle}</p>}
        </div>
      </div>

      <div className="group relative mt-6 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)] sm:mt-10">
        <div
          className="flex w-max items-center gap-4 sm:gap-8 md:gap-12 group-hover:[animation-play-state:paused] motion-reduce:animate-none"
          style={{
            animation: `partners-marquee ${Math.max(18, partners.length * 6)}s linear infinite`,
            willChange: "transform",
            transform: "translate3d(0, 0, 0)",
          }}
        >
          {loop.map((p, i) => {
            const img = (
              <img
                src={p.logo}
                alt={p.name ? `${p.name} logo` : "Partner logo"}
                loading="lazy"
                className="max-h-full max-w-full object-contain select-none transition-transform duration-300"
              />
            );
            return (
              <div
                key={`${p.id}-${i}`}
                className="flex h-20 w-32 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-card p-2.5 shadow-sm transition-all duration-300 sm:h-28 sm:w-44 sm:rounded-2xl sm:p-3.5 md:h-36 md:w-56 md:p-5"
                aria-hidden={i >= partners.length}
              >
                {p.url ? (
                  <a href={p.url} target="_blank" rel="noopener noreferrer" title={p.name} className="flex h-full w-full items-center justify-center">
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

      <style>{`
        @keyframes partners-marquee {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-50%, 0, 0); }
        }
      `}</style>
    </section>
  );
}
