import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useLayoutEffect, useState } from "react";
import {
  defaultFooterConfig,
  loadFooterConfig,
  type FooterConfig,
  localizeFooterConfig,
  type FooterLink,
} from "@/lib/admin-footer";
import { PartnersCarousel } from "@/components/PartnersCarousel";
import { SectionWave } from "@/components/SectionWave";
import { SectionLeafBg } from "@/components/SectionLeafBg";
import WorldMapRoutes from "@/components/WorldMapRoutes";

import { getCachedLogoUrl, getLogoUrl } from "@/lib/admin-branding";
import {
  categoryName,
  listCategories,
  listPublishedProducts,
  localized,
  productImage,
  type ProductCategory,
  type ProductRow,
} from "@/lib/products-db";

import { defaultSiteSettings, loadSiteSettings, type SiteSettings } from "@/lib/site-settings";
import { getAboutVideoUrl } from "@/lib/about-video";
import { getSectionImageUrl } from "@/lib/section-image";
import { useTransparentLogo } from "@/lib/transparent-image";
import { BrandMark, BrandWatermark } from "@/components/BrandMark";
import { PharaonicDivider } from "@/components/PharaonicDivider";
import { PharaonicSplashScreen } from "@/components/PharaonicSplashScreen";
import { WhatsAppButton, WhatsAppIcon } from "@/components/WhatsAppButton";
import { useLang, initLang } from "@/lib/i18n";
import { sanitizeUrl } from "@/lib/sanitize";
import {
  Award,
  ShieldCheck,
  Sprout,
  Truck,
  Snowflake,
  Globe2,
  Clock,
  BadgeCheck,
  HeartHandshake,
  ArrowRight,
  ArrowUp,
  Menu,
  X,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Instagram,
  Linkedin,
  Star,
  Leaf,
} from "lucide-react";

import kemetEdenHero from "@/assets/kemet-eden-hero.jpg";
import { getCachedHeroImageUrl, getHeroImageUrl } from "@/lib/hero-image";
import oranges from "@/assets/oranges.jpg";
import grapes from "@/assets/grapes.jpg";
import mangoes from "@/assets/mangoes.jpg";
import pomegranates from "@/assets/pomegranates.jpg";
import strawberries from "@/assets/strawberries.jpg";
import lemons from "@/assets/lemons.jpg";
import potatoes from "@/assets/potatoes.jpg";
import onions from "@/assets/onions.jpg";
import garlic from "@/assets/garlic.jpg";
import sweetPotatoes from "@/assets/sweet-potatoes.jpg";
import greenBeans from "@/assets/green-beans.jpg";
import peppers from "@/assets/peppers.jpg";
import farm from "@/assets/farm.jpg";

export const Route = createFileRoute("/")({
  component: Index,
});

const whyIcons = [Award, BadgeCheck, Sprout, ShieldCheck, HeartHandshake, Globe2, Clock, Snowflake, Star];
const certIcons = [BadgeCheck, ShieldCheck, Globe2, Award];
const badgeIcons = [Award, BadgeCheck, Globe2];
const contactIcons = [Mail, Phone, MapPin];

function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { lang, setLang, c } = useLang();
  return (
    <div
      aria-label={c.ui.language}
      className={`inline-flex shrink-0 items-center gap-0.5 sm:gap-1 rounded-full border p-0.5 sm:p-1 ${
        compact
          ? "border-border bg-white"
          : "border-white/25 bg-white/10 backdrop-blur-md"
      }`}
    >
      {(["en", "fr"] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={`rounded-full px-2 py-0.5 sm:px-3 sm:py-1 text-[11px] sm:text-xs font-semibold transition-all ${
            lang === l
              ? "bg-gold text-gold-foreground shadow"
              : compact
                ? "text-muted-foreground hover:text-primary"
                : "text-white/80 hover:text-white"
          }`}
        >
          {l === "en" ? "EN" : "FR"}
        </button>
      ))}
    </div>
  );
}

const BLANK_PIXEL =
  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

