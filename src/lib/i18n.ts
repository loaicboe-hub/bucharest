import { useCallback, useSyncExternalStore } from "react";

export type Lang = "en" | "ar";

const KEY = "fd_lang";

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
  const lang: Lang = stored === "ar" ? "ar" : "en";
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
    dir: (lang === "ar" ? "rtl" : "ltr") as "rtl" | "ltr",
    c: content[lang],
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
  brand: "Nailvlora",
  brandSub: "for Export",
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
    heroBadge: "Est. 2011 — ISO 9001 Certified",
    heroTitle1: "Premium Fresh Fruits &",
    heroTitleGold: "Vegetables",
    heroTitle2: "Exported Worldwide",
    heroSub:
      "Delivering exceptional quality, freshness, and reliability since 2011 — from certified farms to your market, uninterrupted.",
    scroll: "Scroll",
    aboutEyebrow: "About Us",
    aboutTitle1: "About",
    aboutTitleGold: "Nailvlora",
    aboutP1:
      "Nailvlora Import and Export has been supplying premium-quality fresh fruits and vegetables to international markets since 2011. We are committed to quality, food safety, reliability, and customer satisfaction.",
    aboutP2:
      "With years of experience and strict quality control standards, we ensure every shipment meets international export requirements.",
    iso: "ISO 9001",
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
    footerBadge: "ISO 9001 Certified · Since 2011",
    backToTop: "Back to top",
    toggleMenu: "Toggle menu",
    language: "Language",
  },
  stats: [
    { n: "14+", l: "Years of Experience" },
    { n: "50+", l: "Professional Team" },
    { n: "ISO", l: "9001 Standards" },
    { n: "24/7", l: "Fast Delivery" },
  ],
  badges: ["Since 2011", "ISO 9001", "Global Export"],
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
    { title: "ISO 9001 Certified", desc: "Rigorous internationally recognized standards." },
    { title: "Selected Farms", desc: "Partnerships with trusted, vetted growers." },
    { title: "Strict Quality Control", desc: "Multi-stage inspection at every step." },
    { title: "Competitive Prices", desc: "Direct sourcing means best value." },
    { title: "Global Experience", desc: "Exporting worldwide since 2011." },
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
    { title: "ISO 9001", sub: "Quality Management" },
    { title: "Food Safety", sub: "Global Standards" },
    { title: "Export Ready", sub: "International Compliance" },
    { title: "Premium Grade", sub: "Quality Assurance" },
  ],
  contact: [
    "info@nailvlora-export.com",
    "+20 100 000 0000",
    "Cairo, Egypt — Serving Worldwide",
  ],
};

