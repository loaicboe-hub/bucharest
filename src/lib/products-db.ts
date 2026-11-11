// Hostinger-only product catalog and media storage.
import { CATALOG, type ProductSpecs } from "@/lib/products-catalog";
import type { Lang } from "./i18n";
import { apiProducts, apiCategories, uploadToHostinger } from "./hostinger-api";

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

function isLocalPreviewHost(): boolean {
  if (typeof window === "undefined") return false;
  const h = window.location.hostname;
  return h === "localhost" || h === "127.0.0.1";
}

function makeShortId(prefix: string): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 6);
  return `${prefix}-${ts}${rand}`;
}

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

const HAS_ARABIC = /[\u0600-\u06FF]/;
const HAS_CYRILLIC = /[\u0400-\u04FF]/;
const CATALOG_BY_SLUG = new Map(CATALOG.map((item) => [item.slug, item]));

const STD_CATEGORIES: Record<string, Record<Lang, string>> = {
  fruits: {
    en: "Fresh Fruits",
    fr: "Fruits Frais",
    ar: "فواكه طازجة",
    ru: "Свежие фрукты",
  },
  "fresh fruits": {
    en: "Fresh Fruits",
    fr: "Fruits Frais",
    ar: "فواكه طازجة",
    ru: "Свежие фрукты",
  },
  vegetables: {
    en: "Fresh Vegetables",
    fr: "Légumes Frais",
    ar: "خضروات طازجة",
    ru: "Свежие овощи",
  },
  "fresh vegetables": {
    en: "Fresh Vegetables",
    fr: "Légumes Frais",
    ar: "خضروات طازجة",
    ru: "Свежие овощи",
  },
};

export function localized(p: ProductRow, lang: Lang) {
  const cat = CATALOG_BY_SLUG.get(p.slug);
  const nameIsAr = HAS_ARABIC.test(p.name_ar || "");
  const introIsAr = HAS_ARABIC.test(p.intro_ar || "");
  const descIsAr = HAS_ARABIC.test(p.description_ar || "");
  const nameIsRu = HAS_CYRILLIC.test(p.name_ar || "");
  const introIsRu = HAS_CYRILLIC.test(p.intro_ar || "");
  const descIsRu = HAS_CYRILLIC.test(p.description_ar || "");

  if (lang === "en") {
    return {
      name: p.name_en || cat?.en.name || "",
      intro: p.intro_en || cat?.en.intro || "",
      description: p.description_en || cat?.en.description || "",
      specs: {
        ...EMPTY_SPECS,
        ...(cat?.en.specs.origin ? { origin: cat.en.specs.origin } : {}),
        ...(cat?.en.specs.category ? { category: cat.en.specs.category } : {}),
        ...(p.specs_en ?? {}),
      },
    };
  }

  if (lang === "ar") {
    if (nameIsAr || introIsAr || descIsAr) {
      return {
        name: (nameIsAr ? p.name_ar : "") || cat?.ar.name || p.name_ar || p.name_en,
        intro: (introIsAr ? p.intro_ar : "") || cat?.ar.intro || p.intro_ar || p.intro_en,
        description: (descIsAr ? p.description_ar : "") || cat?.ar.description || p.description_ar || p.description_en,
        specs: {
          ...EMPTY_SPECS,
          ...(cat?.ar.specs ?? {}),
          ...(p.specs_ar ?? {}),
        },
      };
    }
    if (cat?.ar) return cat.ar;
    return {
      name: p.name_ar || p.name_en,
      intro: p.intro_ar || p.intro_en,
      description: p.description_ar || p.description_en,
      specs: { ...EMPTY_SPECS, ...(p.specs_ar ?? {}), ...(p.specs_en ?? {}) },
    };
  }

  if (lang === "fr") {
    const frName = !nameIsAr && !nameIsRu && p.name_ar?.trim() ? p.name_ar : "";
    const frIntro = !introIsAr && !introIsRu && p.intro_ar?.trim() ? p.intro_ar : "";
    const frDesc = !descIsAr && !descIsRu && p.description_ar?.trim() ? p.description_ar : "";
    const specsArStr = JSON.stringify(p.specs_ar ?? {});
    const specsSafeFr = !HAS_ARABIC.test(specsArStr) && !HAS_CYRILLIC.test(specsArStr);

    if (frName || frIntro || frDesc) {
      return {
        name: frName || cat?.fr.name || p.name_en,
        intro: frIntro || cat?.fr.intro || p.intro_en,
        description: frDesc || cat?.fr.description || p.description_en,
        specs: {
          ...EMPTY_SPECS,
          ...(cat?.fr.specs ?? {}),
          ...(specsSafeFr ? (p.specs_ar ?? {}) : (p.specs_en ?? {})),
        },
      };
    }
    if (cat?.fr) return cat.fr;
    return {
      name: p.name_en,
      intro: p.intro_en,
      description: p.description_en,
      specs: { ...EMPTY_SPECS, ...(p.specs_en ?? {}) },
    };
  }

  // Russian ("ru")
  if (nameIsRu || introIsRu || descIsRu) {
    return {
      name: (nameIsRu ? p.name_ar : "") || cat?.ru.name || p.name_en,
      intro: (introIsRu ? p.intro_ar : "") || cat?.ru.intro || p.intro_en,
      description: (descIsRu ? p.description_ar : "") || cat?.ru.description || p.description_en,
      specs: { ...EMPTY_SPECS, ...(cat?.ru.specs ?? {}), ...(p.specs_ar ?? {}), ...(p.specs_en ?? {}) },
    };
  }
  if (cat?.ru) return cat.ru;
  const baseEn = { ...EMPTY_SPECS, ...(p.specs_en ?? {}) };
  return {
    name: p.name_en,
    intro: p.intro_en,
    description: p.description_en,
    specs: {
      ...baseEn,
      origin: baseEn.origin === "Egypt" ? "Египет" : baseEn.origin,
      category:
        baseEn.category === "Fresh Fruits"
          ? "Свежие фрукты"
          : baseEn.category === "Fresh Vegetables"
            ? "Свежие овощи"
            : baseEn.category,
    },
  };
}

