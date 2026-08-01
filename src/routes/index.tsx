import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  defaultFooterConfig,
  loadFooterConfig,
  type FooterConfig,
  type FooterLink,
} from "@/lib/admin-footer";
import { loadLogo } from "@/lib/admin-branding";
import { useLang, initLang } from "@/lib/i18n";
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

import hero from "@/assets/hero.jpg";
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

const fruitImgs = [oranges, grapes, mangoes, pomegranates, strawberries, lemons];
const vegImgs = [potatoes, onions, garlic, sweetPotatoes, greenBeans, peppers];
const whyIcons = [Award, BadgeCheck, Sprout, ShieldCheck, HeartHandshake, Globe2, Clock, Snowflake, Star];
const certIcons = [BadgeCheck, ShieldCheck, Globe2, Award];
const badgeIcons = [Award, BadgeCheck, Globe2];
const contactIcons = [Mail, Phone, MapPin];

function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { lang, setLang, c } = useLang();
  return (
    <div
      aria-label={c.ui.language}
      className={`inline-flex items-center gap-1 rounded-full border p-1 ${
        compact
          ? "border-border bg-white"
          : "border-white/25 bg-white/10 backdrop-blur-md"
      }`}
    >
      {(["en", "ar"] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
            lang === l
              ? "bg-gold text-gold-foreground shadow"
              : compact
                ? "text-muted-foreground hover:text-primary"
                : "text-white/80 hover:text-white"
          }`}
        >
          {l === "en" ? "EN" : "ع"}
        </button>
      ))}
    </div>
  );
}

function Index() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showTop, setShowTop] = useState(false);
  const [loading, setLoading] = useState(true);
  const [footer, setFooter] = useState<FooterConfig>(defaultFooterConfig);
  const [logo, setLogo] = useState<string | null>(null);
  const [formMsg, setFormMsg] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const { lang, c } = useLang();

  useEffect(() => {
    initLang();
    setFooter(loadFooterConfig());
    setLogo(loadLogo());
  }, []);

  useEffect(() => {
    setFormMsg(null);
    if (typeof document === "undefined") return;
    document.title =
      lang === "ar"
        ? "فريش دايموند للتصدير | مُصدِّر فواكه وخضروات طازجة فاخرة"
        : "Fresh Diamond for Export | Premium Fresh Fruits & Vegetables Exporter";
    const desc = document.querySelector('meta[name="description"]');
    if (desc)
      desc.setAttribute(
        "content",
        lang === "ar"
          ? "فريش دايموند للتصدير شركة رائدة في تصدير الفواكه والخضروات الطازجة الفاخرة منذ 2011، حاصلة على شهادة الأيزو 9001 وتخدم الأسواق الدولية بجودة عالية وموثوقية."
          : "Fresh Diamond for Export is a leading exporter of premium fresh fruits and vegetables since 2011. ISO 9001 Certified. Serving international markets with exceptional quality and reliable export services.",
      );
  }, [lang]);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
      setShowTop(window.scrollY > 600);
    };
    window.addEventListener("scroll", onScroll);
    const t = setTimeout(() => setLoading(false), 600);
    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(t);
    };
  }, []);

  const nav = c.nav;


  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Loading */}
      {loading && (
        <div className="fixed inset-0 z-[100] grid place-items-center bg-primary">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <Leaf className="h-12 w-12 text-gold animate-float" />
              <div className="absolute inset-0 rounded-full blur-2xl bg-gold/40" />
            </div>
            <div className="text-primary-foreground font-display text-xl tracking-wide">
              {c.brand}
            </div>

          </div>
        </div>
      )}

      {/* Navbar */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? "glass shadow-[0_4px_30px_-10px_oklch(0.3_0.08_150/0.15)]" : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
          <a href="#top" className="flex items-center gap-2.5">
            <div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-xl gradient-primary shadow-[var(--shadow-glow)]">
              {logo ? (
                <img src={logo} alt="Fresh Diamond for Export logo" className="h-full w-full object-contain" />
              ) : (
                <Leaf className="h-5 w-5 text-white" />
              )}
            </div>
            <div className="min-w-0">
              <div
                className={`font-display text-lg font-bold leading-none ${
                  scrolled ? "text-primary" : "text-white"
                }`}
              >
                {c.brand}

              </div>
              <div
                className={`text-[10px] uppercase tracking-[0.2em] ${
                  scrolled ? "text-muted-foreground" : "text-white/70"
                }`}
              >
                {c.brandSub}
              </div>
            </div>
          </a>

          <nav className="hidden items-center gap-8 lg:flex">
            {nav.map((n) => (
              <a
                key={n.href}
                href={n.href}
                className={`text-sm font-medium transition-colors ${
                  scrolled
                    ? "text-foreground hover:text-fresh"
                    : "text-white/90 hover:text-gold"
                }`}
              >
                {n.label}
              </a>
            ))}
            <a
              href="#contact"
              className="inline-flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-gold-foreground shadow-lg transition-all hover:scale-105 hover:shadow-xl"
            >
              {c.ui.requestQuote} <ArrowRight className="h-4 w-4" />
            </a>
            <LanguageSwitcher compact={scrolled} />
          </nav>

          <div className="flex items-center gap-3 lg:hidden">
            <LanguageSwitcher compact={scrolled} />
          <button
            aria-label={c.ui.toggleMenu}
            onClick={() => setMenuOpen(!menuOpen)}
            className={`lg:hidden ${scrolled ? "text-foreground" : "text-white"}`}
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
          </div>
        </div>

        {menuOpen && (
          <div className="glass border-t border-white/20 lg:hidden">
            <nav className="flex flex-col gap-1 p-6">
              {nav.map((n) => (
                <a
                  key={n.href}
                  href={n.href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg px-4 py-3 text-foreground transition-colors hover:bg-fresh/10"
                >
                  {n.label}
                </a>
              ))}
              <a
                href="#contact"
                onClick={() => setMenuOpen(false)}
                className="mt-2 rounded-full bg-gold px-5 py-3 text-center font-semibold text-gold-foreground"
              >
                {c.ui.requestQuote}
              </a>
            </nav>
          </div>
        )}
      </header>

      {/* Hero */}
      <section id="top" className="relative min-h-screen overflow-hidden">
        <img
          src={hero}
          alt="Lush citrus fields at sunrise"
          width={1920}
          height={1200}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute inset-0 bg-primary/20 mix-blend-multiply" />

        <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-6 pt-32 pb-20 lg:px-10">
          <div className="max-w-3xl animate-fade-up">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full glass-dark px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] text-white">
              <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse" />
              {c.ui.heroBadge}
            </div>
            <h1 className="font-display text-5xl font-bold leading-[1.05] text-white sm:text-6xl lg:text-7xl xl:text-8xl">
              {c.ui.heroTitle1}{" "}
              <span className="text-gradient-gold">{c.ui.heroTitleGold}</span>
              <br />
              {c.ui.heroTitle2}
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-white/85 sm:text-xl">
              {c.ui.heroSub}
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <a
                href="#contact"
                className="group inline-flex items-center gap-2 rounded-full bg-gold px-8 py-4 font-semibold text-gold-foreground shadow-xl transition-all hover:scale-[1.03] hover:shadow-2xl"
              >
                {c.ui.requestAQuote}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
              <a
                href="#products"
                className="inline-flex items-center gap-2 rounded-full glass-dark px-8 py-4 font-semibold text-white transition-all hover:bg-white/20"
              >
                {c.ui.exploreProducts}
              </a>
            </div>

            <div className="mt-14 grid max-w-2xl grid-cols-3 gap-4">
              {c.badges.map((label, bi) => {
                const BIcon = badgeIcons[bi];
                return (
                <div
                  key={label}
                  className="glass-dark flex items-center gap-3 rounded-2xl px-4 py-3 text-white"
                >
                  <BIcon className="h-5 w-5 shrink-0 text-gold" />
                  <span className="truncate text-sm font-medium">{label}</span>
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
      <section id="about" className="relative py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-fresh">
                <span className="h-px w-8 bg-fresh" /> {c.ui.aboutEyebrow}
              </div>
              <h2 className="font-display text-4xl font-bold text-primary sm:text-5xl lg:text-6xl">
                {c.ui.aboutTitle1} <span className="text-gradient-gold">{c.ui.aboutTitleGold}</span>
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
                {c.ui.aboutP1}
              </p>
              <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                {c.ui.aboutP2}
              </p>

              <div className="mt-10 grid grid-cols-2 gap-4">
                {c.stats.map((s) => (
                  <div
                    key={s.l}
                    className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-soft)] transition-all hover:-translate-y-1 hover:border-fresh/50"
                  >
                    <div className="font-display text-3xl font-bold text-primary">{s.n}</div>
                    <div className="mt-1 text-sm text-muted-foreground">{s.l}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 rounded-3xl gradient-primary opacity-20 blur-2xl" />
              <div className="relative overflow-hidden rounded-3xl shadow-[var(--shadow-soft)]">
                <img
                  src={farm}
                  alt="Vast farm fields"
                  loading="lazy"
                  width={1200}
                  height={900}
                  className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 hidden rounded-2xl glass p-5 shadow-xl sm:block">
                <div className="flex items-center gap-4">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl gradient-primary">
                    <BadgeCheck className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="font-display text-lg font-bold text-primary">
                      {c.ui.iso}
                    </div>
                    <div className="text-xs text-muted-foreground">{c.ui.certifiedExcellence}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products */}
      <section id="products" className="relative bg-cream py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
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

          <div className="mt-16">
            <h3 className="mb-8 font-display text-2xl font-semibold text-primary">
              {c.ui.freshFruits}
            </h3>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {c.fruits.map((p, i) => (
                <ProductCard key={p.name} {...p} img={fruitImgs[i]} premium={c.ui.premium} learnMore={c.ui.learnMore} />
              ))}
            </div>
          </div>

          <div className="mt-20">
            <h3 className="mb-8 font-display text-2xl font-semibold text-primary">
              {c.ui.freshVegetables}
            </h3>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {c.vegetables.map((p, i) => (
                <ProductCard key={p.name} {...p} img={vegImgs[i]} premium={c.ui.premium} learnMore={c.ui.learnMore} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why Us */}
      <section id="why" className="relative py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-fresh">
              <span className="h-px w-8 bg-fresh" /> {c.ui.whyEyebrow}{" "}
              <span className="h-px w-8 bg-fresh" />
            </div>
            <h2 className="font-display text-4xl font-bold text-primary sm:text-5xl lg:text-6xl">
              {c.ui.whyTitle}
            </h2>
          </div>
          <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {c.whyUs.map((w, wi) => {
              const WIcon = whyIcons[wi];
              return (
              <div
                key={w.title}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card p-7 transition-all hover:-translate-y-1 hover:border-fresh/60 hover:shadow-[var(--shadow-soft)]"
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
      <section id="process" className="relative overflow-hidden bg-white py-24 lg:py-32">
        <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
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
                className="group relative overflow-hidden rounded-2xl border border-border bg-card p-7 transition-all duration-300 hover:-translate-y-1 hover:border-fresh/40 hover:shadow-[var(--shadow-soft)]"
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
      <section className="relative py-24 lg:py-32">
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
        className="relative overflow-hidden bg-cream py-24 lg:py-32"
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-fresh">
                <span className="h-px w-8 bg-fresh" /> {c.ui.marketsEyebrow}
              </div>
              <h2 className="font-display text-4xl font-bold text-primary sm:text-5xl lg:text-6xl">
                {c.ui.marketsTitle1} <span className="text-gradient-gold">{c.ui.marketsTitleGold}</span>
              </h2>
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
              <div className="absolute inset-0 rounded-3xl gradient-primary opacity-10 blur-3xl" />
              <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-border bg-white shadow-[var(--shadow-soft)]">
                <WorldMap />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="relative py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid gap-12 lg:grid-cols-5 lg:items-start">
            <div className="lg:col-span-2">
              <div className="mb-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-fresh">
                <span className="h-px w-8 bg-fresh" /> {c.ui.contactEyebrow}
              </div>
              <h2 className="font-display text-4xl font-bold text-primary sm:text-5xl">
                {c.ui.contactTitle1} <span className="text-gradient-gold">{c.ui.contactTitleGold}</span> {c.ui.contactTitle2}
              </h2>
              <p className="mt-4 text-muted-foreground">
                {c.ui.contactSub}
              </p>

              <div className="mt-8 space-y-4">
                {c.contact.map((label, ci) => {
                  const CIcon = contactIcons[ci];
                  return (
                  <div key={label} className="flex items-center gap-4" dir="ltr">
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl gradient-primary text-white">
                      <CIcon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 text-foreground">{label}</div>
                  </div>
                  );
                })}
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
              className="lg:col-span-3 rounded-3xl border border-border bg-card p-8 shadow-[var(--shadow-soft)] lg:p-10"
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
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {c.ui.fMessage}
                </label>
                <textarea
                  name="message"
                  rows={5}
                  className="w-full resize-none rounded-xl border border-input bg-background px-4 py-3 text-foreground outline-none transition-all focus:border-fresh focus:ring-2 focus:ring-fresh/20"
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
                  className="inline-flex items-center gap-2 rounded-full border border-gold bg-gold/10 px-7 py-3.5 font-semibold text-primary transition-all hover:bg-gold hover:text-gold-foreground"
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

      {/* Footer */}
      <footer className="relative bg-primary text-primary-foreground">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center overflow-hidden rounded-xl bg-gold text-gold-foreground">
                  {logo ? (
                    <img src={logo} alt="Fresh Diamond for Export logo" className="h-full w-full object-contain" />
                  ) : (
                    <Leaf className="h-6 w-6" />
                  )}
                </div>
                <div>
                  <div className="font-display text-xl font-bold">{c.brand}</div>
                  <div className="text-[10px] uppercase tracking-[0.2em] text-primary-foreground/60">
                    {c.brandSub}
                  </div>
                </div>
              </div>
              <p className="mt-5 max-w-md text-primary-foreground/70">{footer.tagline}</p>
              <div className="mt-6 flex gap-3">
                {(
                  [
                    [Facebook, footer.social.facebook],
                    [Instagram, footer.social.instagram],
                    [Linkedin, footer.social.linkedin],
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
              © {new Date().getFullYear()} {c.brand} {c.brandSub}. {c.ui.rights}
            </div>
            <div className="flex items-center gap-2">
              <BadgeCheck className="h-4 w-4 text-gold" /> {c.ui.footerBadge}
            </div>
          </div>
        </div>
      </footer>

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
}: {
  name: string;
  desc: string;
  img: string;
  premium: string;
  learnMore: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-border bg-card shadow-[var(--shadow-soft)] transition-all hover:-translate-y-2">
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
        <button className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-fresh transition-all hover:gap-3">
          {learnMore} <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
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
      <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </label>
      <input
        type={type}
        name={name}
        className="w-full rounded-xl border border-input bg-background px-4 py-3 text-foreground outline-none transition-all focus:border-fresh focus:ring-2 focus:ring-fresh/20"
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
        {links.map((l) => (
          <li key={l.label}>
            <a
              href={l.href || "#top"}
              target={l.href?.startsWith("http") ? "_blank" : undefined}
              rel="noreferrer"
              className="text-primary-foreground/70 transition-colors hover:text-gold"
            >
              {l.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function WorldMap() {
  // Highlight coords roughly matching Europe / MENA / Africa / Asia
  const highlights = [
    { cx: 480, cy: 155, r: 26, label: "Europe" },
    { cx: 545, cy: 220, r: 22, label: "Middle East" },
    { cx: 510, cy: 290, r: 30, label: "Africa" },
    { cx: 660, cy: 210, r: 30, label: "Asia" },
  ];
  return (
    <div className="relative h-full w-full bg-gradient-to-br from-white via-cream to-fresh/5 p-6">
      <svg viewBox="0 0 900 450" className="h-full w-full">
        <defs>
          <radialGradient id="glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="oklch(0.66 0.17 145)" stopOpacity="0.6" />
            <stop offset="100%" stopColor="oklch(0.66 0.17 145)" stopOpacity="0" />
          </radialGradient>
          <pattern id="dots" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
            <circle cx="1.5" cy="1.5" r="1.2" fill="oklch(0.35 0.09 150)" opacity="0.35" />
          </pattern>
          <mask id="continents">
            {/* Simplified continent shapes */}
            <rect width="900" height="450" fill="black" />
            {/* North America */}
            <path d="M120,110 Q160,80 220,90 L280,120 L300,180 L260,240 L200,260 L150,220 Z" fill="white" />
            {/* South America */}
            <path d="M270,270 Q310,260 320,320 L300,390 L270,410 L245,360 Z" fill="white" />
            {/* Europe */}
            <path d="M430,110 Q470,100 510,120 L530,160 L500,190 L450,180 L420,150 Z" fill="white" />
            {/* Africa */}
            <path d="M470,200 Q520,190 550,230 L560,310 L520,360 L480,340 L460,270 Z" fill="white" />
            {/* Middle East */}
            <path d="M530,180 L570,190 L575,225 L545,235 L525,215 Z" fill="white" />
            {/* Asia */}
            <path d="M560,130 Q640,110 720,140 L760,180 L740,240 L680,250 L610,220 L580,180 Z" fill="white" />
            {/* SE Asia */}
            <path d="M700,260 L740,270 L735,300 L710,305 Z" fill="white" />
            {/* Australia */}
            <path d="M720,340 Q760,330 790,350 L780,380 L740,385 L720,370 Z" fill="white" />
          </mask>
        </defs>

        <rect width="900" height="450" fill="url(#dots)" mask="url(#continents)" />

        {highlights.map((h) => (
          <g key={h.label}>
            <circle cx={h.cx} cy={h.cy} r={h.r * 2.5} fill="url(#glow)">
              <animate
                attributeName="r"
                values={`${h.r * 1.5};${h.r * 3};${h.r * 1.5}`}
                dur="3s"
                repeatCount="indefinite"
              />
            </circle>
            <circle cx={h.cx} cy={h.cy} r="6" fill="oklch(0.75 0.13 85)" />
            <circle
              cx={h.cx}
              cy={h.cy}
              r="10"
              fill="none"
              stroke="oklch(0.75 0.13 85)"
              strokeWidth="1.5"
              opacity="0.7"
            />
            <text
              x={h.cx}
              y={h.cy - 18}
              textAnchor="middle"
              className="fill-primary"
              style={{ font: "600 12px Inter, sans-serif" }}
            >
              {h.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
