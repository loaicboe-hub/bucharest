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
    "Premium fresh fruits & vegetables exported worldwide since 2026. Premium certified quality you can rely on.",
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
    facebook: "https://facebook.com/bucharestegyagro",
    instagram: "https://instagram.com/bucharestegyagro",
    linkedin: "https://linkedin.com/company/bucharestegyagro",
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

/* ------------------------------ French labels ----------------------------- */

const FR_TEXT: Record<string, string> = {
  // tagline
  [defaultFooterConfig.tagline]:
    "Fruits et légumes frais de première qualité exportés dans le monde entier depuis 2026. Une qualité certifiée sur laquelle vous pouvez compter.",
  // column titles
  Company: "Entreprise",
  Products: "Produits",
  More: "Plus",
  // links
  About: "À Propos",
  "Why Us": "Pourquoi Nous",
  "Export Process": "Processus d'Exportation",
  "Global Markets": "Marchés Mondiaux",
  "Fresh Fruits": "Fruits Frais",
  Vegetables: "Légumes Frais",
  Seasonal: "Produits de Saison",
  Packaging: "Conditionnement",
  Certifications: "Certifications",
  Contact: "Contact",
  "Request Quote": "Demander un Devis",
  "Back to Top": "Retour en haut",
};

export function localizeFooterConfig(cfg: FooterConfig, lang: "en" | "fr"): FooterConfig {
  if (lang !== "fr") return cfg;
  const t = (s: string) => FR_TEXT[s] ?? s;
  return {
    ...cfg,
    tagline: t(cfg.tagline),
    columns: cfg.columns.map((col) => ({
      title: t(col.title),
      links: col.links.map((l) => ({ ...l, label: t(l.label) })),
    })),
  };
}

