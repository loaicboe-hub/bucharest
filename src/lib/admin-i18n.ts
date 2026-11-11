import { useCallback, useSyncExternalStore } from "react";

export type AdminLang = "en" | "fr" | "ar" | "ru";

export const ADMIN_LANG_OPTIONS: readonly {
  code: AdminLang;
  short: string;
  label: string;
  dir: "ltr" | "rtl";
}[] = [
  { code: "en", short: "EN", label: "English", dir: "ltr" },
  { code: "fr", short: "FR", label: "Français", dir: "ltr" },
  { code: "ar", short: "AR", label: "العربية", dir: "rtl" },
  { code: "ru", short: "RU", label: "Русский", dir: "ltr" },
];

const KEY = "app_admin_lang";

let current: AdminLang = "en";
let initialized = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function read(): AdminLang {
  try {
    const val = window.localStorage.getItem(KEY);
    if (val === "fr" || val === "ar" || val === "ru" || val === "en") return val;
    return "en";
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
    viewSite: "Go to Home Page",
    language: "Language",
    english: "English",
    french: "Français",
    arabic: "العربية",
    russian: "Русский",

    "nav.dashboard": "Dashboard",
    "nav.quote-requests": "Quote Requests",
    "nav.contact-requests": "Contact Requests",
    "nav.products": "Products",
    "nav.invoices": "Billing & Invoices",
    "nav.markets": "Markets",
    "nav.partners": "Partners",
    "nav.categories": "Categories",
    "nav.about-video": "About Us Video",
    "aboutVideo.desc": "Upload, replace or delete the video shown in the About Us section on the home page",
    "aboutVideo.current": "Current video",
    "aboutVideo.empty": "No video uploaded yet — the About Us section shows the default image.",
    "aboutVideo.upload": "Upload video",
    "aboutVideo.replace": "Replace video",
    "aboutVideo.delete": "Delete video",
    "aboutVideo.uploaded": "Video uploaded",
    "aboutVideo.deleted": "Video deleted",
    "aboutVideo.hint": "MP4 or WebM, up to 50 MB. It plays muted, looped and inline on all devices.",
    "nav.news": "News Management",
    "news.desc": "Create, edit and publish company news articles shown on the Our News page",
    "nav.content": "Website Content",
    "nav.media": "Media Library",
    "nav.branding": "Logo & Branding",
    "nav.seo": "SEO Settings",
    "nav.settings": "General Settings",
    "nav.users": "Users & Permissions",

    "users.desc": "Create admin users and control what each of them can view, create, edit or delete",
    "users.add": "Add User",
    "users.permissions": "Permissions",
    "users.superAdmin": "Super Admin",
    "users.saved": "Permissions updated",

    "dashboard.desc": "Overview of your website performance and activity",
    "dashboard.totalProducts": "Total Products",
    "dashboard.contactRequests": "Contact Requests",
    "dashboard.quoteRequests": "Quote Requests",
    "dashboard.activeMarkets": "Active Markets",
    "dashboard.recentActivity": "Recent Activity",
    "dashboard.latestContacts": "Latest Contacts",
    "dashboard.noActivity": "No quote or contact activity yet.",
    "dashboard.noContacts": "No contact requests yet.",
    "dashboard.quoteFrom": "Quote request from",
    "dashboard.inquiryFrom": "Inquiry from",

    "quote-requests.desc": "Requests for pricing and quantity quotations",
    "contact-requests.desc": "Inquiries submitted through the website contact form",
    "products.desc": "Manage your product catalog and display order",
    "products.add": "Add Product",
    "categories.title": "Product Categories",
    "categories.desc": "Add, rename, reorder and enable product categories",
    "categories.add": "Add Category",
    "invoices.desc": "Create and manage professional Commercial Invoices for international buyers.",
    "markets.desc": "Countries and regions your business exports to",
    "partners.desc": "Manage the partner logos shown in the Our Partners carousel on the home page",
    "content.desc": "Edit copy, imagery and CTAs across your public site",
    "media.desc": "Upload and manage images used across your site",
    "branding.desc": "Upload the company logo used in the website header, footer and invoice PDFs",
    "seo.desc": "Search engine and social sharing metadata",
    "settings.desc": "Company details, contact info and social links",
  },
  fr: {
    adminPanel: "Panneau d'Administration",
    signedInAs: "Connecté en tant que",
    management: "Gestion",
    logout: "Déconnexion",
    viewSite: "Aller au Site Public",
    language: "Langue",
    english: "English",
    french: "Français",
    arabic: "العربية",
    russian: "Русский",

    "nav.dashboard": "Tableau de Bord",
    "nav.quote-requests": "Demandes de Devis",
    "nav.contact-requests": "Demandes de Contact",
    "nav.products": "Produits",
    "nav.invoices": "Factures & Règlements",
    "nav.markets": "Marchés",
    "nav.partners": "Partenaires",
    "nav.categories": "Catégories",
    "nav.about-video": "Vidéo À Propos",
    "aboutVideo.desc": "Téléchargez, remplacez ou supprimez la vidéo affichée dans la section À Propos",
    "aboutVideo.current": "Vidéo actuelle",
    "aboutVideo.empty": "Aucune vidéo — l'image par défaut est affichée.",
    "aboutVideo.upload": "Télécharger une vidéo",
    "aboutVideo.replace": "Remplacer la vidéo",
    "aboutVideo.delete": "Supprimer la vidéo",
    "aboutVideo.uploaded": "Vidéo téléchargée avec succès",
    "aboutVideo.deleted": "Vidéo supprimée",
    "aboutVideo.hint": "MP4 ou WebM, jusqu'à 50 Mo. Lecture muette en boucle sur tous les appareils.",
    "nav.news": "Gestion des Actualités",
    "news.desc": "Créez, modifiez et publiez les articles d'actualité de l'entreprise",
    "nav.content": "Contenu du Site",
    "nav.media": "Médiathèque",
    "nav.branding": "Logo & Image de Marque",
    "nav.seo": "Paramètres SEO",
    "nav.settings": "Paramètres Généraux",
    "nav.users": "Utilisateurs & Permissions",

    "users.desc": "Gérer les administrateurs et configurer leurs droits d'accès",
    "users.add": "Ajouter un Utilisateur",
    "users.permissions": "Permissions",
    "users.superAdmin": "Super Administrateur",
    "users.saved": "Permissions mises à jour",

    "dashboard.desc": "Aperçu des performances et des activités récentes de votre site",
    "dashboard.totalProducts": "Total Produits",
    "dashboard.contactRequests": "Demandes de Contact",
    "dashboard.quoteRequests": "Demandes de Devis",
    "dashboard.activeMarkets": "Marchés Actifs",
    "dashboard.recentActivity": "Activité Récente",
    "dashboard.latestContacts": "Derniers Contacts",
    "dashboard.noActivity": "Aucune demande de devis ou de contact pour le moment.",
    "dashboard.noContacts": "Aucune demande de contact pour le moment.",
    "dashboard.quoteFrom": "Demande de devis de",
    "dashboard.inquiryFrom": "Message de",

    "quote-requests.desc": "Demandes de cotations et de volumes reçues",
    "contact-requests.desc": "Messages envoyés via le formulaire de contact",
    "products.desc": "Gérez votre catalogue de produits et leur ordre d'affichage",
    "products.add": "Ajouter un Produit",
    "categories.title": "Catégories de Produits",
    "categories.desc": "Ajouter, renommer, réordonner et activer les catégories",
    "categories.add": "Ajouter une Catégorie",
    "invoices.desc": "Créez et gérez des factures commerciales professionnelles pour vos clients.",
    "markets.desc": "Pays et régions vers lesquels vous exportez",
    "partners.desc": "Gérez les logos des partenaires affichés sur la page d'accueil",
    "content.desc": "Modifiez les textes, images et boutons de votre site public",
    "media.desc": "Téléchargez et organisez vos images",
    "branding.desc": "Logo de l'entreprise utilisé sur le site et dans les factures PDF",
    "seo.desc": "Métadonnées pour les moteurs de recherche et réseaux sociaux",
    "settings.desc": "Coordonnées de l'entreprise et réseaux sociaux",
  },
  ar: {
    adminPanel: "لوحة التحكم",
    signedInAs: "تم تسجيل الدخول باسم",
    management: "الإدارة",
    logout: "تسجيل الخروج",
    viewSite: "الذهاب إلى الموقع",
    language: "اللغة",
    english: "English",
    french: "Français",
    arabic: "العربية",
    russian: "Русский",

    "nav.dashboard": "لوحة المعلومات",
    "nav.quote-requests": "طلبات عروض الأسعار",
    "nav.contact-requests": "طلبات التواصل",
    "nav.products": "المنتجات",
    "nav.invoices": "الفواتير والمدفوعات",
    "nav.markets": "الأسواق",
    "nav.partners": "الشركاء",
    "nav.categories": "التصنيفات",
    "nav.about-video": "فيديو من نحن",
    "aboutVideo.desc": "رفع أو استبدال أو حذف الفيديو الظاهر في قسم من نحن على الصفحة الرئيسية",
    "aboutVideo.current": "الفيديو الحالي",
    "aboutVideo.empty": "لا يوجد فيديو مرفوع — يظهر قسم من نحن بالصورة الافتراضية.",
    "aboutVideo.upload": "رفع فيديو",
    "aboutVideo.replace": "استبدال الفيديو",
    "aboutVideo.delete": "حذف الفيديو",
    "aboutVideo.uploaded": "تم رفع الفيديو",
    "aboutVideo.deleted": "تم حذف الفيديو",
    "aboutVideo.hint": "MP4 أو WebM بحد أقصى 50 ميجابايت. يعمل تلقائياً وبدون صوت وبشكل متكرر على جميع الأجهزة.",
    "nav.news": "إدارة الأخبار",
    "news.desc": "إنشاء وتحرير ونشر أخبار الشركة الظاهرة في صفحة أخبارنا",
    "nav.content": "محتوى الموقع",
    "nav.media": "مكتبة الوسائط",
    "nav.branding": "الشعار والهوية",
    "nav.seo": "إعدادات SEO",
    "nav.settings": "الإعدادات العامة",
    "nav.users": "المستخدمون والصلاحيات",

    "users.desc": "إنشاء مستخدمي لوحة التحكم والتحكم في صلاحيات العرض والإضافة والتعديل والحذف",
    "users.add": "إضافة مستخدم",
    "users.permissions": "الصلاحيات",
    "users.superAdmin": "مدير عام",
    "users.saved": "تم تحديث الصلاحيات",

    "dashboard.desc": "نظرة عامة على أداء موقعك ونشاطه",
    "dashboard.totalProducts": "إجمالي المنتجات",
    "dashboard.contactRequests": "طلبات التواصل",
    "dashboard.quoteRequests": "طلبات عروض الأسعار",
    "dashboard.activeMarkets": "الأسواق النشطة",
    "dashboard.recentActivity": "النشاط الأخير",
    "dashboard.latestContacts": "أحدث جهات الاتصال",
    "dashboard.noActivity": "لا توجد طلبات عروض أسعار أو تواصل بعد.",
    "dashboard.noContacts": "لا توجد طلبات تواصل بعد.",
    "dashboard.quoteFrom": "طلب عرض سعر من",
    "dashboard.inquiryFrom": "رسالة تواصل من",

    "quote-requests.desc": "طلبات الأسعار والكميات",
    "contact-requests.desc": "الرسائل المرسلة عبر نموذج التواصل في الموقع",
    "products.desc": "إدارة كتالوج المنتجات وترتيب العرض",
    "products.add": "إضافة منتج",
    "categories.title": "تصنيفات المنتجات",
    "categories.desc": "إضافة وتعديل وترتيب وتفعيل تصنيفات المنتجات",
    "categories.add": "إضافة تصنيف",
    "invoices.desc": "إنشاء وإدارة الفواتير التجارية الاحترافية للمشترين الدوليين.",
    "markets.desc": "الدول والمناطق التي تصدّر إليها شركتك",
    "partners.desc": "إدارة شعارات الشركاء الظاهرة في قسم شركاؤنا على الصفحة الرئيسية",
    "content.desc": "تحرير النصوص والصور وأزرار الدعوة في موقعك العام",
    "media.desc": "رفع وإدارة الصور المستخدمة في موقعك",
    "branding.desc": "ارفع شعار الشركة المستخدم في رأس الموقع والتذييل وملفات الفواتير",
    "seo.desc": "بيانات محركات البحث والمشاركة على وسائل التواصل",
    "settings.desc": "بيانات الشركة ومعلومات التواصل وروابط التواصل الاجتماعي",
  },
  ru: {
    adminPanel: "Панель управления",
    signedInAs: "Вы вошли как",
    management: "Управление",
    logout: "Выйти",
    viewSite: "Перейти на сайт",
    language: "Язык",
    english: "English",
    french: "Français",
    arabic: "العربية",
    russian: "Русский",

    "nav.dashboard": "Дашборд",
    "nav.quote-requests": "Запросы цен",
    "nav.contact-requests": "Обращения",
    "nav.products": "Продукция",
    "nav.invoices": "Счета и инвойсы",
    "nav.markets": "Рынки",
    "nav.partners": "Партнёры",
    "nav.categories": "Категории",
    "nav.about-video": "Видео «О нас»",
    "aboutVideo.desc": "Загрузите, замените или удалите видео в разделе «О нас» на главной странице",
    "aboutVideo.current": "Текущее видео",
    "aboutVideo.empty": "Видео ещё не загружено — в разделе «О нас» отображается изображение по умолчанию.",
    "aboutVideo.upload": "Загрузить видео",
    "aboutVideo.replace": "Заменить видео",
    "aboutVideo.delete": "Удалить видео",
    "aboutVideo.uploaded": "Видео загружено",
    "aboutVideo.deleted": "Видео удалено",
    "aboutVideo.hint": "MP4 или WebM до 50 МБ. Воспроизводится без звука в цикле на всех устройствах.",
    "nav.news": "Новости",
    "news.desc": "Создавайте, редактируйте и публикуйте новости компании для страницы «Новости»",
    "nav.content": "Контент сайта",
    "nav.media": "Медиабиблиотека",
    "nav.branding": "Логотип и бренд",
    "nav.seo": "SEO-настройки",
    "nav.settings": "Общие настройки",
    "nav.users": "Пользователи и права",

    "users.desc": "Создавайте администраторов и настраивайте права на просмотр, создание, изменение и удаление",
    "users.add": "Добавить пользователя",
    "users.permissions": "Права доступа",
    "users.superAdmin": "Супер-админ",
    "users.saved": "Права обновлены",

    "dashboard.desc": "Обзор показателей и последней активности сайта",
    "dashboard.totalProducts": "Всего товаров",
    "dashboard.contactRequests": "Обращения",
    "dashboard.quoteRequests": "Запросы цен",
    "dashboard.activeMarkets": "Активные рынки",
    "dashboard.recentActivity": "Последняя активность",
    "dashboard.latestContacts": "Недавние контакты",
    "dashboard.noActivity": "Пока нет запросов цен или обращений.",
    "dashboard.noContacts": "Пока нет обращений.",
    "dashboard.quoteFrom": "Запрос цены от",
    "dashboard.inquiryFrom": "Обращение от",

    "quote-requests.desc": "Заявки на расчёт стоимости и объёмов поставок",
    "contact-requests.desc": "Сообщения, отправленные через форму обратной связи",
    "products.desc": "Управляйте каталогом продукции и порядком отображения",
    "products.add": "Добавить товар",
    "categories.title": "Категории продукции",
    "categories.desc": "Добавляйте, переименовывайте, сортируйте и включайте категории",
    "categories.add": "Добавить категорию",
    "invoices.desc": "Создавайте и управляйте коммерческими инвойсами для международных покупателей.",
    "markets.desc": "Страны и регионы экспортных поставок",
    "partners.desc": "Управляйте логотипами партнёров в карусели на главной странице",
    "content.desc": "Редактируйте тексты, изображения и кнопки на сайте",
    "media.desc": "Загружайте и управляйте изображениями для сайта",
    "branding.desc": "Логотип компании в шапке, подвале и PDF-инвойсах",
    "seo.desc": "Мета-данные для поисковых систем и соцсетей",
    "settings.desc": "Реквизиты компании, контакты и ссылки на соцсети",
  },
} as const;

export type AdminKey = keyof (typeof adminDict)["en"];

export function useAdminLang() {
  const lang = useSyncExternalStore(
    subscribe,
    () => current,
    () => "en" as AdminLang,
  );
  const t = useCallback((key: AdminKey) => adminDict[lang]?.[key] ?? adminDict.en[key], [lang]);
  return {
    lang,
    t,
    setLang: setAdminLang,
    dir: lang === "ar" ? ("rtl" as const) : ("ltr" as const),
  };
}
