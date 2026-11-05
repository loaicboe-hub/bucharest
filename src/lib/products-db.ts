// Unified product system backed by localStorage, Hostinger MySQL API, and Supabase if configured.
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";
import { CATALOG, type ProductSpecs } from "@/lib/products-catalog";
import { apiProducts, apiCategories, uploadToHostinger } from "./hostinger-api";

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

const FALLBACK = new Map(CATALOG.map((p) => [p.slug, { main: p.main, gallery: p.gallery }]));

export function productImage(p: Pick<ProductRow, "slug" | "main_image">) {
  return p.main_image || FALLBACK.get(p.slug)?.main || "/placeholder.svg";
}

export function productGallery(p: Pick<ProductRow, "slug" | "main_image" | "gallery">) {
  if (p.gallery && p.gallery.length) return p.gallery;
  const fallback = FALLBACK.get(p.slug)?.gallery;
  if (fallback?.length) return fallback;
  return [productImage(p)];
}

export function isSpecVisible(p: Pick<ProductRow, "hidden_specs">, key: keyof ProductSpecs) {
  return !p.hidden_specs || !p.hidden_specs.includes(key);
}

export function localized(p: ProductRow, lang: "en" | "fr") {
  return lang === "fr"
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

export function categoryName(c: ProductCategory | undefined, lang: "en" | "fr") {
  if (!c) return "";
  return lang === "fr" ? c.name_ar || c.name_en : c.name_en;
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

const CAT_STORAGE_KEY = "app_product_categories";
const PROD_STORAGE_KEY = "app_products";

const DEFAULT_CATEGORIES: ProductCategory[] = [
  { id: "cat-fruits", slug: "fruits", name_en: "Fresh Fruits", name_ar: "Fruits Frais", trade: "export", sort_order: 1, active: true },
  { id: "cat-vegetables", slug: "vegetables", name_en: "Fresh Vegetables", name_ar: "Légumes Frais", trade: "export", sort_order: 2, active: true },
];

function getLocalCategories(): ProductCategory[] {
  if (typeof window === "undefined") return DEFAULT_CATEGORIES;
  try {
    const raw = localStorage.getItem(CAT_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return DEFAULT_CATEGORIES;
}

function setLocalCategories(cats: ProductCategory[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CAT_STORAGE_KEY, JSON.stringify(cats));
  } catch {}
}

export async function listCategories(onlyActive = false): Promise<ProductCategory[]> {
  // 1. Try Hostinger MySQL API
  try {
    const remote = await apiCategories.list(onlyActive);
    if (Array.isArray(remote) && remote.length > 0) {
      setLocalCategories(remote);
      return remote;
    }
  } catch {}

  // 2. Try Supabase if configured
  if (isSupabaseConfigured()) {
    try {
      let q = supabase.from("product_categories").select("*").order("sort_order");
      if (onlyActive) q = q.eq("active", true);
      const { data, error } = await q;
      if (!error && data && data.length > 0) {
        setLocalCategories(data as ProductCategory[]);
        return data as ProductCategory[];
      }
    } catch {}
  }

  const cats = getLocalCategories();
  return onlyActive ? cats.filter((c) => c.active) : cats;
}

export async function saveCategory(c: Partial<ProductCategory>): Promise<string | null> {
  const cats = getLocalCategories();
  const id = c.id || `cat-${Date.now()}`;
  const category: ProductCategory = {
    id,
    slug: c.slug || slugify(c.name_en || ""),
    name_en: c.name_en ?? "",
    name_ar: c.name_ar ?? "",
    sort_order: c.sort_order ?? cats.length + 1,
    active: c.active ?? true,
    trade: c.trade ?? "export",
  };

  const existingIdx = cats.findIndex((item) => item.id === id);
  if (existingIdx >= 0) {
    cats[existingIdx] = category;
  } else {
    cats.push(category);
  }
  setLocalCategories(cats);

  // 1. Try Hostinger API
  try {
    await apiCategories.save(category);
  } catch {}

  // 2. Try Supabase if configured
  if (isSupabaseConfigured()) {
    try {
      const payload = {
        slug: category.slug,
        name_en: category.name_en,
        name_ar: category.name_ar,
        sort_order: category.sort_order,
        active: category.active,
        trade: category.trade,
      };
      if (c.id) {
        await supabase.from("product_categories").update(payload).eq("id", c.id);
      } else {
        await supabase.from("product_categories").insert(payload);
      }
    } catch {}
  }

  return null;
}

export async function deleteCategory(id: string): Promise<string | null> {
  const cats = getLocalCategories().filter((c) => c.id !== id);
  setLocalCategories(cats);

  // 1. Try Hostinger API
  try {
    await apiCategories.delete(id);
  } catch {}

  // 2. Try Supabase if configured
  if (isSupabaseConfigured()) {
    try {
      await supabase.from("product_categories").delete().eq("id", id);
    } catch {}
  }

  return null;
}

/* ---------------------------------------------------------------- products */

function defaultProducts(): ProductRow[] {
  return CATALOG.map((p, idx) => ({
    id: `prod-${p.slug}`,
    slug: p.slug,
    trade: "export",
    category_id: p.group === "fruits" ? "cat-fruits" : "cat-vegetables",
    name_en: p.en.name,
    name_ar: (p as any).fr?.name || p.en.name,
    intro_en: p.en.intro,
    intro_ar: (p as any).fr?.intro || p.en.intro,
    description_en: p.en.description,
    description_ar: (p as any).fr?.description || p.en.description,
    specs_en: p.en.specs,
    specs_ar: (p as any).fr?.specs || p.en.specs,
    hidden_specs: [],
    main_image: p.main,
    gallery: p.gallery,
    published: true,
    sort_order: idx + 1,
  }));
}

function getLocalProducts(): ProductRow[] {
  if (typeof window === "undefined") return defaultProducts();
  try {
    const raw = localStorage.getItem(PROD_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  const initial = defaultProducts();
  try {
    localStorage.setItem(PROD_STORAGE_KEY, JSON.stringify(initial));
  } catch {}
  return initial;
}

function setLocalProducts(prods: ProductRow[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PROD_STORAGE_KEY, JSON.stringify(prods));
  } catch {}
}

export async function listPublishedProducts(): Promise<ProductRow[]> {
  // 1. Try Hostinger API
  try {
    const remote = await apiProducts.list();
    if (Array.isArray(remote) && remote.length > 0) return remote as ProductRow[];
  } catch {}

  // 2. Try Supabase if configured
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("published", true)
        .order("sort_order");
      if (!error && data && data.length > 0) return data as unknown as ProductRow[];
    } catch {}
  }
  return getLocalProducts().filter((p) => p.published);
}

export async function listAllProducts(): Promise<ProductRow[]> {
  // 1. Try Hostinger API
  try {
    const remote = await apiProducts.list({ all: true });
    if (Array.isArray(remote) && remote.length > 0) {
      setLocalProducts(remote as ProductRow[]);
      return remote as ProductRow[];
    }
  } catch {}

  // 2. Try Supabase if configured
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.from("products").select("*").order("sort_order");
      if (!error && data && data.length > 0) {
        setLocalProducts(data as unknown as ProductRow[]);
        return data as unknown as ProductRow[];
      }
    } catch {}
  }
  return getLocalProducts();
}

