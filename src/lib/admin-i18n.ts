import { useCallback, useSyncExternalStore } from "react";

export type AdminLang = "en" | "ar";

const KEY = "fd_admin_lang";

let current: AdminLang = "en";
let initialized = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function read(): AdminLang {
  try {
    return window.localStorage.getItem(KEY) === "ar" ? "ar" : "en";
  } catch {
    return "en";
  }
}

function subscribe(cb: () => void) {
  if (!initialized && typeof window !== "undefined") {
    initialized = true;
    current = read();
  }
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function setAdminLang(lang: AdminLang) {
  current = lang;
  try {
    window.localStorage.setItem(KEY, lang);
  } catch {
    /* ignore */
  }
  emit();
}

export const adminDict = {
  en: {
    adminPanel: "Admin Panel",
    signedInAs: "Signed in as",
    management: "Management",
    logout: "Logout",
    language: "Language",
    english: "English",
    arabic: "العربية",

    "nav.dashboard": "Dashboard",
    "nav.quote-requests": "Quote Requests",
    "nav.contact-requests": "Contact Requests",
    "nav.products": "Products",
    "nav.invoices": "Billing & Invoices",
    "nav.markets": "Markets",
    "nav.partners": "Partners",
    "nav.content": "Website Content",
    "nav.media": "Media Library",
    "nav.branding": "Logo & Branding",
    "nav.seo": "SEO Settings",
    "nav.settings": "General Settings",

    "dashboard.desc": "Overview of your website performance and activity",
    "dashboard.totalProducts": "Total Products",
    "dashboard.contactRequests": "Contact Requests",
    "dashboard.quoteRequests": "Quote Requests",
    "dashboard.activeMarkets": "Active Markets",
    "dashboard.recentActivity": "Recent Activity",
    "dashboard.latestContacts": "Latest Contacts",

    "quote-requests.desc": "Requests for pricing and quantity quotations",
    "contact-requests.desc": "Inquiries submitted through the website contact form",
    "products.desc": "Manage your product catalog and display order",
    "invoices.desc": "Create and manage professional Commercial Invoices for international buyers.",
    "markets.desc": "Countries and regions your business exports to",
    "partners.desc": "Manage the partner logos shown in the Our Partners carousel on the home page",
    "content.desc": "Edit copy, imagery and CTAs across your public site",
    "media.desc": "Upload and manage images used across your site",
    "branding.desc": "Upload the company logo used in the website header, footer and invoice PDFs",
    "seo.desc": "Search engine and social sharing metadata",
    "settings.desc": "Company details, contact info and social links",
  },
  ar: {
    adminPanel: "لوحة التحكم",
    signedInAs: "تم تسجيل الدخول باسم",
    management: "الإدارة",
    logout: "تسجيل الخروج",
    language: "اللغة",
    english: "English",
    arabic: "العربية",

    "nav.dashboard": "لوحة المعلومات",
    "nav.quote-requests": "طلبات عروض الأسعار",
    "nav.contact-requests": "طلبات التواصل",
    "nav.products": "المنتجات",
    "nav.invoices": "الفواتير والمدفوعات",
    "nav.markets": "الأسواق",
    "nav.partners": "الشركاء",
    "nav.content": "محتوى الموقع",
    "nav.media": "مكتبة الوسائط",
    "nav.branding": "الشعار والهوية",
    "nav.seo": "إعدادات SEO",
    "nav.settings": "الإعدادات العامة",

    "dashboard.desc": "نظرة عامة على أداء موقعك ونشاطه",
    "dashboard.totalProducts": "إجمالي المنتجات",
    "dashboard.contactRequests": "طلبات التواصل",
    "dashboard.quoteRequests": "طلبات عروض الأسعار",
    "dashboard.activeMarkets": "الأسواق النشطة",
    "dashboard.recentActivity": "النشاط الأخير",
    "dashboard.latestContacts": "أحدث جهات الاتصال",

    "quote-requests.desc": "طلبات الأسعار والكميات",
    "contact-requests.desc": "الرسائل المرسلة عبر نموذج التواصل في الموقع",
    "products.desc": "إدارة كتالوج المنتجات وترتيب العرض",
    "invoices.desc": "إنشاء وإدارة الفواتير التجارية الاحترافية للمشترين الدوليين.",
    "markets.desc": "الدول والمناطق التي تصدّر إليها شركتك",
    "partners.desc": "إدارة شعارات الشركاء الظاهرة في قسم شركاؤنا على الصفحة الرئيسية",
    "content.desc": "تحرير النصوص والصور وأزرار الدعوة في موقعك العام",
    "media.desc": "رفع وإدارة الصور المستخدمة في موقعك",
    "branding.desc": "ارفع شعار الشركة المستخدم في رأس الموقع والتذييل وملفات الفواتير",
    "seo.desc": "بيانات محركات البحث والمشاركة على وسائل التواصل",
    "settings.desc": "بيانات الشركة ومعلومات التواصل وروابط التواصل الاجتماعي",
  },
} as const;

export type AdminKey = keyof (typeof adminDict)["en"];

export function useAdminLang() {
  const lang = useSyncExternalStore(
    subscribe,
    () => current,
    () => "en" as AdminLang,
  );
  const t = useCallback((key: AdminKey) => adminDict[lang][key] ?? adminDict.en[key], [lang]);
  return { lang, t, setLang: setAdminLang, dir: lang === "ar" ? ("rtl" as const) : ("ltr" as const) };
}
