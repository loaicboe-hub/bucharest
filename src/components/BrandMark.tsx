// Shared brand logo pieces so every page shows the company logo consistently.
import { useEffect, useState } from "react";
import { getCachedLogoUrl, getLogoUrl } from "@/lib/admin-branding";
import { useTransparentLogo } from "@/lib/transparent-image";
import { cn } from "@/lib/utils";

/** Fetches the brand logo once per mount (cached URL first, so there's no flash). */
export function useBrandLogo() {
  const [logo, setLogo] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    setLogo(getCachedLogoUrl());
    getLogoUrl()
      .then((url) => alive && setLogo(url))
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, []);
  return logo;
}

/** Circular logo mark used in page headers, matching the landing page treatment. */
export function BrandMark({
  className,
  markClassName,
  showName = true,
  name = "Nailvlora",
}: {
  className?: string;
  /** Size / style overrides for the circular logo frame (e.g. "h-24 w-24"). */
  markClassName?: string;
  showName?: boolean;
  name?: string;
}) {
  const logo = useBrandLogo();

  return (
    <span className={cn("flex items-center gap-3", className)}>
      <span
        className={cn(
          "flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white shadow-md ring-1 ring-border/60",
          markClassName,
        )}
      >
        {logo && (
          <img
            src={logo}
            alt={`${name} logo`}
            className="h-full w-full scale-[1.5] object-contain"
          />
        )}
      </span>
      {showName && (
        <span className="font-display text-xl font-bold leading-tight text-primary">{name}</span>
      )}
    </span>
  );
}

/** Faint logo watermark for section backgrounds. */
export function BrandWatermark({
  className,
  position = "right",
}: {
  className?: string;
  position?: "left" | "right" | "center";
}) {
  const logo = useBrandLogo();
  const clean = useTransparentLogo(logo);
  if (!logo) return null;

  const place =
    position === "left"
      ? "-left-24 top-8"
      : position === "center"
        ? "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        : "-right-24 top-8";

  return (
    <img
      src={clean ?? logo}
      alt=""
      aria-hidden
      className={cn(
        "pointer-events-none absolute z-0 w-[34rem] max-w-none select-none object-contain opacity-[0.07] mix-blend-multiply",
        place,
        className,
      )}
    />

  );
}
