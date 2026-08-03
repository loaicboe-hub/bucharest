// Website product content store (localStorage backed).
// Lets the admin edit / add the product information that is shown on the website
// (product cards + /products/$slug detail pages) on top of the static CATALOG.

import { CATALOG, type CatalogProduct, type ProductSpecs } from "./products-catalog";

const KEY = "fd_product_content";

export type ProductContent = CatalogProduct & {
  /** Export Products | Import Products */
  trade: "Export Products" | "Import Products";
  /** true when the entry was created from the admin (not part of the static catalog) */
  custom?: boolean;
};

export const EMPTY_SPECS: ProductSpecs = {
  scientificName: "",
  origin: "Egypt",
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
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

type Store = Record<string, ProductContent>;

function read(): Store {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(KEY) || "{}") as Store;
  } catch {
    return {};
  }
}

function write(store: Store) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(store));
  window.dispatchEvent(new CustomEvent("fd:product-content"));
}

function base(p: CatalogProduct): ProductContent {
  return { ...p, trade: "Export Products" };
}

/** Full website catalog = static products merged with admin edits + admin-created ones. */
export function loadProductContent(): ProductContent[] {
  const store = read();
  const merged = CATALOG.map((p) => ({ ...base(p), ...(store[p.slug] ?? {}) }) as ProductContent);
  const extras = Object.values(store).filter((p) => !CATALOG.some((c) => c.slug === p.slug));
  return [...merged, ...extras];
}

export function getProductContent(slug: string): ProductContent | undefined {
  return loadProductContent().find((p) => p.slug === slug);
}

export function saveProductContent(product: ProductContent) {
  const store = read();
  store[product.slug] = product;
  write(store);
}

export function deleteProductContent(slug: string) {
  const store = read();
  delete store[slug];
  write(store);
}

export function blankProduct(trade: ProductContent["trade"]): ProductContent {
  return {
    slug: "",
    group: "fruits",
    main: "/placeholder.svg",
    gallery: [],
    trade,
    custom: true,
    en: { name: "", intro: "", description: "", specs: { ...EMPTY_SPECS } },
    ar: { name: "", intro: "", description: "", specs: { ...EMPTY_SPECS } },
  };
}
