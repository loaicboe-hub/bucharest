// Company news / blog system backed by localStorage, Hostinger MySQL, and Supabase if configured.
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";
import { apiNews, uploadToHostinger } from "./hostinger-api";

const BUCKET = "site-media";
const FOLDER = "news";
const SIGNED_TTL = 60 * 60 * 24 * 365; // 1 year
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
  // 1. Try Hostinger MySQL API
  try {
    const remote = await apiNews.list(false);
    if (Array.isArray(remote) && remote.length > 0) return remote as NewsArticle[];
  } catch {}

  // 2. Try Supabase if configured
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .eq("published", true)
        .order("published_at", { ascending: false });
      if (!error && data && data.length > 0) return data as NewsArticle[];
    } catch {}
  }
  return getLocalNews().filter((a) => a.published);
}

export async function getNewsBySlug(slug: string): Promise<NewsArticle | null> {
  // 1. Try Hostinger MySQL API
  try {
    const remote = await apiNews.get(slug);
    if (remote) return remote as NewsArticle;
  } catch {}

  // 2. Try Supabase if configured
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.from("news").select("*").eq("slug", slug).maybeSingle();
      if (!error && data) return data as NewsArticle;
    } catch {}
  }
  return getLocalNews().find((a) => a.slug === slug) ?? null;
}

/** All articles including drafts (admin only). */
export async function listAllNews(): Promise<NewsArticle[]> {
  // 1. Try Hostinger MySQL API
  try {
    const remote = await apiNews.list(true);
    if (Array.isArray(remote) && remote.length > 0) {
      setLocalNews(remote as NewsArticle[]);
      return remote as NewsArticle[];
    }
  } catch {}

  // 2. Try Supabase if configured
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .order("published_at", { ascending: false });
      if (!error && data && data.length > 0) {
        setLocalNews(data as NewsArticle[]);
        return data as NewsArticle[];
      }
    } catch {}
  }
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

  // 1. Try Hostinger MySQL API
  try {
    await apiNews.save(item);
  } catch {}

  // 2. If Supabase configured
  if (isSupabaseConfigured()) {
    try {
      const payload = {
        slug: item.slug,
        title: item.title,
        title_ar: item.title_ar,
        excerpt: item.excerpt,
        excerpt_ar: item.excerpt_ar,
        content: item.content,
        content_ar: item.content_ar,
        featured_image: item.featured_image,
        gallery: item.gallery,
        category: item.category,
        tags: item.tags,
        author: item.author,
        video_url: item.video_url,
        published: item.published,
        published_at: item.published_at,
      };

      if (article.id) {
        await supabase.from("news").update(payload).eq("id", article.id);
      } else {
        await supabase.from("news").insert(payload);
      }
    } catch {}
  }

  return null;
}

export async function deleteNews(id: string): Promise<string | null> {
  const items = getLocalNews().filter((a) => a.id !== id);
  setLocalNews(items);

  // 1. Try Hostinger MySQL API
  try {
    await apiNews.delete(id);
  } catch {}

  // 2. If Supabase configured
  if (isSupabaseConfigured()) {
    try {
      await supabase.from("news").delete().eq("id", id);
    } catch {}
  }
  return null;
}

/** Uploads an image to storage or converts to local data URL. */
export async function uploadNewsImage(file: File): Promise<{ url?: string; error?: string }> {
  if (!file.type.startsWith("image/")) return { error: "Please choose an image file." };
  if (file.size > 8 * 1024 * 1024) return { error: "Image is too large. Keep it under 8 MB." };

  // 1. Try uploading to Hostinger backend
  try {
    const res = await uploadToHostinger(file, "news");
    if (res?.url) return { url: res.url };
  } catch {}

  // 2. Local fallback
  if (!isSupabaseConfigured()) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve({ url: reader.result as string });
      reader.onerror = () => resolve({ error: "Failed to read image" });
      reader.readAsDataURL(file);
    });
  }

  // 3. Supabase fallback
  try {
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${FOLDER}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { upsert: true, contentType: file.type });
    if (error) return { error: error.message };

    const { data } = await supabase.storage.from(BUCKET).createSignedUrl(path, SIGNED_TTL);
    return data?.signedUrl ? { url: data.signedUrl } : { error: "Could not create image URL." };
  } catch (err: any) {
    return { error: err?.message || "Upload failed" };
  }
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
