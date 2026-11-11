// Hostinger-only product catalog and media storage.
import { CATALOG, type ProductSpecs } from "@/lib/products-catalog";
import type { Lang } from "./i18n";
import { apiProducts, apiCategories, uploadToHostinger } from "./hostinger-api";
import orangesImg from "@/assets/oranges.jpg";
import orangesPackhouseImg from "@/assets/gallery/oranges-2.jpg";
import frozenArtichokeImg from "@/assets/frozen-artichoke.jpg";
import frozenMixedVegetablesImg from "@/assets/frozen-mixed-vegetables.jpg";
import farmFallbackImg from "@/assets/farm.jpg";
import packagingFallbackImg from "@/assets/packaging.jpg";
import coldStorageFallbackImg from "@/assets/cold-storage.jpg";

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

const FALLBACK = new Map<string, { main: string; gallery: string[] }>([
  ...CATALOG.map((p) => [p.slug, { main: p.main, gallery: p.gallery }] as const),
  [
    "frozen-artichoke",
    {
      main: frozenArtichokeImg,
      gallery: [frozenArtichokeImg, coldStorageFallbackImg, packagingFallbackImg, farmFallbackImg],
    },
  ],
  [
    "artichoke",
    {
      main: frozenArtichokeImg,
      gallery: [frozenArtichokeImg, coldStorageFallbackImg, packagingFallbackImg, farmFallbackImg],
    },
  ],
  [
    "frozen-mixed-vegetables",
    {
      main: frozenMixedVegetablesImg,
      gallery: [frozenMixedVegetablesImg, coldStorageFallbackImg, packagingFallbackImg, farmFallbackImg],
    },
  ],
  [
    "iqf-mixed-vegetables",
    {
      main: frozenMixedVegetablesImg,
      gallery: [frozenMixedVegetablesImg, coldStorageFallbackImg, packagingFallbackImg, farmFallbackImg],
    },
  ],
  [
    "mixed-vegetables",
    {
      main: frozenMixedVegetablesImg,
      gallery: [frozenMixedVegetablesImg, coldStorageFallbackImg, packagingFallbackImg, farmFallbackImg],
    },
  ],
  [
    "orange",
    {
      main: orangesPackhouseImg,
      gallery: [orangesPackhouseImg, orangesImg, packagingFallbackImg, coldStorageFallbackImg, farmFallbackImg],
    },
  ],
]);

const KNOWN_BROKEN_UPLOAD_URLS: Record<string, string> = {
  "/uploads/products/1794325681_d884a062.jpg": frozenArtichokeImg,
  "/uploads/products/1794328490_21d7e05a.jpg": orangesPackhouseImg,
  "/uploads/products/1794329775_e8fb5cb7.webp": frozenMixedVegetablesImg,
};