const ar: SiteContent = {
  brand: "فريش دايموند",
  brandSub: "للتصدير",
  nav: [
    { href: "#about", label: "من نحن" },
    { href: "#products", label: "منتجاتنا" },
    { href: "#why", label: "لماذا نحن" },
    { href: "#process", label: "مراحل التصدير" },
    { href: "#markets", label: "أسواقنا" },
  ],
  ui: {
    requestQuote: "اطلب عرض سعر",
    requestAQuote: "اطلب عرض سعر",
    exploreProducts: "استعرض المنتجات",
    heroBadge: "تأسست 2011 — حاصلة على شهادة الأيزو 9001",
    heroTitle1: "فواكه وخضروات طازجة",
    heroTitleGold: "فاخرة",
    heroTitle2: "تُصدَّر إلى العالم",
    heroSub:
      "نقدّم جودة استثنائية ونضارة دائمة والتزامًا كاملًا منذ عام 2011 — من المزارع المعتمدة إلى سوقكم دون انقطاع.",
    scroll: "مرّر للأسفل",
    aboutEyebrow: "من نحن",
    aboutTitle1: "عن فريش",
    aboutTitleGold: "دايموند",
    aboutP1:
      "تعمل شركة فريش دايموند للتصدير على توريد الفواكه والخضروات الطازجة عالية الجودة إلى الأسواق الدولية منذ عام 2011، بالتزام كامل بالجودة وسلامة الغذاء والموثوقية ورضا العملاء.",
    aboutP2:
      "وبفضل سنوات من الخبرة ومعايير صارمة لضبط الجودة، نضمن مطابقة كل شحنة لمتطلبات التصدير الدولية.",
    iso: "أيزو 9001",
    certifiedExcellence: "تميّز معتمد",
    productsEyebrow: "منتجاتنا",
    productsTitle: "حصاد من التميّز",
    productsSub:
      "فواكه وخضروات بدرجة تصديرية، مختارة بعناية من حيث النضارة والمظهر ومدة الصلاحية.",
    freshFruits: "فواكه طازجة",
    freshVegetables: "خضروات طازجة",
    exportProducts: "منتجات التصدير",
    importProducts: "منتجات الاستيراد",
    importEmpty:
      "برنامج الاستيراد قيد الإعداد. تواصل معنا لمناقشة احتياجات الاستيراد والتوريد.",

    premium: "فاخر",
    learnMore: "اعرف المزيد",
    whyEyebrow: "لماذا تختارنا",
    whyTitle: "ثقة راسخة ومعايير عالمية",
    processEyebrow: "مراحل التصدير",
    processTitle1: "من المزرعة إلى",
    processTitleGold: "الأسواق العالمية",
    processSub:
      "سبع مراحل محكمة تحافظ على نضارة كل شحنة وتتبّعها والتزامها بالمواعيد.",
    certsEyebrow: "الشهادات",
    certsTitle: "معايير جديرة بثقتكم",
    marketsEyebrow: "الأسواق العالمية",
    marketsTitle1: "نصدّر إلى",
    marketsTitleGold: "العالم",
    marketsSub:
      "نفخر بالتصدير إلى العديد من الأسواق الدولية، وننقل النضارة عبر القارات بسلسلة تبريد موثوقة.",
    contactEyebrow: "تواصل معنا",
    contactTitle1: "لنصدّر",
    contactTitleGold: "النضارة",
    contactTitle2: "معًا",
    contactSub:
      "تواصلوا معنا لطلب عروض الأسعار أو مواصفات المنتجات أو فرص الشراكة. يردّ فريقنا خلال يوم عمل واحد.",
    fName: "الاسم",
    fCompany: "الشركة",
    fCountry: "الدولة",
    fEmail: "البريد الإلكتروني",
    fPhone: "رقم الهاتف",
    fProduct: "المنتج المطلوب",
    fMessage: "الرسالة",
    fMessagePlaceholder: "أخبرنا عن احتياجاتكم...",
    sendInquiry: "إرسال الطلب",
    requestQuotation: "طلب عرض سعر",
    errRequired: "يرجى إدخال الاسم والبريد الإلكتروني والرسالة.",
    errEmail: "يرجى إدخال بريد إلكتروني صحيح.",
    okSent: "شكرًا لكم! تم استلام طلبكم وسنرد خلال يوم عمل واحد.",
    okQuote: "تم استلام طلب عرض السعر، وسيتواصل معكم فريق التصدير قريبًا.",
    rights: "جميع الحقوق محفوظة.",
    footerBadge: "حاصلة على الأيزو 9001 · منذ 2011",
    backToTop: "العودة إلى الأعلى",
    toggleMenu: "فتح القائمة",
    language: "اللغة",
  },
  stats: [
    { n: "+14", l: "عامًا من الخبرة" },
    { n: "+50", l: "فريق محترف" },
    { n: "أيزو", l: "معايير 9001" },
    { n: "24/7", l: "توصيل سريع" },
  ],
  badges: ["منذ 2011", "أيزو 9001", "تصدير عالمي"],
  fruits: [
    { name: "برتقال", desc: "حمضيات ناضجة بطعم حلو ومنعش." },
    { name: "عنب", desc: "عنب مائدة مقطوف يدويًا، ممتلئ وعصيري." },
    { name: "مانجو", desc: "مانجو استوائية عطرة بحلاوة العسل." },
    { name: "رمان", desc: "حبات ياقوتية غنية بالنكهة." },
    { name: "فراولة", desc: "ثمار عطرة محفوظة بسلسلة تبريد كاملة." },
    { name: "ليمون", desc: "ليمون فاخر رقيق القشرة وغني بالحموضة." },
  ],
  vegetables: [
    { name: "بطاطس", desc: "بطاطس متماسكة بدرجة تصديرية ومتعددة الاستخدام." },
    { name: "بصل", desc: "بصل ذهبي وأحمر بعمر تخزيني طويل." },
    { name: "ثوم", desc: "نكهة قوية ورؤوس متجانسة فاخرة." },
    { name: "بطاطا حلوة", desc: "حلاوة طبيعية ولب برتقالي غني." },
    { name: "فاصوليا خضراء", desc: "قرون طرية مقطوفة في أوانها." },
    { name: "فلفل ألوان", desc: "فلفل رومي ملوّن سميك اللب." },
  ],
  whyUs: [
    { title: "جودة فاخرة", desc: "منتجات بدرجة تصديرية فقط، منتقاة يدويًا." },
    { title: "معتمدون أيزو 9001", desc: "معايير دولية صارمة ومعترف بها." },
    { title: "مزارع مختارة", desc: "شراكات مع مزارعين موثوقين ومعتمدين." },
    { title: "رقابة جودة صارمة", desc: "فحص متعدد المراحل في كل خطوة." },
    { title: "أسعار تنافسية", desc: "التوريد المباشر يعني أفضل قيمة." },
    { title: "خبرة عالمية", desc: "نصدّر حول العالم منذ عام 2011." },
    { title: "التزام بالمواعيد", desc: "خدمات لوجستية يمكن الاعتماد عليها." },
    { title: "سلسلة تبريد", desc: "تحكم كامل في درجة الحرارة من البداية للنهاية." },
    { title: "العميل أولًا", desc: "شراكات طويلة الأمد لا مجرد صفقات." },
  ],
  process: [
    { title: "اختيار المزارع", desc: "التوريد من مزارع شريكة معتمدة فقط." },
    { title: "فحص الجودة", desc: "فحوصات حقلية ومعملية لكل دفعة." },
    { title: "الفرز والتعبئة", desc: "تدريج وتعبئة حسب مواصفات المشتري." },
    { title: "التخزين المبرد", desc: "تحكم دقيق في الحرارة والرطوبة." },
    { title: "تحميل الحاويات", desc: "حاويات مبردة يتم تحميلها بعناية." },
    { title: "الشحن الدولي", desc: "شحن بحري وجوي إلى جميع أنحاء العالم." },
    { title: "التسليم", desc: "تسليم طازج وفي الموعد المحدد." },
  ],
  regions: ["أوروبا", "الشرق الأوسط", "أفريقيا", "آسيا"],
  certs: [
    { title: "أيزو 9001", sub: "إدارة الجودة" },
    { title: "سلامة الغذاء", sub: "معايير عالمية" },
    { title: "جاهزية التصدير", sub: "امتثال دولي" },
    { title: "درجة فاخرة", sub: "ضمان الجودة" },
  ],
  contact: [
    "info@nailvlora-export.com",
    "+20 100 000 0000",
    "القاهرة، مصر — نخدم العالم",
  ],
};

export const content: Record<Lang, SiteContent> = { en, ar };