export function categoryName(c: ProductCategory | undefined, lang: Lang) {
  if (!c) return "";
  const std = STD_CATEGORIES[c.slug?.toLowerCase()] ?? STD_CATEGORIES[c.name_en?.toLowerCase()];
  const hasAr = HAS_ARABIC.test(c.name_ar || "");
  const hasRu = HAS_CYRILLIC.test(c.name_ar || "");

  if (lang === "en") return c.name_en || std?.en || "";
  if (lang === "ar") return (hasAr ? c.name_ar : "") || std?.ar || c.name_ar || c.name_en;
  if (lang === "fr") return (!hasAr && !hasRu && c.name_ar ? c.name_ar : "") || std?.fr || c.name_en;
  if (lang === "ru") return (hasRu ? c.name_ar : "") || std?.ru || c.name_en;
  return c.name_en;
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
  try {
    const remote = await apiCategories.list(onlyActive);
    if (Array.isArray(remote)) {
      if (!onlyActive) setLocalCategories(remote);
      return remote;
    }
  } catch {}

  const cats = getLocalCategories();
  return onlyActive ? cats.filter((c) => c.active) : cats;
}

export async function saveCategory(c: Partial<ProductCategory>): Promise<string | null> {
  const cats = getLocalCategories();
  const id = c.id || makeShortId("cat");
  const category: ProductCategory = {
    id,
    slug: c.slug || slugify(c.name_en || "") || makeShortId("cat"),
    name_en: c.name_en ?? "",
    name_ar: c.name_ar ?? "",
    sort_order: c.sort_order ?? cats.length + 1,
    active: c.active ?? true,
    trade: c.trade ?? "export",
  };

  try {
    const res = await apiCategories.save(category);
    if (res?.id) category.id = res.id;
    if (res?.slug) category.slug = res.slug;
  } catch (err: any) {
    if (!isLocalPreviewHost()) {
      return err?.message || "Failed to save category to server.";
    }
  }

  const existingIdx = cats.findIndex((item) => item.id === category.id);
  if (existingIdx >= 0) {
    cats[existingIdx] = category;
  } else {
    cats.push(category);
  }
  setLocalCategories(cats);
  return null;
}

