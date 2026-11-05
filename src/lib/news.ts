import { apiNews, uploadToHostinger } from "./hostinger-api";

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
  const id = article.id || `news-${Date.now()}`;
  const item: NewsArticle = {
    ...article,
    id,
    slug: article.slug || slugifyNews(article.title),
    updated_at: new Date().toISOString(),
  };

  const idx = items.findIndex((a) => a.id === id || a.slug === item.slug);
  if (idx >= 0) {
    items[idx] = item;
  } else {
    items.unshift(item);
  }
  setLocalNews(items);

  try {
    await apiNews.save(item);
  } catch {}

  return null;
}

export async function deleteNews(id: string): Promise<string | null> {
  const items = getLocalNews().filter((a) => a.id !== id);
  setLocalNews(items);

  try {
    await apiNews.delete(id);
  } catch {}
  return null;
}

/** Uploads an image to storage or converts to local data URL. */
export async function uploadNewsImage(file: File): Promise<{ url?: string; error?: string }> {
  if (!file.type.startsWith("image/")) return { error: "Please choose an image file." };
  if (file.size > 8 * 1024 * 1024) return { error: "Image is too large. Keep it under 8 MB." };

  try {
    const res = await uploadToHostinger(file, "news");
    if (res?.url) return { url: res.url };
  } catch {}

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

export function formatDate(value: string, lang: "en" | "fr") {
  try {
    const d = new Date(value);
    return d.toLocaleDateString(lang === "fr" ? "fr-FR" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return value;
  }
}
