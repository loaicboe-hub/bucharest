import { apiNews, uploadToHostinger } from "./hostinger-api";
import type { Lang } from "./i18n";

const NEWS_STORAGE_KEY = "app_news_articles";

export type NewsArticle = {
  id: string;
  slug: string;
  title: string;
  title_ar: string;
  excerpt: string;
  excerpt_ar: string;
  content: string;
  content_ar: string;
  featured_image: string;
  gallery: string[];
  category: string;
  tags: string[];
  author: string;
  video_url: string;
  published: boolean;
  published_at: string;
  created_at: string;
  updated_at: string;
};

export function slugifyNews(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\u0600-\u06FF]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function blankArticle(): NewsArticle {
  const now = new Date().toISOString();
  return {
    id: "",
    slug: "",
    title: "",
    title_ar: "",
    excerpt: "",
    excerpt_ar: "",
    content: "",
    content_ar: "",
    featured_image: "",
    gallery: [],
    category: "",
    tags: [],
    author: "",
    video_url: "",
    published: true,
    published_at: now,
    created_at: now,
    updated_at: now,
  };
}

function getLocalNews(): NewsArticle[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(NEWS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function setLocalNews(items: NewsArticle[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(NEWS_STORAGE_KEY, JSON.stringify(items));
  } catch {}
}

/** Latest published articles first (public website). */
export async function listPublishedNews(): Promise<NewsArticle[]> {
  try {
    const remote = await apiNews.list(false);
    if (Array.isArray(remote) && remote.length > 0) return remote as NewsArticle[];
  } catch {}
  return getLocalNews().filter((a) => a.published);
}

export async function getNewsBySlug(slug: string): Promise<NewsArticle | null> {
  try {
    const remote = await apiNews.get(slug);
    if (remote) return remote as NewsArticle;
  } catch {}
  return getLocalNews().find((a) => a.slug === slug) ?? null;
}

/** All articles including drafts (admin only). */
export async function listAllNews(): Promise<NewsArticle[]> {
  try {
    const remote = await apiNews.list(true);
    if (Array.isArray(remote) && remote.length > 0) {
      setLocalNews(remote as NewsArticle[]);
      return remote as NewsArticle[];
    }
  } catch {}
  return getLocalNews();
}

export async function saveNews(article: NewsArticle): Promise<string | null> {
  const items = getLocalNews();
  const isLocal = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
  const id = article.id || `news-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;
  const item: NewsArticle = {
    ...article,
    id,
    slug: article.slug || slugifyNews(article.title) || id,
    updated_at: new Date().toISOString(),
  };

  try {
    const res = await apiNews.save(item);
    if (res?.id) item.id = res.id;
    if (res?.slug) item.slug = res.slug;
  } catch (err: any) {
    if (!isLocal) return err?.message || "Failed to save article to server.";
  }

  const idx = items.findIndex((a) => a.id === item.id);
  if (idx >= 0) {
    items[idx] = item;
  } else {
    items.unshift(item);
  }
  setLocalNews(items);
  return null;
}

export async function deleteNews(id: string): Promise<string | null> {
  const isLocal = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
  try {
    await apiNews.delete(id);
  } catch (err: any) {
    if (!isLocal) return err?.message || "Failed to delete article from server.";
  }

  const items = getLocalNews().filter((a) => a.id !== id);
  setLocalNews(items);
  return null;
}

/** Uploads an image to storage or converts to local data URL on localhost. */
export async function uploadNewsImage(file: File): Promise<{ url?: string; error?: string }> {
  if (!file.type.startsWith("image/")) return { error: "Please choose an image file." };
  if (file.size > 8 * 1024 * 1024) return { error: "Image is too large. Keep it under 8 MB." };

  const isLocal = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
  try {
    const res = await uploadToHostinger(file, "news");
    if (res?.url) return { url: res.url };
  } catch (err: any) {
    if (!isLocal) return { error: err?.message || "Failed to upload image to server." };
  }

  if (!isLocal) return { error: "Failed to upload image to server." };

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve({ url: reader.result as string });
    reader.onerror = () => resolve({ error: "Failed to read image" });
    reader.readAsDataURL(file);
  });
}

/** Converts a YouTube / Vimeo link to an embeddable URL. */
export function toEmbedUrl(url: string): string | null {
  if (!url) return null;
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{6,})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return null;
}

const HAS_ARABIC = /[\u0600-\u06FF]/;
const HAS_CYRILLIC = /[\u0400-\u04FF]/;

const SEEDED_NEWS_TRANSLATIONS: Record<
  string,
  Partial<Record<"fr" | "ru" | "ar", { title: string; excerpt: string; content: string; category?: string }>>
> = {
  "bucharestegyagro-expands-citrus-exports-2026": {
    fr: {
      title: "BucharestEgyAgro développe ses programmes d'exportation d'agrumes pour 2026",
      excerpt:
        "Grâce à des lignes de calibrage de pointe et une logistique frigorifique renforcée, nous lançons une saison record d'exportation d'agrumes.",
      content:
        "BucharestEgyAgro est fière d'annoncer le lancement officiel de son programme d'exportation d'agrumes d'hiver pour 2026, avec des oranges Valencia et Navel de première qualité expédiées directement des vergers égyptiens vers l'Europe et le monde entier.",
      category: "Actualités de l'entreprise",
    },
    ru: {
      title: "BucharestEgyAgro расширяет экспортные программы по цитрусовым на 2026 год",
      excerpt:
        "Благодаря современным линиям сортировки и расширенной рефрижераторной логистике мы готовы к рекордным отгрузкам цитрусовых.",
      content:
        "Компания BucharestEgyAgro с гордостью объявляет об официальном запуске расширенного сезона экспорта зимних цитрусовых 2026 года — отборных апельсинов сортов Валенсия и Навел, поставляемых напрямую из египетских садов в порты Европы и мира.",
      category: "Новости компании",
    },
    ar: {
      title: "بوخارست إيجي أجرو توسع برامج تصدير الموالح لموسم 2026",
      excerpt:
        "بخطوط فرز حديثة وشبكة لوجستية مبردة متطورة، نبدأ شحن أضخم كميات موالح للأسواق الأوروبية والعربية.",
      content:
        "تفخر شركة بوخارست إيجي أجرو بالإعلان عن انطلاق موسم تصدير الموالح لعام 2026 بأعلى معايير الجودة العالمية وشهادات التصدير المعتمدة.",
      category: "أخبار الشركة",
    },
  },
};

export function localizedArticle(item: NewsArticle, lang: Lang) {
  const seeded = SEEDED_NEWS_TRANSLATIONS[item.slug];
  const tIsAr = HAS_ARABIC.test(item.title_ar || "");
  const eIsAr = HAS_ARABIC.test(item.excerpt_ar || "");
  const cIsAr = HAS_ARABIC.test(item.content_ar || "");
  const tIsRu = HAS_CYRILLIC.test(item.title_ar || "");
  const eIsRu = HAS_CYRILLIC.test(item.excerpt_ar || "");
  const cIsRu = HAS_CYRILLIC.test(item.content_ar || "");

  if (lang === "ar") {
    const s = seeded?.ar;
    return {
      title: (tIsAr ? item.title_ar : "") || s?.title || item.title_ar || item.title,
      excerpt: (eIsAr ? item.excerpt_ar : "") || s?.excerpt || item.excerpt_ar || item.excerpt,
      content: (cIsAr ? item.content_ar : "") || s?.content || item.content_ar || item.content,
      category: (item.category === "Company News" && s?.category) || item.category,
    };
  }

  if (lang === "fr") {
    const s = seeded?.fr;
    return {
      title: (!tIsAr && !tIsRu && item.title_ar) || s?.title || item.title,
      excerpt: (!eIsAr && !eIsRu && item.excerpt_ar) || s?.excerpt || item.excerpt,
      content: (!cIsAr && !cIsRu && item.content_ar) || s?.content || item.content,
      category: (item.category === "Company News" && s?.category) || item.category,
    };
  }

  if (lang === "ru") {
    const s = seeded?.ru;
    return {
      title: (tIsRu ? item.title_ar : "") || s?.title || item.title,
      excerpt: (eIsRu ? item.excerpt_ar : "") || s?.excerpt || item.excerpt,
      content: (cIsRu ? item.content_ar : "") || s?.content || item.content,
      category: (item.category === "Company News" && s?.category) || item.category,
    };
  }

  return {
    title: item.title,
    excerpt: item.excerpt,
    content: item.content,
    category: item.category,
  };
}

const DATE_LOCALES: Record<Lang, string> = {
  en: "en-US",
  fr: "fr-FR",
  ar: "ar-EG",
  ru: "ru-RU",
};

export function formatDate(value: string, lang: Lang) {
  try {
    const d = new Date(value);
    return d.toLocaleDateString(DATE_LOCALES[lang] ?? "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return value;
  }
}