export async function deleteCategory(id: string): Promise<string | null> {
  try {
    await apiCategories.delete(id);
  } catch (err: any) {
    if (!isLocalPreviewHost()) {
      return err?.message || "Failed to delete category from server.";
    }
  }

  const cats = getLocalCategories().filter((c) => c.id !== id);
  setLocalCategories(cats);
  return null;
}

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
  try {
    const remote = await apiProducts.list();
    if (Array.isArray(remote)) return remote as ProductRow[];
  } catch {}

  return getLocalProducts().filter((p) => p.published);
}

export async function listAllProducts(): Promise<ProductRow[]> {
  try {
    const remote = await apiProducts.list({ all: true });
    if (Array.isArray(remote)) {
      setLocalProducts(remote as ProductRow[]);
      return remote as ProductRow[];
    }
  } catch {}

  return getLocalProducts();
}

export async function getProductBySlug(slug: string): Promise<ProductRow | null> {
  try {
    const remote = await apiProducts.get(slug);
    if (remote) return remote as ProductRow;
  } catch {}

  return getLocalProducts().find((p) => p.slug === slug) ?? null;
}

export async function saveProduct(p: ProductRow): Promise<string | null> {
  const prods = getLocalProducts();
  const id = p.id || makeShortId("prod");
  const product: ProductRow = {
    ...p,
    id,
    slug: p.slug || slugify(p.name_en) || makeShortId("item"),
  };

  try {
    const res = await apiProducts.save(product);
    if (res?.id) product.id = res.id;
    if (res?.slug) product.slug = res.slug;
  } catch (err: any) {
    if (!isLocalPreviewHost()) {
      return err?.message || "Failed to save product to server.";
    }
  }

  const idx = prods.findIndex((item) => item.id === product.id);
  if (idx >= 0) {
    prods[idx] = product;
  } else {
    prods.push(product);
  }
  setLocalProducts(prods);
  return null;
}

export async function deleteProduct(id: string): Promise<string | null> {
  try {
    await apiProducts.delete(id);
  } catch (err: any) {
    if (!isLocalPreviewHost()) {
      return err?.message || "Failed to delete product from server.";
    }
  }

  const prods = getLocalProducts().filter((p) => p.id !== id);
  setLocalProducts(prods);
  return null;
}

export async function setProductPublished(id: string, published: boolean): Promise<string | null> {
  const prods = getLocalProducts();
  const p = prods.find((item) => item.id === id);
  const updated = p ? { ...p, published } : null;

  try {
    if (updated) {
      await apiProducts.save(updated);
    } else {
      const remote = await apiProducts.get(id);
      if (remote) await apiProducts.save({ ...remote, published });
    }
  } catch (err: any) {
    if (!isLocalPreviewHost()) {
      return err?.message || "Failed to update publish status.";
    }
  }

  if (p) {
    p.published = published;
    setLocalProducts(prods);
  }
  return null;
}

export async function saveOrder(rows: { id: string; sort_order: number }[]): Promise<string | null> {
  try {
    await apiProducts.reorder(rows);
  } catch (err: any) {
    if (!isLocalPreviewHost()) {
      return err?.message || "Failed to save product order.";
    }
  }

  const prods = getLocalProducts();
  const orderMap = new Map(rows.map((r) => [r.id, r.sort_order]));
  prods.forEach((p) => {
    if (orderMap.has(p.id)) p.sort_order = orderMap.get(p.id)!;
  });
  prods.sort((a, b) => a.sort_order - b.sort_order);
  setLocalProducts(prods);
  return null;
}

/** Uploads an image to Hostinger storage (falls back to Data URL only on localhost). */
export async function uploadProductImage(file: File): Promise<{ url?: string; error?: string }> {
  try {
    const res = await uploadToHostinger(file, "products");
    if (res?.url) return { url: res.url };
  } catch (err: any) {
    if (!isLocalPreviewHost()) {
      return { error: err?.message || "Failed to upload image to server." };
    }
  }

  if (!isLocalPreviewHost()) {
    return { error: "Failed to upload image to server." };
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve({ url: reader.result as string });
    reader.onerror = () => resolve({ error: "Failed to read image" });
    reader.readAsDataURL(file);
  });
}
