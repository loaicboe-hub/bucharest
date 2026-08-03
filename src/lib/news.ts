// Company news / blog system backed by Lovable Cloud (news table + site-media storage).

import { supabase } from "@/integrations/supabase/client";

const BUCKET = "site-media";
const FOLDER = "news";
const SIGNED_TTL = 60 * 60 * 24 * 365; // 1 year

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

/** Latest published articles first (public website). */
export async function listPublishedNews(): Promise<NewsArticle[]> {
  const { data, error } = await supabase
    .from("news")
    .select("*")
    .eq("published", true)
    .order("published_at", { ascending: false });
  if (error) return [];
  return (data ?? []) as NewsArticle[];
}

export async function getNewsBySlug(slug: string): Promise<NewsArticle | null> {
  const { data } = await supabase.from("news").select("*").eq("slug", slug).maybeSingle();
  return (data as NewsArticle | null) ?? null;
}

/** All articles including drafts (admin only — RLS enforces it). */
export async function listAllNews(): Promise<NewsArticle[]> {
  const { data, error } = await supabase
    .from("news")
    .select("*")
    .order("published_at", { ascending: false });
  if (error) return [];
  return (data ?? []) as NewsArticle[];
}

export async function saveNews(article: NewsArticle): Promise<string | null> {
  const payload = {
    slug: article.slug,
    title: article.title,
    title_ar: article.title_ar,
    excerpt: article.excerpt,
    excerpt_ar: article.excerpt_ar,
    content: article.content,
    content_ar: article.content_ar,
    featured_image: article.featured_image,
    gallery: article.gallery,
    category: article.category,
    tags: article.tags,
    author: article.author,
    video_url: article.video_url,
    published: article.published,
    published_at: article.published_at,
  };

  if (article.id) {
    const { error } = await supabase.from("news").update(payload).eq("id", article.id);
    return error?.message ?? null;
  }
  const { error } = await supabase.from("news").insert(payload);
  return error?.message ?? null;
}

export async function deleteNews(id: string): Promise<string | null> {
  const { error } = await supabase.from("news").delete().eq("id", id);
  return error?.message ?? null;
}

/** Uploads an image to storage and returns a long-lived signed URL. */
export async function uploadNewsImage(file: File): Promise<{ url?: string; error?: string }> {
  if (!file.type.startsWith("image/")) return { error: "Please choose an image file." };
  if (file.size > 8 * 1024 * 1024) return { error: "Image is too large. Keep it under 8 MB." };

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${FOLDER}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { upsert: true, contentType: file.type });
  if (error) return { error: error.message };

  const { data } = await supabase.storage.from(BUCKET).createSignedUrl(path, SIGNED_TTL);
  return data?.signedUrl ? { url: data.signedUrl } : { error: "Could not create image URL." };
}

/** Converts a YouTube / Vimeo link to an embeddable URL (or null when unsupported). */
export function toEmbedUrl(url: string): string | null {
  if (!url) return null;
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{6,})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return null;
}

export function formatDate(value: string, lang: "en" | "ar") {
  try {
    return new Date(value).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-GB", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return value;
  }
}
