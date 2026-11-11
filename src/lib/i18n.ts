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
    requestQuote: "Get a Quote",
    requestAQuote: "Get a Quote",
    getQuote: "Get a Quote",
    exploreProducts: "Explore Products",
    ourNews: "Our News",
    heroBadge: "Egyptian Agricultural Exports",
    heroTitle1: "Fresh Egyptian Fruits &",
    heroTitleGold: "Vegetables",
    heroTitle2: "For International Importers",
    heroSub:
      "Selected seasonal produce from the Nile Delta, Ismailia & Upper Egypt—sorted, pre-cooled, and shipped to your destination port.",
    scroll: "Scroll",
    aboutEyebrow: "About Us",
    aboutTitle1: "About",
    aboutTitleGold: "BucharestEgyAgro",
    aboutP1:
      "BucharestEgyAgro Import and Export supplies fresh Egyptian fruits and vegetables to importers, wholesalers, and retail distributors across Europe, the Gulf, Africa, and Asia.",
    aboutP2:
      "Our operations team oversees farm selection across the Nile Delta and desert reclaimed zones, packhouse grading, container pre-cooling, and export paperwork from Cairo to port of arrival.",
    iso: "Export Grade",
    certifiedExcellence: "Origin Traceable",
    productsEyebrow: "Our Products",
    productsTitle: "Export Product Catalogue",
    productsSub:
      "Seasonal Egyptian crops with verified calibres, pack weights, and container MOQs.",
    freshFruits: "Fresh Fruits",
    freshVegetables: "Fresh Vegetables",
    filterFruits: "Fruits",
    filterVegetables: "Vegetables",
    exportProducts: "Export Products",
    importProducts: "Import Products",
    importEmpty:
      "Our import programme is being prepared. Contact us to discuss sourcing requirements.",
    premium: "Top Export",
    learnMore: "Get a Quote",
    viewSpecs: "View Specs",
    seasonLabel: "Season",
    packingLabel: "Packing",
    moqLabel: "MOQ",
    whyEyebrow: "Why Choose Us",
    whyTitle: "Operational Edge for Importers",
    processEyebrow: "Export Process",
    processTitle1: "From Farm to",
    processTitleGold: "Destination Port",
    processSub:
      "Seven structured checkpoints tracking maturity, packhouse grading, container temperature, and customs clearance.",
    certsEyebrow: "Export Documentation",
    certsTitle: "Customs & Dispatch Paperwork",
    marketsEyebrow: "Export Corridors",
    marketsTitle1: "Target Export",
    marketsTitleGold: "Regions",
    marketsSub:
      "Regular sea reefer and air freight corridors serving wholesale buyers in the UK, EU, Russia, Saudi Arabia, UAE, Africa, and India.",
    contactEyebrow: "Contact",
    contactTitle1: "Request Your",
    contactTitleGold: "FOB / CIF",
    contactTitle2: "Quotation",
    contactSub:
      "Reach out for seasonal FOB or CIF quotations, container loading specs, or trial orders. Our export team responds within one business day.",
    fName: "Name",
    fCompany: "Company",
    fCountry: "Country",
    fEmail: "Email",
    fPhone: "Phone",
    fProduct: "Interested Product",
    fProductSelectDefault: "Select a product...",
    fProductAllOption: "Multiple Products / General Export Inquiry",
    fMessage: "Message",
    fMessagePlaceholder: "Specify product, tonnage or container size, preferred packing, and destination port...",
    sendInquiry: "Send Inquiry",
    requestQuotation: "Request Quotation",
    errRequired: "Please enter your name, email address, phone number, and message.",
    errQuoteRequired: "Please enter your name, email address, and phone number to request a quote.",
    errEmail: "Please enter a valid email address.",
    okSent: "Thank you! Your inquiry has been received. Our team responds within one business day.",
    okQuote: "Quotation request received. Our export team responds within one business day.",
    rights: "All rights reserved.",
    footerBadge: "Egyptian Agricultural Produce Exporter",
    backToTop: "Back to top",
    toggleMenu: "Toggle menu",
    language: "Language",
    importExportLabel: "Import & Export",
    all: "All",
    other: "Other",
    noCategoryProducts: "No products available in this category yet.",
    partnersTitle: "Our Partners",
    partnersSub: "Collaborating with growers, packhouses, and logistics carriers across key trade lanes",
    whatsappLabel: "WhatsApp Chat",
    whatsappGreeting:
      "Hello BucharestEgyAgro, I would like to request a quote for Egyptian produce export.",
    errSubmit: "Unable to submit request right now. Please try again later.",
    mapHub: "EGYPT",
    addressFallback: "Cairo, Egypt — Export Head Office & Dispatch Desk",
  },
  stats: [
    { n: "12+", l: "Export Crops" },
    { n: "7", l: "Workflow Steps" },
    { n: "4", l: "Target Regions" },
    { n: "1 Day", l: "Business Day Reply" },
  ],
  badges: ["Direct from Farms", "FOB & CIF Shipping", "Multi-Stage Inspection"],
  fruits: [
    { name: "Oranges", desc: "Navel, Valencia & Baladi · >45% juice yield · Calibres 48–113." },
    { name: "Grapes", desc: "Early Sweet, Superior & Flame · Brix 16–20° · SO2 punnet packs." },
    { name: "Mangoes", desc: "Keitt, Kent & Naomi · Fiberless flesh · 250–900 g cartons." },
    { name: "Pomegranates", desc: "Wonderful & 116 · Brix >16° · 300–700 g tray-packed." },
    { name: "Strawberries", desc: "Fortuna & Festival · Air fresh (2 kg) & IQF sea (10 kg)." },
    { name: "Lemons", desc: "Adalia, Baladi & Eureka · >35% juice · 80–180 g calibrated." },
  ],
  vegetables: [
    { name: "Potatoes", desc: "Spunta, Hermes & Lady Rosetta · 20–24% dry matter · 10/25 kg bags." },
    { name: "Onions", desc: "Giza 6, Golden & Red · >14% dry matter · Tight-skin 40–90 mm." },
    { name: "Garlic", desc: "Egyptian White & Red Baladi · Fresh & cured · 4.5–6.5+ cm." },
    { name: "Sweet Potatoes", desc: "Beauregard cured 7 days · Brix >11° · 150–600 g cartons." },
    { name: "Green Beans", desc: "Paulista & Serengeti · Extra-fine (<6 mm) · Air fresh & IQF." },
    { name: "Peppers", desc: "Blocky Bell & Chili · G/GG sizes · 5 kg & flow-pack trios." },
  ],
  whyUs: [
    { title: "Delta & Desert Origins", desc: "Sourced directly from farms in Ismailia, Nubaria, Sadat City, and Upper Egypt." },
    { title: "Brix & Calibre Sorting", desc: "Optical sizing and manual grading tailored to retail and wholesale specifications." },
    { title: "Peak-Window Harvesting", desc: "Scheduled farm picking timed for sugar maturity and long sea-transit firm skin." },
    { title: "Pre-Shipment Inspection", desc: "Visual, defect, and carton-weight inspection logged prior to container sealing." },
    { title: "Direct Farm-Gate Quotes", desc: "Transparent FOB and CIF container pricing quoted according to season and tonnage." },
    { title: "Regional Trade Corridors", desc: "Established ocean reefer and air lanes serving Europe, Russia, the Gulf, Africa, and Asia." },
    { title: "Fixed Loading Schedules", desc: "Packhouse packing synchronized directly with weekly vessel cut-off dates." },
    { title: "Reefer Temperature Setup", desc: "Forced-air pre-cooling, precise humidity targets, and data loggers per container." },
    { title: "One-Day Export Desk", desc: "Batch status updates and preliminary quotes issued within one business day." },
  ],
  process: [
    { title: "Farm Selection", desc: "Contracting harvest lots directly with partner farms in key Egyptian regions." },
    { title: "Pre-Shipment Inspection", desc: "Field sorting and packhouse visual/weight verification for every batch." },
    { title: "Grading & Packing", desc: "Calibrated into export cartons, punnets, or mesh bags to buyer specs." },
    { title: "Forced-Air Pre-Cooling", desc: "Rapid core temperature drawdown immediately after packhouse sealing." },
    { title: "Container Loading", desc: "Reefer stowing with verified airflow ventilation and digital thermal loggers." },
    { title: "Sea & Air Transit", desc: "Scheduled container vessels and air cargo to target regional destination ports." },
    { title: "Port Arrival & Docs", desc: "Full B/L, phytosanitary papers, and cooling logs delivered before discharge." },
  ],
  regions: ["Europe & UK", "Middle East & Gulf", "Africa", "Russia & Asia"],
  certs: [
    { title: "Phytosanitary Clearance", sub: "Official Plant Quarantine Docs" },
    { title: "Certificate of Origin", sub: "Chamber of Commerce Issued" },
    { title: "Pre-Shipment Grading", sub: "Size, Brix & Weight Verification" },
    { title: "Container Thermal Log", sub: "Reefer Temp & Ventilation Setup" },
  ],
  contact: [
    "info@bucharestegyagro.com",
    "+20 107 003 3892",
    "Cairo, Egypt — Export Head Office & Dispatch Desk",
  ],
};

