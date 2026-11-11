import { createFileRoute, Link } from "@tanstack/react-router";
import { SectionWave } from "@/components/SectionWave";
import { SectionLeafBg } from "@/components/SectionLeafBg";
import { PharaonicDivider } from "@/components/PharaonicDivider";
import { useEffect, useLayoutEffect, useState } from "react";
import { ArrowLeft, ArrowRight, ChevronRight, X } from "lucide-react";
import { useLang, initLang } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { getProduct, SPEC_LABELS, PAGE_UI, type ProductSpecs } from "@/lib/products-catalog";
import { getCachedLogoUrl, getLogoUrl } from "@/lib/admin-branding";
import {
  getProductBySlug,
  listPublishedProducts,
  localized,
  productFallbackImage,
  productGallery,
  productImage,
  type ProductRow,
} from "@/lib/products-db";

export const Route = createFileRoute("/products/$slug")({
  loader: ({ params }) => {
    const product = getProduct(params.slug);
    // Admin-created products live in browser storage, so a missing static entry
    // is resolved on the client instead of 404-ing during SSR.
    if (!product) {
      const pretty = params.slug
        .replace(/[-_]+/g, " ")
        .replace(/\b\w/g, (ch) => ch.toUpperCase());
      return { slug: params.slug, name: pretty || params.slug, intro: "" };
    }
    return { slug: product.slug, name: product.en.name, intro: product.en.intro };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Product Not Found | BucharestEgyAgro" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const title = `${loaderData.name} Export from Egypt | BucharestEgyAgro`;
    const description = `${loaderData.intro} Egyptian ${loaderData.name.toLowerCase()} for international importers — specifications, packaging, sizes and shipping terms.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "product" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: ProductDetail,
});

const SPEC_ORDER: (keyof ProductSpecs)[] = [
  "scientificName",
  "origin",
  "category",
  "variety",
  "season",
  "sizes",
  "color",
  "taste",
  "packaging",
  "shelfLife",
  "storageTemp",
  "transportation",
  "moq",
  "loading",
  "certifications",
];

function ProductDetail() {
  const { slug } = Route.useParams();
  const [product, setProduct] = useState<ProductRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [related, setRelated] = useState<ProductRow[]>([]);
  const { lang, c, dir } = useLang();
  const t = PAGE_UI[lang];
  const labels = SPEC_LABELS[lang];
  const data = product ? localized(product, lang) : undefined;

  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [logo, setLogo] = useState<string | null>(null);

  useLayoutEffect(() => {
    const cachedLogo = getCachedLogoUrl();
    if (cachedLogo) setLogo(cachedLogo);
  }, []);

  useEffect(() => {
    initLang();
    getLogoUrl().then((u) => { if (u) setLogo(u); }).catch(() => undefined);
  }, []);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    getProductBySlug(slug).then((p) => {
      if (!alive) return;
      setProduct(p);
      setLoading(false);
    });
    listPublishedProducts().then((all) => {
      if (alive) setRelated(all.filter((p) => p.slug !== slug).slice(0, 4));
    });
    return () => {
      alive = false;
    };
  }, [slug]);
  useEffect(() => {
    setActive(0);
  }, [slug]);
  useEffect(() => {
    if (data?.name) document.title = `${data.name} Export from Egypt | ${c.brand}`;
  }, [data?.name, c.brand]);
  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setLightbox(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox]);

  if (loading) {
    return (
      <div dir={dir} className="grid min-h-screen place-items-center bg-background text-sm text-muted-foreground">
        {t.loading}
      </div>
    );
  }

  if (!product || !data) {
    return (
      <div dir={dir} className="grid min-h-screen place-items-center bg-background p-6 text-center">
        <div>
          <h1 className="font-display text-2xl font-bold text-primary">{t.notFound}</h1>
          <Link to="/" hash="products" className="mt-4 inline-block text-sm font-semibold text-fresh underline">
            {t.back}
          </Link>
        </div>
      </div>
    );
  }

  const visibleSpecs = SPEC_ORDER.filter(
    (key) => !product.hidden_specs.includes(key) && !!data.specs[key],
  );
  const gallery = productGallery(product);
  const fallbackSrc = productFallbackImage(product);
  const handleImgError = (fallback: string) => (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.currentTarget;
    if (fallback && !target.dataset.fbApplied) {
      target.dataset.fbApplied = "1";
      target.src = fallback;
    }
  };

  const Arrow = dir === "rtl" ? ArrowLeft : ArrowRight;

  return (
    <div className="min-h-screen bg-background" dir={dir}>
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 py-3 sm:px-6 sm:py-4 lg:px-10">
          <Link to="/" className="flex min-w-0 items-center gap-2.5 sm:gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gold/50 bg-white p-0.5 shadow-md sm:h-12 sm:w-12 sm:rounded-2xl">
              <img
                data-brand-logo
                src={logo || "/logo.png"}
                alt={c.brand}
                className="h-full w-full object-contain"
              />
            </div>
            <div className="min-w-0 leading-tight">
              <div className="truncate font-display text-base font-extrabold leading-none text-stone-950 sm:text-xl">
                BucharestEgyAgro
              </div>
              <div className="mt-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-primary sm:text-[10px] sm:tracking-[0.18em]">{c.brandSub}</div>
            </div>
          </Link>
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
            <LanguageSwitcher compact inlineFrom="sm" />
            <Link
              to="/"
              hash="products"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border px-2.5 py-1.5 text-[11px] font-semibold text-primary transition-colors hover:bg-secondary sm:gap-2 sm:px-4 sm:py-2 sm:text-sm"
            >
              {t.back}
            </Link>
          </div>
        </div>
      </header>
      <div className="relative h-[60px] overflow-hidden md:h-[90px]">
        <SectionWave />
      </div>

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="border-b border-border/50 bg-cream">
        <ol className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-6 py-4 text-sm text-muted-foreground lg:px-10">
          <li>
            <Link to="/" className="hover:text-fresh">{t.home}</Link>
          </li>
          <ChevronRight className={`h-4 w-4 ${dir === "rtl" ? "rotate-180" : ""}`} />
          <li>
            <Link to="/" hash="products" className="hover:text-fresh">{t.products}</Link>
          </li>
          <ChevronRight className={`h-4 w-4 ${dir === "rtl" ? "rotate-180" : ""}`} />
          <li className="font-semibold text-primary">{data.name}</li>
        </ol>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-cream py-14 lg:py-20">
        <SectionLeafBg opacity="opacity-[0.08]" />
        <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-10 px-6 lg:grid-cols-2 lg:px-10">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-gold" /> {t.premium}
            </span>
            <h1 className="mt-5 font-display text-3xl font-bold text-primary sm:text-5xl lg:text-6xl break-words">
              {data.name}
            </h1>
            <p className="mt-4 max-w-xl text-lg text-muted-foreground">{data.intro}</p>
            <Link
              to="/"
              hash="contact"
              onClick={() => {
                try {
                  sessionStorage.setItem("bea_quote_product", data.name);
                } catch {}
              }}
              className="mt-8 inline-flex items-center gap-2 rounded-full gradient-primary px-7 py-3.5 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-105"
            >
              {t.requestQuote} <Arrow className="h-4 w-4" />
            </Link>
          </div>
          <div className="relative overflow-hidden rounded-3xl border border-border bg-muted/20 shadow-[var(--shadow-soft)]">
            <img
              src={productImage(product)}
              alt={data.name}
              width={1024}
              height={768}
              onError={handleImgError(fallbackSrc)}
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <h2 className="mb-8 font-display text-3xl font-bold text-primary">{t.gallery}</h2>
          <button
            type="button"
            onClick={() => setLightbox(true)}
            className="block w-full overflow-hidden rounded-3xl border border-border bg-muted/20 shadow-[var(--shadow-soft)]"
          >
            <img
              src={gallery[active]}
              alt={`${data.name} ${active + 1}`}
              loading="lazy"
              width={1024}
              height={768}
              onError={handleImgError(fallbackSrc)}
              className="aspect-[16/10] w-full object-cover transition-transform duration-700 hover:scale-105"
            />
          </button>
          <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-6 lg:grid-cols-8">
            {gallery.map((img, i) => (
              <button
                key={img + i}
                type="button"
                onClick={() => setActive(i)}
                className={`overflow-hidden rounded-xl border-2 transition-all ${
                  i === active ? "border-fresh ring-2 ring-fresh/30" : "border-border opacity-70 hover:opacity-100"
                }`}
              >
                <img
                  src={img}
                  alt={`${data.name} thumbnail ${i + 1}`}
                  loading="lazy"
                  onError={handleImgError(fallbackSrc)}
                  className="aspect-square w-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Info */}
      {visibleSpecs.length > 0 && (
      <section className="bg-cream py-16 lg:py-20">

        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <h2 className="mb-8 font-display text-3xl font-bold text-primary">{t.info}</h2>
          <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-[var(--shadow-soft)]">
            <dl className="grid gap-px bg-border sm:grid-cols-2">
              {visibleSpecs.map((key) => (
                <div key={key} className="bg-card p-5">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-fresh">{labels[key]}</dt>
                  <dd className="mt-1.5 text-sm text-foreground">{data.specs[key]}</dd>
                </div>
              ))}
            </dl>

          </div>
        </div>
      </section>
      )}


      {/* Description */}
      <section className="py-16 lg:py-20">
        <div className="mx-auto max-w-4xl px-6 lg:px-10">
          <h2 className="mb-6 font-display text-3xl font-bold text-primary">{t.description}</h2>
          <p className="text-lg leading-relaxed text-muted-foreground">{data.description}</p>
          <Link
            to="/"
            hash="contact"
            onClick={() => {
              try {
                sessionStorage.setItem("bea_quote_product", data.name);
              } catch {}
            }}
            className="mt-8 inline-flex items-center gap-2 rounded-full gradient-primary px-7 py-3.5 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-105"
          >
            {t.requestQuote} <Arrow className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Related */}
      <section className="bg-cream py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <h2 className="mb-8 font-display text-3xl font-bold text-primary">{t.related}</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => (
              <Link
                key={p.slug}
                to="/products/$slug"
                params={{ slug: p.slug }}
                className="group overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-soft)] transition-all hover:-translate-y-1"
              >
                <img
                  src={productImage(p)}
                  alt={localized(p, lang).name}
                  loading="lazy"
                  onError={handleImgError(productFallbackImage(p))}
                  className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="p-4">
                  <h3 className="font-display text-lg font-semibold text-primary">{localized(p, lang).name}</h3>
                  <span className="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-fresh">
                    {t.viewProduct} <Arrow className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {lightbox && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/85 p-6"
          onClick={() => setLightbox(false)}
        >
          <button
            type="button"
            aria-label="Close"
            className="absolute end-6 top-6 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
            onClick={() => setLightbox(false)}
          >
            <X className="h-5 w-5" />
          </button>
          <img
            src={gallery[active]}
            alt={data.name}
            onError={handleImgError(fallbackSrc)}
            className="max-h-[85vh] max-w-full rounded-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
