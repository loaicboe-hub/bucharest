import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
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
  Quote,
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
import shipping from "@/assets/shipping.jpg";
import coldStorage from "@/assets/cold-storage.jpg";
import packaging from "@/assets/packaging.jpg";
import farm from "@/assets/farm.jpg";
import loading from "@/assets/loading.jpg";

export const Route = createFileRoute("/")({
  component: Index,
});

const fruits = [
  { name: "Oranges", desc: "Sun-ripened citrus with vibrant sweetness.", img: oranges },
  { name: "Grapes", desc: "Hand-picked table grapes, plump and juicy.", img: grapes },
  { name: "Mangoes", desc: "Fragrant, honey-sweet tropical mangoes.", img: mangoes },
  { name: "Pomegranates", desc: "Ruby seeds bursting with flavor.", img: pomegranates },
  { name: "Strawberries", desc: "Aromatic berries, cold-chain fresh.", img: strawberries },
  { name: "Lemons", desc: "Zesty, thin-skinned premium lemons.", img: lemons },
];

const vegetables = [
  { name: "Potatoes", desc: "Firm, versatile export-grade potatoes.", img: potatoes },
  { name: "Onions", desc: "Golden and red bulbs, long shelf life.", img: onions },
  { name: "Garlic", desc: "Robust flavor, uniform premium bulbs.", img: garlic },
  { name: "Sweet Potatoes", desc: "Naturally sweet, rich orange flesh.", img: sweetPotatoes },
  { name: "Green Beans", desc: "Crisp, tender pods harvested young.", img: greenBeans },
  { name: "Peppers", desc: "Colorful bell peppers, thick-walled.", img: peppers },
];

const whyUs = [
  { icon: Award, title: "Premium Quality", desc: "Only export-grade produce, hand-selected." },
  { icon: BadgeCheck, title: "ISO 9001 Certified", desc: "Rigorous internationally recognized standards." },
  { icon: Sprout, title: "Selected Farms", desc: "Partnerships with trusted, vetted growers." },
  { icon: ShieldCheck, title: "Strict Quality Control", desc: "Multi-stage inspection at every step." },
  { icon: HeartHandshake, title: "Competitive Prices", desc: "Direct sourcing means best value." },
  { icon: Globe2, title: "Global Experience", desc: "Exporting worldwide since 2011." },
  { icon: Clock, title: "On-Time Delivery", desc: "Reliable logistics you can plan around." },
  { icon: Snowflake, title: "Cold Chain", desc: "Temperature controlled end-to-end." },
  { icon: Star, title: "Customer First", desc: "Long-term partnerships, not transactions." },
];

const process = [
  { title: "Farm Selection", desc: "Sourcing only from certified partner farms." },
  { title: "Quality Inspection", desc: "Field and lab checks for every batch." },
  { title: "Sorting & Packaging", desc: "Graded and packed to buyer specifications." },
  { title: "Cold Storage", desc: "Temperature and humidity controlled." },
  { title: "Container Loading", desc: "Refrigerated reefers loaded with care." },
  { title: "International Shipping", desc: "Ocean and air freight worldwide." },
  { title: "Delivery", desc: "Handed off fresh, on schedule." },
];

const testimonials = [
  {
    quote: "Outstanding quality and professional service. Every container arrives exactly as promised.",
    author: "M. Kellerman",
    role: "Procurement Director, EU Distributor",
  },
  {
    quote: "Reliable supplier with consistent freshness. Our supermarket clients are delighted.",
    author: "A. Al-Farsi",
    role: "Import Manager, Gulf Region",
  },
  {
    quote: "Excellent export partner. Fresh Diamond understands what premium truly means.",
    author: "R. Nakamura",
    role: "Head of Sourcing, Asian Retail Chain",
  },
];

