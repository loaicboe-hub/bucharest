import { createFileRoute, Link } from "@tanstack/react-router";
import { SectionWave } from "@/components/SectionWave";
import { BrandMark } from "@/components/BrandMark";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, ArrowLeft, CalendarDays, User, Newspaper } from "lucide-react";
import { useLang, initLang } from "@/lib/i18n";
import { listPublishedNews, formatDate, type NewsArticle } from "@/lib/news";
import { getSectionImageUrl } from "@/lib/section-image";

export const Route = createFileRoute("/news/")({
  head: () => {
    const title = "Our News | Nailvlora Import and Export";
    const description =
      "Company news, market updates and stories from Nailvlora Import and Export — fresh produce trade insights, partnerships and announcements.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: NewsList,
});

const PAGE_SIZE = 6;

const UI = {
  en: {
    eyebrow: "Newsroom",
    title: "Our News",
    sub: "Company announcements, market updates and stories from our team.",
    readMore: "Read More",
    loadMore: "Load More",
    empty: "No news articles have been published yet.",
    back: "Back to Home",
    all: "All",
  },
  ar: {
    eyebrow: "غرفة الأخبار",
    title: "أخبارنا",
    sub: "إعلانات الشركة وتحديثات السوق وقصص فريقنا.",
    readMore: "اقرأ المزيد",
    loadMore: "عرض المزيد",
    empty: "لا توجد أخبار منشورة حتى الآن.",
    back: "العودة إلى الصفحة الرئيسية",
    all: "الكل",
  },
} as const;

function NewsList() {
  const { lang, dir } = useLang();
  const t = UI[lang];
  const [items, setItems] = useState<NewsArticle[]>([]);
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [category, setCategory] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [bg, setBg] = useState<string | null>(null);
  const Arrow = dir === "rtl" ? ArrowLeft : ArrowRight;

  useEffect(() => {
    initLang();
    listPublishedNews().then((rows) => {
      setItems(rows);
      setLoading(false);
    });
    getSectionImageUrl("news")
      .then((u) => { if (u) setBg(u); })
      .catch(() => undefined);
  }, []);

  const categories = useMemo(
    () => Array.from(new Set(items.map((i) => i.category).filter(Boolean))),
    [items],
  );
  const filtered = useMemo(
    () => (category ? items.filter((i) => i.category === category) : items),
    [items, category],
  );

  return (
    <div className="min-h-screen bg-background" dir={dir}>
      <header className="border-b border-border bg-cream">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
          <Link to="/" aria-label="Nailvlora home">
            <BrandMark />
          </Link>
          <Link to="/" className="text-sm font-semibold text-fresh hover:underline">
            {t.back}
          </Link>
        </div>
      </header>
      <div className="relative h-[60px] overflow-hidden md:h-[90px]">
        <SectionWave />
      </div>

      <div
        className="relative"
        style={
          bg
            ? {
                backgroundImage: `url("${bg}")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center center",
                backgroundSize: "100% 100%",
                filter: "none",
                opacity: 1,
              }
            : undefined
        }
      >
        <section className="relative z-10 mx-auto max-w-7xl px-6 py-14 lg:px-10 lg:py-20">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-fresh">
          <span className="h-px w-8 bg-fresh" /> {t.eyebrow}
        </div>
        <h1 className="mt-4 font-display text-4xl font-bold text-primary lg:text-5xl">{t.title}</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">{t.sub}</p>

        {categories.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2">
            {["", ...categories].map((cat) => (
              <button
                key={cat || "all"}
                onClick={() => {
                  setCategory(cat);
                  setVisible(PAGE_SIZE);
                }}
                className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                  category === cat
                    ? "border-fresh bg-fresh text-white"
                    : "border-border bg-background text-foreground hover:border-fresh"
                }`}
              >
                {cat || t.all}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-80 animate-pulse rounded-2xl bg-muted" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="mt-16 grid place-items-center rounded-2xl border border-dashed border-border py-20 text-center">
            <Newspaper className="h-10 w-10 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">{t.empty}</p>
          </div>
        ) : (
          <>
            <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.slice(0, visible).map((item) => {
                const title = (lang === "ar" && item.title_ar) || item.title;
                const excerpt = (lang === "ar" && item.excerpt_ar) || item.excerpt;
                return (
                  <article
                    key={item.id}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
                  >
                    <Link to="/news/$slug" params={{ slug: item.slug }} className="block overflow-hidden">
                      <img
                        src={item.featured_image || "/placeholder.svg"}
                        alt={title}
                        loading="lazy"
                        className="h-52 w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </Link>
                    <div className="flex flex-1 flex-col p-6">
                      {item.category && (
                        <span className="mb-3 w-fit rounded-full bg-fresh/10 px-3 py-1 text-xs font-semibold text-fresh">
                          {item.category}
                        </span>
                      )}
                      <h2 className="font-display text-xl font-bold leading-snug text-primary">
                        <Link to="/news/$slug" params={{ slug: item.slug }} className="hover:text-fresh">
                          {title}
                        </Link>
                      </h2>
                      <p className="mt-2 line-clamp-3 flex-1 text-sm text-muted-foreground">{excerpt}</p>
                      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5">
                          <CalendarDays className="h-3.5 w-3.5" />
                          {formatDate(item.published_at, lang)}
                        </span>
                        {item.author && (
                          <span className="inline-flex items-center gap-1.5">
                            <User className="h-3.5 w-3.5" />
                            {item.author}
                          </span>
                        )}
                      </div>
                      <Link
                        to="/news/$slug"
                        params={{ slug: item.slug }}
                        className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-fresh"
                      >
                        {t.readMore} <Arrow className="h-4 w-4" />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>

            {visible < filtered.length && (
              <div className="mt-12 text-center">
                <button
                  onClick={() => setVisible((v) => v + PAGE_SIZE)}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:scale-105"
                >
                  {t.loadMore}
                </button>
              </div>
            )}
          </>
        )}
      </section>
      </div>
    </div>
  );
}