const fr: SiteContent = {
  brand: "BucharestEgyAgro",
  brandSub: "(Import & Export)",
  nav: [
    { href: "#about", label: "À Propos" },
    { href: "#products", label: "Produits" },
    { href: "#why", label: "Atouts" },
    { href: "#process", label: "Processus" },
    { href: "#markets", label: "Marchés" },
  ],
  ui: {
    requestQuote: "Demander un Devis",
    requestAQuote: "Demander un Devis",
    getQuote: "Demander un Devis",
    exploreProducts: "Explorer les Produits",
    ourNews: "Nos Actualités",
    heroBadge: "Exportations Agricoles Égyptiennes",
    heroTitle1: "Fruits & Légumes Frais",
    heroTitleGold: "d'Égypte",
    heroTitle2: "Pour Importateurs Internationaux",
    heroSub:
      "Récoltes saisonnières du delta du Nil, d'Ismaïlia et de Haute-Égypte — triées, pré-refroidies et expédiées jusqu'à votre port.",
    scroll: "Défiler",
    aboutEyebrow: "À Propos de Nous",
    aboutTitle1: "À Propos de",
    aboutTitleGold: "BucharestEgyAgro",
    aboutP1:
      "BucharestEgyAgro Import et Export fournit des fruits et légumes frais égyptiens aux importateurs, grossistes et distributeurs d'Europe, du Golfe, d'Afrique et d'Asie.",
    aboutP2:
      "Notre équipe supervise le choix des parcelles dans le delta du Nil et les zones agricoles du désert, le calibrage en station, le pré-refroidissement et les documents d'exportation.",
    iso: "Qualité Export",
    certifiedExcellence: "Origine Traçable",
    productsEyebrow: "Nos Produits",
    productsTitle: "Catalogue d'Exportation",
    productsSub:
      "Cultures égyptiennes saisonnières avec calibres, poids de conditionnement et volumes min. (MOQ).",
    freshFruits: "Fruits Frais",
    freshVegetables: "Légumes Frais",
    filterFruits: "Fruits",
    filterVegetables: "Légumes",
    exportProducts: "Produits d'Exportation",
    importProducts: "Produits d'Importation",
    importEmpty:
      "Notre programme d'importation est en cours de préparation. Contactez-nous pour vos besoins.",
    premium: "Phare",
    learnMore: "Demander un Devis",
    viewSpecs: "Voir Fiche",
    seasonLabel: "Saison",
    packingLabel: "Emballage",
    moqLabel: "MOQ",
    whyEyebrow: "Pourquoi Nous Choisir",
    whyTitle: "Avantages Opérationnels",
    processEyebrow: "Processus d'Exportation",
    processTitle1: "De la Ferme au",
    processTitleGold: "Port d'Arrivée",
    processSub:
      "Sept étapes contrôlées : maturité, calibrage, refroidissement des conteneurs et formalités douanières.",
    certsEyebrow: "Documents d'Exportation",
    certsTitle: "Dossiers Douaniers & Contrôles",
    marketsEyebrow: "Axes d'Exportation",
    marketsTitle1: "Marchés",
    marketsTitleGold: "Cibles",
    marketsSub:
      "Expéditions maritimes reefer et aériennes desservant l'UE, le Royaume-Uni, la Russie, l'Arabie Saoudite, les EAU, l'Afrique et l'Inde.",
    contactEyebrow: "Contact",
    contactTitle1: "Demandez Votre",
    contactTitleGold: "Devis FOB / CIF",
    contactTitle2: "",
    contactSub:
      "Contactez-nous pour un devis FOB ou CIF, les spécifications de chargement ou une commande test. Notre équipe répond sous un jour ouvré.",
    fName: "Nom",
    fCompany: "Société",
    fCountry: "Pays",
    fEmail: "E-mail",
    fPhone: "Téléphone",
    fProduct: "Produit Recherché",
    fProductSelectDefault: "Sélectionnez un produit...",
    fProductAllOption: "Plusieurs produits / Demande générale",
    fMessage: "Message",
    fMessagePlaceholder: "Indiquez le produit, tonnage ou conteneur, l'emballage souhaité et le port d'arrivée...",
    sendInquiry: "Envoyer la Demande",
    requestQuotation: "Demander une Cotation",
    errRequired: "Veuillez saisir votre nom, votre e-mail, votre téléphone et votre message.",
    errQuoteRequired: "Veuillez renseigner votre nom, votre e-mail et votre téléphone pour demander un devis.",
    errEmail: "Veuillez entrer une adresse e-mail valide.",
    okSent: "Merci ! Votre demande a bien été reçue. Notre équipe répond sous un jour ouvré.",
    okQuote: "Demande de devis reçue. Notre équipe répond sous un jour ouvré.",
    rights: "Tous droits réservés.",
    footerBadge: "Exportateur de Produits Agricoles Égyptiens",
    backToTop: "Retour en haut",
    toggleMenu: "Menu",
    language: "Langue",
    importExportLabel: "Import & Export",
    all: "Tout",
    other: "Autres",
    noCategoryProducts: "Aucun produit dans cette catégorie pour le moment.",
    partnersTitle: "Nos Partenaires",
    partnersSub: "En collaboration avec des producteurs, stations de tri et transporteurs sur nos corridors clés",
    whatsappLabel: "Discuter sur WhatsApp",
    whatsappGreeting:
      "Bonjour BucharestEgyAgro, je souhaite recevoir un devis pour l'exportation de fruits et légumes égyptiens.",
    errSubmit: "Impossible d'envoyer la demande pour le moment. Veuillez réessayer plus tard.",
    mapHub: "ÉGYPTE",
    addressFallback: "Le Caire, Égypte — Bureau d'Export & Coordination",
  },
  stats: [
    { n: "12+", l: "Cultures Export" },
    { n: "7", l: "Étapes Logistiques" },
    { n: "4", l: "Régions Cibles" },
    { n: "1 Jour", l: "Réponse Ouvrée" },
  ],
  badges: ["Direct des Fermes", "Expédition FOB / CIF", "Contrôle Multi-Étapes"],
  fruits: [
    { name: "Oranges", desc: "Navel, Valencia & Baladi · >45% de jus · Calibres 48–113." },
    { name: "Raisins", desc: "Early Sweet, Superior & Flame · Brix 16–20° · Buvards SO2." },
    { name: "Mangues", desc: "Keitt, Kent & Naomi · Chair sans fibres · Plateaux 4–5 kg." },
    { name: "Grenades", desc: "Wonderful & 116 · Brix >16° · 300–700 g en plateaux alvéolés." },
    { name: "Fraises", desc: "Fortuna & Festival · Frais avion (2 kg) & IQF mer (10 kg)." },
    { name: "Citrons", desc: "Adalia, Baladi & Eureka · >35% de jus · Calibres 80–180 g." },
  ],
  vegetables: [
    { name: "Pommes de terre", desc: "Spunta, Hermes & Lady Rosetta · 20–24% MS · Sacs 10/25 kg." },
    { name: "Oignons", desc: "Giza 6, Doré & Rouge · >14% MS · Peaux fermes 40–90 mm." },
    { name: "Ail", desc: "Blanc Égyptien & Rouge Baladi · Frais ou sec · 4,5–6,5+ cm." },
    { name: "Patates Douces", desc: "Beauregard affinées 7 jours · Brix >11° · Cartons 5–10 kg." },
    { name: "Haricots Verts", desc: "Paulista & Serengeti · Extra-fin (<6 mm) · Avion frais & IQF." },
    { name: "Poivrons", desc: "Poivrons cubiques & piments · Calibre G/GG · Cartons 5 kg." },
  ],
  whyUs: [
    { title: "Terroirs Delta & Désert", desc: "Approvisionnement direct à Ismaïlia, Noubaria, Sadat City et Haute-Égypte." },
    { title: "Calibrage & Taux Brix", desc: "Tri mécanique et manuel adapté au cahier des charges des acheteurs." },
    { title: "Récolte à Maturité Optimale", desc: "Cueillette planifiée pour la tenue au transport maritime longue distance." },
    { title: "Contrôle Avant Chargement", desc: "Vérification visuelle, poids net et défauts avant scellement du conteneur." },
    { title: "Cotations Directes FOB / CIF", desc: "Tarifs établis par campagne selon le volume et le port de destination." },
    { title: "Corridors Maritimes & Aériens", desc: "Lignes dédiées vers l'Europe, la Russie, le Golfe, l'Afrique et l'Asie." },
    { title: "Planning Maritime Fixe", desc: "Conditionnement synchronisé avec les départs hebdomadaires de navires." },
    { title: "Refroidissement Maîtrisé", desc: "Pré-refroidissement rapide, hygrométrie et sondes thermiques enregistrées." },
    { title: "Réponse Sous Un Jour Ouvré", desc: "Suivi des lots et cotations préliminaires transmis sous un jour ouvré." },
  ],
  process: [
    { title: "Sélection des Fermes", desc: "Contrats directs avec des fermes vérifiées du delta et des terres agricoles." },
    { title: "Contrôle Pré-Expédition", desc: "Tri au champ et inspection visuelle en station pour chaque lot." },
    { title: "Calibrage & Emballage", desc: "Conditionnement en cartons, barquettes ou filets selon vos critères." },
    { title: "Pré-Refroidissement", desc: "Abaissement rapide de température au cœur du fruit par air forcé." },
    { title: "Chargement Reefer", desc: "Arrimage optimisé avec ventilation contrôlée et enregistreurs de température." },
    { title: "Transit Maritime & Aérien", desc: "Navires porte-conteneurs reefer et fret aérien vers les ports cibles." },
    { title: "Arrivée & Documentation", desc: "Connaissement (B/L), certificat phytosanitaire et relevés remis avant déchargement." },
  ],
  regions: ["Europe & Royaume-Uni", "Moyen-Orient & Golfe", "Afrique", "Russie & Asie"],
  certs: [
    { title: "Dédouanement Phytosanitaire", sub: "Quarantaine Agricole Égyptienne" },
    { title: "Certificat d'Origine", sub: "Visé Chambre de Commerce" },
    { title: "Contrôle Poids & Calibre", sub: "Tri en Station de Conditionnement" },
    { title: "Relevé Thermique Reefer", sub: "Réglage Température & Ventilation" },
  ],
  contact: [
    "info@bucharestegyagro.com",
    "+20 107 003 3892",
    "Le Caire, Égypte — Bureau d'Export & Coordination",
  ],
};

