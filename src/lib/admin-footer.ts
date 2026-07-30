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
        { label: "Global Markets", href: "#markets" },
      ],
    },
    {
      title: "Products",
      links: [
        { label: "Fresh Fruits", href: "#products" },
        { label: "Vegetables", href: "#products" },
        { label: "Seasonal", href: "#products" },
        { label: "Packaging", href: "#process" },
      ],
    },
    {
      title: "More",
      links: [
        { label: "Certifications", href: "#about" },
        { label: "Contact", href: "#contact" },
        { label: "Request Quote", href: "#contact" },
        { label: "Back to Top", href: "#top" },
      ],
    },
  ],
  social: {
    facebook: "https://facebook.com/freshdiamond",
    instagram: "https://instagram.com/freshdiamond",
    linkedin: "https://linkedin.com/company/freshdiamond",
  },
};

export function loadFooterConfig(): FooterConfig {
  if (typeof window === "undefined") return defaultFooterConfig;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return defaultFooterConfig;
    const parsed = JSON.parse(raw) as FooterConfig;
    return {
      ...defaultFooterConfig,
      ...parsed,
      social: { ...defaultFooterConfig.social, ...(parsed.social ?? {}) },
      columns: parsed.columns?.length ? parsed.columns : defaultFooterConfig.columns,
    };
  } catch {
    return defaultFooterConfig;
  }
}

export function saveFooterConfig(cfg: FooterConfig) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(cfg));
}