function Index() {

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [trade, setTrade] = useState<"export" | "import">("export");
  const [activeCat, setActiveCat] = useState<string>("all");

  const [showTop, setShowTop] = useState(false);
  const [footerRaw, setFooter] = useState<FooterConfig>(defaultFooterConfig);
  const [logo, setLogo] = useState<string | null>(null);

  const [site, setSite] = useState<SiteSettings>(defaultSiteSettings);
  const [formMsg, setFormMsg] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [aboutVideo, setAboutVideo] = useState<string | null>(null);
  const [sectionImages, setSectionImages] = useState<Record<string, string>>({});
  const [heroBg, setHeroBg] = useState<string>(kemetEdenHero);
  const [dbProducts, setDbProducts] = useState<ProductRow[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const heroLogo = useTransparentLogo(logo);
  const { lang, c } = useLang();
  const footer = localizeFooterConfig(footerRaw, lang);

  useLayoutEffect(() => {
    const cachedLogo = getCachedLogoUrl();
    if (cachedLogo) setLogo(cachedLogo);
    const cachedHero = getCachedHeroImageUrl();
    if (cachedHero) setHeroBg(cachedHero);
  }, []);

  useEffect(() => {
    initLang();
    setFooter(loadFooterConfig());
    getLogoUrl().then((u) => { if (u) setLogo(u); }).catch(() => undefined);
    loadSiteSettings().then(setSite);
    getAboutVideoUrl().then(setAboutVideo).catch(() => setAboutVideo(null));
    (["about", "whyUs", "process", "contact", "products", "markets", "certificate"] as const).forEach((k) => {
      getSectionImageUrl(k)
        .then((u) => { if (u) setSectionImages((m) => ({ ...m, [k]: u })); })
        .catch(() => undefined);
    });
    getHeroImageUrl().then((u) => { if (u) setHeroBg(u); }).catch(() => undefined);
    listPublishedProducts().then(setDbProducts).catch(() => setDbProducts([]));
    listCategories(true).then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    setFormMsg(null);
    if (typeof document === "undefined") return;
    document.title = site.seoTitle || site.companyName;
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute("content", site.seoDescription);
    const kw = document.querySelector('meta[name="keywords"]');
    if (kw) kw.setAttribute("content", site.seoKeywords);
  }, [lang, site]);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const y = window.scrollY;
        // hysteresis avoids rapid toggling (flicker) right at the threshold
        setScrolled((prev) => (prev ? y > 20 : y > 60));
        setShowTop((prev) => (prev ? y > 500 : y > 600));
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);


  const nav = c.nav;


  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden w-full">
      {/* Majestic Cinematic Pharaonic Intro Splash Screen */}
      <PharaonicSplashScreen duration={8500} />




      {/* Navbar */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-[background-color,backdrop-filter,box-shadow] duration-300 ${
          menuOpen || scrolled ? "glass shadow-md py-2 sm:py-3" : "bg-transparent py-3 sm:py-5"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 sm:px-6 lg:px-10">
          <a href="#top" className="flex min-w-0 items-center gap-2 sm:gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gold/50 bg-white p-1 shadow-md sm:h-14 sm:w-14 sm:rounded-2xl lg:h-16 lg:w-16">
              <img
                data-brand-logo
                suppressHydrationWarning
                src={logo || "/logo.png"}
                alt={`${site.companyName || c.brand} logo`}
                className="h-full w-full object-contain"
              />
            </div>

            <div className="flex min-w-0 flex-col justify-center">
              <span className="truncate font-display text-[15px] font-bold leading-tight xs:text-base sm:text-xl lg:text-2xl drop-shadow-sm">
                <span className="text-gradient-gold font-extrabold">BucharestEgyAgro</span>
              </span>
              <span
                className={`whitespace-nowrap text-[8px] font-semibold uppercase tracking-[0.16em] sm:text-[10px] sm:tracking-[0.22em] ${
                  menuOpen || scrolled ? "text-muted-foreground" : "text-white/80"
                }`}
              >
                Import & Export
              </span>
            </div>
          </a>

          <nav className="hidden items-center justify-center gap-4 md:flex lg:gap-6 xl:gap-8">
            {nav.map((n) => (
              <a
                key={n.href}
                href={n.href}
                className={`whitespace-nowrap text-xs font-semibold transition-colors lg:text-sm ${
                  scrolled
                    ? "text-foreground hover:text-fresh"
                    : "text-white/90 hover:text-gold"
                }`}
              >
                {n.label}
              </a>
            ))}
            <Link
              to="/news"
              className={`whitespace-nowrap text-xs font-semibold transition-colors lg:text-sm ${
                scrolled ? "text-foreground hover:text-fresh" : "text-white/90 hover:text-gold"
              }`}
            >
              {c.ui.ourNews || "Our News"}
            </Link>
          </nav>

          <div className="hidden shrink-0 items-center gap-3 md:flex lg:gap-4">
            <a
              href="#contact"
              className="inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-gold px-4 py-2 text-xs font-semibold text-gold-foreground shadow-md transition-all hover:scale-105 hover:shadow-lg sm:px-5 sm:py-2.5 sm:text-sm"
            >
              {c.ui.requestQuote} <ArrowRight className="h-3.5 w-3.5" />
            </a>
            <LanguageSwitcher compact={scrolled} />
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2.5 md:hidden">
            <LanguageSwitcher compact={menuOpen || scrolled} />
            <button
              type="button"
              aria-label={c.ui.toggleMenu}
              onClick={() => setMenuOpen(!menuOpen)}
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-colors ${
                menuOpen || scrolled
                  ? "border-border/60 bg-white/70 text-foreground shadow-sm hover:bg-black/5"
                  : "border-white/20 bg-white/10 text-white backdrop-blur-md hover:bg-white/20"
              }`}
            >
              {menuOpen ? <X className="h-5 w-5 shrink-0" /> : <Menu className="h-5 w-5 shrink-0" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="glass border-t border-border/40 md:hidden animate-in fade-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col gap-1 p-4 sm:p-6 max-h-[calc(100vh-80px)] overflow-y-auto">
              {nav.map((n) => (
                <a
                  key={n.href}
                  href={n.href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-xl px-4 py-3 text-base font-medium text-foreground transition-colors hover:bg-fresh/10"
                >
                  {n.label}
                </a>
              ))}
              <Link
                to="/news"
                onClick={() => setMenuOpen(false)}
                className="rounded-xl px-4 py-3 text-base font-medium text-foreground transition-colors hover:bg-fresh/10"
              >
                {c.ui.ourNews || "Our News"}
              </Link>
              <a
                href="#contact"
                onClick={() => setMenuOpen(false)}
                className="mt-2 rounded-full bg-gold px-5 py-3 text-center text-sm font-semibold text-gold-foreground shadow-md"
              >
                {c.ui.requestQuote}
              </a>
            </nav>
          </div>
        )}
      </header>

      {/* Hero */}
      <section id="top" className="relative min-h-screen overflow-hidden bg-primary">
        <img
          data-hero-background
          suppressHydrationWarning
          src={heroBg}
          alt={`${site.companyName || c.brand} import and export: farm fields, cargo ship and fresh produce`}
          width={1920}
          height={1920}
          className="absolute inset-0 h-full w-full object-cover object-center md:object-top"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-black/15" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />

        <div className="relative mx-auto grid min-h-screen max-w-7xl grid-cols-1 items-center gap-10 px-5 pt-36 pb-20 sm:px-6 sm:pt-40 sm:pb-24 lg:grid-cols-12 lg:px-10 lg:pt-44">
          <div className="max-w-3xl animate-fade-up lg:col-span-7">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full glass-dark px-3.5 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-white sm:mb-6 sm:px-4 sm:py-2">
              <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse" />
              {c.ui.heroBadge}
            </div>
            <h1 className="font-display text-4xl font-bold leading-[1.1] text-white sm:text-6xl lg:text-7xl">
              {c.ui.heroTitle1}{" "}
              <span className="text-gradient-gold">{c.ui.heroTitleGold}</span>
              <br />
              {c.ui.heroTitle2}
            </h1>
            <p className="mt-4 max-w-2xl text-base text-white/85 sm:mt-6 sm:text-xl">
              {c.ui.heroSub}
            </p>
            <div className="mt-8 flex flex-wrap gap-4 sm:mt-10">
              <a
                href="#products"
                className="inline-flex items-center gap-2 rounded-full glass-dark px-7 py-3.5 text-sm font-semibold text-white transition-all hover:bg-white/20 sm:px-8 sm:py-4 sm:text-base"
              >
                {c.ui.exploreProducts}
              </a>
            </div>

            <div className="mt-10 grid max-w-2xl grid-cols-3 gap-2 sm:mt-14 sm:gap-4">
              {c.badges.map((label, bi) => {
                const BIcon = badgeIcons[bi];
                return (
                <div
                  key={label}
                  className="glass-dark flex items-center gap-2 rounded-xl p-2.5 text-white sm:gap-3 sm:rounded-2xl sm:px-4 sm:py-3"
                >
                  <BIcon className="h-4 w-4 shrink-0 text-gold sm:h-5 sm:w-5" />
                  <span className="truncate text-xs font-medium sm:text-sm">{label}</span>
                </div>
                );
              })}
            </div>
          </div>

        </div>


        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/60 text-xs uppercase tracking-[0.3em] animate-float">
          {c.ui.scroll}
        </div>
      </section>

      {/* About */}
      <section id="about" className="relative overflow-hidden py-24 lg:py-32">
        <SectionLeafBg opacity="opacity-[0.32] sm:opacity-[0.38]" />
        <SectionWave />

        <div className="relative z-10 mx-auto max-w-5xl px-6 text-center lg:px-10">
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-3">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-fresh">
              <span className="h-px w-8 bg-fresh" /> {c.ui.aboutEyebrow}{" "}
              <span className="h-px w-8 bg-fresh" />
            </div>
            <h2 className="font-display text-4xl font-bold text-primary sm:text-5xl lg:text-6xl">
              {c.ui.aboutTitle1} <span className="text-gradient-gold">{c.ui.aboutTitleGold}</span>
            </h2>
            <PharaonicDivider className="my-2" />
          </div>

          <div className="mt-10 rounded-3xl border border-gold/40 bg-card/90 p-8 shadow-[var(--shadow-soft)] backdrop-blur-md sm:p-12">
            <p className="text-lg leading-relaxed text-foreground sm:text-xl font-medium">
              {c.ui.aboutP1}
            </p>
            <p className="mt-6 text-base leading-relaxed text-muted-foreground sm:text-lg">
              {c.ui.aboutP2}
            </p>

            <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
              {c.stats.map((s) => (
                <div
                  key={s.l}
                  className="rounded-2xl border border-gold/30 bg-cream/70 p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-gold hover:shadow-md"
                >
                  <div className="font-display text-3xl font-bold sm:text-4xl">
                    <span className="text-gradient-gold font-extrabold">{s.n}</span>
                  </div>
                  <div className="mt-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:text-sm">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Products */}
      <section
        id="products"
        className="relative overflow-hidden py-24 lg:py-32"
        style={
          sectionImages.products
            ? {
                backgroundImage: `url("${sectionImages.products}")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center center",
                backgroundSize: "100% 100%",
                filter: "none",
                opacity: 1,
              }
            : undefined
        }
      >
        {!sectionImages.products && <SectionLeafBg />}
        <SectionWave />
        {!sectionImages.products && <BrandWatermark position="right" />}

        <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-fresh">
              <span className="h-px w-8 bg-fresh" /> {c.ui.productsEyebrow}{" "}
              <span className="h-px w-8 bg-fresh" />
            </div>
            <h2 className="font-display text-4xl font-bold text-primary sm:text-5xl lg:text-6xl">
              {c.ui.productsTitle}
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              {c.ui.productsSub}
            </p>
          </div>

          <div className="mt-10 flex justify-center">
            <div className="inline-flex rounded-full border border-border bg-card p-1 shadow-sm">
              {(["export", "import"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => { setTrade(t); setActiveCat("all"); }}
                  className={`rounded-full px-6 py-2.5 text-sm font-semibold transition-colors ${
                    trade === t
                      ? "bg-fresh text-white shadow"
                      : "text-muted-foreground hover:text-primary"
                  }`}
                >
                  {t === "export" ? c.ui.exportProducts : c.ui.importProducts}
                </button>
              ))}
            </div>
          </div>

          {(() => {
            const list = dbProducts.filter((p) => p.trade === trade);
            const tradeCats = categories.filter((cat) => cat.trade === trade);

            if (!list.length && !tradeCats.length) {
              return (
                <div className="mt-12 rounded-3xl border border-dashed border-border bg-card p-12 text-center">
                  <h3 className="font-display text-2xl font-semibold text-primary">
                    {trade === "export" ? c.ui.exportProducts : c.ui.importProducts}
                  </h3>
                  <p className="mx-auto mt-3 max-w-xl text-muted-foreground">{c.ui.importEmpty}</p>
                  <a
                    href="#contact"
                    className="mt-6 inline-flex items-center gap-2 rounded-full gradient-primary px-7 py-3 font-semibold text-white shadow-lg transition-all hover:scale-[1.03]"
                  >
                    {c.ui.requestQuote}
                  </a>
                </div>
              );
            }

            const tabs: { id: string; label: string; items: ProductRow[] }[] = [];
            for (const cat of tradeCats) {
              tabs.push({
                id: cat.id,
                label: categoryName(cat, lang),
                items: list.filter((p) => p.category_id === cat.id),
              });
            }
            const ungrouped = list.filter((p) => !tradeCats.some((cat) => cat.id === p.category_id));
            if (ungrouped.length)
              tabs.push({ id: "other", label: lang === "fr" ? "Autres" : "Other", items: ungrouped });

            const allTabs =
              tabs.length > 1
                ? [{ id: "all", label: lang === "fr" ? "Tout" : "All", items: list }, ...tabs]
                : tabs;
            const current = allTabs.find((t) => t.id === activeCat) ?? allTabs[0];
            const currentItems = current?.items ?? [];

            return (
              <>
                {allTabs.length > 1 && (
                  <div className="mt-8 flex flex-wrap justify-center gap-2">
                    {allTabs.map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveCat(tab.id)}
                        className={`rounded-full border px-5 py-2 text-sm font-semibold transition-all ${
                          current?.id === tab.id
                            ? "border-fresh bg-fresh text-white shadow"
                            : "border-border bg-card text-muted-foreground hover:border-fresh/60 hover:text-primary"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                )}
                {currentItems.length === 0 ? (
                  <div className="mt-12 rounded-3xl border border-dashed border-border bg-card p-10 text-center">
                    <p className="text-muted-foreground">
                      {lang === "fr" ? "Aucun produit dans cette catégorie pour le moment." : "No products available in this category yet."}
                    </p>
                  </div>
                ) : (
                  <div
                    key={`${trade}-${current?.id}`}
                    className="animate-fade-up mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
                  >
                    {currentItems.map((p) => {
                      const l = localized(p, lang);
                      return (
                        <ProductCard
                          key={p.id}
                          name={l.name}
                          desc={l.intro}
                          img={productImage(p)}
                          slug={p.slug}
                          premium={c.ui.premium}
                          learnMore={c.ui.learnMore}
                        />
                      );
                    })}
                  </div>
                )}
              </>
            );
          })()}

        </div>
      </section>

      {/* Why Us */}
      <section
        id="why"
        className="relative overflow-hidden py-24 lg:py-32"
        style={
          sectionImages.whyUs
            ? {
                backgroundImage: `url("${sectionImages.whyUs}")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center center",
                backgroundSize: "100% 100%",
                filter: "none",
                opacity: 1,
              }
            : undefined
        }
      >
        {!sectionImages.whyUs && <SectionLeafBg />}
        <SectionWave />
        {!sectionImages.whyUs && (
          <BrandWatermark position="center" className="w-[46rem] opacity-[0.07]" />
        )}

        <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
            <BrandMark showName={false} markClassName="h-28 w-28 shadow-lg md:h-32 md:w-32" />
            <div>
              <div className="mb-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-fresh">
                <span className="h-px w-8 bg-fresh" /> {c.ui.whyEyebrow}{" "}
                <span className="h-px w-8 bg-fresh" />
              </div>
              <h2 className="font-display text-4xl font-bold text-primary sm:text-5xl lg:text-6xl">
                {c.ui.whyTitle}
              </h2>
            </div>
          </div>

          <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {c.whyUs.map((w, wi) => {
              const WIcon = whyIcons[wi];
              return (
              <div
                key={w.title}
                className="group relative overflow-hidden rounded-2xl border border-border/70 bg-card p-7 transition-all hover:-translate-y-1 hover:border-fresh/60 hover:shadow-[var(--shadow-soft)]"
              >
                <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-fresh/5 transition-all group-hover:scale-150 group-hover:bg-fresh/10" />
                <div className="relative">
                  <div className="grid h-12 w-12 place-items-center rounded-xl gradient-primary text-white shadow-lg">
                    <WIcon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 font-display text-xl font-semibold text-primary">
                    {w.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {w.desc}
                  </p>
                </div>
              </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Process */}
      <section
        id="process"
        className="relative overflow-hidden py-24 lg:py-32"
        style={
          sectionImages.process
            ? {
                backgroundImage: `url("${sectionImages.process}")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center center",
                backgroundSize: "100% 100%",
                filter: "none",
                opacity: 1,
              }
            : undefined
        }
      >
        {!sectionImages.process && <SectionLeafBg />}
        <SectionWave />
        {!sectionImages.process && <BrandWatermark position="center" />}

        <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-fresh">
              <span className="h-px w-8 bg-fresh" /> {c.ui.processEyebrow}{" "}
              <span className="h-px w-8 bg-fresh" />
            </div>
            <h2 className="font-display text-4xl font-bold text-primary sm:text-5xl lg:text-6xl">
              {c.ui.processTitle1} <span className="text-gradient-gold">{c.ui.processTitleGold}</span>
            </h2>
            <p className="mt-6 text-lg text-muted-foreground">
              {c.ui.processSub}
            </p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {c.process.map((step, i) => (
              <div
                key={step.title}
                className="group relative overflow-hidden rounded-2xl border border-border/70 bg-card p-7 transition-all duration-300 hover:-translate-y-1 hover:border-fresh/40 hover:shadow-[var(--shadow-soft)]"
              >
                <span className="absolute right-5 top-3 font-display text-6xl font-bold text-fresh/10 transition-colors group-hover:text-gold/20">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-fresh/10 font-display text-lg font-bold text-fresh transition-colors group-hover:bg-fresh group-hover:text-white">
                  {i + 1}
                </div>
                <h3 className="relative mt-5 font-display text-xl font-semibold text-primary">
                  {step.title}
                </h3>
                <p className="relative mt-2 text-sm leading-relaxed text-muted-foreground">
                  {step.desc}
                </p>
                <span className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-fresh to-gold transition-transform duration-300 group-hover:scale-x-100" />
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Certifications */}
      <section
        id="certificate"
        className="relative overflow-hidden py-24 lg:py-32"
        style={
          sectionImages.certificate
            ? {
                backgroundImage: `url("${sectionImages.certificate}")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center center",
                backgroundSize: "100% 100%",
                filter: "none",
                opacity: 1,
              }
            : undefined
        }
      >
        {!sectionImages.certificate && <SectionLeafBg />}
        <SectionWave />

        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-fresh">
              <span className="h-px w-8 bg-fresh" /> {c.ui.certsEyebrow}{" "}
              <span className="h-px w-8 bg-fresh" />
            </div>
            <h2 className="font-display text-4xl font-bold text-primary sm:text-5xl lg:text-6xl">
              {c.ui.certsTitle}
            </h2>
          </div>
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {c.certs.map((cert, ci) => {
              const CIcon = certIcons[ci];
              return (
              <div
                key={cert.title}
                className="group relative overflow-hidden rounded-2xl border border-gold/30 bg-gradient-to-br from-card to-cream p-8 text-center transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-soft)]"
              >
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-gold to-[oklch(0.68_0.14_75)] text-gold-foreground shadow-lg transition-transform group-hover:scale-110">
                  <CIcon className="h-8 w-8" />
                </div>
                <div className="mt-5 font-display text-xl font-bold text-primary">
                  {cert.title}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">{cert.sub}</div>
              </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Global Markets */}
      <section
        id="markets"
        className="relative overflow-hidden py-24 lg:py-32"
        style={
          sectionImages.markets
            ? {
                backgroundImage: `url("${sectionImages.markets}")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center center",
                backgroundSize: "100% 100%",
                filter: "none",
                opacity: 1,
              }
            : undefined
        }
      >
        {!sectionImages.markets && <SectionLeafBg />}
        <SectionWave />
        {!sectionImages.markets && <BrandWatermark position="right" />}

        <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-fresh">
                <span className="h-px w-8 bg-fresh" /> {c.ui.marketsEyebrow}
              </div>
              <div className="flex items-center gap-4">
                <BrandMark showName={false} className="shrink-0" markClassName="h-24 w-24 sm:h-28 sm:w-28" />
                <h2 className="font-display text-4xl font-bold text-primary sm:text-5xl lg:text-6xl">
                  {c.ui.marketsTitle1} <span className="text-gradient-gold">{c.ui.marketsTitleGold}</span>
                </h2>
              </div>
              <p className="mt-6 text-lg text-muted-foreground">
                {c.ui.marketsSub}
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                {c.regions.map((r) => (
                  <span
                    key={r}
                    className="inline-flex items-center gap-2 rounded-full border border-fresh/30 bg-white px-5 py-2.5 text-sm font-semibold text-primary shadow-sm"
                  >
                    <span className="h-2 w-2 rounded-full bg-fresh animate-pulse" /> {r}
                  </span>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 rounded-3xl gradient-primary opacity-20 blur-3xl" />
              <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-fresh/20 shadow-[var(--shadow-soft)]">
                <WorldMapRoutes labels={c.regions} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section
        id="contact"
        className="relative overflow-hidden py-24 lg:py-32"
        style={
          sectionImages.contact
            ? {
                backgroundImage: `url("${sectionImages.contact}")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center center",
                backgroundSize: "100% 100%",
                filter: "none",
                opacity: 1,
              }
            : undefined
        }
      >
        {!sectionImages.contact && <SectionLeafBg />}
        <SectionWave />
        {sectionImages.contact && (
          <div className="absolute inset-0 bg-stone-900/10 backdrop-blur-[1px] pointer-events-none" />
        )}

        <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid gap-12 lg:grid-cols-5 lg:items-start">
            <div className="lg:col-span-2 rounded-3xl border border-gold/30 bg-white/95 backdrop-blur-xl p-8 shadow-2xl lg:p-10">
              <div className="mb-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-fresh">
                <span className="h-px w-8 bg-fresh" /> {c.ui.contactEyebrow}
              </div>
              <h2 className="font-display text-4xl font-bold text-primary sm:text-5xl">
                {c.ui.contactTitle1} <span className="text-gradient-gold">{c.ui.contactTitleGold}</span> {c.ui.contactTitle2}
              </h2>
              <p className="mt-4 text-stone-700 font-normal leading-relaxed">
                {c.ui.contactSub}
              </p>

              <div className="mt-8 space-y-4">
                {site.email && (
                  <a
                    href={`mailto:${site.email}`}
                    className="flex items-center gap-4 group transition-colors"
                    dir="ltr"
                  >
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl gradient-primary text-white shadow-md group-hover:scale-105 transition-transform">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 font-medium text-stone-900 group-hover:text-emerald-700 break-words">
                      {site.email}
                    </div>
                  </a>
                )}

                {site.phone && (
                  <a
                    href={`tel:${site.phone.replace(/\s+/g, "")}`}
                    className="flex items-center gap-4 group transition-colors"
                    dir="ltr"
                  >
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl gradient-primary text-white shadow-md group-hover:scale-105 transition-transform">
                      <Phone className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 font-medium text-stone-900 group-hover:text-emerald-700 break-words">
                      {site.phone}
                    </div>
                  </a>
                )}

                {(site.whatsapp || site.phone) && (
                  <a
                    href={`https://wa.me/${(site.whatsapp || site.phone).replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                      lang === "ar"
                        ? "مرحباً بوخارست إيجي أجرو، أرغب في الاستفسار عن برامج التصدير."
                        : "Hello BucharestEgyAgro, I would like to inquire about your produce export programs."
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 group transition-colors"
                    dir="ltr"
                  >
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#25D366] text-white shadow-md group-hover:scale-105 transition-transform">
                      <WhatsAppIcon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 font-medium text-stone-900 group-hover:text-emerald-700 break-words flex items-center gap-2">
                      <span>{site.whatsapp || site.phone}</span>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">WhatsApp</span>
                    </div>
                  </a>
                )}

                {site.address && (
                  <div className="flex items-center gap-4" dir="ltr">
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl gradient-primary text-white shadow-md">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 font-medium text-stone-900 break-words">
                      {site.address}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const name = String(fd.get("name") ?? "").trim();
                const email = String(fd.get("email") ?? "").trim();
                const message = String(fd.get("message") ?? "").trim();
                if (!name || !email || !message) {
                  setFormMsg({ type: "error", text: c.ui.errRequired });
                  return;
                }
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                  setFormMsg({ type: "error", text: c.ui.errEmail });
                  return;
                }
                setFormMsg({ type: "success", text: c.ui.okSent });
                e.currentTarget.reset();
              }}
              className="lg:col-span-3 rounded-3xl border border-gold/40 bg-white/95 backdrop-blur-xl p-8 shadow-2xl lg:p-10"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label={c.ui.fName} type="text" name="name" />
                <Field label={c.ui.fCompany} type="text" name="company" />
                <Field label={c.ui.fCountry} type="text" name="country" />
                <Field label={c.ui.fEmail} type="email" name="email" />
                <Field label={c.ui.fPhone} type="tel" name="phone" />
                <Field label={c.ui.fProduct} type="text" name="product" />
              </div>
              <div className="mt-5">
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-emerald-950">
                  {c.ui.fMessage}
                </label>
                <textarea
                  name="message"
                  rows={5}
                  className="w-full resize-none rounded-xl border border-stone-300 bg-white px-4 py-3 text-stone-900 font-medium placeholder:text-stone-400 outline-none transition-all focus:border-fresh focus:bg-white focus:ring-4 focus:ring-fresh/20 shadow-sm"
                  placeholder={c.ui.fMessagePlaceholder}
                />
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="submit"
                  className="group inline-flex items-center gap-2 rounded-full gradient-primary px-7 py-3.5 font-semibold text-white shadow-lg transition-all hover:scale-[1.03] hover:shadow-xl"
                >
                  {c.ui.sendInquiry} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
                <button
                  type="button"
                  onClick={() => setFormMsg({ type: "success", text: c.ui.okQuote })}
                  className="inline-flex items-center gap-2 rounded-full border-2 border-gold/70 bg-white/90 px-7 py-3.5 font-bold text-primary shadow-sm transition-all hover:bg-gold hover:text-stone-900"
                >
                  {c.ui.requestQuotation}
                </button>
              </div>
              {formMsg && (
                <div
                  role="status"
                  className={`mt-5 rounded-xl border px-4 py-3 text-sm font-medium ${
                    formMsg.type === "error"
                      ? "border-destructive/30 bg-destructive/10 text-destructive"
                      : "border-fresh/40 bg-fresh/10 text-primary"
                  }`}
                >
                  {formMsg.text}
                </div>
              )}
            </form>
          </div>
        </div>
      </section>

      <PartnersCarousel
        title={lang === "ar" ? "شركاؤنا" : "Our Partners"}
        subtitle={
          lang === "ar"
            ? "نفخر بالتعاون مع شركاء موثوقين حول العالم"
            : "Proudly working with trusted partners around the world"
        }
      />

      {/* Soft mint wave leading into the footer */}
      <div className="relative overflow-hidden bg-mint">
        <SectionWave gradient />
        <div className="h-24 md:h-32" />
      </div>

      {/* Footer */}
      <footer className="relative bg-primary text-primary-foreground">

        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-gold/50 bg-white p-1.5 shadow-xl sm:h-24 sm:w-24">
                  <img
                    src={logo || "/logo.png"}
                    alt={`${site.companyName || c.brand} logo`}
                    className="h-full w-full object-contain"
                    suppressHydrationWarning
                  />
                </div>


                <div>
                  <div className="font-display text-2xl font-bold">
                    <span className="text-gradient-gold font-extrabold">BucharestEgyAgro</span>
                  </div>
                  <div className="text-[10px] uppercase tracking-[0.2em] text-primary-foreground/75">
                    {c.brandSub}
                  </div>
                </div>
              </div>
              <p className="mt-5 max-w-md text-primary-foreground/70">{footer.tagline}</p>
              <div className="mt-6 flex gap-3">
                {(
                  [
                    [Facebook, sanitizeUrl(site.facebook || footer.social.facebook, false)],
                    [Instagram, sanitizeUrl(site.instagram || footer.social.instagram, false)],
                    [Linkedin, sanitizeUrl(site.linkedin || footer.social.linkedin, false)],
                    ...(site.whatsapp || site.phone
                      ? [[WhatsAppIcon, ('https://wa.me/' + (site.whatsapp || site.phone).replace(/[^0-9]/g, ''))] as const]
                      : []),
                  ] as const
                ).map(([I, href], i) => (
                  <a
                    key={i}
                    href={href || "#top"}
                    target={href?.startsWith("http") ? "_blank" : undefined}
                    rel="noreferrer"
                    aria-label="Social"
                    className="grid h-10 w-10 place-items-center rounded-full border border-white/15 text-primary-foreground/80 transition-all hover:border-gold hover:bg-gold hover:text-gold-foreground"
                  >
                    <I className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>

            {footer.columns.map((col) => (
              <FooterCol key={col.title} title={col.title} links={col.links} />
            ))}
          </div>

          <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-sm text-primary-foreground/60 sm:flex-row">
            <div>
              © {new Date().getFullYear()} {site.companyName || c.brand}. {c.ui.rights}
            </div>
            <div className="flex items-center gap-2">
              <BadgeCheck className="h-4 w-4 text-gold" /> {c.ui.footerBadge}
            </div>
          </div>
        </div>
      </footer>

      {/* WhatsApp Floating Chat Button */}
      <WhatsAppButton whatsapp={site.whatsapp} phone={site.phone} />

      {/* Back to top */}
      {showTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label={c.ui.backToTop}
          className="fixed bottom-8 right-8 z-40 grid h-12 w-12 place-items-center rounded-full gradient-primary text-white shadow-xl transition-all hover:scale-110"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}


function ProductCard({
  name,
  desc,
  img,
  premium,
  learnMore,
  slug,
}: {
  name: string;
  desc: string;
  img: string;
  premium: string;
  learnMore: string;
  slug: string;
}) {
  return (
    <Link
      to="/products/$slug"
      params={{ slug }}
      className="group relative block overflow-hidden rounded-3xl border border-border bg-card shadow-[var(--shadow-soft)] transition-all hover:-translate-y-2">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={img}
          alt={name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-transparent to-transparent opacity-60" />
        <div className="absolute right-4 top-4 rounded-full glass px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary">
          {premium}
        </div>
      </div>
      <div className="p-6">
        <h4 className="font-display text-2xl font-semibold text-primary">{name}</h4>
        <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
        <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-fresh transition-all group-hover:gap-3">
          {learnMore} <ArrowRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}

function Field({
  label,
  type,
  name,
}: {
  label: string;
  type: string;
  name: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-emerald-950">
        {label}
      </label>
      <input
        type={type}
        name={name}
        className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-stone-900 font-medium placeholder:text-stone-400 outline-none transition-all focus:border-fresh focus:bg-white focus:ring-4 focus:ring-fresh/20 shadow-sm"
      />
    </div>
  );
}

function FooterCol({ title, links }: { title: string; links: FooterLink[] }) {
  return (
    <div>
      <div className="font-display text-sm font-bold uppercase tracking-[0.2em] text-gold">
        {title}
      </div>
      <ul className="mt-4 space-y-2.5 text-sm">
        {links.map((l) => {
          const safeHref = sanitizeUrl(l.href, true) || "#top";
          return (
          <li key={l.label}>
            <a
              href={safeHref}
              target={safeHref.startsWith("http") ? "_blank" : undefined}
              rel="noopener noreferrer"
              className="text-primary-foreground/70 transition-colors hover:text-gold"
            >
              {l.label}
            </a>
          </li>
          );
        })}
      </ul>
    </div>
  );
}