const ar: SiteContent = {
  brand: "BucharestEgyAgro",
  brandSub: "(استيراد وتصدير)",
  nav: [
    { href: "#about", label: "من نحن" },
    { href: "#products", label: "منتجاتنا" },
    { href: "#why", label: "المميزات" },
    { href: "#process", label: "آلية العمل" },
    { href: "#markets", label: "الأسواق" },
  ],
  ui: {
    requestQuote: "اطلب عرض سعر",
    requestAQuote: "اطلب عرض سعر",
    getQuote: "اطلب عرض سعر",
    exploreProducts: "تصفح المنتجات",
    ourNews: "أخبارنا",
    heroBadge: "صادرات زراعية مصرية",
    heroTitle1: "فواكه وخضروات مصرية",
    heroTitleGold: "طازجة",
    heroTitle2: "للمستوردين في الأسواق الدولية",
    heroSub:
      "محاصيل موسمية منتقاة من دلتا النيل والإسماعيلية وصعيد مصر — مفروزة ومبرّدة وجاهزة للشحن إلى ميناء الوصول.",
    scroll: "تصفح المزيد",
    aboutEyebrow: "من نحن",
    aboutTitle1: "عن شركة",
    aboutTitleGold: "BucharestEgyAgro",
    aboutP1:
      "تقوم شركة BucharestEgyAgro للاستيراد والتصدير بتوريد الفواكه والخضروات المصرية الطازجة للمستوردين وتجار الجملة وشركات التوزيع في أوروبا والخليج وأفريقيا وآسيا.",
    aboutP2:
      "يشرف فريقنا التشغيلي على اختيار المزارع في الدلتا والمناطق الزراعية الجديدة، والفرز في محطات التعبئة، والتبريد المسبق، وتجهيز مستندات التصدير من القاهرة حتى ميناء الوصول.",
    iso: "جودة تصدير",
    certifiedExcellence: "تتبع المنشأ",
    productsEyebrow: "منتجاتنا",
    productsTitle: "كتالوج منتجات التصدير",
    productsSub:
      "محاصيل مصرية موسمية بمقاسات محددة وأوزان تعبئة واضحة وحد أدنى للحاوية (MOQ).",
    freshFruits: "فواكه طازجة",
    freshVegetables: "خضروات طازجة",
    filterFruits: "فواكه",
    filterVegetables: "خضروات",
    exportProducts: "منتجات التصدير",
    importProducts: "منتجات الاستيراد",
    importEmpty:
      "برنامج الاستيراد قيد التجهيز حالياً. تواصل معنا لمناقشة احتياجاتكم.",
    premium: "الأكثر طلباً",
    learnMore: "اطلب عرض سعر",
    viewSpecs: "المواصفات",
    seasonLabel: "الموسم",
    packingLabel: "التعبئة",
    moqLabel: "أقل كمية",
    whyEyebrow: "لماذا تختارنا",
    whyTitle: "مزايا عملية للمستوردين",
    processEyebrow: "آلية التصدير",
    processTitle1: "من المزرعة إلى",
    processTitleGold: "ميناء الوصول",
    processSub:
      "سبع خطوات منظمة لمتابعة النضج والتدريج في المحطة وضبط حرارة الحاوية وإتمام الأوراق الجمركية.",
    certsEyebrow: "وثائق وإجراءات التصدير",
    certsTitle: "مستندات الشحن والرقابة",
    marketsEyebrow: "خطوط التصدير",
    marketsTitle1: "الأسواق",
    marketsTitleGold: "المستهدفة",
    marketsSub:
      "شحن بحري مبرد وجوي منتظم يخدم المستوردين في أوروبا وبريطانيا وروسيا والسعودية والإمارات وأفريقيا والهند.",
    contactEyebrow: "تواصل معنا",
    contactTitle1: "اطلب تسعيرة",
    contactTitleGold: "FOB / CIF",
    contactTitle2: "لشحنتك",
    contactSub:
      "تواصل معنا لعروض الأسعار الموسمية (FOB أو CIF) ومواصفات تحميل الحاويات. يرد فريق التصدير خلال يوم عمل واحد.",
    fName: "الاسم",
    fCompany: "الشركة",
    fCountry: "الدولة",
    fEmail: "البريد الإلكتروني",
    fPhone: "رقم الهاتف",
    fProduct: "المنتج المطلوب",
    fProductSelectDefault: "اختر المنتج...",
    fProductAllOption: "عدة منتجات / استفسار تصدير عام",
    fMessage: "الرسالة",
    fMessagePlaceholder: "حدد المنتج المطلوب، الكمية أو نوع الحاوية، التعبئة وميناء الوصول...",
    sendInquiry: "إرسال الاستفسار",
    requestQuotation: "طلب عرض سعر",
    errRequired: "يرجى إدخال الاسم والبريد الإلكتروني ورقم الهاتف والرسالة.",
    errQuoteRequired: "يرجى إدخال الاسم والبريد الإلكتروني ورقم الهاتف لطلب عرض السعر.",
    errEmail: "يرجى إدخال بريد إلكتروني صحيح.",
    okSent: "شكراً لك! تم استلام استفسارك بنجاح، وسيتواصل معك فريقنا خلال يوم عمل واحد.",
    okQuote: "تم استلام طلب عرض السعر بنجاح. يرد فريق التصدير خلال يوم عمل واحد.",
    rights: "جميع الحقوق محفوظة.",
    footerBadge: "مصدرون للحاصلات الزراعية المصرية",
    backToTop: "العودة للأعلى",
    toggleMenu: "القائمة",
    language: "اللغة",
    importExportLabel: "استيراد وتصدير",
    all: "الكل",
    other: "أخرى",
    noCategoryProducts: "لا توجد منتجات متاحة في هذه الفئة حالياً.",
    partnersTitle: "شركاؤنا",
    partnersSub: "تعاون مباشر مع المزارع ومحطات التعبئة وشركات الشحن عبر خطوط التصدير الرئيسية",
    whatsappLabel: "تواصل عبر واتساب",
    whatsappGreeting:
      "مرحباً بوخارست إيجي أجرو، أرغب في طلب عرض سعر لتصدير الحاصلات الزراعية المصرية.",
    errSubmit: "تعذر إرسال الطلب في الوقت الحالي. يرجى المحاولة لاحقاً.",
    mapHub: "مصر",
    addressFallback: "القاهرة، مصر — مكتب التصدير والتشغيل",
  },
  stats: [
    { n: "+12", l: "محصولاً تصديرياً" },
    { n: "7", l: "خطوات تجهيز" },
    { n: "4", l: "أقاليم تصديرية" },
    { n: "يوم عمل", l: "الرد على الطلبات" },
  ],
  badges: ["مباشرة من المزارع", "شحن FOB و CIF", "فحص متعدد المراحل"],
  fruits: [
    { name: "البرتقال", desc: "أبو سرة وفالنسيا · عصير >45% · مقاسات 48–113." },
    { name: "العنب", desc: "إيرلي سويت وسوبريور · سكريات 16–20 بريكس · بانيتات SO2." },
    { name: "المانجو", desc: "كيت وكينت ونعومي · لب خالٍ من الألياف · أوزان 250–900 جم." },
    { name: "الرمان", desc: "وندرفل و116 · سكريات >16 بريكس · كراتين 4–5 كجم بأطباق." },
    { name: "الفراولة", desc: "فورتونا وفستيفال · طازجة جواً (2 كجم) ومجمدة IQF (10 كجم)." },
    { name: "الليمون", desc: "أضاليا وبلدي ويوريكا · عصير >35% · مقاسات 80–180 جم." },
  ],
  vegetables: [
    { name: "البطاطس", desc: "سبونتا وهيرمس وروزيتا · مادة جافة 20–24% · أجولة 10/25 كجم." },
    { name: "البصل", desc: "جيزة 6 والذهبي والأحمر · مادة جافة >14% · مقاسات 40–90 ملم." },
    { name: "الثوم", desc: "أبيض مصري وأحمر بلدي · طازج ومجفف · أقطار 4.5–6.5+ سم." },
    { name: "البطاطا الحلوة", desc: "بورجارد معالجة 7 أيام · سكريات >11 بريكس · كراتين 5–10 كجم." },
    { name: "الفاصوليا الخضراء", desc: "بوليستا وسيرينجيتي · رفيعة (<6 ملم) · تبريد مائي فوري." },
    { name: "الفلفل الألوان", desc: "فلفل ألوان وفلفل حار · مقاسات G/GG · كراتين 5 كجم." },
  ],
  whyUs: [
    { title: "منشأ الدلتا والصحراء", desc: "توريد مباشر من مزارع الإسماعيلية والنوبارية والسادات وصعيد مصر." },
    { title: "فرز السكريات والمقاسات", desc: "تدريج آلي ويدوي دقيق للأحجام ونسبة السكر وفق مواصفات المشتري." },
    { title: "الحصاد في ذروة النضج", desc: "جدولة القطاف في الموعد المناسب لتحمل الشحن البحري الطويل." },
    { title: "فحص ما قبل الشحن", desc: "مراجعة بصرية وفحص للأوزان وخلو العيوب قبل إغلاق الحاوية." },
    { title: "تسعير مباشر FOB / CIF", desc: "عروض أسعار شفافة حسب الموسم والكميات وميناء الوصول." },
    { title: "خطوط شحن إقليمية", desc: "شحن بحري مبرد وجوي لأوروبا وروسيا والخليج وأفريقيا وآسيا." },
    { title: "مواعيد تحميل منضبطة", desc: "تزامن التعبئة في المحطات مع مواعيد إغلاق السفن الأسبوعية." },
    { title: "تبريد وضبط الحاويات", desc: "تبريد مسبق بالهواء المدفوع ومتابعة درجات الحرارة والرطوبة." },
    { title: "الرد خلال يوم عمل واحد", desc: "تسليم تحديثات الدفعات وعروض الأسعار خلال يوم عمل واحد." },
  ],
  process: [
    { title: "اختيار المزارع", desc: "تحديد قطع الإنتاج في مزارع الشركاء بدلتا النيل والأراضي المستصلحة." },
    { title: "فحص ما قبل الشحن", desc: "فرز ميداني وفحص بصري وللأوزان في المحطة لكل دفعة." },
    { title: "التدريج والتعبئة", desc: "تعبئة في كراتين أو بانيتات أو أجولة حسب اشتراطات المستورد." },
    { title: "التبريد المسبق", desc: "خفض حرارة الثمار بسرعة فور التعبئة بالهواء المدفوع." },
    { title: "تحميل الحاويات", desc: "تستيف مبرد مع ضبط فتحات التهوية ووضع مسجلات الحرارة." },
    { title: "الشحن البحري والجوي", desc: "حجز منتظم على الخطوط الملاحية والشحن الجوي لموانئ المقصد." },
    { title: "الوصول والمستندات", desc: "تسليم بوليصة الشحن والشهادة النباتية وتقارير الحرارة قبل التفريغ." },
  ],
  regions: ["أوروبا وبريطانيا", "الشرق الأوسط والخليج", "أفريقيا", "روسيا وآسيا"],
  certs: [
    { title: "شهادة الصحة النباتية", sub: "إفراج الحجر الزراعي المصري" },
    { title: "شهادة المنشأ التجارية", sub: "إصدار الغرفة التجارية للتخليص" },
    { title: "فحص وتدريج المحطة", sub: "مراجعة الأحجام والوزن الصافي" },
    { title: "سجل تبريد الحاوية", sub: "ضبط الحرارة والتهوية قبل الإبحار" },
  ],
  contact: [
    "info@bucharestegyagro.com",
    "+20 107 003 3892",
    "القاهرة، مصر — مكتب التصدير والتشغيل",
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
    requestAQuote: "Запросить цену",
    getQuote: "Запросить цену",
    exploreProducts: "Каталог продукции",
    ourNews: "Новости",
    heroBadge: "Египетский сельхозэкспорт",
    heroTitle1: "Свежие египетские фрукты и",
    heroTitleGold: "овощи",
    heroTitle2: "для международных импортёров",
    heroSub:
      "Сезонный урожай из дельты Нила, Исмаилии и Верхнего Египта — отсортированный, охлаждённый и готовый к отгрузке в ваш порт.",
    scroll: "Вниз",
    aboutEyebrow: "О компании",
    aboutTitle1: "О компании",
    aboutTitleGold: "BucharestEgyAgro",
    aboutP1:
      "Компания BucharestEgyAgro Import and Export поставляет свежие египетские фрукты и овощи импортёрам, оптовым компаниям и торговым сетям Европы, стран Залива, Африки и Азии.",
    aboutP2:
      "Наша команда контролирует подбор хозяйств в дельте Нила и пустынных регионах, сортировку на упаковочных линиях, предварительное охлаждение контейнеров и оформление экспортных документов.",
    iso: "Экспортный класс",
    certifiedExcellence: "Контроль происхождения",
    productsEyebrow: "Наша продукция",
    productsTitle: "Каталог экспортной продукции",
    productsSub:
      "Сезонные египетские культуры с точными калибрами, весом упаковки и минимальной партией (MOQ).",
    freshFruits: "Свежие фрукты",
    freshVegetables: "Свежие овощи",
    filterFruits: "Фрукты",
    filterVegetables: "Овощи",
    exportProducts: "Экспортная продукция",
    importProducts: "Импортная продукция",
    importEmpty:
      "Программа импорта находится в стадии формирования. Свяжитесь с нами для обсуждения поставок.",
    premium: "Хит экспорта",
    learnMore: "Запросить цену",
    viewSpecs: "Характеристики",
    seasonLabel: "Сезон",
    packingLabel: "Упаковка",
    moqLabel: "Мин. заказ",
    whyEyebrow: "Почему выбирают нас",
    whyTitle: "Практические преимущества",
    processEyebrow: "Экспортный процесс",
    processTitle1: "От фермы до",
    processTitleGold: "порта прибытия",
    processSub:
      "Семь контролируемых этапов: отбор зрелости, сортировка, термоконтроль контейнера и таможенное оформление.",
    certsEyebrow: "Экспортные документы",
    certsTitle: "Таможенное и грузовое оформление",
    marketsEyebrow: "Направления поставок",
    marketsTitle1: "Целевые рынки",
    marketsTitleGold: "экспорта",
    marketsSub:
      "Регулярные морские рефрижераторные и авиаотгрузки для покупателей в ЕС, Великобритании, России, Саудовской Аравии, ОАЭ, Африке и Индии.",
    contactEyebrow: "Контакты",
    contactTitle1: "Запросите расчёт",
    contactTitleGold: "FOB / CIF",
    contactTitle2: "",
    contactSub:
      "Свяжитесь с нами для расчёта цен FOB или CIF, спецификаций загрузки или пробной партии. Мы отвечаем в течение одного рабочего дня.",
    fName: "Имя",
    fCompany: "Компания",
    fCountry: "Страна",
    fEmail: "Электронная почта",
    fPhone: "Телефон",
    fProduct: "Интересующий товар",
    fProductSelectDefault: "Выберите товар...",
    fProductAllOption: "Несколько позиций / Общий запрос",
    fMessage: "Сообщение",
    fMessagePlaceholder: "Укажите товар, объём или тип контейнера, упаковку и порт назначения...",
    sendInquiry: "Отправить запрос",
    requestQuotation: "Запросить расчёт",
    errRequired: "Пожалуйста, введите имя, электронную почту, телефон и сообщение.",
    errQuoteRequired: "Пожалуйста, введите имя, электронную почту и телефон для расчёта стоимости.",
    errEmail: "Пожалуйста, введите корректный адрес электронной почты.",
    okSent: "Спасибо! Ваш запрос получен. Мы ответим в течение одного рабочего дня.",
    okQuote: "Запрос на расчёт стоимости получен. Мы ответим в течение одного рабочего дня.",
    rights: "Все права защищены.",
    footerBadge: "Экспортёр египетской сельхозпродукции",
    backToTop: "Наверх",
    toggleMenu: "Меню",
    language: "Язык",
    importExportLabel: "Импорт и Экспорт",
    all: "Все",
    other: "Прочее",
    noCategoryProducts: "В этой категории пока нет доступных товаров.",
    partnersTitle: "Наши партнёры",
    partnersSub: "Прямое сотрудничество с хозяйствами, упаковочными центрами и перевозчиками на ключевых маршрутах",
    whatsappLabel: "Чат в WhatsApp",
    whatsappGreeting:
      "Здравствуйте, BucharestEgyAgro! Я хотел(а) бы запросить расчёт стоимости экспорта египетской продукции.",
    errSubmit: "Не удалось отправить запрос. Пожалуйста, попробуйте позже.",
    mapHub: "ЕГИПЕТ",
    addressFallback: "Каир, Египет — Экспортный офис и координация",
  },
  stats: [
    { n: "12+", l: "Экспортных культур" },
    { n: "7", l: "Этапов отгрузки" },
    { n: "4", l: "Ключевых региона" },
    { n: "1 День", l: "Ответ на заявку" },
  ],
  badges: ["Прямо с ферм", "Отгрузки FOB / CIF", "Многоступенчатый контроль"],
  fruits: [
    { name: "Апельсины", desc: "Навел, Валенсия и Балади · сок >45% · калибры 48–113." },
    { name: "Виноград", desc: "Эрли Свит, Супериор, Флейм · Брикс 16–20° · SO2." },
    { name: "Манго", desc: "Китт, Кент, Наоми · мякоть без волокон · лотки 4–5 кг." },
    { name: "Гранаты", desc: "Вандерфул и 116 · Брикс >16° · плоды 300–700 г." },
    { name: "Клубника", desc: "Фортуна и Фестиваль · свежая авиа (2 кг) и IQF море (10 кг)." },
    { name: "Лимоны", desc: "Адалия, Балади, Эврика · сок >35% · калибр 80–180 г." },
  ],
  vegetables: [
    { name: "Картофель", desc: "Спунта, Гермес, Леди Розетта · сухое в-во 20–24% · 10/25 кг." },
    { name: "Репчатый лук", desc: "Гиза 6, Золотистый, Красный · >14% СР · калибр 40–90 мм." },
    { name: "Чеснок", desc: "Египетский белый и красный · свежий и сухой · 4,5–6,5+ см." },
    { name: "Батат", desc: "Борегард 7-дневный кюринг · Брикс >11° · коробки 5–10 кг." },
    { name: "Стручковая фасоль", desc: "Паулиста, Серенгети · <6 мм и 6–9 мм · гидроохлаждение." },
    { name: "Болгарский перец", desc: "Кубовидный перец и чили · размер G/GG · коробки 5 кг." },
  ],
  whyUs: [
    { title: "Фермы Дельты и пустыни", desc: "Прямые поставки из хозяйств Исмаилии, Нубарии, Садат-Сити и Верхнего Египта." },
    { title: "Калибровка и Брикс", desc: "Точная сортировка по размеру и зрелости под спецификации торговых сетей." },
    { title: "Сбор в пик зрелости", desc: "Сбор урожая в оптимальное окно для длительной морской транспортировки." },
    { title: "Предэкспортная инспекция", desc: "Визуальная проверка и контроль веса нетто перед пломбировкой контейнера." },
    { title: "Прямые расчёты FOB / CIF", desc: "Прозрачные сезонные котировки под объём, фасовку и порт прибытия." },
    { title: "Региональные маршруты", desc: "Морские рефконтейнеры и авиадоставка в Европу, РФ, Залив, Африку и Азию." },
    { title: "Точный график отгрузок", desc: "Работа упаковочного цеха синхронизирована с недельным расписанием судов." },
    { title: "Термоконтроль контейнера", desc: "Предварительное охлаждение, влажность и регистраторы температуры в рейсе." },
    { title: "Ответ за один рабочий день", desc: "Оперативная обработка заявок и статусы отгрузок в течение рабочего дня." },
  ],
  process: [
    { title: "Отбор ферм", desc: "Контрактация партий напрямую в хозяйствах дельты Нила и пустынных зон." },
    { title: "Предэкспортный осмотр", desc: "Отбор в поле и визуально-весовой контроль на упаковочной линии." },
    { title: "Сортировка и фасовка", desc: "Калибровка и упаковка в коробки, пинетки или сетки по заказу." },
    { title: "Быстрое охлаждение", desc: "Принудительное снижение температуры плодов сразу после фасовки." },
    { title: "Погрузка рефконтейнера", desc: "Укладка с проверкой вентиляции и установкой термодатчиков." },
    { title: "Морской и авиафрахт", desc: "Регулярная отправка судами-рефрижераторами и авиалиниями в порт заказчика." },
    { title: "Прибытие и документы", desc: "Передача коносамента (B/L), фитосанитарных бумаг и термограмм до выгрузки." },
  ],
  regions: ["Европа и Великобритания", "Ближний Восток и Залив", "Африка", "Россия и Азия"],
  certs: [
    { title: "Фитосанитарный контроль", sub: "Оформление карантинной службы Египта" },
    { title: "Сертификат происхождения", sub: "Заверение Торговой палаты" },
    { title: "Сортировка и вес нетто", sub: "Калибровка на упаковочной линии" },
    { title: "Термопротокол контейнера", sub: "Контроль температуры и вентиляции" },
  ],
  contact: [
    "info@bucharestegyagro.com",
    "+20 107 003 3892",
    "Каир, Египет — Экспортный офис и координация",
  ],
};

export const content: Record<Lang, SiteContent> = { en, fr, ar, ru };