export async function getProductBySlug(slug: string): Promise<ProductRow | null> {
  // 1. Try Hostinger API
  try {
    const remote = await apiProducts.get(slug);
    if (remote) return remote as ProductRow;
  } catch {}

  // 2. Try Supabase if configured
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.from("products").select("*").eq("slug", slug).maybeSingle();
      if (!error && data) return data as unknown as ProductRow;
    } catch {}
  }
  return getLocalProducts().find((p) => p.slug === slug) ?? null;
}

export async function saveProduct(p: ProductRow): Promise<string | null> {
  const prods = getLocalProducts();
  const id = p.id || `prod-${p.slug || slugify(p.name_en)}-${Date.now()}`;
  const product: ProductRow = { ...p, id, slug: p.slug || slugify(p.name_en) };

  const idx = prods.findIndex((item) => item.id === id || item.slug === product.slug);
  if (idx >= 0) {
    prods[idx] = product;
  } else {
    prods.push(product);
  }
  setLocalProducts(prods);

  // 1. Try Hostinger MySQL API
  try {
    await apiProducts.save(product);
  } catch {}

  // 2. Try Supabase if configured
  if (isSupabaseConfigured()) {
    try {
      const payload = {
        slug: product.slug,
        trade: product.trade,
        category_id: product.category_id,
        name_en: product.name_en,
        name_ar: product.name_ar,
        intro_en: product.intro_en,
        intro_ar: product.intro_ar,
        description_en: product.description_en,
        description_ar: product.description_ar,
        specs_en: product.specs_en,
        specs_ar: product.specs_ar,
        hidden_specs: product.hidden_specs,
        main_image: product.main_image,
        gallery: product.gallery,
        published: product.published,
        sort_order: product.sort_order,
      };
      if (p.id) {
        await supabase.from("products").update(payload).eq("id", p.id);
      } else {
        await supabase.from("products").insert(payload);
      }
    } catch {}
  }

  return null;
}

