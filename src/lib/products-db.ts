// Unified product system backed by Lovable Cloud.
// One record per product: type (export/import) + admin managed category +
// bilingual website content, images, specs and visibility toggles.

import { supabase } from "@/integrations/supabase/client";
import { CATALOG, type ProductSpecs } from "@/lib/products-catalog";

const BUCKET = "site-media";
const FOLDER = "products";
const SIGNED_TTL = 60 * 60 * 24 * 365; // 1 year

export type Trade = "export" | "import";

export type ProductCategory = {
  id: string;
  slug: string;
  name_en: string;
  name_ar: string;
  trade: Trade;
  sort_order: number;
  active: boolean;
};

export type ProductRow = {
  id: string;
  slug: string;
  trade: Trade;
  category_id: string | null;
  name_en: string;
  name_ar: string;
  intro_en: string;
  intro_ar: string;
  description_en: string;
  description_ar: string;
  specs_en: Partial<ProductSpecs>;
  specs_ar: Partial<ProductSpecs>;
  hidden_specs: string[];
  main_image: string;
  gallery: string[];
  published: boolean;
  sort_order: number;
};

export const EMPTY_SPECS: ProductSpecs = {
  scientificName: "",
  origin: "",
  category: "",
  variety: "",
  season: "",
  sizes: "",
  color: "",
  taste: "",
  packaging: "",
  shelfLife: "",
  storageTemp: "",
  transportation: "",
  moq: "",
  loading: "",
  certifications: "",
};

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\u0600-\u06FF]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Bundled artwork that ships with the original catalog, used when no image was uploaded. */
const FALLBACK = new Map(CATALOG.map((p) => [p.slug, { main: p.main, gallery: p.gallery }]));

export function productImage(p: Pick<ProductRow, "slug" | "main_image">) {
  return p.main_image || FALLBACK.get(p.slug)?.main || "/placeholder.svg";
}

export function productGallery(p: Pick<ProductRow, "slug" | "main_image" | "gallery">) {
  if (p.gallery.length) return p.gallery;
  const fallback = FALLBACK.get(p.slug)?.gallery;
  if (fallback?.length) return fallback;
  return [productImage(p)];
}

export function isSpecVisible(p: Pick<ProductRow, "hidden_specs">, key: keyof ProductSpecs) {
  return !p.hidden_specs.includes(key);
}

export function localized(p: ProductRow, lang: "en" | "ar") {
  return lang === "ar"
    ? {
        name: p.name_ar || p.name_en,
        intro: p.intro_ar || p.intro_en,
        description: p.description_ar || p.description_en,
        specs: { ...EMPTY_SPECS, ...(p.specs_ar ?? {}) },
      }
    : {
        name: p.name_en,
        intro: p.intro_en,
        description: p.description_en,
        specs: { ...EMPTY_SPECS, ...(p.specs_en ?? {}) },
      };
}

export function categoryName(c: ProductCategory | undefined, lang: "en" | "ar") {
  if (!c) return "";
  return lang === "ar" ? c.name_ar || c.name_en : c.name_en;
}

export function blankProduct(trade: Trade, categoryId: string | null): ProductRow {
  return {
    id: "",
    slug: "",
    trade,
    category_id: categoryId,
    name_en: "",
    name_ar: "",
    intro_en: "",
    intro_ar: "",
    description_en: "",
    description_ar: "",
    specs_en: { ...EMPTY_SPECS },
    specs_ar: { ...EMPTY_SPECS },
    hidden_specs: [],
    main_image: "",
    gallery: [],
    published: true,
    sort_order: 1,
  };
}

/* ---------------------------------------------------------------- categories */

export async function listCategories(onlyActive = false): Promise<ProductCategory[]> {
  let q = supabase.from("product_categories").select("*").order("sort_order");
  if (onlyActive) q = q.eq("active", true);
  const { data } = await q;
  return (data ?? []) as ProductCategory[];
}

export async function saveCategory(c: Partial<ProductCategory>): Promise<string | null> {
  const payload = {
    slug: c.slug || slugify(c.name_en || ""),
    name_en: c.name_en ?? "",
    name_ar: c.name_ar ?? "",
    trade: c.trade ?? "export",
    sort_order: c.sort_order ?? 1,
    active: c.active ?? true,
  };
  const { error } = c.id
    ? await supabase.from("product_categories").update(payload).eq("id", c.id)
    : await supabase.from("product_categories").insert(payload);
  return error ? error.message : null;
}

export async function deleteCategory(id: string): Promise<string | null> {
  const { count } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("category_id", id);
  if (count && count > 0) return `This category is used by ${count} product(s).`;
  const { error } = await supabase.from("product_categories").delete().eq("id", id);
  return error ? error.message : null;
}

/* ------------------------------------------------------------------ products */

export async function listPublishedProducts(): Promise<ProductRow[]> {
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("published", true)
    .order("sort_order");
  return (data ?? []) as unknown as ProductRow[];
}

export async function listAllProducts(): Promise<ProductRow[]> {
  const { data } = await supabase.from("products").select("*").order("sort_order");
  return (data ?? []) as unknown as ProductRow[];
}

export async function getProductBySlug(slug: string): Promise<ProductRow | null> {
  const { data } = await supabase.from("products").select("*").eq("slug", slug).maybeSingle();
  return (data as unknown as ProductRow | null) ?? null;
}

export async function saveProduct(p: ProductRow): Promise<string | null> {
  const payload = {
    slug: p.slug || slugify(p.name_en),
    trade: p.trade,
    category_id: p.category_id,
    name_en: p.name_en,
    name_ar: p.name_ar,
    intro_en: p.intro_en,
    intro_ar: p.intro_ar,
    description_en: p.description_en,
    description_ar: p.description_ar,
    specs_en: p.specs_en,
    specs_ar: p.specs_ar,
    hidden_specs: p.hidden_specs,
    main_image: p.main_image,
    gallery: p.gallery,
    published: p.published,
    sort_order: p.sort_order,
  };
  const { error } = p.id
    ? await supabase.from("products").update(payload).eq("id", p.id)
    : await supabase.from("products").insert(payload);
  return error ? error.message : null;
}

export async function deleteProduct(id: string): Promise<string | null> {
  const { error } = await supabase.from("products").delete().eq("id", id);
  return error ? error.message : null;
}

export async function setProductPublished(id: string, published: boolean) {
  await supabase.from("products").update({ published }).eq("id", id);
}

export async function saveOrder(rows: { id: string; sort_order: number }[]) {
  await Promise.all(
    rows.map((r) => supabase.from("products").update({ sort_order: r.sort_order }).eq("id", r.id)),
  );
}

/** Uploads an image to storage and returns a long-lived signed URL. */
export async function uploadProductImage(file: File): Promise<{ url?: string; error?: string }> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${FOLDER}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    upsert: true,
    contentType: file.type || "image/jpeg",
  });
  if (error) return { error: error.message };
  const { data } = await supabase.storage.from(BUCKET).createSignedUrl(path, SIGNED_TTL);
  return data?.signedUrl ? { url: data.signedUrl } : { error: "Could not create image URL." };
}
