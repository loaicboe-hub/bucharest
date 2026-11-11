import { createFileRoute, Link } from "@tanstack/react-router";
import { SectionWave } from "@/components/SectionWave";
import { SectionLeafBg } from "@/components/SectionLeafBg";
import { BrandMark } from "@/components/BrandMark";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  RefreshCw,
  User,
  Tag,
  Facebook,
  Linkedin,
  Twitter,
  Link2,
} from "lucide-react";
import { useLang, initLang, type Lang } from "@/lib/i18n";
import { sanitizeRichHtml, sanitizeUrl } from "@/lib/sanitize";
import {
  getNewsBySlug,
  listPublishedNews,
  localizedArticle,
  formatDate,
  toEmbedUrl,
  type NewsArticle,
} from "@/lib/news";
import { toast } from "sonner";

export const Route = createFileRoute("/news/$slug")({
  head: () => ({
    meta: [
      { title: "News Article | BucharestEgyAgro" },
      {
        name: "description",
        content: "Read the latest company news and market updates from BucharestEgyAgro.",
      },
      { property: "og:title", content: "News Article | BucharestEgyAgro" },
      {
        property: "og:description",
        content: "Read the latest company news and market updates from BucharestEgyAgro.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: NewsDetail,
});

const UI: Record<
  Lang,
  {
    back: string;
    published: string;
    updated: string;
    share: string;
    related: string;
    gallery: string;
    notFound: string;
    copied: string;
    readMore: string;
  }
> = {
  en: {
    back: "Back to News",
    published: "Published",
    updated: "Last updated",
    share: "Share",
    related: "Related News",
    gallery: "Gallery",
    notFound: "Article not found",
    copied: "Link copied",
    readMore: "Read More",
  },
  fr: {
    back: "Retour aux Actualités",
    published: "Publié le",
    updated: "Mis à jour le",
    share: "Partager",
    related: "Articles Similaires",
    gallery: "Galerie Photos",
    notFound: "Article non trouvé",
    copied: "Lien copié !",
    readMore: "Lire la suite",
  },
  ar: {
    back: "العودة للأخبار",
    published: "تاريخ النشر",
    updated: "آخر تحديث",
    share: "مشاركة",
    related: "أخبار ذات صلة",
    gallery: "معرض الصور",
    notFound: "المقال غير موجود",
    copied: "تم نسخ الرابط",
    readMore: "اقرأ المزيد",
  },
  ru: {
    back: "К новостям",
    published: "Опубликовано",
    updated: "Обновлено",
    share: "Поделиться",
    related: "Похожие новости",
    gallery: "Фотогалерея",
    notFound: "Статья не найдена",
    copied: "Ссылка скопирована",
    readMore: "Читать далее",
  },
};

function NewsDetail() {
  const { slug } = Route.useParams();
  const { lang, dir } = useLang();
  const t = UI[lang];
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [related, setRelated] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const Arrow = dir === "rtl" ? ArrowLeft : ArrowRight;

  useEffect(() => {
    initLang();
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([getNewsBySlug(slug), listPublishedNews()]).then(([item, all]) => {
      if (cancelled) return;
      setArticle(item && item.published ? item : null);
      setRelated(
        all
          .filter((a) => a.slug !== slug && (!item?.category || a.category === item.category))
          .slice(0, 3),
      );
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const localized = article ? localizedArticle(article, lang) : null;
  const title = localized?.title ?? "";
  const content = localized ? sanitizeRichHtml(localized.content) : "";
  const category = localized?.category ?? "";

  useEffect(() => {
    if (title) document.title = `${title} | BucharestEgyAgro`;
  }, [title]);

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const embed = article ? toEmbedUrl(article.video_url) : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-10">
        <div className="mx-auto max-w-4xl animate-pulse space-y-6">
          <div className="h-80 rounded-2xl bg-muted" />
          <div className="h-6 w-2/3 rounded bg-muted" />
          <div className="h-40 rounded bg-muted" />
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div dir={dir} className="grid min-h-screen place-items-center bg-background p-6 text-center">
        <div>
          <h1 className="font-display text-2xl font-bold text-primary">{t.notFound}</h1>
          <Link to="/news" className="mt-4 inline-block text-sm font-semibold text-fresh underline">
            {t.back}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir={dir}>
      <header className="border-b border-border bg-cream">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-4 sm:px-6 sm:py-5 lg:px-10">
          <Link to="/" aria-label="BucharestEgyAgro home" className="min-w-0">
            <BrandMark />
          </Link>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <LanguageSwitcher compact inlineFrom="sm" />
            <Link to="/news" className="whitespace-nowrap text-xs font-semibold text-fresh hover:underline sm:text-sm">
              {t.back}
            </Link>
          </div>
        </div>
      </header>
      <div className="relative h-[60px] overflow-hidden md:h-[90px]">
        <SectionWave />
      </div>

      <div className="relative overflow-hidden">
        <SectionLeafBg opacity="opacity-[0.06]" />
        <article className="relative z-10 mx-auto max-w-4xl px-6 py-12 lg:px-10 lg:py-16">
        {category && (
          <span className="rounded-full bg-fresh/10 px-3 py-1 text-xs font-semibold text-fresh">
            {category}
          </span>
        )}
        <h1 className="mt-4 font-display text-3xl font-bold leading-tight text-primary lg:text-4xl">
          {title}
        </h1>

        <div className="mt-4 flex flex-wrap items-center gap-5 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="h-4 w-4" /> {t.published}: {formatDate(article.published_at, lang)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <RefreshCw className="h-4 w-4" /> {t.updated}: {formatDate(article.updated_at, lang)}
          </span>
          {article.author && (
            <span className="inline-flex items-center gap-1.5">
              <User className="h-4 w-4" /> {article.author}
            </span>
          )}
        </div>

        {article.featured_image && sanitizeUrl(article.featured_image, true) && (
          <img
            src={sanitizeUrl(article.featured_image, true)}
            alt={title}
            className="mt-8 aspect-[16/9] w-full rounded-2xl object-cover shadow-lg"
          />
        )}

        <div
          className="prose mt-8 max-w-none text-base leading-relaxed text-foreground [&_a]:text-fresh [&_a]:underline [&_blockquote]:border-s-4 [&_blockquote]:border-fresh [&_blockquote]:ps-4 [&_blockquote]:italic [&_h2]:mb-3 [&_h2]:mt-8 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-primary [&_img]:rounded-xl [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:ps-6 [&_p]:mb-4 [&_ul]:my-3 [&_ul]:list-disc [&_ul]:ps-6"
          dangerouslySetInnerHTML={{ __html: content }}
        />

        {embed && (
          <div className="mt-10 aspect-video w-full overflow-hidden rounded-2xl shadow-lg">
            <iframe
              src={embed}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
              allowFullScreen
              className="h-full w-full"
            />
          </div>
        )}

        {article.gallery.length > 0 && (
          <section className="mt-12">
            <h2 className="font-display text-xl font-bold text-primary">{t.gallery}</h2>
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
              {article.gallery.map((src, i) => (
                <img
                  key={src + i}
                  src={src}
                  alt={`${title} ${i + 1}`}
                  loading="lazy"
                  className="aspect-square w-full rounded-xl object-cover shadow-sm"
                />
              ))}
            </div>
          </section>
        )}

        {article.tags.length > 0 && (
          <div className="mt-10 flex flex-wrap items-center gap-2">
            <Tag className="h-4 w-4 text-muted-foreground" />
            {article.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-10 flex flex-wrap items-center gap-3 border-t border-border pt-6">
          <span className="text-sm font-semibold text-foreground">{t.share}:</span>
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Share on Facebook"
            className="grid h-9 w-9 place-items-center rounded-full border border-border text-foreground transition-colors hover:border-fresh hover:text-fresh"
          >
            <Facebook className="h-4 w-4" />
          </a>
          <a
            href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Share on X"
            className="grid h-9 w-9 place-items-center rounded-full border border-border text-foreground transition-colors hover:border-fresh hover:text-fresh"
          >
            <Twitter className="h-4 w-4" />
          </a>
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Share on LinkedIn"
            className="grid h-9 w-9 place-items-center rounded-full border border-border text-foreground transition-colors hover:border-fresh hover:text-fresh"
          >
            <Linkedin className="h-4 w-4" />
          </a>
          <button
            type="button"
            aria-label="Copy link"
            onClick={() => {
              navigator.clipboard.writeText(shareUrl);
              toast.success(t.copied);
            }}
            className="grid h-9 w-9 place-items-center rounded-full border border-border text-foreground transition-colors hover:border-fresh hover:text-fresh"
          >
            <Link2 className="h-4 w-4" />
          </button>
        </div>
      </article>
    </div>

      {related.length > 0 && (
        <section className="border-t border-border bg-cream py-14">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <h2 className="font-display text-2xl font-bold text-primary">{t.related}</h2>
            <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => {
                const { title: rTitle } = localizedArticle(item, lang);
                return (
                  <article
                    key={item.id}
                    className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
                  >
                    <Link to="/news/$slug" params={{ slug: item.slug }}>
                      <img
                        src={item.featured_image || "/placeholder.svg"}
                        alt={rTitle}
                        loading="lazy"
                        className="h-44 w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </Link>
                    <div className="p-5">
                      <p className="text-xs text-muted-foreground">{formatDate(item.published_at, lang)}</p>
                      <h3 className="mt-2 font-display text-lg font-bold leading-snug text-primary">
                        <Link to="/news/$slug" params={{ slug: item.slug }} className="hover:text-fresh">
                          {rTitle}
                        </Link>
                      </h3>
                      <Link
                        to="/news/$slug"
                        params={{ slug: item.slug }}
                        className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-fresh"
                      >
                        {t.readMore} <Arrow className="h-4 w-4" />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
