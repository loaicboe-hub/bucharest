export type FooterLink = { label: string; href: string };
export type FooterColumn = { title: string; links: FooterLink[] };
export type FooterConfig = {
  tagline: string;
  columns: FooterColumn[];
  social: { facebook: string; instagram: string; linkedin: string };
};

const KEY = "fd_footer_config";

export const defaultFooterConfig: FooterConfig = {
  tagline:
    "Premium fresh fruits & vegetables exported worldwide since 2011. ISO 9001 certified quality you can rely on.",
  columns: [
    {
      title: "Company",
      links: [
        { label: "About", href: "#about" },
        { label: "Why Us", href: "#why" },
        { label: "Export Process", href: "#process" },
      ],
    },
    {
      title: "Products",
      links: [
        { label: "Fresh Fruits", href: "#products" },
        { label: "Vegetables", href: "#products" },
      ],
    },
    {
      title: "More",
      links: [
        { label: "Contact", href: "#contact" },
        { label: "Request Quote", href: "#contact" },
        { label: "Back to Top", href: "#top" },
      ],
    },
  ],
  social: {
    facebook: "https://facebook.com/nailvlora",
    instagram: "https://instagram.com/nailvlora",
    linkedin: "https://linkedin.com/company/nailvlora",
  },
};

const REMOVED_LABELS = new Set(["Certifications", "Seasonal", "Packaging", "Global Markets"]);

export function loadFooterConfig(): FooterConfig {
  if (typeof window === "undefined") return defaultFooterConfig;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return defaultFooterConfig;
    const parsed = JSON.parse(raw) as FooterConfig;
    const columns = (parsed.columns?.length ? parsed.columns : defaultFooterConfig.columns).map(
      (c) => ({ ...c, links: (c.links ?? []).filter((l) => !REMOVED_LABELS.has(l.label)) }),
    );
    return {
      ...defaultFooterConfig,
      ...parsed,
      social: { ...defaultFooterConfig.social, ...(parsed.social ?? {}) },
      columns,
    };
  } catch {
    return defaultFooterConfig;
  }
}

export function saveFooterConfig(cfg: FooterConfig) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(cfg));
}

/* ------------------------------ Arabic labels ----------------------------- */

const AR_TEXT: Record<string, string> = {
  // tagline
  [defaultFooterConfig.tagline]:
    "فواكه وخضروات طازجة فاخرة تُصدَّر إلى العالم منذ 2011. جودة معتمدة بشهادة الأيزو 9001 يمكنكم الاعتماد عليها.",
  // column titles
  Company: "الشركة",
  Products: "المنتجات",
  More: "المزيد",
  // links
  About: "من نحن",
  "Why Us": "لماذا نحن",
  "Export Process": "مراحل التصدير",
  "Global Markets": "الأسواق العالمية",
  "Fresh Fruits": "فواكه طازجة",
  Vegetables: "خضروات",
  Seasonal: "منتجات موسمية",
  Packaging: "التعبئة والتغليف",
  Certifications: "الشهادات",
  Contact: "تواصل معنا",
  "Request Quote": "اطلب عرض سعر",
  "Back to Top": "العودة إلى الأعلى",
};

export function localizeFooterConfig(cfg: FooterConfig, lang: "en" | "ar"): FooterConfig {
  if (lang !== "ar") return cfg;
  const t = (s: string) => AR_TEXT[s] ?? s;
  return {
    ...cfg,
    tagline: t(cfg.tagline),
    columns: cfg.columns.map((col) => ({
      title: t(col.title),
      links: col.links.map((l) => ({ ...l, label: t(l.label) })),
    })),
  };
}

