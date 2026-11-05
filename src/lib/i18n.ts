import { useCallback, useSyncExternalStore } from "react";

export type Lang = "en" | "fr";

const KEY = "app_lang";

/* ---------------------------------- store --------------------------------- */

let current: Lang = "en";
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function applyDocument(lang: Lang) {
  if (typeof document === "undefined") return;
  document.documentElement.lang = lang;
  document.documentElement.dir = "ltr";
}

export function initLang() {
  if (typeof window === "undefined") return;
  let stored: string | null = null;
  try {
    stored = window.localStorage.getItem(KEY);
  } catch {
    stored = null;
  }
  const lang: Lang = stored === "fr" ? "fr" : "en";
  current = lang;
  applyDocument(lang);
  emit();
}

export function setLang(lang: Lang) {
  current = lang;
  try {
    window.localStorage.setItem(KEY, lang);
  } catch {
    /* ignore */
  }
  applyDocument(lang);
  emit();
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function getSnapshot(): Lang {
  return current;
}

function getServerSnapshot(): Lang {
  return "en";
}

export function useLang() {
  const lang = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const change = useCallback((l: Lang) => setLang(l), []);
  return {
    lang,
    setLang: change,
    dir: "ltr" as const,
    c: content[lang] || content.en,
  };
}

/* -------------------------------- content --------------------------------- */

export type SiteContent = {
  brand: string;
  brandSub: string;
  nav: { href: string; label: string }[];
  ui: Record<string, string>;
  stats: { n: string; l: string }[];
  badges: string[];
  fruits: { name: string; desc: string }[];
  vegetables: { name: string; desc: string }[];
  whyUs: { title: string; desc: string }[];
  process: { title: string; desc: string }[];
  regions: string[];
  certs: { title: string; sub: string }[];
  contact: string[];
};

const en: SiteContent = {
  brand: "BucharestEgyAgro",
  brandSub: "(Import & Export)",
  nav: [
    { href: "#about", label: "About" },
    { href: "#products", label: "Products" },
    { href: "#why", label: "Why Us" },
    { href: "#process", label: "Process" },
    { href: "#markets", label: "Markets" },
  ],
  ui: {
    requestQuote: "Request Quote",
    requestAQuote: "Request a Quote",
    exploreProducts: "Explore Products",
    ourNews: "Our News",
    heroBadge: "Est. 2026 — Premium Export Quality",
    heroTitle1: "Premium Fresh Fruits &",
    heroTitleGold: "Vegetables",
    heroTitle2: "Exported Worldwide",
    heroSub:
      "Delivering exceptional quality, freshness, and reliability since 2026 — from certified farms to your market, uninterrupted.",
    scroll: "Scroll",
    aboutEyebrow: "About Us",
    aboutTitle1: "About",
    aboutTitleGold: "BucharestEgyAgro",
    aboutP1:
      "BucharestEgyAgro Import and Export has been supplying premium-quality fresh fruits and vegetables to international markets since 2026. We are committed to quality, food safety, reliability, and customer satisfaction.",
    aboutP2:
      "With years of experience and strict quality control standards, we ensure every shipment meets international export requirements.",
    iso: "Premium Quality",
    certifiedExcellence: "Certified Excellence",
    productsEyebrow: "Our Products",
    productsTitle: "A Harvest of Excellence",
    productsSub:
      "Export-grade fruits and vegetables, selected for freshness, appearance, and shelf life.",
    freshFruits: "Fresh Fruits",
    freshVegetables: "Fresh Vegetables",
    exportProducts: "Export Products",
    importProducts: "Import Products",
    importEmpty:
      "Our import programme is being prepared. Contact us to discuss import requirements and sourcing.",

    premium: "Premium",
    learnMore: "Learn More",
    whyEyebrow: "Why Choose Us",
    whyTitle: "Built on Trust & Standards",
    processEyebrow: "Export Process",
    processTitle1: "From Farm to",
    processTitleGold: "Global Market",
    processSub:
      "Seven controlled stages that keep every shipment fresh, traceable and on schedule.",
    certsEyebrow: "Certifications",
    certsTitle: "Standards You Can Trust",
    marketsEyebrow: "Global Markets",
    marketsTitle1: "We Export to",
    marketsTitleGold: "the World",
    marketsSub:
      "We proudly export to multiple international markets, delivering freshness across continents with cold-chain reliability.",
    contactEyebrow: "Contact",
    contactTitle1: "Let's Ship",
    contactTitleGold: "Freshness",
    contactTitle2: "Together",
    contactSub:
      "Reach out for quotations, product specifications, or partnership inquiries. Our team responds within one business day.",
    fName: "Name",
    fCompany: "Company",
    fCountry: "Country",
    fEmail: "Email",
    fPhone: "Phone",
    fProduct: "Interested Product",
    fMessage: "Message",
    fMessagePlaceholder: "Tell us about your requirements...",
    sendInquiry: "Send Inquiry",
    requestQuotation: "Request Quotation",
    errRequired: "Please fill in your name, email and message.",
    errEmail: "Please enter a valid email address.",
    okSent: "Thank you! Your inquiry has been received. We'll reply within one business day.",
    okQuote: "Quotation request received. Our export team will contact you shortly.",
    rights: "All rights reserved.",
    footerBadge: "Premium Export Quality · Since 2026",
    backToTop: "Back to top",
    toggleMenu: "Toggle menu",
    language: "Language",
  },
  stats: [
    { n: "14+", l: "Years of Experience" },
    { n: "50+", l: "Professional Team" },
    { n: "100%", l: "Quality Standards" },
    { n: "24/7", l: "Fast Delivery" },
  ],
  badges: ["Since 2026", "Premium Quality", "Global Export"],
  fruits: [
    { name: "Oranges", desc: "Sun-ripened citrus with vibrant sweetness." },
    { name: "Grapes", desc: "Hand-picked table grapes, plump and juicy." },
    { name: "Mangoes", desc: "Fragrant, honey-sweet tropical mangoes." },
    { name: "Pomegranates", desc: "Ruby seeds bursting with flavor." },
    { name: "Strawberries", desc: "Aromatic berries, cold-chain fresh." },
    { name: "Lemons", desc: "Zesty, thin-skinned premium lemons." },
  ],
  vegetables: [
    { name: "Potatoes", desc: "Firm, versatile export-grade potatoes." },
    { name: "Onions", desc: "Golden and red bulbs, long shelf life." },
    { name: "Garlic", desc: "Robust flavor, uniform premium bulbs." },
    { name: "Sweet Potatoes", desc: "Naturally sweet, rich orange flesh." },
    { name: "Green Beans", desc: "Crisp, tender pods harvested young." },
    { name: "Peppers", desc: "Colorful bell peppers, thick-walled." },
  ],
  whyUs: [
    { title: "Premium Quality", desc: "Only export-grade produce, hand-selected." },
    { title: "Certified Quality", desc: "Rigorous internationally recognized standards." },
    { title: "Selected Farms", desc: "Partnerships with trusted, vetted growers." },
    { title: "Strict Quality Control", desc: "Multi-stage inspection at every step." },
    { title: "Competitive Prices", desc: "Direct sourcing means best value." },
    { title: "Global Experience", desc: "Exporting worldwide since 2026." },
    { title: "On-Time Delivery", desc: "Reliable logistics you can plan around." },
    { title: "Cold Chain", desc: "Temperature controlled end-to-end." },
    { title: "Customer First", desc: "Long-term partnerships, not transactions." },
  ],
  process: [
    { title: "Farm Selection", desc: "Sourcing only from certified partner farms." },
    { title: "Quality Inspection", desc: "Field and lab checks for every batch." },
    { title: "Sorting & Packaging", desc: "Graded and packed to buyer specifications." },
    { title: "Cold Storage", desc: "Temperature and humidity controlled." },
    { title: "Container Loading", desc: "Refrigerated reefers loaded with care." },
    { title: "International Shipping", desc: "Ocean and air freight worldwide." },
    { title: "Delivery", desc: "Handed off fresh, on schedule." },
  ],
  regions: ["Europe", "Middle East", "Africa", "Asia"],
  certs: [
    { title: "Quality Management", sub: "Consistent Standards" },
    { title: "Food Safety", sub: "Global Standards" },
    { title: "Export Ready", sub: "International Compliance" },
    { title: "Premium Grade", sub: "Quality Assurance" },
  ],
  contact: [
    "info@bucharestegyagro.com",
    "+20 107 003 3892",
    "Cairo, Egypt — Serving Worldwide",
  ],
};

const fr: SiteContent = {
  brand: "BucharestEgyAgro",
  brandSub: "(Import & Export)",
  nav: [
    { href: "#about", label: "À Propos" },
    { href: "#products", label: "Produits" },
    { href: "#why", label: "Pourquoi Nous" },
    { href: "#process", label: "Processus" },
    { href: "#markets", label: "Marchés" },
  ],
  ui: {
    requestQuote: "Demander un Devis",
    requestAQuote: "Demander un Devis",
    exploreProducts: "Explorer les Produits",
    ourNews: "Nos Actualités",
    heroBadge: "Fondé en 2026 — Qualité d'Exportation Supérieure",
    heroTitle1: "Fruits & Légumes Frais",
    heroTitleGold: "de Première Qualité",
    heroTitle2: "Exportés dans le Monde Entier",
    heroSub:
      "Offrant une qualité exceptionnelle, une fraîcheur constante et une fiabilité totale depuis 2026 — des fermes certifiées à votre marché, sans interruption.",
    scroll: "Défiler",
    aboutEyebrow: "À Propos de Nous",
    aboutTitle1: "À Propos de",
    aboutTitleGold: "BucharestEgyAgro",
    aboutP1:
      "BucharestEgyAgro Import et Export fournit des fruits et légumes frais de première qualité aux marchés internationaux depuis 2026. Nous sommes engagés envers la qualité, la sécurité alimentaire, la fiabilité et la satisfaction client.",
    aboutP2:
      "Grâce à des années d'expérience et à des normes rigoureuses de contrôle qualité, nous garantissons que chaque expédition répond aux exigences d'exportation internationales.",
    iso: "Qualité Supérieure",
    certifiedExcellence: "Excellence Certifiée",
    productsEyebrow: "Nos Produits",
    productsTitle: "Une Récolte d'Excellence",
    productsSub:
      "Fruits et légumes de qualité exportation, sélectionnés pour leur fraîcheur, leur aspect et leur durée de conservation.",
    freshFruits: "Fruits Frais",
    freshVegetables: "Légumes Frais",
    exportProducts: "Produits d'Exportation",
    importProducts: "Produits d'Importation",
    importEmpty:
      "Notre programme d'importation est en cours de préparation. Contactez-nous pour discuter de vos besoins d'approvisionnement.",

    premium: "Premium",
    learnMore: "En Savoir Plus",
    whyEyebrow: "Pourquoi Nous Choisir",
    whyTitle: "Fondé sur la Confiance et les Normes",
    processEyebrow: "Processus d'Exportation",
    processTitle1: "De la Ferme aux",
    processTitleGold: "Marchés Mondiaux",
    processSub:
      "Sept étapes contrôlées pour garantir la fraîcheur, la traçabilité et le respect des délais de chaque cargaison.",
    certsEyebrow: "Certifications",
    certsTitle: "Des Normes de Confiance",
    marketsEyebrow: "Marchés Mondiaux",
    marketsTitle1: "Nous Exportons vers",
    marketsTitleGold: "le Monde",
    marketsSub:
      "Nous exportons avec fierté vers de multiples marchés internationaux, assurant la fraîcheur à travers les continents grâce à une chaîne du froid maîtrisée.",
    contactEyebrow: "Contact",
    contactTitle1: "Exportons la",
    contactTitleGold: "Fraîcheur",
    contactTitle2: "Ensemble",
    contactSub:
      "Contactez-nous pour des demandes de devis, des fiches techniques ou des opportunités de partenariat. Notre équipe vous répond sous un jour ouvré.",
    fName: "Nom",
    fCompany: "Société",
    fCountry: "Pays",
    fEmail: "E-mail",
    fPhone: "Téléphone",
    fProduct: "Produit Recherché",
    fMessage: "Message",
    fMessagePlaceholder: "Parlez-nous de vos besoins et spécifications...",
    sendInquiry: "Envoyer la Demande",
    requestQuotation: "Demander une Cotation",
    errRequired: "Veuillez renseigner votre nom, votre e-mail et votre message.",
    errEmail: "Veuillez entrer une adresse e-mail valide.",
    okSent: "Merci ! Votre demande a été bien reçue. Nous vous répondrons dans un délai d'un jour ouvrable.",
    okQuote: "Demande de devis reçue. Notre équipe d'exportation vous contactera rapidement.",
    rights: "Tous droits réservés.",
    footerBadge: "Qualité d'Exportation Supérieure · Depuis 2026",
    backToTop: "Retour en haut",
    toggleMenu: "Menu",
    language: "Langue",
  },
  stats: [
    { n: "14+", l: "Années d'Expérience" },
    { n: "50+", l: "Équipe Professionnelle" },
    { n: "100%", l: "Normes de Qualité" },
    { n: "24/7", l: "Livraison Rapide" },
  ],
  badges: ["Depuis 2026", "Qualité Supérieure", "Export Mondial"],
  fruits: [
    { name: "Oranges", desc: "Agrumes mûris au soleil avec une douceur éclatante." },
    { name: "Raisins", desc: "Raisins de table récoltés à la main, charnus et juteux." },
    { name: "Mangues", desc: "Mangues tropicales parfumées et douces comme le miel." },
    { name: "Grenades", desc: "Grains rubis éclatants de saveur." },
    { name: "Fraises", desc: "Baies aromatiques transportées sous chaîne du froid rigoureuse." },
    { name: "Citrons", desc: "Citrons frais à peau fine et jus intense." },
  ],
  vegetables: [
    { name: "Pommes de terre", desc: "Pommes de terre fermes et polyvalentes de qualité export." },
    { name: "Oignons", desc: "Oignons dorés et rouges avec une excellente conservation." },
    { name: "Ail", desc: "Saveur intense et bulbes homogènes de première qualité." },
    { name: "Patates Douces", desc: "Naturellement sucrées avec une chair orange savoureuse." },
    { name: "Haricots Verts", desc: "Gousses croquantes et tendres récoltées jeunes." },
    { name: "Poivrons", desc: "Poivrons colorés, croquants et à paroi épaisse." },
  ],
  whyUs: [
    { title: "Qualité Supérieure", desc: "Produits de qualité export exclusivement, triés à la main." },
    { title: "Qualité Certifiée", desc: "Normes internationales strictes et reconnues mondialement." },
    { title: "Fermes Sélectionnées", desc: "Partenariats directs avec des producteurs agréés." },
    { title: "Contrôle Rigoureux", desc: "Inspections à chaque étape de la récolte au départ." },
    { title: "Prix Compétitifs", desc: "Approvisionnement direct pour une valeur optimale." },
    { title: "Expérience Mondiale", desc: "Exportation internationale reconnue depuis 2026." },
    { title: "Respect des Délais", desc: "Logistique fiable et planification garantie." },
    { title: "Chaîne du Froid", desc: "Température contrôlée de bout en bout." },
    { title: "Orientation Client", desc: "Des partenariats durables plutôt que de simples transactions." },
  ],
  process: [
    { title: "Sélection des Fermes", desc: "Approvisionnement exclusif auprès de fermes certifiées." },
    { title: "Contrôle Qualité", desc: "Analyses en champ et en laboratoire pour chaque lot." },
    { title: "Tri et Emballage", desc: "Calibrage et conditionnement sur mesure pour l'acheteur." },
    { title: "Stockage Frigorifique", desc: "Température et hygrométrie contrôlées avec précision." },
    { title: "Chargement Conteneurs", desc: "Conteneurs frigorifiques inspectés et chargés avec soin." },
    { title: "Transport International", desc: "Fret maritime et aérien vers toutes les destinations." },
    { title: "Livraison", desc: "Livraison de produits ultra-frais et dans les délais convenus." },
  ],
  regions: ["Europe", "Moyen-Orient", "Afrique", "Asie"],
  certs: [
    { title: "Gestion de la Qualité", sub: "Normes Constantes" },
    { title: "Sécurité Alimentaire", sub: "Standards Mondiaux" },
    { title: "Prêt pour l'Export", sub: "Conformité Internationale" },
    { title: "Catégorie Supérieure", sub: "Assurance Qualité" },
  ],
  contact: [
    "info@bucharestegyagro.com",
    "+20 107 003 3892",
    "Le Caire, Égypte — Service Mondial",
  ],
};

export const content: Record<Lang, SiteContent> = { en, fr };