const galleryImages = [
  { src: farm, alt: "Farm fields at sunrise", cls: "row-span-2" },
  { src: packaging, alt: "Packaging facility", cls: "" },
  { src: coldStorage, alt: "Cold storage warehouse", cls: "" },
  { src: shipping, alt: "Container ship at port", cls: "col-span-2" },
  { src: loading, alt: "Container loading", cls: "" },
  { src: strawberries, alt: "Fresh strawberries", cls: "" },
  { src: peppers, alt: "Colorful peppers", cls: "" },
  { src: mangoes, alt: "Ripe mangoes", cls: "" },
];

const regions = ["Europe", "Middle East", "Africa", "Asia"];

function Index() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showTop, setShowTop] = useState(false);
  const [loading, setLoading] = useState(true);

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

  const nav = [
    { href: "#about", label: "About" },
    { href: "#products", label: "Products" },
    { href: "#why", label: "Why Us" },
    { href: "#process", label: "Process" },
    { href: "#markets", label: "Markets" },
    { href: "#contact", label: "Contact" },
  ];

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
              Fresh Diamond
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
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl gradient-primary shadow-[var(--shadow-glow)]">
              <Leaf className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0">
              <div
                className={`font-display text-lg font-bold leading-none ${
                  scrolled ? "text-primary" : "text-white"
                }`}
              >
                Fresh Diamond
              </div>
              <div
                className={`text-[10px] uppercase tracking-[0.2em] ${
                  scrolled ? "text-muted-foreground" : "text-white/70"
                }`}
              >
                for Export
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
              Request Quote <ArrowRight className="h-4 w-4" />
            </a>
          </nav>

          <button
            aria-label="Toggle menu"
            onClick={() => setMenuOpen(!menuOpen)}
            className={`lg:hidden ${scrolled ? "text-foreground" : "text-white"}`}
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
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
                Request Quote
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
              Est. 2011 — ISO 9001 Certified
            </div>
            <h1 className="font-display text-5xl font-bold leading-[1.05] text-white sm:text-6xl lg:text-7xl xl:text-8xl">
              Premium Fresh Fruits &{" "}
              <span className="text-gradient-gold">Vegetables</span>
              <br />
              Exported Worldwide
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-white/85 sm:text-xl">
              Delivering exceptional quality, freshness, and reliability since 2011 — from
              certified farms to your market, uninterrupted.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <a
                href="#contact"
                className="group inline-flex items-center gap-2 rounded-full bg-gold px-8 py-4 font-semibold text-gold-foreground shadow-xl transition-all hover:scale-[1.03] hover:shadow-2xl"
              >
                Request a Quote
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
              <a
                href="#products"
                className="inline-flex items-center gap-2 rounded-full glass-dark px-8 py-4 font-semibold text-white transition-all hover:bg-white/20"
              >
                Explore Products
              </a>
            </div>

            <div className="mt-14 grid max-w-2xl grid-cols-3 gap-4">
              {[
                { icon: Award, label: "Since 2011" },
                { icon: BadgeCheck, label: "ISO 9001" },
                { icon: Globe2, label: "Global Export" },
              ].map((b) => (
                <div
                  key={b.label}
                  className="glass-dark flex items-center gap-3 rounded-2xl px-4 py-3 text-white"
                >
                  <b.icon className="h-5 w-5 shrink-0 text-gold" />
                  <span className="truncate text-sm font-medium">{b.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/60 text-xs uppercase tracking-[0.3em] animate-float">
          Scroll
        </div>
      </section>

      {/* About */}
      <section id="about" className="relative py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-fresh">
                <span className="h-px w-8 bg-fresh" /> About Us
              </div>
              <h2 className="font-display text-4xl font-bold text-primary sm:text-5xl lg:text-6xl">
                About Fresh <span className="text-gradient-gold">Diamond</span>
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
                Fresh Diamond for Export has been supplying premium-quality fresh fruits and
                vegetables to international markets since 2011. We are committed to quality,
                food safety, reliability, and customer satisfaction.
              </p>
              <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                With years of experience and strict quality control standards, we ensure every
                shipment meets international export requirements.
              </p>

              <div className="mt-10 grid grid-cols-2 gap-4">
                {[
                  { n: "14+", l: "Years of Experience" },
                  { n: "50+", l: "Professional Team" },
                  { n: "ISO", l: "9001 Standards" },
                  { n: "24/7", l: "Fast Delivery" },
                ].map((s) => (
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
                      ISO 9001
                    </div>
                    <div className="text-xs text-muted-foreground">Certified Excellence</div>
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
              <span className="h-px w-8 bg-fresh" /> Our Products{" "}
              <span className="h-px w-8 bg-fresh" />
            </div>
            <h2 className="font-display text-4xl font-bold text-primary sm:text-5xl lg:text-6xl">
              A Harvest of Excellence
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Export-grade fruits and vegetables, selected for freshness, appearance, and shelf life.
            </p>
          </div>

          <div className="mt-16">
            <h3 className="mb-8 font-display text-2xl font-semibold text-primary">
              Fresh Fruits
            </h3>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {fruits.map((p) => (
                <ProductCard key={p.name} {...p} />
              ))}
            </div>
          </div>

          <div className="mt-20">
            <h3 className="mb-8 font-display text-2xl font-semibold text-primary">
              Fresh Vegetables
            </h3>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {vegetables.map((p) => (
                <ProductCard key={p.name} {...p} />
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
              <span className="h-px w-8 bg-fresh" /> Why Choose Us{" "}
              <span className="h-px w-8 bg-fresh" />
            </div>
            <h2 className="font-display text-4xl font-bold text-primary sm:text-5xl lg:text-6xl">
              Built on Trust & Standards
            </h2>
          </div>
          <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {whyUs.map((w) => (
              <div
                key={w.title}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card p-7 transition-all hover:-translate-y-1 hover:border-fresh/60 hover:shadow-[var(--shadow-soft)]"
              >
                <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-fresh/5 transition-all group-hover:scale-150 group-hover:bg-fresh/10" />
                <div className="relative">
                  <div className="grid h-12 w-12 place-items-center rounded-xl gradient-primary text-white shadow-lg">
                    <w.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 font-display text-xl font-semibold text-primary">
                    {w.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {w.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section
        id="process"
        className="relative overflow-hidden bg-primary py-24 text-primary-foreground lg:py-32"
      >
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url(${coldStorage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/95 via-primary/90 to-primary" />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-gold">
              <span className="h-px w-8 bg-gold" /> Export Process{" "}
              <span className="h-px w-8 bg-gold" />
            </div>
            <h2 className="font-display text-4xl font-bold sm:text-5xl lg:text-6xl">
              From Farm to <span className="text-gradient-gold">Global Market</span>
            </h2>
          </div>

          <div className="relative mt-20">
            <div className="absolute left-4 top-0 bottom-0 hidden w-px bg-gradient-to-b from-gold/60 via-gold/30 to-transparent md:left-1/2 md:block" />
            <div className="space-y-8 md:space-y-16">
              {process.map((step, i) => (
                <div
                  key={step.title}
                  className={`relative md:grid md:grid-cols-2 md:gap-12 ${
                    i % 2 === 1 ? "md:[&>*:first-child]:col-start-2" : ""
                  }`}
                >
                  <div className={i % 2 === 1 ? "md:text-left" : "md:text-right"}>
                    <div className="glass-dark rounded-2xl p-6">
                      <div className="text-gold font-display text-4xl font-bold">
                        {String(i + 1).padStart(2, "0")}
                      </div>
                      <h3 className="mt-2 font-display text-2xl font-semibold">{step.title}</h3>
                      <p className="mt-2 text-primary-foreground/70">{step.desc}</p>
                    </div>
                  </div>
                  <div
                    className={`absolute left-4 top-8 hidden h-4 w-4 -translate-x-1/2 rounded-full bg-gold shadow-[0_0_20px_oklch(0.75_0.13_85)] md:left-1/2 md:block`}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="relative py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-fresh">
              <span className="h-px w-8 bg-fresh" /> Certifications{" "}
              <span className="h-px w-8 bg-fresh" />
            </div>
            <h2 className="font-display text-4xl font-bold text-primary sm:text-5xl lg:text-6xl">
              Standards You Can Trust
            </h2>
          </div>
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: BadgeCheck, title: "ISO 9001", sub: "Quality Management" },
              { icon: ShieldCheck, title: "Food Safety", sub: "Global Standards" },
              { icon: Globe2, title: "Export Ready", sub: "International Compliance" },
              { icon: Award, title: "Premium Grade", sub: "Quality Assurance" },
            ].map((c) => (
              <div
                key={c.title}
                className="group relative overflow-hidden rounded-2xl border border-gold/30 bg-gradient-to-br from-card to-cream p-8 text-center transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-soft)]"
              >
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-gold to-[oklch(0.68_0.14_75)] text-gold-foreground shadow-lg transition-transform group-hover:scale-110">
                  <c.icon className="h-8 w-8" />
                </div>
                <div className="mt-5 font-display text-xl font-bold text-primary">
                  {c.title}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">{c.sub}</div>
              </div>
            ))}
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
                <span className="h-px w-8 bg-fresh" /> Global Markets
              </div>
              <h2 className="font-display text-4xl font-bold text-primary sm:text-5xl lg:text-6xl">
                We Export to <span className="text-gradient-gold">the World</span>
              </h2>
              <p className="mt-6 text-lg text-muted-foreground">
                We proudly export to multiple international markets, delivering freshness across
                continents with cold-chain reliability.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                {regions.map((r) => (
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

      {/* Gallery */}
      <section className="relative py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-fresh">
              <span className="h-px w-8 bg-fresh" /> Gallery{" "}
              <span className="h-px w-8 bg-fresh" />
            </div>
            <h2 className="font-display text-4xl font-bold text-primary sm:text-5xl lg:text-6xl">
              Freshness in Motion
            </h2>
          </div>

          <div className="mt-14 grid auto-rows-[220px] grid-cols-2 gap-4 md:grid-cols-4">
            {galleryImages.map((g, i) => (
              <div
                key={i}
                className={`group relative overflow-hidden rounded-2xl ${g.cls}`}
              >
                <img
                  src={g.src}
                  alt={g.alt}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/70 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="absolute bottom-4 left-4 translate-y-4 text-sm font-medium text-white opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100">
                  {g.alt}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative overflow-hidden bg-cream py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-fresh">
              <span className="h-px w-8 bg-fresh" /> Testimonials{" "}
              <span className="h-px w-8 bg-fresh" />
            </div>
            <h2 className="font-display text-4xl font-bold text-primary sm:text-5xl lg:text-6xl">
              Trusted by Partners Worldwide
            </h2>
          </div>
          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <div
                key={t.author}
                className="relative rounded-2xl border border-border bg-card p-8 shadow-[var(--shadow-soft)] transition-all hover:-translate-y-1"
              >
                <Quote className="absolute right-6 top-6 h-10 w-10 text-fresh/15" />
                <div className="mb-3 flex gap-1 text-gold">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="text-foreground/85 leading-relaxed">"{t.quote}"</p>
                <div className="mt-6 border-t border-border pt-4">
                  <div className="font-semibold text-primary">{t.author}</div>
                  <div className="text-sm text-muted-foreground">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="relative py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid gap-12 lg:grid-cols-5 lg:items-start">
            <div className="lg:col-span-2">
              <div className="mb-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-fresh">
                <span className="h-px w-8 bg-fresh" /> Contact
              </div>
              <h2 className="font-display text-4xl font-bold text-primary sm:text-5xl">
                Let's Ship <span className="text-gradient-gold">Freshness</span> Together
              </h2>
              <p className="mt-4 text-muted-foreground">
                Reach out for quotations, product specifications, or partnership inquiries. Our
                team responds within one business day.
              </p>

              <div className="mt-8 space-y-4">
                {[
                  { icon: Mail, label: "info@freshdiamond-export.com" },
                  { icon: Phone, label: "+20 100 000 0000" },
                  { icon: MapPin, label: "Cairo, Egypt — Serving Worldwide" },
                ].map((c) => (
                  <div key={c.label} className="flex items-center gap-4">
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl gradient-primary text-white">
                      <c.icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 text-foreground">{c.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
              }}
              className="lg:col-span-3 rounded-3xl border border-border bg-card p-8 shadow-[var(--shadow-soft)] lg:p-10"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Name" type="text" name="name" />
                <Field label="Company" type="text" name="company" />
                <Field label="Country" type="text" name="country" />
                <Field label="Email" type="email" name="email" />
                <Field label="Phone" type="tel" name="phone" />
                <Field label="Interested Product" type="text" name="product" />
              </div>
              <div className="mt-5">
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Message
                </label>
                <textarea
                  rows={5}
                  className="w-full resize-none rounded-xl border border-input bg-background px-4 py-3 text-foreground outline-none transition-all focus:border-fresh focus:ring-2 focus:ring-fresh/20"
                  placeholder="Tell us about your requirements..."
                />
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="submit"
                  className="group inline-flex items-center gap-2 rounded-full gradient-primary px-7 py-3.5 font-semibold text-white shadow-lg transition-all hover:scale-[1.03] hover:shadow-xl"
                >
                  Send Inquiry <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full border border-gold bg-gold/10 px-7 py-3.5 font-semibold text-primary transition-all hover:bg-gold hover:text-gold-foreground"
                >
                  Request Quotation
                </button>
              </div>
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
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-gold text-gold-foreground">
                  <Leaf className="h-6 w-6" />
                </div>
                <div>
                  <div className="font-display text-xl font-bold">Fresh Diamond</div>
                  <div className="text-[10px] uppercase tracking-[0.2em] text-primary-foreground/60">
                    for Export
                  </div>
                </div>
              </div>
              <p className="mt-5 max-w-md text-primary-foreground/70">
                Premium fresh fruits & vegetables exported worldwide since 2011. ISO 9001
                certified quality you can rely on.
              </p>
              <div className="mt-6 flex gap-3">
                {[Facebook, Instagram, Linkedin].map((I, i) => (
                  <a
                    key={i}
                    href="#"
                    aria-label="Social"
                    className="grid h-10 w-10 place-items-center rounded-full border border-white/15 text-primary-foreground/80 transition-all hover:border-gold hover:bg-gold hover:text-gold-foreground"
                  >
                    <I className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>

            <FooterCol title="Company" links={["About", "Careers", "News", "Sustainability"]} />
            <FooterCol
              title="Products"
              links={["Fresh Fruits", "Vegetables", "Seasonal", "Packaging"]}
            />
            <FooterCol
              title="More"
              links={["Certifications", "Contact", "Request Quote", "Privacy"]}
            />
          </div>

          <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-sm text-primary-foreground/60 sm:flex-row">
            <div>© {new Date().getFullYear()} Fresh Diamond for Export. All rights reserved.</div>
            <div className="flex items-center gap-2">
              <BadgeCheck className="h-4 w-4 text-gold" /> ISO 9001 Certified · Since 2011
            </div>
          </div>
        </div>
      </footer>

      {/* Back to top */}
      {showTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Back to top"
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
}: {
  name: string;
  desc: string;
  img: string;
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
          Premium
        </div>
      </div>
      <div className="p-6">
        <h4 className="font-display text-2xl font-semibold text-primary">{name}</h4>
        <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
        <button className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-fresh transition-all hover:gap-3">
          Learn More <ArrowRight className="h-4 w-4" />
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

function FooterCol({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <div className="font-display text-sm font-bold uppercase tracking-[0.2em] text-gold">
        {title}
      </div>
      <ul className="mt-4 space-y-2.5 text-sm">
        {links.map((l) => (
          <li key={l}>
            <a
              href="#"
              className="text-primary-foreground/70 transition-colors hover:text-gold"
            >
              {l}
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
