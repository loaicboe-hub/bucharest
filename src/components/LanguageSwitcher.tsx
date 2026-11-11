import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Globe } from "lucide-react";
import { useLang, type Lang } from "@/lib/i18n";

export const LANG_OPTIONS: readonly { code: Lang; short: string; label: string }[] = [
  { code: "en", short: "EN", label: "English" },
  { code: "fr", short: "FR", label: "Français" },
  { code: "ar", short: "AR", label: "العربية" },
  { code: "ru", short: "RU", label: "Русский" },
];

export function LanguageSwitcher({
  compact = false,
  inlineFrom = "lg",
}: {
  compact?: boolean;
  inlineFrom?: "sm" | "lg" | "xl" | "always";
}) {
  const { lang, setLang, c } = useLang();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("mousedown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const active = LANG_OPTIONS.find((o) => o.code === lang) ?? LANG_OPTIONS[0];

  const pillClasses =
    inlineFrom === "always"
      ? "inline-flex"
      : inlineFrom === "xl"
        ? "hidden xl:inline-flex"
        : inlineFrom === "sm"
          ? "hidden sm:inline-flex"
          : "hidden lg:inline-flex";

  const dropdownClasses =
    inlineFrom === "always"
      ? "hidden"
      : inlineFrom === "xl"
        ? "relative inline-block xl:hidden"
        : inlineFrom === "sm"
          ? "relative inline-block sm:hidden"
          : "relative inline-block lg:hidden";

  return (
    <div ref={rootRef} className="relative shrink-0">
      {/* Desktop inline segmented control */}
      <div
        role="group"
        aria-label={c.ui.language}
        dir="ltr"
        className={`${pillClasses} shrink-0 items-center gap-0.5 rounded-full border p-0.5 sm:gap-1 sm:p-1 ${
          compact
            ? "border-border bg-white shadow-sm"
            : "border-white/25 bg-white/10 backdrop-blur-md"
        }`}
      >
        {LANG_OPTIONS.map((o) => (
          <button
            key={o.code}
            type="button"
            title={o.label}
            aria-label={o.label}
            aria-pressed={lang === o.code}
            onClick={() => setLang(o.code)}
            className={`rounded-full px-2 py-0.5 text-[11px] font-semibold transition-all sm:px-2.5 sm:py-1 sm:text-xs ${
              lang === o.code
                ? "bg-gold text-gold-foreground shadow"
                : compact
                  ? "text-muted-foreground hover:text-primary"
                  : "text-white/85 hover:text-white"
            }`}
          >
            {o.short}
          </button>
        ))}
      </div>

      {/* Compact Globe dropdown for narrow viewports (mobile / tablet) */}
      <div className={dropdownClasses}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-label={c.ui.language}
          className={`inline-flex h-9 items-center gap-1 rounded-full border px-2.5 text-xs font-semibold transition-colors ${
            compact
              ? "border-border bg-white text-primary shadow-sm hover:bg-secondary"
              : "border-white/25 bg-white/10 text-white backdrop-blur-md hover:bg-white/20"
          }`}
        >
          <Globe className="h-3.5 w-3.5 shrink-0 text-gold" />
          <span>{active.short}</span>
          <ChevronDown className={`h-3 w-3 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>

        {open && (
          <div
            role="listbox"
            aria-label={c.ui.language}
            className="absolute end-0 top-full z-[70] mt-2 w-40 overflow-hidden rounded-2xl border border-border bg-white p-1.5 shadow-xl"
          >
            {LANG_OPTIONS.map((o) => {
              const selected = lang === o.code;
              return (
                <button
                  key={o.code}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  dir={o.code === "ar" ? "rtl" : "ltr"}
                  onClick={() => {
                    setLang(o.code);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition-colors ${
                    selected
                      ? "bg-gold/15 text-primary"
                      : "text-foreground hover:bg-secondary"
                  }`}
                >
                  <span className="truncate">{o.label}</span>
                  <span className="inline-flex shrink-0 items-center gap-1 text-[10px] font-bold uppercase text-muted-foreground">
                    {o.short}
                    {selected && <Check className="h-3.5 w-3.5 text-fresh" />}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