export async function deleteProduct(id: string): Promise<string | null> {
  const prods = getLocalProducts().filter((p) => p.id !== id);
  setLocalProducts(prods);

  // 1. Try Hostinger MySQL API
  try {
    await apiProducts.delete(id);
  } catch {}

  // 2. Try Supabase if configured
  if (isSupabaseConfigured()) {
    try {
      await supabase.from("products").delete().eq("id", id);
    } catch {}
  }

  return null;
}

export async function setProductPublished(id: string, published: boolean) {
  const prods = getLocalProducts();
  const p = prods.find((item) => item.id === id);
  if (p) {
    p.published = published;
    setLocalProducts(prods);
  }

  try {
    if (p) await apiProducts.save(p);
  } catch {}

  if (isSupabaseConfigured()) {
    try {
      await supabase.from("products").update({ published }).eq("id", id);
    } catch {}
  }
}

export async function saveOrder(rows: { id: string; sort_order: number }[]) {
  const prods = getLocalProducts();
  const orderMap = new Map(rows.map((r) => [r.id, r.sort_order]));
  prods.forEach((p) => {
    if (orderMap.has(p.id)) p.sort_order = orderMap.get(p.id)!;
  });
  prods.sort((a, b) => a.sort_order - b.sort_order);
  setLocalProducts(prods);

  if (isSupabaseConfigured()) {
    try {
      await Promise.all(
        rows.map((r) => supabase.from("products").update({ sort_order: r.sort_order }).eq("id", r.id)),
      );
    } catch {}
  }
}

/** Uploads an image to storage or converts to local data URL in dev mode. */
export async function uploadProductImage(file: File): Promise<{ url?: string; error?: string }> {
  // 1. Try uploading to Hostinger backend
  try {
    const res = await uploadToHostinger(file, "products");
    if (res?.url) return { url: res.url };
  } catch {}

  // 2. Local fallback data URL if not using Supabase
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
    const path = `${FOLDER}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
      upsert: true,
      contentType: file.type || "image/jpeg",
    });
    if (error) return { error: error.message };
    const { data } = await supabase.storage.from(BUCKET).createSignedUrl(path, SIGNED_TTL);
    return data?.signedUrl ? { url: data.signedUrl } : { error: "Could not create image URL." };
  } catch (err: any) {
    return { error: err?.message || "Upload failed" };
  }
}