function normalizeImageUrl(raw: string | undefined, slug?: string): string {
  const trimmed = (raw ?? "").trim();
  if (!trimmed || trimmed === "/placeholder.svg") {
    return (slug ? FALLBACK.get(slug)?.main : undefined) || farmFallbackImg;
  }
  const cleanPath = trimmed
    .replace(/^https?:\/\/(?:www\.)?bucharestegyagro\.com/i, "")
    .split(/[?#]/)[0];
  const withSlash = cleanPath.startsWith("uploads/") ? `/${cleanPath}` : cleanPath;
  if (KNOWN_BROKEN_UPLOAD_URLS[withSlash]) {
    return KNOWN_BROKEN_UPLOAD_URLS[withSlash];
  }
  return trimmed;
}

export function productFallbackImage(p: Pick<ProductRow, "slug">) {
  return FALLBACK.get(p.slug)?.main || farmFallbackImg;
}

export function productImage(p: Pick<ProductRow, "slug" | "main_image">) {
  return normalizeImageUrl(p.main_image, p.slug);
}

export function productGallery(p: Pick<ProductRow, "slug" | "main_image" | "gallery">) {
  const normalized = (p.gallery || [])
    .map((src) => normalizeImageUrl(src, p.slug))
    .filter(Boolean);
  if (normalized.length) return Array.from(new Set(normalized));
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
  "frozen-vegetables": {
    en: "Frozen Vegetables",
    fr: "Légumes Surgelés",
    ar: "خضروات مجمدة",
    ru: "Замороженные овощи",
  },
  "frozen vegetables": {
    en: "Frozen Vegetables",
    fr: "Légumes Surgelés",
    ar: "خضروات مجمدة",
    ru: "Замороженные овощи",
  },
};

const LEGACY_SEED_TITLES = new Set([
  "Fresh Valencia & Navel Oranges",
  "Superior & Flame Seedless Grapes",
  "Fresh Premium Egyptian Mangoes",
  "Wonderful Pomegranates",
  "Fresh & IQF Strawberries",
  "Adalia & Eureka Fresh Lemons",
  "Fresh Table & Processing Potatoes",
  "Golden & Red Egyptian Onions",
  "Fresh & Dry Egyptian Garlic",
  "Beauregard Sweet Potatoes",
  "Fine & Extra-Fine Green Beans",
  "Colored Bell & Chili Peppers",
  "برتقال فالنسيا ونافيلا طازج",
  "عنب سوبريور وفليم بدون بذور",
  "مانجو مصرية طازجة ممتازة",
  "رمان وندرفل مصري فاخر",
  "فراولة طازجة ومجمدة IQF",
  "ليمون أضاليا ويوريكا طازج",
  "بطاطس طازجة للمائدة والتصنيع",
  "بصل ذهبي وأحمر مصري",
  "ثوم مصري طازج وجاف",
  "بطاطا حلوة بورجارد فاخرة",
  "فاصوليا خضراء رفيعة وفاخرة",
  "فلفل ألوان وفلفل حار",
]);

const LEGACY_SEED_INTROS = new Set([
  "World-renowned Egyptian citrus, perfectly balanced between sweetness and acidity.",
  "Sweet and juicy Egyptian mandarins, easy to peel with a vibrant citrus flavor.",
  "برتقال مصري فائق الجودة يجمع بين العصير الغزير والنكهة المنعشة واللون البرتقالي الزاهي.",
  "Crisp, sweet seedless grapes harvested early for prime European and Gulf arrivals.",
  "عنب مصري بدون بذور يتميز بحبات مقرمشة وسكر متوازن وجاذبية تجارية عالية.",
  "Intensely fragrant and smooth, featuring famous varieties like Keitt, Kent and Naomi.",
  "أفخر أصناف المانجو المصرية بطعمها العطري الغني وقوامها المخملي الخالي من الألياف.",
  "Deep crimson arils packed with sweet-tart juice and high antioxidant power.",
  "رمان مصري من صنف وندرفل بألوانه الحمراء الداكنة وحباته العصيرية الغنية بمضادات الأكسدة.",
  "Conical, intensely aromatic berries shipped fresh by air or frozen IQF for industry.",
  "فراولة مصرية حمراء ناصعة تشحن طازجة بالجو أو مجمدة بأحدث تقنيات الـ IQF.",
  "Juicy, bright yellow lemons packed with natural citric acidity and protective oils.",
  "ليمون مصري عالي النقاوة غني بالعصير والزيوت العطرية الطبيعية بفترة صلاحية ممتدة.",
  "Grown in pest-free certified soils, offering superior skin finish and low sugar content.",
  "بطاطس مصرية معتمدة من المناطق الخالية من العفن البني، ممتازة للطبخ والقلي الصناعي.",
  "Firm, dry-skinned onions celebrated worldwide for pungent flavor and exceptional shelf life.",
  "بصل مصري أصفر وأحمر عالي الجفاف والصلابة، يتميز بقدرته الفائقة على التخزين والشحن الطويل.",
  "White and purple garlic heads featuring tight cloves, intense aroma and high allicin content.",
  "ثوم مصري أبيض وبنفسجي برائحة عطرية قوية ونكهة حادة وفترة صلاحية ممتازة.",
  "Vibrant orange-fleshed sweet potatoes, carefully cured for high brix sweetness and silky texture.",
  "بطاطا حلوة مصرية صنف بورجارد بلونها البرتقالي الجذاب ونعومة قوامها بعد الطهي.",
  "Slender, stringless green pods picked daily and hydro-cooled to lock in field freshness.",
  "فاصوليا خضراء طازجة مقرمشة بدون خيوط، يتم جمعها وفرزها يومياً وتبريدها بالماء فور الحصاد.",
  "Thick-walled, crunchy bell peppers in red, yellow, orange and green, plus spicy chilies.",
  "فلفل رومي ألوان وفلفل حار سميك الجدران ومقرمش، مزروع بأحدث تقنيات الصوب الزراعية.",
]);

const LEGACY_SEED_DESCRIPTIONS = new Set([
  "Egyptian oranges represent the pinnacle of Mediterranean citrus farming. Sourced from fertile Nile Delta and desert reclaimed groves, our Fresh Egyptian Mandarins are carefully harvested at peak brix levels to ensure maximum juice content and long transit life.",
  "Egyptian oranges represent the pinnacle of Mediterranean citrus farming. Sourced from fertile Nile Delta and desert reclaimed groves, our Valencia and Navel oranges are carefully harvested at peak brix levels to ensure maximum juice content and long transit life.",
]);

function normalizeTitleText(clean: string): string {
  if (/^\s*iqf\s+mixed\s+vegetables\s*$/i.test(clean)) {
    return "Frozen Mixed Vegetables";
  }
  return clean.replace(/\bIQF\s+Mixed\s+Vegetables\b/gi, "Frozen Mixed Vegetables");
}

function sanitizeProductText(raw: string | undefined): string {
  const trimmed = (raw ?? "").trim();
  if (!trimmed) return "";
  let out = trimmed
    .replace(
      /^(?:a\s+)?premium(?:[\s-]+quality)?\s+egyptian\s+artichokes,\s*individually\s+quick-frozen\s*\(iqf\)\s*to\s+preserve\s+peak\s+freshness,\s*natural\s+flavor,\s*and\s+nutritional\s+value\.?/i,
      "Egyptian artichokes, individually quick-frozen (IQF) to preserve natural texture and flavor.",
    )
    .replace(
      /^(?:a\s+)?premium,\s*colorful\s+blend\s+of\s+farm-fresh\s+vegetables,\s*individually\s+quick-frozen\s*\(iqf\)\s*to\s+lock\s+in\s+natural\s+sweetness,\s*vibrant\s+colors,\s*and\s+essential\s+nutrients\.?/i,
      "Colorful blend of farm-fresh vegetables, individually quick-frozen (IQF) to preserve natural sweetness, color, and crisp texture.",
    )
    .replace(
      /^(?:a\s+)?premium(?:[\s-]+quality)?\s+egyptian\s+oranges,\s*hand-picked\s+for\s+their\s+exceptional\s+juiciness,\s*vibrant\s+color,\s*and\s+refreshing\s+citrus\s+flavor\.?/i,
      "Egyptian oranges, hand-picked for high juice yield, vibrant color, and balanced citrus flavor.",
    )
    .replace(/\bOur\s+IQF\s+mixed\s+vegetables\b/gi, "Our frozen mixed vegetables")
    .replace(/\bIQF\s+Mixed\s+Vegetables\b/gi, "Frozen Mixed Vegetables")
    .replace(/^\s*(?:a\s+)?premium(?:[\s-]+quality)?(?:,\s*|\s+)/i, "")
    .replace(/\bpremium(?:[\s-]+quality)?\s+/gi, "")
    .replace(/\bpeak\s+freshness\b/gi, "harvest quality")
    .replace(/\bnutritional\s+value\b/gi, "natural quality")
    .replace(/\bessential\s+nutrients\b/gi, "natural texture")
    .replace(/\bto\s+lock\s+in\b/gi, "to preserve")
    .replace(/\block\s+in\b/gi, "preserve")
    .replace(/\s{2,}/g, " ")
    .trim();
  out = out.replace(/^([a-z])/, (_, ch: string) => ch.toUpperCase());
  return out;
}

function cleanSpecs(specs: Partial<ProductSpecs> | undefined): Partial<ProductSpecs> {
  if (!specs) return {};
  const result: Partial<ProductSpecs> = {};
  (Object.keys(specs) as (keyof ProductSpecs)[]).forEach((k) => {
    const val = specs[k];
    if (typeof val === "string" && val.trim() !== "") {
      let cleaned = val.trim();
      if (k === "variety") {
        cleaned = cleaned.replace(/(?:\s*,\s*)+/g, ", ").replace(/^,\s*|,\s*$/g, "").replace(/\s{2,}/g, " ");
      }
      result[k] = cleaned;
    }
  });
  return result;
}

type CustomLocaleData = {
  en?: { specs?: Partial<ProductSpecs> };
  fr?: { name: string; intro: string; description: string; specs: Partial<ProductSpecs> };
  ar?: { name: string; intro: string; description: string; specs: Partial<ProductSpecs> };
  ru?: { name: string; intro: string; description: string; specs: Partial<ProductSpecs> };
};

const CUSTOM_LOCALE_OVERRIDES: Record<string, CustomLocaleData> = {
  "frozen-artichoke": {
    en: {
      specs: {
        scientificName: "Cynara cardunculus",
        origin: "Egypt",
        category: "Frozen Vegetables",
        variety: "IQF Artichoke Bottoms & Halved Hearts",
        season: "Year-round availability",
        sizes: "Bottoms: 3–5 / 5–7 / 7–9 cm · Halved hearts",
        packaging: "10 kg bulk carton or 400 g / 1 kg polybags",
        shelfLife: "24 months at -18 °C",
        storageTemp: "-18 °C or below",
        transportation: "Reefer container at -18 °C",
        moq: "1 x 40' HC container",
        certifications: "Phytosanitary Certificate, Certificate of Origin, Export Health Certificate",
      },
    },
    fr: {
      name: "Artichauts Surgelés",
      intro: "Artichauts égyptiens surgelés individuellement (IQF) pour préserver texture tendre et saveur naturelle.",
      description:
        "Traités selon un procédé de surgélation rapide individuelle (IQF), nos fonds et cœurs d'artichauts restent bien séparés tout en conservant une texture tendre et un goût authentique sans agglomération.",
      specs: {
        scientificName: "Cynara cardunculus",
        origin: "Égypte",
        category: "Légumes Surgelés",
        variety: "Fonds et cœurs d'artichauts (IQF)",
        season: "Disponible toute l'année",
        sizes: "Fonds : 3–5 / 5–7 / 7–9 cm · Cœurs coupés",
        packaging: "Cartons vrac 10 kg ou sachets 400 g / 1 kg",
        shelfLife: "24 mois à -18 °C",
        storageTemp: "-18 °C ou inférieur",
        transportation: "Conteneur reefer à -18 °C",
        moq: "1 conteneur 40' HC",
        certifications: "Certificat Phytosanitaire, Certificat d'Origine, Certificat Sanitaire",
      },
    },
    ar: {
      name: "خرشوف مجمد",
      intro: "خرشوف مصري مجمد بتقنية التجميد السريع المنفرد (IQF) للحفاظ على القوام الطري والنكهة الطبيعية.",
      description:
        "يتم تجهيز وتجميد قلوب وقيعان الخرشوف بتقنية التجميد السريع المنفرد (IQF) بحيث تبقى كل قطعة منفصلة وتحافظ على قوامها الطري ومذاقها الطبيعي دون تكتل.",
      specs: {
        scientificName: "Cynara cardunculus",
        origin: "مصر",
        category: "خضروات مجمدة",
        variety: "قيعان وقلوب خرشوف (IQF)",
        season: "متوفر طوال العام",
        sizes: "قيعان: 3–5 / 5–7 / 7–9 سم · قلوب مقطعة أنصاف",
        packaging: "كرتونة 10 كجم جملة أو أكياس 400 جم / 1 كجم",
        shelfLife: "24 شهراً عند -18 درجة مئوية",
        storageTemp: "-18 درجة مئوية أو أقل",
        transportation: "حاوية مبردة عند -18°م",
        moq: "حاوية واحدة 40 قدم HC",
        certifications: "شهادة الصحة النباتية، شهادة المنشأ، الشهادة الصحية للتصدير",
      },
    },
    ru: {
      name: "Замороженные артишоки",
      intro: "Египетские артишоки быстрой индивидуальной заморозки (IQF) с сохранением нежной текстуры и натурального вкуса.",
      description:
        "Артишоки проходят быструю индивидуальную заморозку (IQF), благодаря чему кусочки не слипаются и сохраняют нежную структуру и естественный вкус без добавок.",
      specs: {
        scientificName: "Cynara cardunculus",
        origin: "Египет",
        category: "Замороженные овощи",
        variety: "Донца и половинки сердец артишока (IQF)",
        season: "Круглогодичные поставки",
        sizes: "Донца: 3–5 / 5–7 / 7–9 см · Половинки сердец",
        packaging: "Коробка 10 кг навалом или пакеты 400 г / 1 кг",
        shelfLife: "24 месяца при -18 °C",
        storageTemp: "-18 °C или ниже",
        transportation: "Рефрижераторный контейнер при -18 °C",
        moq: "1 x 40' HC контейнер",
        certifications: "Фитосанитарный сертификат, сертификат происхождения, экспортный сертификат качества",
      },
    },
  },
  "frozen-mixed-vegetables": {
    en: {
      specs: {
        scientificName: "Mixed Vegetable Blend",
        origin: "Egypt",
        category: "Frozen Vegetables",
        variety: "Diced Carrots, Green Peas, Sweet Corn, Cut Green Beans",
        season: "All-year-round",
        sizes: "Diced / Standard Cut",
        packaging: "10 kg bulk carton or 400 g / 1 kg retail bags",
        shelfLife: "24 months at -18 °C",
        storageTemp: "-18 °C or below",
        transportation: "Reefer container at -18 °C",
        moq: "1 x 40' HC container",
        certifications: "Phytosanitary Certificate, Certificate of Origin, Export Health Certificate",
      },
    },
    fr: {
      name: "Légumes Mélangés Surgelés",
      intro: "Mélange coloré de légumes surgelés individuellement (IQF) conservant douceur naturelle, couleur et croquant.",
      description:
        "Notre mélange de légumes surgelés comprend des dés de carottes, petits pois verts, maïs doux et haricots verts coupés, surgelés rapidement sans additifs ni conservateurs.",
      specs: {
        scientificName: "Mélange de légumes",
        origin: "Égypte",
        category: "Légumes Surgelés",
        variety: "Carottes en dés, petits pois, maïs doux, haricots verts",
        season: "Toute l'année",
        sizes: "Dés / Coupe standard",
        packaging: "Cartons vrac 10 kg ou sachets 400 g / 1 kg",
        shelfLife: "24 mois à -18 °C",
        storageTemp: "-18 °C ou inférieur",
        transportation: "Conteneur reefer à -18 °C",
        moq: "1 conteneur 40' HC",
        certifications: "Certificat Phytosanitaire, Certificat d'Origine, Certificat Sanitaire",
      },
    },
    ar: {
      name: "خضروات مشكلة مجمدة",
      intro: "مزيج متناسق من الخضروات المجمدة بتقنية IQF للحفاظ على اللون الزاهي والقوام المتماسك والحلاوة الطبيعية.",
      description:
        "يحتوي مزيج الخضروات المجمدة على مكعبات الجزر، البازلاء الخضراء، الذرة الحلوة، والفاصوليا الخضراء المقطعة، ويتم تجهيزه وتجميده سريعاً بدون أي مواد حافظة أو إضافات صناعية.",
      specs: {
        scientificName: "مزيج خضروات مشكلة",
        origin: "مصر",
        category: "خضروات مجمدة",
        variety: "جزر مقطع، بازلاء خضراء، ذرة حلوة، فاصوليا خضراء",
        season: "متوفر طوال العام",
        sizes: "مكعبات / تقطيع قياسي",
        packaging: "كرتونة 10 كجم جملة أو أكياس تجزئة 400 جم / 1 كجم",
        shelfLife: "24 شهراً عند -18 درجة مئوية",
        storageTemp: "-18 درجة مئوية أو أقل",
        transportation: "حاوية مبردة عند -18°م",
        moq: "حاوية واحدة 40 قدم HC",
        certifications: "شهادة الصحة النباتية، شهادة المنشأ، الشهادة الصحية للتصدير",
      },
    },
    ru: {
      name: "Замороженная овощная смесь",
      intro: "Яркая смесь овощей быстрой заморозки (IQF) с сохранением природной сладости, цвета и упругой текстуры.",
      description:
        "Наша замороженная овощная смесь включает кубики моркови, зелёный горошек, сладкую кукурузу и резаную стручковую фасоль. Обработана методом быстрой заморозки без искусственных добавок и консервантов.",
      specs: {
        scientificName: "Овощная смесь",
        origin: "Египет",
        category: "Замороженные овощи",
        variety: "Морковь, зелёный горошек, сладкая кукуруза, стручковая фасоль",
        season: "Круглогодично",
        sizes: "Кубики / стандартная нарезка",
        packaging: "Коробка 10 кг навалом или пакеты 400 г / 1 кг",
        shelfLife: "24 месяца при -18 °C",
        storageTemp: "-18 °C или ниже",
        transportation: "Рефрижераторный контейнер при -18 °C",
        moq: "1 x 40' HC контейнер",
        certifications: "Фитосанитарный сертификат, сертификат происхождения, экспортный сертификат качества",
      },
    },
  },
  orange: {
    fr: {
      name: "Oranges Valencia & Navel Fraîches",
      intro: "Oranges égyptiennes cueillies à maturité pour leur jus abondant, leur couleur vive et leur équilibre d'agrumes.",
      description:
        "Récoltées dans les vergers égyptiens (variétés Valencia et Navel), nos oranges offrent une peau ferme assurant une bonne tenue au transport et un équilibre entre sucre et acidité.",
      specs: {
        scientificName: "Citrus sinensis",
        origin: "Égypte",
        category: "Fruits Frais",
        variety: "Valencia, Navel, Baladi",
        season: "Décembre – Juin (Navel) / Février – Juin (Valencia)",
        sizes: "48 / 56 / 64 / 72 / 80 / 88 / 100 / 113 calibres",
        color: "Orange vif naturel",
        taste: "Très juteux, doux et légèrement acidulé, chair ferme",
        packaging: "Cartons télescopiques, cartons ouverts ou filets (15 kg / 8 kg)",
        shelfLife: "6 à 8 semaines",
        storageTemp: "3 – 5 °C, 85–90% HR",
        transportation: "Conteneur réfrigéré (Reefer)",
      },
    },
    ar: {
      name: "برتقال فالنسيا وأبو سرة طازج",
      intro: "برتقال مصري مقطوف بعناية يتميز بغزارة العصير واللون الزاهي والنكهة الحمضية المتوازنة.",
      description:
        "برتقال مصري من أصناف فالنسيا وأبو سرة بقشرة متماسكة تدوم للشحن البحري الطويل ونسبة سكر وحموضة متوازنة.",
      specs: {
        scientificName: "Citrus sinensis",
        origin: "مصر",
        category: "فواكه طازجة",
        variety: "فالنسيا، أبو سرة، بلدي",
        season: "ديسمبر – يونيو (أبو سرة) / فبراير – يونيو (فالنسيا)",
        sizes: "48 / 56 / 64 / 72 / 80 / 88 / 100 / 113 ثمرة",
        color: "برتقالي ساطع",
        taste: "غني بالعصير، حلو ومنعش، قوام متماسك",
        packaging: "كراتين تلسكوبية، كراتين مفتوحة أو أجولة شبكية (15 / 8 كجم)",
        shelfLife: "6 إلى 8 أسابيع",
        storageTemp: "3 – 5 درجات مئوية، رطوبة 85–90%",
        transportation: "حاوية مبردة (Reefer)",
      },
    },
    ru: {
      name: "Свежие апельсины Валенсия и Навел",
      intro: "Египетские апельсины отборного сбора с высоким содержанием сока, ярким цветом и сбалансированным вкусом.",
      description:
        "Апельсины сортов Валенсия и Навел из египетских садов отличаются плотной кожурой для длительной морской перевозки и гармоничным кисло-сладким вкусом.",
      specs: {
        scientificName: "Citrus sinensis",
        origin: "Египет",
        category: "Свежие фрукты",
        variety: "Валенсия, Навел, Балади",
        season: "Декабрь – июнь (Навел) / Февраль – июнь (Валенсия)",
        sizes: "Калибр 48 / 56 / 64 / 72 / 80 / 88 / 100 / 113",
        color: "Ярко-оранжевый",
        taste: "Очень сочные, сладкие с освежающей кислинкой",
        packaging: "Телескопические коробки, открытые лотки или сетки (15 кг / 8 кг)",
        shelfLife: "6 – 8 недель",
        storageTemp: "3 – 5 °C, влажность 85–90%",
        transportation: "Рефрижераторный контейнер (Reefer)",
      },
    },
  },
};

function fixCustomEnglishSpecs(slug: string, specs: Partial<ProductSpecs>): Partial<ProductSpecs> {
  if (slug === "orange") {
    const fixed = { ...specs };
    if (!fixed.packaging && fixed.storageTemp && /carton|mesh bag/i.test(fixed.storageTemp)) {
      fixed.packaging = fixed.storageTemp;
      fixed.storageTemp = "3 – 5 °C, 85–90% RH";
    }
    if (fixed.sizes && /^(?:bright\s+)?orange$/i.test(fixed.sizes.trim())) {
      fixed.sizes = "48 / 56 / 64 / 72 / 80 / 88 / 100 / 113 count";
    }
    return fixed;
  }
  return specs;
}

function pickTitle(raw: string | undefined, fallback: string | undefined): string {
  const clean = (raw ?? "").trim();
  if (!clean) return fallback ?? "";
  if (fallback && LEGACY_SEED_TITLES.has(clean)) return fallback;
  return normalizeTitleText(clean);
}

function pickIntro(raw: string | undefined, fallback: string | undefined): string {
  const clean = (raw ?? "").trim();
  if (!clean) return fallback ?? "";
  if (fallback && LEGACY_SEED_INTROS.has(clean)) return fallback;
  return sanitizeProductText(clean);
}

function pickDescription(raw: string | undefined, fallback: string | undefined): string {
  const clean = (raw ?? "").trim();
  if (!clean) return fallback ?? "";
  if (fallback && LEGACY_SEED_DESCRIPTIONS.has(clean)) return fallback;
  return sanitizeProductText(clean);
}

export function localized(p: ProductRow, lang: Lang) {
  const cat = CATALOG_BY_SLUG.get(p.slug);
  const custom = CUSTOM_LOCALE_OVERRIDES[p.slug];
  const nameIsAr = HAS_ARABIC.test(p.name_ar || "");
  const introIsAr = HAS_ARABIC.test(p.intro_ar || "");
  const descIsAr = HAS_ARABIC.test(p.description_ar || "");
  const nameIsRu = HAS_CYRILLIC.test(p.name_ar || "");
  const introIsRu = HAS_CYRILLIC.test(p.intro_ar || "");
  const descIsRu = HAS_CYRILLIC.test(p.description_ar || "");

  if (lang === "en") {
    const cleanedSpecs = fixCustomEnglishSpecs(p.slug, cleanSpecs(p.specs_en));
    if (cat?.en.specs.certifications && cleanedSpecs.certifications && /GLOBALG\.A\.P\.|ISO 9001|ISO 22000|BRC|SMETA|Sedex|FDA|PFA Certified/i.test(cleanedSpecs.certifications)) {
      cleanedSpecs.certifications = cat.en.specs.certifications;
    }
    return {
      name: pickTitle(p.name_en, cat?.en.name),
      intro: pickIntro(p.intro_en, cat?.en.intro),
      description: pickDescription(p.description_en, cat?.en.description),
      specs: {
        ...EMPTY_SPECS,
        ...(custom?.en?.specs ?? {}),
        ...(cat?.en.specs ?? {}),
        ...cleanedSpecs,
      },
    };
  }

  const enNameClean = pickTitle(p.name_en, cat?.en.name);
  const enIntroClean = pickIntro(p.intro_en, cat?.en.intro);
  const enDescClean = pickDescription(p.description_en, cat?.en.description);

  if (lang === "ar") {
    const specsArStr = JSON.stringify(p.specs_ar ?? {});
    const specsIsAr = HAS_ARABIC.test(specsArStr);
    if (nameIsAr || introIsAr || descIsAr) {
      const cleanedArSpecs = specsIsAr ? cleanSpecs(p.specs_ar) : {};
      if (cat?.ar.specs.certifications && cleanedArSpecs.certifications && /GLOBALG\.A\.P\.|ISO|BRC|معتمدة/i.test(cleanedArSpecs.certifications)) {
        cleanedArSpecs.certifications = cat.ar.specs.certifications;
      }
      return {
        name: pickTitle(nameIsAr ? p.name_ar : "", cat?.ar.name || custom?.ar?.name) || p.name_ar || enNameClean,
        intro: pickIntro(introIsAr ? p.intro_ar : "", cat?.ar.intro || custom?.ar?.intro) || p.intro_ar || enIntroClean,
        description:
          (descIsAr ? sanitizeProductText(p.description_ar) : "") ||
          cat?.ar.description ||
          custom?.ar?.description ||
          p.description_ar ||
          enDescClean,
        specs: {
          ...EMPTY_SPECS,
          ...(custom?.ar?.specs ?? {}),
          ...(cat?.ar.specs ?? {}),
          ...cleanedArSpecs,
        },
      };
    }
    if (cat?.ar) return cat.ar;
    if (custom?.ar) {
      return {
        name: custom.ar.name,
        intro: custom.ar.intro,
        description: custom.ar.description,
        specs: { ...EMPTY_SPECS, ...custom.ar.specs },
      };
    }
    return {
      name: p.name_ar || enNameClean,
      intro: p.intro_ar || enIntroClean,
      description: p.description_ar || enDescClean,
      specs: { ...EMPTY_SPECS, ...cleanSpecs(p.specs_ar), ...cleanSpecs(p.specs_en) },
    };
  }

  if (lang === "fr") {
    const frName = !nameIsAr && !nameIsRu && p.name_ar?.trim() ? normalizeTitleText(p.name_ar.trim()) : "";
    const frIntro = !introIsAr && !introIsRu && p.intro_ar?.trim() ? sanitizeProductText(p.intro_ar.trim()) : "";
    const frDesc = !descIsAr && !descIsRu && p.description_ar?.trim() ? sanitizeProductText(p.description_ar.trim()) : "";
    const specsArStr = JSON.stringify(p.specs_ar ?? {});
    const specsSafeFr = !HAS_ARABIC.test(specsArStr) && !HAS_CYRILLIC.test(specsArStr);

    if (frName || frIntro || frDesc) {
      return {
        name: frName || cat?.fr.name || custom?.fr?.name || enNameClean,
        intro: frIntro || cat?.fr.intro || custom?.fr?.intro || enIntroClean,
        description: frDesc || cat?.fr.description || custom?.fr?.description || enDescClean,
        specs: {
          ...EMPTY_SPECS,
          ...(custom?.fr?.specs ?? {}),
          ...(cat?.fr.specs ?? {}),
          ...(specsSafeFr ? cleanSpecs(p.specs_ar) : cat ? {} : cleanSpecs(p.specs_en)),
        },
      };
    }
    if (cat?.fr) return cat.fr;
    if (custom?.fr) {
      return {
        name: custom.fr.name,
        intro: custom.fr.intro,
        description: custom.fr.description,
        specs: { ...EMPTY_SPECS, ...custom.fr.specs },
      };
    }
    return {
      name: enNameClean,
      intro: enIntroClean,
      description: enDescClean,
      specs: { ...EMPTY_SPECS, ...cleanSpecs(p.specs_en) },
    };
  }

  // Russian ("ru")
  if (nameIsRu || introIsRu || descIsRu) {
    const specsArStr = JSON.stringify(p.specs_ar ?? {});
    const specsIsRu = HAS_CYRILLIC.test(specsArStr);
    return {
      name: (nameIsRu ? p.name_ar : "") || cat?.ru.name || custom?.ru?.name || enNameClean,
      intro: (introIsRu ? p.intro_ar : "") || cat?.ru.intro || custom?.ru?.intro || enIntroClean,
      description: (descIsRu ? p.description_ar : "") || cat?.ru.description || custom?.ru?.description || enDescClean,
      specs: {
        ...EMPTY_SPECS,
        ...(custom?.ru?.specs ?? {}),
        ...(cat?.ru.specs ?? {}),
        ...(specsIsRu ? cleanSpecs(p.specs_ar) : cat ? {} : cleanSpecs(p.specs_en)),
      },
    };
  }
  if (cat?.ru) return cat.ru;
  if (custom?.ru) {
    return {
      name: custom.ru.name,
      intro: custom.ru.intro,
      description: custom.ru.description,
      specs: { ...EMPTY_SPECS, ...custom.ru.specs },
    };
  }
  const baseEn = { ...EMPTY_SPECS, ...cleanSpecs(p.specs_en) };
  return {
    name: enNameClean,
    intro: enIntroClean,
    description: enDescClean,
    specs: {
      ...baseEn,
      origin: baseEn.origin === "Egypt" ? "Египет" : baseEn.origin,
      category:
        baseEn.category === "Fresh Fruits"
          ? "Свежие фрукты"
          : baseEn.category === "Fresh Vegetables"
            ? "Свежие овощи"
            : baseEn.category === "Frozen Vegetables"
              ? "Замороженные овощи"
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
