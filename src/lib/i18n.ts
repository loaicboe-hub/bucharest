import { useCallback, useSyncExternalStore } from "react";

export type Lang = "en" | "fr" | "ar" | "ru";

const VALID_LANGS: readonly Lang[] = ["en", "fr", "ar", "ru"];

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
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
}

export function initLang() {
  if (typeof window === "undefined") return;
  let stored: string | null = null;
  try {
    stored = window.localStorage.getItem(KEY);
  } catch {
    stored = null;
  }
  const lang: Lang = VALID_LANGS.includes(stored as Lang) ? (stored as Lang) : "en";
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
  const dir: "ltr" | "rtl" = lang === "ar" ? "rtl" : "ltr";
  return {
    lang,
    setLang: change,
    dir,
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
    importExportLabel: "Import & Export",
    all: "All",
    other: "Other",
    noCategoryProducts: "No products available in this category yet.",
    partnersTitle: "Our Partners",
    partnersSub: "Proudly working with trusted partners around the world",
    whatsappLabel: "WhatsApp Chat",
    whatsappGreeting:
      "Hello BucharestEgyAgro, I would like to inquire about your fresh produce export programs.",
    errSubmit: "Unable to submit request right now. Please try again later.",
    mapHub: "EGYPT",
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
    importExportLabel: "Import & Export",
    all: "Tout",
    other: "Autres",
    noCategoryProducts: "Aucun produit dans cette catégorie pour le moment.",
    partnersTitle: "Nos Partenaires",
    partnersSub: "Fiers de collaborer avec des partenaires de confiance dans le monde entier",
    whatsappLabel: "Discuter sur WhatsApp",
    whatsappGreeting:
      "Bonjour BucharestEgyAgro, je souhaite obtenir des informations sur vos programmes d'exportation de produits frais.",
    errSubmit: "Impossible d'envoyer la demande pour le moment. Veuillez réessayer plus tard.",
    mapHub: "ÉGYPTE",
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

const ar: SiteContent = {
  brand: "BucharestEgyAgro",
  brandSub: "(استيراد وتصدير)",
  nav: [
    { href: "#about", label: "من نحن" },
    { href: "#products", label: "منتجاتنا" },
    { href: "#why", label: "لماذا نحن" },
    { href: "#process", label: "آلية التصدير" },
    { href: "#markets", label: "الأسواق" },
  ],
  ui: {
    requestQuote: "اطلب عرض سعر",
    requestAQuote: "اطلب عرض سعر",
    exploreProducts: "تصفح المنتجات",
    ourNews: "أخبارنا",
    heroBadge: "تأسست عام 2026 — جودة تصديرية فاخرة",
    heroTitle1: "أجود الفواكه و",
    heroTitleGold: "الخضروات الطازجة",
    heroTitle2: "نُصدّرها إلى جميع أنحاء العالم",
    heroSub:
      "نقدم أعلى معايير الجودة والطزاجة والموثوقية منذ عام 2026 — من مزارعنا المعتمدة إلى أسواقكم حول العالم دون انقطاع.",
    scroll: "تصفح المزيد",
    aboutEyebrow: "من نحن",
    aboutTitle1: "عن شركة",
    aboutTitleGold: "BucharestEgyAgro",
    aboutP1:
      "تعمل شركة BucharestEgyAgro للاستيراد والتصدير في توريد أجود الفواكه والخضروات المصرية الطازجة إلى الأسواق العالمية منذ عام 2026. نحن ملتزمون بالجودة وسلامة الغذاء والمصداقية التامة ورضا عملائنا.",
    aboutP2:
      "بفضل سنوات من الخبرة ومعايير الرقابة الصارمة على الجودة، نضمن مطابقة كل شحنة لأعلى اشتراطات التصدير الدولية.",
    iso: "جودة فائقة",
    certifiedExcellence: "تميّز معتمد",
    productsEyebrow: "منتجاتنا",
    productsTitle: "حصاد من التميّز",
    productsSub:
      "فواكه وخضروات بدرجة التصدير الفاخرة، مختارة بعناية فائقة لضمان الطزاجة والشكل المثالي ومدة الصلاحية الطويلة.",
    freshFruits: "فواكه طازجة",
    freshVegetables: "خضروات طازجة",
    exportProducts: "منتجات التصدير",
    importProducts: "منتجات الاستيراد",
    importEmpty:
      "برنامج الاستيراد قيد التجهيز حالياً. تواصل معنا لمناقشة احتياجاتكم ومتطلبات التوريد.",
    premium: "ممتاز",
    learnMore: "اعرف المزيد",
    whyEyebrow: "لماذا تختارنا",
    whyTitle: "شراكة مبنية على الثقة والمعايير",
    processEyebrow: "آلية التصدير",
    processTitle1: "من المزرعة إلى",
    processTitleGold: "الأسواق العالمية",
    processSub:
      "سبع مراحل خاضعة للرقابة الصارمة للحفاظ على طزاجة كل شحنة وإمكانية تتبعها ووصولها في الموعد المحدد.",
    certsEyebrow: "الشهادات والاعتمادات",
    certsTitle: "معايير عالمية موثوقة",
    marketsEyebrow: "الأسواق العالمية",
    marketsTitle1: "نُصدّر إلى",
    marketsTitleGold: "جميع أنحاء العالم",
    marketsSub:
      "نفخر بالتصدير إلى أسواق دولية متعددة، ونوصل خيرات الطبيعة المصرية عبر القارات بسلسلة تبريد متكاملة وموثوقة.",
    contactEyebrow: "تواصل معنا",
    contactTitle1: "لنُصدّر",
    contactTitleGold: "الطزاجة",
    contactTitle2: "معاً",
    contactSub:
      "تواصل معنا لطلب عروض الأسعار، والمواصفات الفنية للمنتجات، أو فرص الشراكة التجارية. يرد فريقنا خلال يوم عمل واحد.",
    fName: "الاسم",
    fCompany: "الشركة",
    fCountry: "الدولة",
    fEmail: "البريد الإلكتروني",
    fPhone: "رقم الهاتف",
    fProduct: "المنتج المطلوب",
    fMessage: "الرسالة",
    fMessagePlaceholder: "أخبرنا عن الكميات والمواصفات المطلوبة...",
    sendInquiry: "إرسال الاستفسار",
    requestQuotation: "طلب عرض سعر",
    errRequired: "يرجى إدخال الاسم والبريد الإلكتروني والرسالة.",
    errEmail: "يرجى إدخال بريد إلكتروني صحيح.",
    okSent: "شكراً لك! تم استلام استفسارك بنجاح، وسيتواصل معك فريقنا خلال يوم عمل واحد.",
    okQuote: "تم استلام طلب عرض السعر بنجاح. سيتواصل معك فريق التصدير لدينا في أقرب وقت.",
    rights: "جميع الحقوق محفوظة.",
    footerBadge: "جودة تصدير فاخرة · منذ عام 2026",
    backToTop: "العودة للأعلى",
    toggleMenu: "القائمة",
    language: "اللغة",
    importExportLabel: "استيراد وتصدير",
    all: "الكل",
    other: "أخرى",
    noCategoryProducts: "لا توجد منتجات متاحة في هذه الفئة حالياً.",
    partnersTitle: "شركاؤنا",
    partnersSub: "نفخر بالتعاون مع شركاء موثوقين حول العالم",
    whatsappLabel: "تواصل عبر واتساب",
    whatsappGreeting:
      "مرحباً بوخارست إيجي أجرو، أرغب في الاستفسار عن برامج تصدير الحاصلات الزراعية.",
    errSubmit: "تعذر إرسال الطلب في الوقت الحالي. يرجى المحاولة لاحقاً.",
    mapHub: "مصر",
  },
  stats: [
    { n: "+14", l: "عاماً من الخبرة" },
    { n: "+50", l: "فريق عمل محترف" },
    { n: "100%", l: "معايير الجودة" },
    { n: "24/7", l: "توصيل سريع" },
  ],
  badges: ["منذ عام 2026", "جودة فاخرة", "تصدير عالمي"],
  fruits: [
    { name: "البرتقال", desc: "موالح مصرية ناضجة تحت الشمس بحلاوة وعصارة غنية." },
    { name: "العنب", desc: "عنب مائدة مقطوف يدوياً بحبات ممتلئة ومقرمشة." },
    { name: "المانجو", desc: "مانجو استوائية عطرية ذات مذاق عسلي فاخر." },
    { name: "الرمان", desc: "حبات ياقوتية زاهية غنية بالعصير والنكهة." },
    { name: "الفراولة", desc: "فراولة عطرية مشحونة ضمن سلسلة تبريد متكاملة." },
    { name: "الليمون", desc: "ليمون فاخر بقشرة رقيقة وعصير وفير ومنعش." },
  ],
  vegetables: [
    { name: "البطاطس", desc: "بطاطس صلبة عالية الجودة للتصدير والاستخدامات المتعددة." },
    { name: "البصل", desc: "بصل ذهبي وأحمر بقدرة تخزين طويلة وجودة ممتازة." },
    { name: "الثوم", desc: "نكهة قوية ورؤوس متجانسة فاخرة للتصدير." },
    { name: "البطاطا الحلوة", desc: "حلاوة طبيعية ولب برتقالي غني بالقيمة الغذائية." },
    { name: "الفاصوليا الخضراء", desc: "قرون طرية ومقرمشة تُقطف طازجة في ذروة نضارتها." },
    { name: "الفلفل الألوان", desc: "فلفل ألوان طازج بجدران سميكة وألوان زاهية." },
  ],
  whyUs: [
    { title: "جودة تصدير فائقة", desc: "محاصيل بدرجة التصدير الأولى، منتقاة وفرزها بدقة." },
    { title: "جودة معتمدة دولياً", desc: "التزام صارم بأعلى المعايير الغذائية والزراعية العالمية." },
    { title: "مزارع مختارة بعناية", desc: "شراكات مباشرة مع نخبة من المزارعين المعتمدين." },
    { title: "رقابة جودة صارمة", desc: "فحص متعدد المراحل في كل خطوة من الحصاد حتى الشحن." },
    { title: "أسعار تنافسية", desc: "توريد مباشر من المزارع يمنحكم أفضل قيمة وتكلفة." },
    { title: "خبرة دولية", desc: "حضور وتصدير متواصل للأسواق العالمية منذ عام 2026." },
    { title: "التزام بالمواعيد", desc: "خدمات لوجستية موثوقة تضمن جدول توريد منتظم." },
    { title: "سلسلة تبريد متكاملة", desc: "تحكم كامل في درجات الحرارة من المزرعة حتى الميناء." },
    { title: "العميل أولاً", desc: "نبني شراكات استراتيجية طويلة الأمد، لا مجرد صفقات عابرة." },
  ],
  process: [
    { title: "اختيار المزارع", desc: "التوريد حصرياً من مزارع الشركاء الحاصلة على الاعتماد." },
    { title: "فحص الجودة", desc: "اختبارات ميدانية ومخبرية دقيقة لكل دفعة إنتاج." },
    { title: "الفرز والتعبئة", desc: "تدريج وتغليف وفق اشتراطات كل عميل وسوق." },
    { title: "التبريد والتخزين", desc: "غرف تبريد مضبوطة الحرارة والرطوبة بدقة." },
    { title: "تحميل الحاويات", desc: "شحن وتجهيز الحاويات المبردة بأعلى عناية." },
    { title: "الشحن الدولي", desc: "شحن بحري وجوي سريع إلى جميع الوجهات العالمية." },
    { title: "التسليم النهائي", desc: "تسليم المحاصيل طازجة تماماً وفي الموعد المحدد." },
  ],
  regions: ["أوروبا", "الشرق الأوسط", "أفريقيا", "آسيا"],
  certs: [
    { title: "إدارة الجودة", sub: "معايير ثابتة ومعتمدة" },
    { title: "سلامة الغذاء", sub: "اشتراطات دولية صارمة" },
    { title: "جاهزية التصدير", sub: "امتثال كامل للأسواق العالمية" },
    { title: "الدرجة الممتازة", sub: "ضمان شامل للجودة" },
  ],
  contact: [
    "info@bucharestegyagro.com",
    "+20 107 003 3892",
    "القاهرة، مصر — نخدم جميع دول العالم",
  ],
};

const ru: SiteContent = {
  brand: "BucharestEgyAgro",
  brandSub: "(Импорт и Экспорт)",
  nav: [
    { href: "#about", label: "О нас" },
    { href: "#products", label: "Продукция" },
    { href: "#why", label: "Преимущества" },
    { href: "#process", label: "Процесс" },
    { href: "#markets", label: "Рынки" },
  ],
  ui: {
    requestQuote: "Запросить цену",
    requestAQuote: "Запросить расчёт",
    exploreProducts: "Каталог продукции",
    ourNews: "Новости",
    heroBadge: "Осн. в 2026 — Премиальное экспортное качество",
    heroTitle1: "Свежие фрукты и",
    heroTitleGold: "овощи премиум-класса",
    heroTitle2: "с экспортом по всему миру",
    heroSub:
      "Неизменное качество, свежесть и надёжность поставок с 2026 года — от сертифицированных ферм прямо на ваш рынок без перебоев.",
    scroll: "Вниз",
    aboutEyebrow: "О компании",
    aboutTitle1: "О компании",
    aboutTitleGold: "BucharestEgyAgro",
    aboutP1:
      "Компания BucharestEgyAgro Import and Export поставляет отборные свежие фрукты и овощи на международные рынки с 2026 года. Наши главные принципы — высокое качество, пищевая безопасность, надёжность и удовлетворённость каждого партнёра.",
    aboutP2:
      "Благодаря многолетнему опыту и многоступенчатому контролю качества мы гарантируем соответствие каждой партии строгим международным экспортным стандартам.",
    iso: "Премиум-качество",
    certifiedExcellence: "Сертифицированный стандарт",
    productsEyebrow: "Наша продукция",
    productsTitle: "Урожай высочайшего качества",
    productsSub:
      "Отборные фрукты и овощи экспортного класса, отобранные по свежести, внешнему виду и сохранности при транспортировке.",
    freshFruits: "Свежие фрукты",
    freshVegetables: "Свежие овощи",
    exportProducts: "Экспортная продукция",
    importProducts: "Импортная продукция",
    importEmpty:
      "Наша программа импорта находится в стадии формирования. Свяжитесь с нами для обсуждения условий закупки и поставок.",
    premium: "Премиум",
    learnMore: "Подробнее",
    whyEyebrow: "Почему выбирают нас",
    whyTitle: "Надёжность и международные стандарты",
    processEyebrow: "Экспортный процесс",
    processTitle1: "От фермы до",
    processTitleGold: "мировых рынков",
    processSub:
      "Семь контролируемых этапов, обеспечивающих свежесть, прослеживаемость и точную доставку каждой партии в срок.",
    certsEyebrow: "Сертификация",
    certsTitle: "Стандарты, которым доверяют",
    marketsEyebrow: "Глобальные рынки",
    marketsTitle1: "Мы экспортируем",
    marketsTitleGold: "по всему миру",
    marketsSub:
      "Мы поставляем продукцию на ведущие международные рынки, сохраняя свежесть урожая на всех континентах благодаря непрерывной холодовой цепи.",
    contactEyebrow: "Контакты",
    contactTitle1: "Давайте поставлять",
    contactTitleGold: "свежесть",
    contactTitle2: "вместе",
    contactSub:
      "Свяжитесь с нами для расчёта стоимости, уточнения спецификаций продукции или обсуждения партнёрства. Мы отвечаем в течение одного рабочего дня.",
    fName: "Имя",
    fCompany: "Компания",
    fCountry: "Страна",
    fEmail: "Электронная почта",
    fPhone: "Телефон",
    fProduct: "Интересующий товар",
    fMessage: "Сообщение",
    fMessagePlaceholder: "Укажите объёмы, калибры и условия поставки...",
    sendInquiry: "Отправить запрос",
    requestQuotation: "Запросить расчёт",
    errRequired: "Пожалуйста, заполните имя, электронную почту и сообщение.",
    errEmail: "Пожалуйста, введите корректный адрес электронной почты.",
    okSent: "Спасибо! Ваш запрос успешно получен. Мы свяжемся с вами в течение одного рабочего дня.",
    okQuote: "Запрос на расчёт стоимости получен. Наш отдел экспорта скоро свяжется с вами.",
    rights: "Все права защищены.",
    footerBadge: "Экспорт премиум-класса · С 2026 года",
    backToTop: "Наверх",
    toggleMenu: "Меню",
    language: "Язык",
    importExportLabel: "Импорт и Экспорт",
    all: "Все",
    other: "Прочее",
    noCategoryProducts: "В этой категории пока нет доступных товаров.",
    partnersTitle: "Наши партнёры",
    partnersSub: "Мы гордимся сотрудничеством с надёжными партнёрами по всему миру",
    whatsappLabel: "Чат в WhatsApp",
    whatsappGreeting:
      "Здравствуйте, BucharestEgyAgro! Я хотел(а) бы узнать о ваших программах экспорта свежей сельхозпродукции.",
    errSubmit: "Не удалось отправить запрос. Пожалуйста, попробуйте позже.",
    mapHub: "ЕГИПЕТ",
  },
  stats: [
    { n: "14+", l: "Лет опыта" },
    { n: "50+", l: "Специалистов в команде" },
    { n: "100%", l: "Контроль качества" },
    { n: "24/7", l: "Быстрая логистика" },
  ],
  badges: ["С 2026 года", "Премиум-качество", "Мировой экспорт"],
  fruits: [
    { name: "Апельсины", desc: "Созревающие на солнце египетские цитрусовые с высокой сочностью." },
    { name: "Виноград", desc: "Столовый виноград ручного сбора, сочный и хрустящий." },
    { name: "Манго", desc: "Ароматные, сладкие тропические плоды премиальных сортов." },
    { name: "Гранаты", desc: "Рубиновые зёрна с насыщенным вкусом и высокой сочностью." },
    { name: "Клубника", desc: "Ароматная зимняя ягода с непрерывным контролем холодовой цепи." },
    { name: "Лимоны", desc: "Тонкокорые свежие лимоны с высокой кислотностью и ароматом." },
  ],
  vegetables: [
    { name: "Картофель", desc: "Плотный экспортный картофель для розничных сетей и переработки." },
    { name: "Репчатый лук", desc: "Золотистый и красный лук с длительным сроком хранения." },
    { name: "Чеснок", desc: "Насыщенный аромат и однородные калиброванные головки." },
    { name: "Батат", desc: "Природная сладость и яркая оранжевая мякоть." },
    { name: "Стручковая фасоль", desc: "Нежные хрустящие стручки ежедневного свежего сбора." },
    { name: "Болгарский перец", desc: "Сочный толстостенный перец ярких расцветок." },
  ],
  whyUs: [
    { title: "Премиальное качество", desc: "Только отборная продукция экспортного класса." },
    { title: "Сертифицированные стандарты", desc: "Строгое соблюдение признанных международных норм." },
    { title: "Проверенные фермы", desc: "Прямое партнёрство с сертифицированными хозяйствами." },
    { title: "Жёсткий контроль качества", desc: "Многоступенчатая инспекция каждой партии продукции." },
    { title: "Конкурентные цены", desc: "Прямые поставки от производителей обеспечивают лучшую цену." },
    { title: "Международный опыт", desc: "Экспорт на глобальные рынки с 2026 года." },
    { title: "Точные сроки поставки", desc: "Выверенная логистика и стабильное выполнение графика." },
    { title: "Непрерывная холодовая цепь", desc: "Контроль температуры на всём пути следования груза." },
    { title: "Клиент на первом месте", desc: "Долгосрочное партнёрство вместо разовых сделок." },
  ],
  process: [
    { title: "Отбор ферм", desc: "Закупка урожая только у сертифицированных хозяйств." },
    { title: "Контроль качества", desc: "Полевые и лабораторные проверки каждой партии." },
    { title: "Сортировка и упаковка", desc: "Калибровка и фасовка по требованиям покупателя." },
    { title: "Холодное хранение", desc: "Точный контроль температуры и влажности в камерах." },
    { title: "Погрузка в контейнеры", desc: "Бережная загрузка рефрижераторных контейнеров." },
    { title: "Международная доставка", desc: "Морские и авиаперевозки по всем направлениям." },
    { title: "Передача клиенту", desc: "Доставка свежей продукции точно в оговорённый срок." },
  ],
  regions: ["Европа", "Ближний Восток", "Африка", "Азия"],
  certs: [
    { title: "Управление качеством", sub: "Единые стандарты" },
    { title: "Пищевая безопасность", sub: "Глобальные нормы" },
    { title: "Готовность к экспорту", sub: "Международное соответствие" },
    { title: "Высший сорт", sub: "Гарантия качества" },
  ],
  contact: [
    "info@bucharestegyagro.com",
    "+20 107 003 3892",
    "Каир, Египет — Поставки по всему миру",
  ],
};

export const content: Record<Lang, SiteContent> = { en, fr, ar, ru };
