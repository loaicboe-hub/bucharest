import { useCallback, useSyncExternalStore } from "react";

export type AdminLang = "en" | "fr";

const KEY = "app_admin_lang";

let current: AdminLang = "en";
let initialized = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function read(): AdminLang {
  try {
    return window.localStorage.getItem(KEY) === "fr" ? "fr" : "en";
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
} as const;

export type AdminKey = keyof (typeof adminDict)["en"];

export function useAdminLang() {
  const lang = useSyncExternalStore(
    subscribe,
    () => current,
    () => "en" as AdminLang,
  );
  const t = useCallback((key: AdminKey) => adminDict[lang]?.[key] ?? adminDict.en[key], [lang]);
  return { lang, t, setLang: setAdminLang, dir: "ltr" as const };
}
