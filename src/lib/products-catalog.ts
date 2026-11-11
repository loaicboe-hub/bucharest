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

import orangesB from "@/assets/gallery/oranges-2.jpg";
import grapesB from "@/assets/gallery/grapes-2.jpg";
import mangoesB from "@/assets/gallery/mangoes-2.jpg";
import pomegranatesB from "@/assets/gallery/pomegranates-2.jpg";
import strawberriesB from "@/assets/gallery/strawberries-2.jpg";
import lemonsB from "@/assets/gallery/lemons-2.jpg";
import potatoesB from "@/assets/gallery/potatoes-2.jpg";
import onionsB from "@/assets/gallery/onions-2.jpg";
import garlicB from "@/assets/gallery/garlic-2.jpg";
import sweetPotatoesB from "@/assets/gallery/sweet-potatoes-2.jpg";
import greenBeansB from "@/assets/gallery/green-beans-2.jpg";
import peppersB from "@/assets/gallery/peppers-2.jpg";

import farm from "@/assets/farm.jpg";
import packaging from "@/assets/packaging.jpg";
import coldStorage from "@/assets/cold-storage.jpg";
import shipping from "@/assets/shipping.jpg";
import loading from "@/assets/loading.jpg";
import hero from "@/assets/hero.jpg";

import type { Lang } from "./i18n";

/** Shared operational imagery appended to every product gallery. */
const SHARED = [farm, packaging, coldStorage, shipping, loading, hero];

export type ProductSpecs = {
  scientificName: string;
  origin: string;
  category: string;
  variety: string;
  season: string;
  sizes: string;
  color: string;
  taste: string;
  packaging: string;
  shelfLife: string;
  storageTemp: string;
  transportation: string;
  moq: string;
  loading: string;
  certifications: string;
};

export type LocalizedCatalogEntry = {
  name: string;
  intro: string;
  description: string;
  specs: ProductSpecs;
};

export type CatalogProduct = {
  slug: string;
  group: "fruits" | "vegetables";
  main: string;
  gallery: string[];
  en: LocalizedCatalogEntry;
  fr: LocalizedCatalogEntry;
  ar: LocalizedCatalogEntry;
  ru: LocalizedCatalogEntry;
};

type BaseLocaleInput = {
  name: string;
  intro: string;
  description: string;
  specs: Omit<ProductSpecs, "origin" | "category" | "certifications">;
};

const CERT_EN = "Phytosanitary Certificate, Certificate of Origin, Export Health Certificate";
const CERT_FR = "Certificat Phytosanitaire, Certificat d'Origine, Certificat Sanitaire";
const CERT_AR = "شهادة الصحة النباتية، شهادة المنشأ، الشهادة الصحية للتصدير";
const CERT_RU = "Фитосанитарный сертификат, сертификат происхождения, ветеринарно-санитарный сертификат";

function build(
  slug: string,
  group: "fruits" | "vegetables",
  main: string,
  extra: string,
  en: BaseLocaleInput,
  fr: BaseLocaleInput,
  ar: BaseLocaleInput,
  ru: BaseLocaleInput,
): CatalogProduct {
  return {
    slug,
    group,
    main,
    gallery: [main, extra, ...SHARED],
    en: {
      name: en.name,
      intro: en.intro,
      description: en.description,
      specs: {
        ...en.specs,
        origin: "Egypt",
        category: group === "fruits" ? "Fresh Fruits" : "Fresh Vegetables",
        certifications: CERT_EN,
      },
    },
    fr: {
      name: fr.name,
      intro: fr.intro,
      description: fr.description,
      specs: {
        ...fr.specs,
        origin: "Égypte",
        category: group === "fruits" ? "Fruits Frais" : "Légumes Frais",
        certifications: CERT_FR,
      },
    },
    ar: {
      name: ar.name,
      intro: ar.intro,
      description: ar.description,
      specs: {
        ...ar.specs,
        origin: "مصر",
        category: group === "fruits" ? "فواكه طازجة" : "خضروات طازجة",
        certifications: CERT_AR,
      },
    },
    ru: {
      name: ru.name,
      intro: ru.intro,
      description: ru.description,
      specs: {
        ...ru.specs,
        origin: "Египет",
        category: group === "fruits" ? "Свежие фрукты" : "Свежие овощи",
        certifications: CERT_RU,
      },
    },
  };
}

export const CATALOG: CatalogProduct[] = [
  build(
    "oranges",
    "fruits",
    oranges,
    orangesB,
    {
      name: "Oranges",
      intro: "Navel, Valencia & Baladi · >45% juice yield · Calibres 48–113 · 45-day reefer shelf life.",
      description:
        "Egyptian Navel and Valencia oranges offer deep orange colour, high Brix level, and dependable sea-transit endurance. Grown in the fertile soils of the Nile Delta, Ismailia, and Upper Egypt, our oranges are picked at maturity, washed, waxed, graded by weight, and packed at the packhouse under documented batch inspection. Consignments are forced-air pre-cooled and shipped in temperature-controlled reefer containers for supermarkets, wholesalers, and juice processors.",
      specs: {
        scientificName: "Citrus sinensis",
        variety: "Navel, Valencia, Baladi",
        season: "December – May (Navel) / March – July (Valencia)",
        sizes: "48 / 56 / 64 / 72 / 80 / 88 / 100 / 113 count",
        color: "Bright deep orange",
        taste: "Sweet with a balanced citrus acidity",
        packaging: "15 kg / 7 kg telescopic carton, mesh bags, or as required",
        shelfLife: "Up to 45 days under recommended conditions",
        storageTemp: "3 – 5 °C, 85–90% RH",
        transportation: "Reefer container 40' HC, temperature 4.0 °C, ventilation 15 m³/h",
        moq: "1 x 40' HC container",
        loading: "24 – 27 tons per 40' HC container",
      },
    },
    {
      name: "Oranges",
      intro: "Navel, Valencia & Baladi · >45% de jus · Calibres 48–113 · Tenue reefer 45 jours.",
      description:
        "Les oranges Navel et Valencia d'Égypte sont reconnues pour leur couleur intense, leur taux de Brix élevé et leur bonne tenue au transport maritime. Cultivées dans le delta du Nil, à Ismaïlia et en Haute-Égypte, nos oranges sont cueillies à maturité, lavées, cirées, calibrées et emballées en station avec contrôle par lot. Chaque expédition est pré-refroidie et chargée en conteneur reefer sous température régulée.",
      specs: {
        scientificName: "Citrus sinensis",
        variety: "Navel, Valencia, Baladi",
        season: "Décembre – Mai (Navel) / Mars – Juillet (Valencia)",
        sizes: "48 / 56 / 64 / 72 / 80 / 88 / 100 / 113 calibres",
        color: "Orange éclatant et profond",
        taste: "Doux avec une acidité d'agrumes équilibrée",
        packaging: "Cartons télescopiques 15 kg / 7 kg, filets ou sur mesure",
        shelfLife: "Jusqu'à 45 jours dans les conditions recommandées",
        storageTemp: "3 – 5 °C, 85–90% HR",
        transportation: "Conteneur reefer 40' HC, température 4,0 °C, ventilation 15 m³/h",
        moq: "1 conteneur 40' HC",
        loading: "24 – 27 tonnes par conteneur 40' HC",
      },
    },
    {
      name: "البرتقال",
      intro: "أبو سرة وفالنسيا وبلدي · عصير >45% · مقاسات 48–113 · صلاحية شحن 45 يوماً.",
      description:
        "يتميز البرتقال المصري أبو سرة وفالنسيا بلونه البرتقالي الزاهي وارتفاع نسبة العصير والسكر وتحمّله للشحن البحري. يُزرع في دلتا النيل والإسماعيلية وصعيد مصر، ويُقطف عند اكتمال النضج ليُغسل ويُشمع ويُفرز بالوزن في محطة التعبئة، ثم يُبرّد مسبقاً بالهواء المدفوع ويُشحن في حاويات مبردة لأسواق التجزئة ومصانع العصير.",
      specs: {
        scientificName: "Citrus sinensis",
        variety: "أبو سرة (نافل)، فالنسيا، بلدي",
        season: "ديسمبر – مايو (أبو سرة) / مارس – يوليو (فالنسيا)",
        sizes: "48 / 56 / 64 / 72 / 80 / 88 / 100 / 113 ثمرة",
        color: "برتقالي داكن زاهي",
        taste: "حلو مع حموضة حمضية متوازنة",
        packaging: "كرتونة تلسكوبية 15 كجم / 7 كجم، أجولة شبكية أو حسب الطلب",
        shelfLife: "حتى 45 يوماً في ظروف التخزين الموصى بها",
        storageTemp: "3 – 5 درجات مئوية، رطوبة 85–90%",
        transportation: "حاوية مبردة 40 قدم HC، حرارة 4.0°م، تهوية 15 م³/ساعة",
        moq: "حاوية واحدة 40 قدم HC",
        loading: "24 – 27 طناً لكل حاوية 40 قدم HC",
      },
    },
    {
      name: "Апельсины",
      intro: "Навел, Валенсия, Балади · сок >45% · калибры 48–113 · 45 дней в рефконтейнере.",
      description:
        "Египетские апельсины сортов Навел и Валенсия отличаются насыщенным цветом, высоким содержанием сока (>45%) и хорошей сохранностью при морских перевозках. Выращенные в дельте Нила, Исмаилии и Верхнем Египте плоды собираются при достижении зрелости, моются, покрываются пищевым воском, калибруются по весу на линии и охлаждаются перед погрузкой в рефконтейнер.",
      specs: {
        scientificName: "Citrus sinensis",
        variety: "Навел, Валенсия, Балади",
        season: "Декабрь – май (Навел) / Март – июль (Валенсия)",
        sizes: "Калибр 48 / 56 / 64 / 72 / 80 / 88 / 100 / 113",
        color: "Ярко-оранжевый насыщенный",
        taste: "Сладкий со сбалансированной цитрусовой кислинкой",
        packaging: "Телескопические коробки 15 кг / 7 кг, сетки или по заказу",
        shelfLife: "До 45 дней при соблюдении условий хранения",
        storageTemp: "3 – 5 °C, влажность 85–90%",
        transportation: "Рефрижераторный контейнер 40' HC при 4,0 °C, вентиляция 15 м³/ч",
        moq: "1 x 40' HC контейнер",
        loading: "24 – 27 тонн в 40' HC контейнер",
      },
    },
  ),
  build(
    "grapes",
    "fruits",
    grapes,
    grapesB,
    {
      name: "Grapes",
      intro: "Early Sweet, Superior & Flame · Brix 16–20° · 17–22 mm · SO₂ punnet packs (4.5–5 kg).",
      description:
        "Our seedless table grapes are cultivated on selected farms in Egypt's early-season regions, allowing early dispatch to European and Gulf ports. Bunches are packed into punnets with SO₂ pads, forced-air pre-cooled, and held in dedicated cooling rooms with MRL testing and batch-level lot numbers for retail programmes.",
      specs: {
        scientificName: "Vitis vinifera",
        variety: "Early Sweet, Flame Seedless, Superior, Crimson",
        season: "May – August",
        sizes: "Bunch weight 400 – 800 g, berry 17 – 22 mm",
        color: "Golden green, red or dark crimson",
        taste: "Very sweet, crisp, seedless",
        packaging: "4.5 / 5 kg carton with 500 g punnets, SO₂ pad",
        shelfLife: "30 – 45 days under recommended conditions",
        storageTemp: "0 – 1 °C, 90–95% RH",
        transportation: "Reefer container, temperature 0.5 °C, controlled humidity",
        moq: "1 x 40' HC container",
        loading: "18 – 20 tons per 40' HC container",
      },
    },
    {
      name: "Raisins",
      intro: "Early Sweet, Superior & Flame · Brix 16–20° · 17–22 mm · Barquettes 500 g avec SO₂.",
      description:
        "Nos raisins de table sans pépins proviennent de parcelles précoces d'Égypte, permettant des expéditions dès le début de campagne vers l'Europe et le Golfe. Les grappes sont emballées en barquettes avec buvards SO₂, pré-refroidies rapidement par air forcé et enregistrées par numéro de lot.",
      specs: {
        scientificName: "Vitis vinifera",
        variety: "Early Sweet, Flame Seedless, Superior, Crimson",
        season: "Mai – Août",
        sizes: "Grappe 400 – 800 g, baie 17 – 22 mm",
        color: "Vert doré, rouge rubis ou pourpre profond",
        taste: "Très sucré, croquant, sans pépins",
        packaging: "Carton 4,5 / 5 kg avec barquettes 500 g, buvard SO₂",
        shelfLife: "30 – 45 jours dans les conditions recommandées",
        storageTemp: "0 – 1 °C, 90–95% HR",
        transportation: "Conteneur reefer, température 0,5 °C, humidité régulée",
        moq: "1 conteneur 40' HC",
        loading: "18 – 20 tonnes par conteneur 40' HC",
      },
    },
    {
      name: "العنب",
      intro: "إيرلي سويت وسوبريور وفليم · سكريات 16–20 بريكس · 17–22 ملم · بانيتات 500 جم مع SO₂.",
      description:
        "يُزرع عنب المائدة الخالي من البذور في مناطق الإنتاج المبكر بمصر، مما يتيح بدء التوريد إلى أوروبا والخليج مبكراً في الموسم. تُعبأ العناقيد في بانيتات مزودة بأوراق الحماية SO₂ وتُبرّد مسبقاً مباشرة بعد التعبئة مع متابعة أرقام التشغيلات وتحاليل المتبقيات.",
      specs: {
        scientificName: "Vitis vinifera",
        variety: "إيرلي سويت، فليم سيدلس، سوبريور، كريمسون",
        season: "مايو – أغسطس",
        sizes: "وزن العنقود 400 – 800 جم، قطر الحبة 17 – 22 ملم",
        color: "أخضر ذهبي، أحمر ياقوتي أو قرمزي داكن",
        taste: "حلو جداً، مقرمش وخالٍ من البذور",
        packaging: "كرتونة 4.5 / 5 كجم ببانيتات 500 جم مع ورقة SO₂",
        shelfLife: "30 – 45 يوماً في ظروف التخزين الموصى بها",
        storageTemp: "0 – 1 درجة مئوية، رطوبة 90–95%",
        transportation: "حاوية مبردة عند 0.5°م مع تحكم في الرطوبة",
        moq: "حاوية واحدة 40 قدم HC",
        loading: "18 – 20 طناً لكل حاوية 40 قدم HC",
      },
    },
    {
      name: "Виноград",
      intro: "Эрли Свит, Супериор, Флейм · Брикс 16–20° · 17–22 мм · Пинетки 500 г с SO₂.",
      description:
        "Наш бессемянный столовый виноград выращивается в регионах раннего созревания Египта для оперативной отгрузки в порты Европы и стран Персидского залива. Грозди фасуются в пинетки с SO₂-вкладышами, проходят быстрое охлаждение и прослеживаются по номеру партии.",
      specs: {
        scientificName: "Vitis vinifera",
        variety: "Эрли Свит, Флейм Сидлисс, Супериор, Кримсон",
        season: "Май – август",
        sizes: "Гроздь 400 – 800 г, ягода 17 – 22 мм",
        color: "Золотисто-зелёный, рубиново-красный или тёмно-бордовый",
        taste: "Очень сладкий, хрустящий, без косточек",
        packaging: "Коробка 4,5 / 5 кг с пинетками по 500 г и вкладышем SO₂",
        shelfLife: "30 – 45 дней при соблюдении условий хранения",
        storageTemp: "0 – 1 °C, влажность 90–95%",
        transportation: "Рефрижераторный контейнер при 0,5 °C, контроль влажности",
        moq: "1 x 40' HC контейнер",
        loading: "18 – 20 тонн в 40' HC контейнер",
      },
    },
  ),
  build(
    "mangoes",
    "fruits",
    mangoes,
    mangoesB,
    {
      name: "Mangoes",
      intro: "Keitt, Kent & Naomi · Fiberless flesh · 250–900 g · 4/5 kg trays via reefer (11 °C) or air.",
      description:
        "Egyptian mangoes are famous for their intense aroma, fiberless flesh and exceptional sweetness. We export leading commercial varieties selected for export firmness and shelf life, harvested at the correct dry-matter level and hot-water treated where the destination market requires it. Careful single-layer packing protects the fruit during transit by sea or air.",
      specs: {
        scientificName: "Mangifera indica",
        variety: "Keitt, Kent, Naomi, Zebda, Fajr Kelan",
        season: "June – October",
        sizes: "250 – 400 g / 400 – 600 g / 600 – 900 g",
        color: "Green to golden yellow with red blush",
        taste: "Rich, honey-sweet, aromatic, fiberless",
        packaging: "4 kg / 5 kg single-layer carton with trays",
        shelfLife: "21 – 28 days under recommended conditions",
        storageTemp: "10 – 12 °C, 85–90% RH",
        transportation: "Reefer container 11 °C, or air freight for express orders",
        moq: "1 x 40' HC container or 1 ton by air",
        loading: "16 – 18 tons per 40' HC container",
      },
    },
    {
      name: "Mangues",
      intro: "Keitt, Kent & Naomi · Chair sans fibres · 250–900 g · Plateaux 4–5 kg mer ou avion.",
      description:
        "Les mangues égyptiennes sont réputées pour leur parfum envoûtant, leur chair fondante sans fibres et leur douceur naturelle. Nous exportons des variétés commerciales sélectionnées pour leur fermeté et leur excellente tenue au transport, récoltées au degré optimal de maturité et conditionnées en plateaux alvéolés à simple couche.",
      specs: {
        scientificName: "Mangifera indica",
        variety: "Keitt, Kent, Naomi, Zebda, Fajr Kelan",
        season: "Juin – Octobre",
        sizes: "250 – 400 g / 400 – 600 g / 600 – 900 g",
        color: "Vert à jaune doré avec reflets pourpres",
        taste: "Riche, miellé, parfumé, sans fibres",
        packaging: "Carton 4 kg / 5 kg simple couche avec alvéoles",
        shelfLife: "21 – 28 jours dans les conditions recommandées",
        storageTemp: "10 – 12 °C, 85–90% HR",
        transportation: "Conteneur reefer 11 °C ou fret aérien express",
        moq: "1 conteneur 40' HC ou 1 tonne en avion",
        loading: "16 – 18 tonnes par conteneur 40' HC",
      },
    },
    {
      name: "المانجو",
      intro: "كيت وكينت ونعومي · لب خالٍ من الألياف · 250–900 جم · كراتين 4–5 كجم بحراً أو جواً.",
      description:
        "تتميز المانجو المصرية برائحتها العطرية القوية ولبها الناعم الخالي من الألياف. نصدر الأصناف التجارية المنتقاة (كيت وكينت ونعومي) لقوامها المتماسك وصلاحيتها للشحن، مع القطاف عند نسبة المادة الجافة المناسبة والمعالجة بالماء الساخن عند الطلب والتغليف في طبقة واحدة بحراً وجواً.",
      specs: {
        scientificName: "Mangifera indica",
        variety: "كيت، كينت، نعومي، زبدة، فجر كلان",
        season: "يونيو – أكتوبر",
        sizes: "250 – 400 جم / 400 – 600 جم / 600 – 900 جم",
        color: "أخضر إلى أصفر ذهبي مع حمرة خفيفة",
        taste: "غني، حلو كالعسل، عطري وخالٍ من الألياف",
        packaging: "كرتونة 4 كجم / 5 كجم بطبقة واحدة وأطباق حماية",
        shelfLife: "21 – 28 يوماً في ظروف التخزين الموصى بها",
        storageTemp: "10 – 12 درجة مئوية، رطوبة 85–90%",
        transportation: "حاوية مبردة عند 11°م أو شحن جوي للطلبات السريعة",
        moq: "حاوية واحدة 40 قدم HC أو 1 طن شحن جوي",
        loading: "16 – 18 طناً لكل حاوية 40 قدم HC",
      },
    },
    {
      name: "Манго",
      intro: "Китт, Кент, Наоми · без волокон · 250–900 г · лотки 4–5 кг морем (11 °C) и авиа.",
      description:
        "Египетское манго славится насыщенным ароматом, нежной мякотью без волокон и исключительной сладостью. Мы экспортируем отборные сорта с плотной текстурой и высокой лёжкостью, укладывая плоды в один слой в специальные лотки для бережной доставки морским рефрижераторным транспортом или авиадоставкой.",
      specs: {
        scientificName: "Mangifera indica",
        variety: "Китт, Кент, Наоми, Зебда, Фаджр Келан",
        season: "Июнь – октябрь",
        sizes: "250 – 400 г / 400 – 600 г / 600 – 900 г",
        color: "От зелёного до золотисто-жёлтого с красным румянцем",
        taste: "Насыщенный, медово-сладкий, ароматный, без волокон",
        packaging: "Однослойные коробки 4 кг / 5 кг с индивидуальными ячейками",
        shelfLife: "21 – 28 дней при соблюдении условий хранения",
        storageTemp: "10 – 12 °C, влажность 85–90%",
        transportation: "Рефрижераторный контейнер при 11 °C или авиадоставка",
        moq: "1 x 40' HC контейнер или от 1 тонны авиа",
        loading: "16 – 18 тонн в 40' HC контейнер",
      },
    },
  ),
  build(
    "pomegranates",
    "fruits",
    pomegranates,
    pomegranatesB,
    {
      name: "Pomegranates",
      intro: "Wonderful & 116 · 300–700 g/fruit (6–12 ct) · 4/5 kg trays · 60–90 days reefer life.",
      description:
        "Egyptian Wonderful pomegranates offer deep red arils, thin skin and a superb sweet-tart balance. Each fruit is inspected for crown damage and sunburn, brushed, graded and packed in protective trays. With a long natural shelf life, pomegranates travel exceptionally well to Europe, Russia, the Gulf and Far East markets.",
      specs: {
        scientificName: "Punica granatum",
        variety: "Wonderful, 116, Early Foreign",
        season: "September – December",
        sizes: "6 / 8 / 10 / 12 pcs per 4 kg or 300 – 700 g each",
        color: "Deep ruby red",
        taste: "Sweet-tart, juicy, richly aromatic",
        packaging: "4 kg / 5 kg carton with trays or open-top carton",
        shelfLife: "60 – 90 days under recommended conditions",
        storageTemp: "5 – 7 °C, 90% RH",
        transportation: "Reefer container 6 °C, ventilation 20 m³/h",
        moq: "1 x 40' HC container",
        loading: "22 – 24 tons per 40' HC container",
      },
    },
    {
      name: "Grenades",
      intro: "Wonderful & 116 · 300–700 g/fruit (6–12 pcs) · Plateaux 4–5 kg · 60–90 jours reefer.",
      description:
        "La grenade égyptienne Wonderful offre des arilles rouge rubis, une écorce fine et un équilibre entre douceur et acidité. Chaque fruit est brossé, calibré et conditionné en plateaux alvéolés pour les trajets maritimes vers l'Europe, la Russie, le Golfe et l'Asie.",
      specs: {
        scientificName: "Punica granatum",
        variety: "Wonderful, 116, Early Foreign",
        season: "Septembre – Décembre",
        sizes: "6 / 8 / 10 / 12 pièces par carton 4 kg (300 – 700 g/pièce)",
        color: "Rouge rubis éclatant",
        taste: "Doux-acidulé, très juteux et aromatique",
        packaging: "Carton 4 kg / 5 kg en plateaux alvéolés",
        shelfLife: "60 – 90 jours dans les conditions recommandées",
        storageTemp: "5 – 7 °C, 90% HR",
        transportation: "Conteneur reefer 6 °C, ventilation 20 m³/h",
        moq: "1 conteneur 40' HC",
        loading: "22 – 24 tonnes par conteneur 40' HC",
      },
    },
    {
      name: "الرمان",
      intro: "وندرفل و116 · 300–700 جم للثمرة (6–12 حبة) · كراتين 4–5 كجم · صلاحية 60–90 يوماً.",
      description:
        "يتميز الرمان المصري صنف وندرفل بحبوبه الحمراء الداكنة وقشرته الرفيعة وتوازنه الرائع بين الحلاوة والحموضة. تُفحص كل ثمرة للتأكد من خلوها من حروق الشمس وتُنظّف وتُفرز وتُعبأ في أطباق واقية، وبفضل صلاحيته الطبيعية الطويلة يصل بحالة ممتازة إلى أسواق أوروبا وروسيا والخليج والشرق الأقصى.",
      specs: {
        scientificName: "Punica granatum",
        variety: "وندرفل، 116، إيرلي فورين",
        season: "سبتمبر – ديسمبر",
        sizes: "6 / 8 / 10 / 12 ثمرة لكل 4 كجم (300 – 700 جم للثمرة)",
        color: "أحمر ياقوتي عميق",
        taste: "حلو حامضي، عصيري وغني النكهة",
        packaging: "كرتونة 4 كجم / 5 كجم بأطباق أو كرتون مفتوح من الأعلى",
        shelfLife: "60 – 90 يوماً في ظروف التخزين الموصى بها",
        storageTemp: "5 – 7 درجات مئوية، رطوبة 90%",
        transportation: "حاوية مبردة عند 6°م، تهوية 20 م³/ساعة",
        moq: "حاوية واحدة 40 قدم HC",
        loading: "22 – 24 طناً لكل حاوية 40 قدم HC",
      },
    },
    {
      name: "Гранаты",
      intro: "Вандерфул и 116 · плоды 300–700 г (6–12 шт.) · коробки 4–5 кг · 60–90 дней.",
      description:
        "Египетский гранат сорта Вандерфул отличается глубоким рубиновым цветом зёрен, тонкой кожурой и гармоничным кисло-сладким вкусом. Каждый плод проходит инспекцию, сухую чистку, калибровку и укладку в защитные лотки, обеспечивая отличную сохранность при поставках в Россию, Европу и страны Персидского залива.",
      specs: {
        scientificName: "Punica granatum",
        variety: "Вандерфул, 116, Эрли Форейн",
        season: "Сентябрь – декабрь",
        sizes: "6 / 8 / 10 / 12 шт. на 4 кг (300 – 700 г плод)",
        color: "Насыщенный рубиново-красный",
        taste: "Кисло-сладкий, очень сочный, ароматный",
        packaging: "Коробки 4 кг / 5 кг с лотками или открытый верх",
        shelfLife: "60 – 90 дней при соблюдении условий хранения",
        storageTemp: "5 – 7 °C, влажность 90%",
        transportation: "Рефрижераторный контейнер при 6 °C, вентиляция 20 м³/ч",
        moq: "1 x 40' HC контейнер",
        loading: "22 – 24 тонны в 40' HC контейнер",
      },
    },
  ),
  build(
    "strawberries",
    "fruits",
    strawberries,
    strawberriesB,
    {
      name: "Strawberries",
      intro: "Fortuna, Festival & Sensation · Fresh air cargo (2 kg cartons) & IQF sea bulk (10 kg).",
      description:
        "Egypt's mild winter yields bright red, aromatic strawberries from November through April. Berries are field-packed, forced-air pre-cooled immediately after picking, and dispatched fresh by air cargo or frozen IQF in reefer containers for processors and retailers.",
      specs: {
        scientificName: "Fragaria × ananassa",
        variety: "Fortuna, Festival, Sensation, Winter Star",
        season: "November – April",
        sizes: "25 – 45 g per berry, calibrated",
        color: "Glossy bright red",
        taste: "Sweet, highly aromatic, firm flesh",
        packaging: "250 / 500 g punnets in 2 kg carton, or IQF 10 kg",
        shelfLife: "7 – 10 days fresh, 24 months IQF",
        storageTemp: "0 – 2 °C fresh, -18 °C IQF",
        transportation: "Air freight at 1 °C or reefer container at -18 °C for IQF",
        moq: "500 kg air freight / 1 x 40' HC for IQF",
        loading: "Up to 22 tons per 40' HC container (IQF)",
      },
    },
    {
      name: "Fraises",
      intro: "Fortuna, Festival & Sensation · Frais par avion (2 kg) et surgelé IQF mer (10 kg).",
      description:
        "L'hiver tempéré d'Égypte permet de récolter des fraises rouges parfumées de novembre à avril. Les fruits sont emballés à la parcelle, pré-refroidis par ventilation forcée après récolte et expédiés en frais par avion ou en surgelé IQF par mer.",
      specs: {
        scientificName: "Fragaria × ananassa",
        variety: "Fortuna, Festival, Sensation, Winter Star",
        season: "Novembre – Avril",
        sizes: "25 – 45 g par fruit calibré",
        color: "Rouge vif et brillant",
        taste: "Sucré, très parfumé, chair ferme",
        packaging: "Barquettes 250 / 500 g en carton 2 kg ou IQF 10 kg",
        shelfLife: "7 – 10 jours en frais, 24 mois en IQF",
        storageTemp: "0 – 2 °C en frais, -18 °C en IQF",
        transportation: "Fret aérien à 1 °C ou conteneur reefer -18 °C",
        moq: "500 kg par avion / 1 conteneur 40' HC en IQF",
        loading: "Jusqu'à 22 tonnes par conteneur 40' HC (IQF)",
      },
    },
    {
      name: "الفراولة",
      intro: "فورتونا وفستيفال وسينسيشن · طازجة جواً (كراتين 2 كجم) ومجمدة IQF بحراً (10 كجم).",
      description:
        "ينتج شتاء مصر المعتدل فراولة ذات لون أحمر لامع ورائحة عطرية من نوفمبر حتى أبريل. تُعبأ الثمار في الحقل وتُبرّد بالهواء المدفوع فور القطف، ونوفّرها طازجة عبر الشحن الجوي أو مجمدة بتقنية IQF عبر الحاويات البحرية المبردة للمصانع وسلاسل التجزئة.",
      specs: {
        scientificName: "Fragaria × ananassa",
        variety: "فورتونا، فستيفال، سينسيشن، وينتر ستار",
        season: "نوفمبر – أبريل",
        sizes: "25 – 45 جم للثمرة، مفروزة ومعايرة",
        color: "أحمر زاهي لامع",
        taste: "حلو، عطري للغاية وقوام متماسك",
        packaging: "بانيتات 250 / 500 جم في كرتونة 2 كجم، أو مجمدة IQF 10 كجم",
        shelfLife: "7 – 10 أيام طازج، 24 شهراً مجمد IQF",
        storageTemp: "0 – 2 درجة مئوية طازج، -18 درجة مئوية IQF",
        transportation: "شحن جوي عند 1°م للطازج أو حاوية مبردة -18°م للمجمد",
        moq: "500 كجم شحن جوي / حاوية 40 قدم HC للمجمد IQF",
        loading: "حتى 22 طناً لكل حاوية 40 قدم HC (مجمد IQF)",
      },
    },
    {
      name: "Клубника",
      intro: "Фортуна, Фестиваль, Сенсейшн · свежая авиа (коробки 2 кг) и заморозка IQF (10 кг).",
      description:
        "Мягкая египетская зима позволяет получать ярко-красную и необыкновенно ароматную клубнику с ноября по апрель. Ягоды фасуются прямо в поле, подвергаются принудительному охлаждению в течение 2 часов и доставляются свежими авиатранспортом или замороженными (IQF) морем для переработки и ритейла.",
      specs: {
        scientificName: "Fragaria × ananassa",
        variety: "Фортуна, Фестиваль, Сенсейшн, Винтер Стар",
        season: "Ноябрь – апрель",
        sizes: "Калиброванная ягода 25 – 45 г",
        color: "Глянцевый ярко-красный",
        taste: "Сладкая, высокоароматная, с плотной мякотью",
        packaging: "Пинетки 250 / 500 г в коробке 2 кг или IQF по 10 кг",
        shelfLife: "7 – 10 дней свежая, 24 месяца IQF",
        storageTemp: "0 – 2 °C свежая, -18 °C IQF",
        transportation: "Авиадоставка при 1 °C или рефконтейнер -18 °C для IQF",
        moq: "500 кг авиа / 1 x 40' HC контейнер для IQF",
        loading: "До 22 тонн в 40' HC контейнер (IQF)",
      },
    },
  ),
  build(
    "lemons",
    "fruits",
    lemons,
    lemonsB,
    {
      name: "Lemons",
      intro: "Adalia, Baladi & Eureka · Thin-skinned, >35% juice · 80–180 g · Year-round supply.",
      description:
        "Our Adalia and Baladi lemons deliver strong acidity, aromatic peel oil and consistent size grading. Fruit is degreened where required, waxed with food-grade wax and packed to buyer specification. Lemons are a year-round staple in our programme thanks to Egypt's extended production window.",
      specs: {
        scientificName: "Citrus limon",
        variety: "Adalia (Interdonato), Baladi, Eureka",
        season: "August – March (peak) / year-round availability",
        sizes: "80 – 100 g / 100 – 130 g / 130 – 180 g",
        color: "Bright yellow to light green",
        taste: "Sharp, fresh acidity with aromatic peel",
        packaging: "15 kg carton, 10 kg carton, or mesh bags",
        shelfLife: "45 – 60 days under recommended conditions",
        storageTemp: "8 – 10 °C, 85–90% RH",
        transportation: "Reefer container 9 °C, ventilation 15 m³/h",
        moq: "1 x 40' HC container",
        loading: "24 – 27 tons per 40' HC container",
      },
    },
    {
      name: "Citrons",
      intro: "Adalia, Baladi & Eureka · Peau fine, >35% jus · 80–180 g · Cartons 10/15 kg toute l'année.",
      description:
        "Nos citrons Adalia et Baladi offrent une acidité vive, des huiles essentielles très aromatiques et un calibrage irréprochable. Cirés avec de la cire de qualité alimentaire et triés méticuleusement, ils bénéficient d'une large fenêtre de production tout au long de l'année.",
      specs: {
        scientificName: "Citrus limon",
        variety: "Adalia, Baladi, Eureka",
        season: "Août – Mars (pic de saison) / disponible toute l'année",
        sizes: "80 – 100 g / 100 – 130 g / 130 – 180 g",
        color: "Jaune éclatant à vert clair",
        taste: "Acidité franche et fraîche, zeste parfumé",
        packaging: "Cartons 15 kg / 10 kg ou filets",
        shelfLife: "45 – 60 jours dans les conditions recommandées",
        storageTemp: "8 – 10 °C, 85–90% HR",
        transportation: "Conteneur reefer 9 °C, ventilation 15 m³/h",
        moq: "1 conteneur 40' HC",
        loading: "24 – 27 tonnes par conteneur 40' HC",
      },
    },
    {
      name: "الليمون",
      intro: "أضاليا وبلدي ويوريكا · قشرة رقيقة وعصير >35% · 80–180 جم · متوفر طوال العام.",
      description:
        "يوفر ليمون الأضاليا والبلدي المصري حموضة مركزة وزيوتاً عطرية قوية في القشرة وتدريجاً متجانساً للأحجام. تُزال الصبغة الخضراء عند الحاجة وتُشمع الثمار بشمع غذائي آمن وتُعبأ وفق مواصفات المشتري، مع توافر مستمر على مدار العام بفضل اتساع مواسم الإنتاج في مصر.",
      specs: {
        scientificName: "Citrus limon",
        variety: "أضاليا (إنتر دوناتو)، بلدي، يوريكا",
        season: "أغسطس – مارس (ذروة الموسم) / متوفر طوال العام",
        sizes: "80 – 100 جم / 100 – 130 جم / 130 – 180 جم",
        color: "أصفر ساطع إلى أخضر فاتح",
        taste: "حموضة منعشة مركزة وقشرة عطرية",
        packaging: "كرتونة 15 كجم، كرتونة 10 كجم أو أجولة شبكية",
        shelfLife: "45 – 60 يوماً في ظروف التخزين الموصى بها",
        storageTemp: "8 – 10 درجات مئوية، رطوبة 85–90%",
        transportation: "حاوية مبردة عند 9°م، تهوية 15 م³/ساعة",
        moq: "حاوية واحدة 40 قدم HC",
        loading: "24 – 27 طناً لكل حاوية 40 قدم HC",
      },
    },
    {
      name: "Лимоны",
      intro: "Адалия, Балади, Эврика · тонкая кожура, сок >35% · 80–180 г · круглый год.",
      description:
        "Египетские лимоны сортов Адалия и Балади отличаются яркой кислотностью, высоким содержанием эфирных масел в кожуре и точной калибровкой. Плоды покрываются пищевым воском и упаковываются под требования заказчика, оставаясь доступными практически круглый год.",
      specs: {
        scientificName: "Citrus limon",
        variety: "Адалия (Интердонато), Балади, Эврика",
        season: "Август – март (пик) / круглогодичные поставки",
        sizes: "80 – 100 г / 100 – 130 г / 130 – 180 г",
        color: "От ярко-жёлтого до светло-зелёного",
        taste: "Яркая свежая кислотность и ароматная цедра",
        packaging: "Коробки 15 кг, 10 кг или сетки",
        shelfLife: "45 – 60 дней при соблюдении условий хранения",
        storageTemp: "8 – 10 °C, влажность 85–90%",
        transportation: "Рефрижераторный контейнер при 9 °C, вентиляция 15 м³/ч",
        moq: "1 x 40' HC контейнер",
        loading: "24 – 27 тонн в 40' HC контейнер",
      },
    },
  ),
  build(
    "potatoes",
    "vegetables",
    potatoes,
    potatoesB,
    {
      name: "Potatoes",
      intro: "Spunta, Hermes & Lady Rosetta · 35–80+ mm calibres · Washed/brushed 10/25 kg mesh & big bags.",
      description:
        "Egyptian potatoes are grown in sandy, virus-free land and are approved for demanding markets including the EU and Russia. We supply table and processing varieties with consistent dry matter, low reducing sugars and excellent frying colour. Every lot is washed or brushed, graded and inspected for brown-rot compliance before shipment.",
      specs: {
        scientificName: "Solanum tuberosum",
        variety: "Spunta, Cara, Hermes, Lady Rosetta, Diamond",
        season: "January – May and October – December",
        sizes: "35/55, 45/65, 50/70, 60/80, 70+ mm",
        color: "Yellow to light brown skin, cream flesh",
        taste: "Mild, earthy, firm texture after cooking",
        packaging: "25 kg mesh/jute bags, 10 kg or 5 kg bags, big bags",
        shelfLife: "3 – 6 months under recommended conditions",
        storageTemp: "6 – 8 °C table / 8 – 10 °C processing, 90% RH",
        transportation: "Reefer or ventilated container at 7 °C, ventilation 25 m³/h",
        moq: "1 x 40' HC container",
        loading: "26 – 28 tons per 40' HC container",
      },
    },
    {
      name: "Pommes de Terre",
      intro: "Spunta, Hermes & Lady Rosetta · Calibres 35–80+ mm · Sacs filet/jute 10–25 kg & big bags.",
      description:
        "Les pommes de terre égyptiennes sont cultivées dans des sols sablonneux préparés pour l'exportation vers l'Union Européenne, la Russie et le Golfe. Nous fournissons des variétés de table et d'industrie avec un taux de matière sèche régulier et un lavage ou brossage en station.",
      specs: {
        scientificName: "Solanum tuberosum",
        variety: "Spunta, Cara, Hermes, Lady Rosetta, Diamond",
        season: "Janvier – Mai et Octobre – Décembre",
        sizes: "35/55, 45/65, 50/70, 60/80, 70+ mm",
        color: "Peau jaune à beige clair, chair crème",
        taste: "Doux, texture ferme après cuisson",
        packaging: "Sacs filet/jute 25 kg, 10 kg, 5 kg ou big bags",
        shelfLife: "3 – 6 mois dans les conditions recommandées",
        storageTemp: "6 – 8 °C (table) / 8 – 10 °C (industrie), 90% HR",
        transportation: "Conteneur reefer ou ventilé à 7 °C, ventilation 25 m³/h",
        moq: "1 conteneur 40' HC",
        loading: "26 – 28 tonnes par conteneur 40' HC",
      },
    },
    {
      name: "البطاطس",
      intro: "سبونتا وهيرمس وليدي روزيتا · مقاسات 35–80+ ملم · أجولة 10/25 كجم وجامبو باج.",
      description:
        "تُزرع البطاطس المصرية في أراضٍ رملية مخصصة للتصدير نحو أسواق الاتحاد الأوروبي وروسيا وأفريقيا. نوفر أصناف المائدة والتصنيع بنسبة مادة جافة متجانسة وسكريات مختزلة منخفضة، مع الغسيل أو التنظيف بالفرشاة والفرز وإصدار مستندات الحجر الزراعي قبل الشحن.",
      specs: {
        scientificName: "Solanum tuberosum",
        variety: "سبونتا، كارا، هيرمس، ليدي روزيتا، دايموند",
        season: "يناير – مايو وأكتوبر – ديسمبر",
        sizes: "35/55، 45/65، 50/70، 60/80، +70 ملم",
        color: "قشرة صفراء إلى بني فاتح، لب كريمي",
        taste: "مذاق معتدل وقوام متماسك بعد الطهي",
        packaging: "أجولة شبكية/خيش 25 كجم، 10 كجم، 5 كجم أو جامبو باج",
        shelfLife: "3 – 6 أشهر في ظروف التخزين الموصى بها",
        storageTemp: "6 – 8°م للمائدة / 8 – 10°م للتصنيع، رطوبة 90%",
        transportation: "حاوية مبردة أو مهواة عند 7°م، تهوية 25 م³/ساعة",
        moq: "حاوية واحدة 40 قدم HC",
        loading: "26 – 28 طناً لكل حاوية 40 قدم HC",
      },
    },
    {
      name: "Картофель",
      intro: "Спунта, Гермес, Леди Розетта · калибр 35–80+ мм · сетки 10/25 кг и биг-бэги.",
      description:
        "Египетский картофель выращивается на чистых песчаных почвах (зоны свободные от бурой гнили — PFA) и подготовлен для поставок в Россию и ЕС. Мы поставляем столовые и чипсовые сорта со стабильным содержанием сухих веществ, отличной очисткой (мытый или щёточный) и точной калибровкой.",
      specs: {
        scientificName: "Solanum tuberosum",
        variety: "Спунта, Кара, Гермес, Леди Розетта, Даймонд",
        season: "Январь – май и октябрь – декабрь",
        sizes: "35/55, 45/65, 50/70, 60/80, 70+ мм",
        color: "Кожура от жёлтой до светло-коричневой, кремовая мякоть",
        taste: "Мягкий вкус, плотная текстура после приготовления",
        packaging: "Сетка или джут 25 кг, мешки 10 / 5 кг, биг-бэги",
        shelfLife: "3 – 6 месяцев при соблюдении условий хранения",
        storageTemp: "6 – 8 °C столовый / 8 – 10 °C для переработки, влажность 90%",
        transportation: "Рефрижераторный или вентилируемый контейнер при 7 °C, вентиляция 25 м³/ч",
        moq: "1 x 40' HC контейнер",
        loading: "26 – 28 тонн в 40' HC контейнер",
      },
    },
  ),
  build(
    "onions",
    "vegetables",
    onions,
    onionsB,
    {
      name: "Onions",
      intro: "Giza 6, Golden Yellow & Red · Calibres 40–90 mm · Tight cured skin · 10/20/25 kg mesh bags.",
      description:
        "Egyptian onions are widely imported in Europe, Russia, and the Gulf for their high dry matter, firm pungency, and extended storage tolerance. We supply fresh and cured golden, red, and white onions calibrated and cured for tight dry outer skins.",
      specs: {
        scientificName: "Allium cepa",
        variety: "Giza 6, Golden Yellow, Red Star, White",
        season: "March – August (fresh) / year-round (stored)",
        sizes: "40/60, 50/70, 60/80, 70/90 mm",
        color: "Golden brown, deep red or white",
        taste: "Pungent, sweet after cooking",
        packaging: "25 kg / 20 kg / 10 kg mesh bags, 5 kg retail bags",
        shelfLife: "4 – 6 months under recommended conditions",
        storageTemp: "0 – 2 °C cured, 65–70% RH",
        transportation: "Ventilated or reefer container at 1 °C, ventilation 30 m³/h",
        moq: "1 x 40' HC container",
        loading: "26 – 28 tons per 40' HC container",
      },
    },
    {
      name: "Oignons",
      intro: "Giza 6, Doré & Rouge · Calibres 40–90 mm · Séchés, peaux fermes · Sacs filet 10–25 kg.",
      description:
        "Les oignons égyptiens sont réputés pour leur forte teneur en matière sèche et leur capacité de conservation exceptionnelle. Nous proposons des oignons dorés, rouges et blancs séchés et calibrés avec soin pour garantir une résistance optimale durant le transport.",
      specs: {
        scientificName: "Allium cepa",
        variety: "Giza 6, Doré, Rouge, Blanc",
        season: "Mars – Août (frais) / toute l'année (stockés)",
        sizes: "40/60, 50/70, 60/80, 70/90 mm",
        color: "Brun doré, rouge intense ou blanc",
        taste: "Piquant, s'adoucissant à la cuisson",
        packaging: "Sacs filet 25 kg / 20 kg / 10 kg ou filets 5 kg",
        shelfLife: "4 – 6 mois dans les conditions recommandées",
        storageTemp: "0 – 2 °C séché, 65–70% HR",
        transportation: "Conteneur ventilé ou reefer à 1 °C, ventilation 30 m³/h",
        moq: "1 conteneur 40' HC",
        loading: "26 – 28 tonnes par conteneur 40' HC",
      },
    },
    {
      name: "البصل",
      intro: "جيزة 6 والذهبي والأحمر · مقاسات 40–90 ملم · قشرة جافة محكمة · أجولة 10–25 كجم.",
      description:
        "يحظى البصل المصري بإقبال مستمر في أسواق أوروبا وروسيا والخليج لارتفاع نسبة المادة الجافة وصلابته وتحمله للتخزين. نوفر البصل الذهبي والأحمر والأبيض طازجاً ومجففاً في عبوات جملة أو تجزئة بعد التدريج والتجفيف لضمان قشرة جافة محكمة.",
      specs: {
        scientificName: "Allium cepa",
        variety: "جيزة 6، أصفر ذهبي، أحمر، أبيض",
        season: "مارس – أغسطس (طازج) / طوال العام (مخزن)",
        sizes: "40/60، 50/70، 60/80، 70/90 ملم",
        color: "بني ذهبي، أحمر داكن أو أبيض",
        taste: "نكهة قوية وحادة، حلو بعد الطهي",
        packaging: "أجولة شبكية 25 / 20 / 10 كجم، أو عبوات 5 كجم للتجزئة",
        shelfLife: "4 – 6 أشهر في ظروف التخزين الموصى بها",
        storageTemp: "0 – 2 درجة مئوية للمجفف، رطوبة 65–70%",
        transportation: "حاوية مهواة أو مبردة عند 1°م، تهوية 30 م³/ساعة",
        moq: "حاوية واحدة 40 قدم HC",
        loading: "26 – 28 طناً لكل حاوية 40 قدم HC",
      },
    },
    {
      name: "Репчатый лук",
      intro: "Гиза 6, Золотистый, Красный · калибры 40–90 мм · просушенная шелуха · сетки 10–25 кг.",
      description:
        "Египетский репчатый лук востребован в странах Европы, России и Залива благодаря высокому содержанию сухих веществ и хорошей лёжкости. Мы поставляем золотистый, красный и белый лук в сетках после естественной просушки, калибровки и переборки.",
      specs: {
        scientificName: "Allium cepa",
        variety: "Гиза 6, Золотисто-жёлтый, Красный, Белый",
        season: "Март – август (свежий) / круглый год (хранение)",
        sizes: "40/60, 50/70, 60/80, 70/90 мм",
        color: "Золотисто-коричневый, тёмно-красный или белый",
        taste: "Острый, сладковатый после термической обработки",
        packaging: "Сетки 25 кг / 20 кг / 10 кг, фасовка по 5 кг",
        shelfLife: "4 – 6 месяцев при соблюдении условий хранения",
        storageTemp: "0 – 2 °C просушенный, влажность 65–70%",
        transportation: "Вентилируемый или рефконтейнер при 1 °C, вентиляция 30 м³/ч",
        moq: "1 x 40' HC контейнер",
        loading: "26 – 28 тонн в 40' HC контейнер",
      },
    },
  ),
  build(
    "garlic",
    "vegetables",
    garlic,
    garlicB,
    {
      name: "Garlic",
      intro: "Egyptian White & Red Baladi · 4.5–6.5+ cm bulbs · Fresh & dry cured · 10 kg cartons / 20 kg mesh.",
      description:
        "Egyptian garlic combines strong aroma with excellent bulb uniformity. Bulbs are field-cured, cleaned, root-cut and graded by diameter. Available as fresh, dried or peeled cloves, our garlic serves both retail packers and industrial buyers in Europe, the Gulf and Africa.",
      specs: {
        scientificName: "Allium sativum",
        variety: "Egyptian White, Chinese White, Red Baladi",
        season: "March – July (fresh) / year-round (dried)",
        sizes: "4.5 – 5.5 cm / 5.5 – 6.5 cm / 6.5 cm+",
        color: "Pure white to light purple",
        taste: "Strong, pungent, richly aromatic",
        packaging: "10 kg carton, 20 kg mesh bag, 500 g retail nets",
        shelfLife: "6 – 8 months under recommended conditions",
        storageTemp: "-1 – 0 °C, 60–70% RH",
        transportation: "Reefer container at 0 °C, ventilation 20 m³/h",
        moq: "1 x 40' HC container",
        loading: "22 – 25 tons per 40' HC container",
      },
    },
    {
      name: "Ail",
      intro: "Blanc Égyptien & Rouge Baladi · Bulbes 4,5–6,5+ cm · Frais ou sec · Cartons 10 kg & filets 20 kg.",
      description:
        "L'ail égyptien allie un arôme puissant et une excellente régularité de calibre. Séché au champ, équeuté et calibré, notre ail est disponible en vert, sec ou gousses pour répondre aux besoins de la distribution et des transformateurs.",
      specs: {
        scientificName: "Allium sativum",
        variety: "Blanc Égyptien, Blanc Chinois, Rouge Baladi",
        season: "Mars – Juillet (frais) / toute l'année (sec)",
        sizes: "4,5 – 5,5 cm / 5,5 – 6,5 cm / 6,5 cm+",
        color: "Blanc pur à reflets violets",
        taste: "Puissant, corsé et très aromatique",
        packaging: "Carton 10 kg, sac filet 20 kg, filets 500 g",
        shelfLife: "6 – 8 mois dans les conditions recommandées",
        storageTemp: "-1 – 0 °C, 60–70% HR",
        transportation: "Conteneur reefer à 0 °C, ventilation 20 m³/h",
        moq: "1 conteneur 40' HC",
        loading: "22 – 25 tonnes par conteneur 40' HC",
      },
    },
    {
      name: "الثوم",
      intro: "أبيض مصري وأحمر بلدي · أقطار 4.5–6.5+ سم · طازج وجاف · كراتين 10 كجم وشبك 20 كجم.",
      description:
        "يجمع الثوم المصري بين الرائحة العطرية القوية وتجانس الرؤوس. يُجفف طبيعياً في الحقول ويُنظّف وتُقص الجذور ويُدرج حسب القطر، ويتوفر أخضر طازجاً أو جافاً أو فصوصاً مقشرة لتلبية احتياجات شركات التعبئة والمصانع في أوروبا والخليج وأفريقيا.",
      specs: {
        scientificName: "Allium sativum",
        variety: "أبيض مصري، أبيض صيني، أحمر بلدي",
        season: "مارس – يوليو (طازج) / طوال العام (جاف)",
        sizes: "4.5 – 5.5 سم / 5.5 – 6.5 سم / +6.5 سم",
        color: "أبيض ناصع إلى بنفسجي فاتح",
        taste: "قوي، لاذع وغني بالرائحة العطرية",
        packaging: "كرتونة 10 كجم، شوال شبكي 20 كجم، شبك 500 جم للتجزئة",
        shelfLife: "6 – 8 أشهر في ظروف التخزين الموصى بها",
        storageTemp: "-1 – 0 درجة مئوية، رطوبة 60–70%",
        transportation: "حاوية مبردة عند 0°م، تهوية 20 م³/ساعة",
        moq: "حاوية واحدة 40 قدم HC",
        loading: "22 – 25 طناً لكل حاوية 40 قدم HC",
      },
    },
    {
      name: "Чеснок",
      intro: "Египетский белый и красный · 4,5–6,5+ см · свежий и сухой · коробки 10 кг / сетки 20 кг.",
      description:
        "Египетский чеснок сочетает выраженный пряный аромат с высокой однородностью головок. После естественной сушки, обрезки корней и калибровки по диаметру мы отгружаем свежий (зелёный), сухой чеснок и очищенные зубки для торговых сетей и перерабатывающих предприятий.",
      specs: {
        scientificName: "Allium sativum",
        variety: "Египетский белый, Китайский белый, Красный Балади",
        season: "Март – июль (свежий) / круглый год (сухой)",
        sizes: "4,5 – 5,5 см / 5,5 – 6,5 см / 6,5+ см",
        color: "Чисто-белый или с фиолетовыми прожилками",
        taste: "Насыщенный, острый, выраженно ароматный",
        packaging: "Коробка 10 кг, сетка 20 кг, розничные сетки по 500 г",
        shelfLife: "6 – 8 месяцев при соблюдении условий хранения",
        storageTemp: "-1 – 0 °C, влажность 60–70%",
        transportation: "Рефрижераторный контейнер при 0 °C, вентиляция 20 м³/ч",
        moq: "1 x 40' HC контейнер",
        loading: "22 – 25 тонн в 40' HC контейнер",
      },
    },
  ),
  build(
    "sweet-potatoes",
    "vegetables",
    sweetPotatoes,
    sweetPotatoesB,
    {
      name: "Sweet Potatoes",
      intro: "Beauregard & Covington · Cured 7 days · 150–600 g sizing · 5/6/10 kg cartons · 4–6 mo life.",
      description:
        "Our Beauregard sweet potatoes are cured for seven days to set the skin and develop sugars, then graded for shape and calibre. They deliver deep orange flesh, high beta-carotene and a clean, sweet flavour that performs well in retail packs and food service across Europe and the Gulf.",
      specs: {
        scientificName: "Ipomoea batatas",
        variety: "Beauregard, Covington, Japanese Purple",
        season: "September – March",
        sizes: "200 – 400 g / 400 – 600 g / 100 – 200 g (baby)",
        color: "Copper-orange skin, deep orange flesh",
        taste: "Sweet, creamy, smooth texture",
        packaging: "5 kg / 6 kg carton, 10 kg carton, big bags",
        shelfLife: "4 – 6 months after curing",
        storageTemp: "12 – 14 °C, 85–90% RH",
        transportation: "Reefer container at 13 °C, ventilation 20 m³/h",
        moq: "1 x 40' HC container",
        loading: "24 – 26 tons per 40' HC container",
      },
    },
    {
      name: "Patates Douces",
      intro: "Beauregard & Covington · Affinées 7 jours · Calibres 150–600 g · Cartons 5/6/10 kg.",
      description:
        "Nos patates douces Beauregard sont affinées pendant 7 jours pour stabiliser la peau et développer les sucres, puis calibrées par poids pour les circuits de distribution en Europe et dans le Golfe.",
      specs: {
        scientificName: "Ipomoea batatas",
        variety: "Beauregard, Covington, Violette",
        season: "Septembre – Mars",
        sizes: "200 – 400 g / 400 – 600 g / 100 – 200 g (baby)",
        color: "Peau cuivrée, chair orange profond",
        taste: "Sucré, crémeux, texture douce",
        packaging: "Carton 5 kg / 6 kg, carton 10 kg ou big bags",
        shelfLife: "4 – 6 mois après affinage",
        storageTemp: "12 – 14 °C, 85–90% HR",
        transportation: "Conteneur reefer à 13 °C, ventilation 20 m³/h",
        moq: "1 conteneur 40' HC",
        loading: "24 – 26 tonnes par conteneur 40' HC",
      },
    },
    {
      name: "البطاطا الحلوة",
      intro: "بورجارد وكوفينجتون · معالجة 7 أيام · أوزان 150–600 جم · كراتين 5 و6 و10 كجم.",
      description:
        "تُعالج البطاطا الحلوة صنف بورجارد لمدة سبعة أيام لتثبيت القشرة وتركيز السكريات الطبيعية، ثم تُفرز حسب الشكل والوزن. تتميز بلب برتقالي داكن غني بالبيتا كاروتين ونكهة حلوة كريمية تلبي أعلى طلبات التجزئة وقطاع الأغذية في أوروبا والخليج.",
      specs: {
        scientificName: "Ipomoea batatas",
        variety: "بورجارد، كوفينجتون، ياباني بنفسجي",
        season: "سبتمبر – مارس",
        sizes: "200 – 400 جم / 400 – 600 جم / 100 – 200 جم (صغير)",
        color: "قشرة نحاسية برتقالية، لب برتقالي عميق",
        taste: "حلو، كريمي وقوام ناعم",
        packaging: "كرتونة 5 / 6 كجم، كرتونة 10 كجم أو جامبو باج",
        shelfLife: "4 – 6 أشهر بعد المعالجة",
        storageTemp: "12 – 14 درجة مئوية، رطوبة 85–90%",
        transportation: "حاوية مبردة عند 13°م، تهوية 20 م³/ساعة",
        moq: "حاوية واحدة 40 قدم HC",
        loading: "24 – 26 طناً لكل حاوية 40 قدم HC",
      },
    },
    {
      name: "Батат",
      intro: "Борегард, Ковингтон · 7-дневный кюринг · калибровка 150–600 г · коробки 5/6/10 кг.",
      description:
        "Наш батат сорта Борегард проходит семидневное кюринг-дозревание для укрепления кожуры и повышения сахаристости, после чего калибруется по форме и весу. Высокое содержание бета-каротина и нежный кремовый вкус делают его хитом розничных сетей Европы.",
      specs: {
        scientificName: "Ipomoea batatas",
        variety: "Борегард, Ковингтон, Японский фиолетовый",
        season: "Сентябрь – март",
        sizes: "200 – 400 г / 400 – 600 г / 100 – 200 г (бэби)",
        color: "Медно-оранжевая кожура, яркая оранжевая мякоть",
        taste: "Сладкий, нежный, кремовой текстуры",
        packaging: "Коробки 5 / 6 кг, 10 кг или биг-бэги",
        shelfLife: "4 – 6 месяцев после дозревания",
        storageTemp: "12 – 14 °C, влажность 85–90%",
        transportation: "Рефрижераторный контейнер при 13 °C, вентиляция 20 м³/ч",
        moq: "1 x 40' HC контейнер",
        loading: "24 – 26 тонн в 40' HC контейнер",
      },
    },
  ),
  build(
    "green-beans",
    "vegetables",
    greenBeans,
    greenBeansB,
    {
      name: "Green Beans",
      intro: "Paulista, Nomad & Serengeti · Extra-fine (<6 mm) & fine · Hydro-cooled air cargo & IQF sea.",
      description:
        "Fine and extra-fine green beans are hand-picked daily, sorted for straightness and colour, and hydro-cooled within hours to preserve their snap. They are shipped fresh by air to Europe or frozen IQF by sea, and are one of our most consistent winter programme lines.",
      specs: {
        scientificName: "Phaseolus vulgaris",
        variety: "Paulista, Nomad, Serengeti (fine & extra fine)",
        season: "October – May",
        sizes: "Extra fine 6 mm, fine 6 – 9 mm, bobby 9 – 12 mm",
        color: "Uniform vivid green",
        taste: "Sweet, crisp, tender with no strings",
        packaging: "250 / 500 g punnets in 3 kg carton, 5 kg bulk, IQF 10 kg",
        shelfLife: "10 – 14 days fresh, 24 months IQF",
        storageTemp: "5 – 7 °C fresh, -18 °C IQF",
        transportation: "Air freight at 6 °C or reefer container for IQF",
        moq: "500 kg air freight / 1 x 40' HC for IQF",
        loading: "Up to 22 tons per 40' HC container (IQF)",
      },
    },
    {
      name: "Haricots Verts",
      intro: "Paulista, Nomad & Serengeti · Extra-fin (<6 mm) · Hydro-refroidi avion frais ou IQF mer.",
      description:
        "Les haricots verts fins et extra-fins sont cueillis quotidiennement, triés pour leur droiture et leur couleur éclatante, puis hydro-refroidis immédiatement. Expédiés en frais par avion ou en surgelé IQF par mer, ils constituent une valeur sûre de nos programmes d'hiver.",
      specs: {
        scientificName: "Phaseolus vulgaris",
        variety: "Paulista, Nomad, Serengeti (fin & extra-fin)",
        season: "Octobre – Mai",
        sizes: "Extra-fin < 6 mm, fin 6 – 9 mm, bobby 9 – 12 mm",
        color: "Vert vif et uniforme",
        taste: "Croquant, tendre, sans fil",
        packaging: "Barquettes 250 / 500 g en carton 3 kg ou vrac 5 kg",
        shelfLife: "10 – 14 jours en frais, 24 mois en IQF",
        storageTemp: "5 – 7 °C en frais, -18 °C en IQF",
        transportation: "Fret aérien à 6 °C ou conteneur reefer pour IQF",
        moq: "500 kg par avion / 1 conteneur 40' HC en IQF",
        loading: "Jusqu'à 22 tonnes par conteneur 40' HC (IQF)",
      },
    },
    {
      name: "الفاصوليا الخضراء",
      intro: "بوليستا ونوماد وسيرينجيتي · إكسترا فاين (<6 ملم) · تبريد مائي للشحن الجوي والمجمد IQF.",
      description:
        "تُقطف الفاصوليا الخضراء الرفيعة والناعمة (إكسترا فاين) يدوياً يومياً، وتُفرز حسب الاستقامة واللون ثم تُبرّد مائياً فور الحصاد، وتُشحن طازجة جواً أو مجمدة بتقنية IQF بحراً في برامجنا الشتوية.",
      specs: {
        scientificName: "Phaseolus vulgaris",
        variety: "بوليستا، نوماد، سيرينجيتي (رفيع وإكسترا فاين)",
        season: "أكتوبر – مايو",
        sizes: "إكسترا فاين 6 ملم، رفيع 6–9 ملم، بوبي 9–12 ملم",
        color: "أخضر زاهي متجانس",
        taste: "حلو، مقرمش، طري وخالٍ تماماً من الخيوط",
        packaging: "بانيتات 250 / 500 جم في كرتونة 3 كجم، جملة 5 كجم، أو IQF 10 كجم",
        shelfLife: "10 – 14 يوماً طازج، 24 شهراً مجمد IQF",
        storageTemp: "5 – 7 درجات مئوية طازج، -18 درجة مئوية IQF",
        transportation: "شحن جوي عند 6°م أو حاوية مبردة للمجمد IQF",
        moq: "500 كجم شحن جوي / حاوية 40 قدم HC للمجمد IQF",
        loading: "حتى 22 طناً لكل حاوية 40 قدم HC (مجمد IQF)",
      },
    },
    {
      name: "Стручковая фасоль",
      intro: "Паулиста, Номад, Серенгети · <6 мм и 6–9 мм · гидроохлаждение авиа и заморозка IQF.",
      description:
        "Тонкая и экстра-тонкая стручковая фасоль собирается вручную ежедневно, сортируется по прямизне и яркому зелёному цвету, затем сразу проходит гидроохлаждение. Поставляется свежей авиатранспортом в Европу или замороженной (IQF) морскими контейнерами.",
      specs: {
        scientificName: "Phaseolus vulgaris",
        variety: "Паулиста, Номад, Серенгети (файн и экстра-файн)",
        season: "Октябрь – май",
        sizes: "Экстра-файн до 6 мм, файн 6–9 мм, бобби 9–12 мм",
        color: "Равномерный ярко-зелёный",
        taste: "Нежная, хрустящая, сладковатая, без волокон",
        packaging: "Пинетки 250 / 500 г в коробке 3 кг, навалом 5 кг, IQF 10 кг",
        shelfLife: "10 – 14 дней свежая, 24 месяца IQF",
        storageTemp: "5 – 7 °C свежая, -18 °C IQF",
        transportation: "Авиадоставка при 6 °C или рефконтейнер для IQF",
        moq: "500 кг авиа / 1 x 40' HC контейнер для IQF",
        loading: "До 22 тонн в 40' HC контейнер (IQF)",
      },
    },
  ),
  build(
    "peppers",
    "vegetables",
    peppers,
    peppersB,
    {
      name: "Peppers",
      intro: "California Wonder & Blocky / Chili · G & GG (70–100 mm) · 5 kg bulk cartons & trio flow-packs.",
      description:
        "Our greenhouse and open-field bell peppers provide thick flesh, blocky shape and long shelf life in red, yellow, orange and green colors. We also supply hot chili varieties for specialized ethnic and retail markets in Europe and the Gulf.",
      specs: {
        scientificName: "Capsicum annuum",
        variety: "California Wonder, Red Knight, Yellow Blocky, Chili",
        season: "November – June",
        sizes: "G (70–85 mm), GG (85–100 mm), 5 kg bulk carton",
        color: "Bright red, yellow, orange or dark green",
        taste: "Sweet, crunchy, succulent / spicy for chilis",
        packaging: "5 kg carton loose, flow-pack trio or 2-piece bags",
        shelfLife: "18 – 24 days under recommended conditions",
        storageTemp: "7 – 9 °C, 90–95% RH",
        transportation: "Reefer container at 8 °C, ventilation 15 m³/h",
        moq: "1 x 40' HC container",
        loading: "20 – 22 tons per 40' HC container",
      },
    },
    {
      name: "Poivrons",
      intro: "California Wonder & Piments · Calibres G/GG (70–100 mm) · Cartons 5 kg & sachets trio.",
      description:
        "Nos poivrons doux et piments sont cultivés sous serres contrôlées et en plein champ, garantissant des parois épaisses, une forme cubique parfaite et une excellente longévité en rouge, jaune, orange et vert pour la distribution européenne.",
      specs: {
        scientificName: "Capsicum annuum",
        variety: "California Wonder, Red Knight, Yellow Blocky, Piment",
        season: "Novembre – Juin",
        sizes: "G (70–85 mm), GG (85–100 mm), carton vrac 5 kg",
        color: "Rouge vif, jaune, orange ou vert foncé",
        taste: "Doux, croquant, très juteux",
        packaging: "Carton 5 kg vrac, sachet flow-pack trio ou duo",
        shelfLife: "18 – 24 jours dans les conditions recommandées",
        storageTemp: "7 – 9 °C, 90–95% HR",
        transportation: "Conteneur reefer à 8 °C, ventilation 15 m³/h",
        moq: "1 conteneur 40' HC",
        loading: "20 – 22 tonnes par conteneur 40' HC",
      },
    },
    {
      name: "الفلفل الألوان",
      intro: "كاليفورنيا وندر وفلفل حار · مقاسات G/GG (70–100 ملم) · كراتين 5 كجم وعبوات تريو.",
      description:
        "يتميز الفلفل الألوان المزروع في الصوب الزراعية الحديثة والحقول المكشوفة بجدران سميكة وشكل متناسق وعمر تخزيني طويل بألوان الأحمر والأصفر والبرتقالي والأخضر، كما نوفر أصناف الفلفل الحار للأسواق المتخصصة وسلاسل التجزئة في أوروبا والخليج.",
      specs: {
        scientificName: "Capsicum annuum",
        variety: "كاليفورنيا وندر، ريد نايت، بلوكي أصفر، فلفل حار",
        season: "نوفمبر – يونيو",
        sizes: "G (70–85 ملم)، GG (85–100 ملم)، كرتونة جملة 5 كجم",
        color: "أحمر زاهي، أصفر، برتقالي أو أخضر داكن",
        taste: "حلو مقرمش وعصيري / حار للأصناف الحارة",
        packaging: "كرتونة 5 كجم سائب، أو عبوات فلو باك ثلاثية وثنائية",
        shelfLife: "18 – 24 يوماً في ظروف التخزين الموصى بها",
        storageTemp: "7 – 9 درجات مئوية، رطوبة 90–95%",
        transportation: "حاوية مبردة عند 8°م، تهوية 15 م³/ساعة",
        moq: "حاوية واحدة 40 قدم HC",
        loading: "20 – 22 طناً لكل حاوية 40 قدم HC",
      },
    },
    {
      name: "Болгарский перец",
      intro: "Калифорния Вандер и Чили · калибры G/GG (70–100 мм) · коробки 5 кг и флоу-пак трио.",
      description:
        "Наш сладкий перец из современных теплиц и открытого грунта отличается толстой стенкой, правильной кубовидной формой и длительной сохранностью в красном, жёлтом, оранжевом и зелёном цветах. Также поставляем острый перец чили для розничных сетей.",
      specs: {
        scientificName: "Capsicum annuum",
        variety: "Калифорния Вандер, Ред Найт, Йеллоу Блоки, Чили",
        season: "Ноябрь – июнь",
        sizes: "G (70–85 мм), GG (85–100 мм), коробка 5 кг",
        color: "Ярко-красный, жёлтый, оранжевый или тёмно-зелёный",
        taste: "Сладкий, хрустящий, сочный / острый для чили",
        packaging: "Коробка 5 кг навалом, флоу-пак трио или дуэт",
        shelfLife: "18 – 24 дня при соблюдении условий хранения",
        storageTemp: "7 – 9 °C, влажность 90–95%",
        transportation: "Рефрижераторный контейнер при 8 °C, вентиляция 15 м³/ч",
        moq: "1 x 40' HC контейнер",
        loading: "20 – 22 тонны в 40' HC контейнер",
      },
    },
  ),
];

export function getProduct(slug: string): CatalogProduct | undefined {
  return CATALOG.find((p) => p.slug === slug);
}

export const SPEC_LABELS: Record<Lang, Record<keyof ProductSpecs, string>> = {
  en: {
    scientificName: "Scientific Name",
    origin: "Origin",
    category: "Category",
    variety: "Variety",
    season: "Season Availability",
    sizes: "Sizes / Calibres",
    color: "Colour",
    taste: "Taste & Texture",
    packaging: "Packaging",
    shelfLife: "Shelf Life",
    storageTemp: "Storage Temperature",
    transportation: "Transportation",
    moq: "MOQ",
    loading: "Loading Capacity",
    certifications: "Export Documents",
  },
  fr: {
    scientificName: "Nom Scientifique",
    origin: "Origine",
    category: "Catégorie",
    variety: "Variété",
    season: "Disponibilité Saisonnière",
    sizes: "Calibres",
    color: "Couleur",
    taste: "Saveur & Texture",
    packaging: "Conditionnement",
    shelfLife: "Durée de Conservation",
    storageTemp: "Température de Stockage",
    transportation: "Transport",
    moq: "Quantité Min. (MOQ)",
    loading: "Capacité de Chargement",
    certifications: "Documents d'Export",
  },
  ar: {
    scientificName: "الاسم العلمي",
    origin: "بلد المنشأ",
    category: "الفئة",
    variety: "الأصناف",
    season: "موسم التوفر",
    sizes: "الأحجام / المقاسات",
    color: "اللون",
    taste: "الطعم والقوام",
    packaging: "التعبئة والتغليف",
    shelfLife: "فترة الصلاحية",
    storageTemp: "درجة حرارة التخزين",
    transportation: "الشحن والنقل",
    moq: "الحد الأدنى للطلب",
    loading: "سعة التحميل",
    certifications: "مستندات التصدير",
  },
  ru: {
    scientificName: "Латинское название",
    origin: "Страна происхождения",
    category: "Категория",
    variety: "Сорта",
    season: "Сезон поставок",
    sizes: "Размеры / Калибр",
    color: "Цвет",
    taste: "Вкус и текстура",
    packaging: "Упаковка",
    shelfLife: "Срок годности",
    storageTemp: "Температура хранения",
    transportation: "Транспортировка",
    moq: "Мин. партия (MOQ)",
    loading: "Загрузка контейнера",
    certifications: "Экспортные документы",
  },
};

export const PAGE_UI: Record<
  Lang,
  {
    home: string;
    products: string;
    premium: string;
    requestQuote: string;
    gallery: string;
    info: string;
    description: string;
    related: string;
    back: string;
    viewProduct: string;
    loading: string;
    notFound: string;
  }
> = {
  en: {
    home: "Home",
    products: "Products",
    premium: "Egyptian Export Produce",
    requestQuote: "Get a Quote",
    gallery: "Product Gallery",
    info: "Product Information",
    description: "Description",
    related: "Other Products",
    back: "Back to Products",
    viewProduct: "View Product",
    loading: "Loading…",
    notFound: "Product not found",
  },
  fr: {
    home: "Accueil",
    products: "Produits",
    premium: "Production d'Exportation Égyptienne",
    requestQuote: "Demander un Devis",
    gallery: "Galerie du Produit",
    info: "Fiche Technique",
    description: "Description",
    related: "Autres Produits",
    back: "Retour aux Produits",
    viewProduct: "Voir le Produit",
    loading: "Chargement…",
    notFound: "Produit introuvable",
  },
  ar: {
    home: "الرئيسية",
    products: "المنتجات",
    premium: "محاصيل تصدير مصرية",
    requestQuote: "اطلب عرض سعر",
    gallery: "معرض صور المنتج",
    info: "المواصفات الفنية",
    description: "الوصف التفصيلي",
    related: "منتجات أخرى",
    back: "العودة للمنتجات",
    viewProduct: "عرض المنتج",
    loading: "جاري التحميل…",
    notFound: "المنتج غير موجود",
  },
  ru: {
    home: "Главная",
    products: "Продукция",
    premium: "Египетский сельхозэкспорт",
    requestQuote: "Запросить цену",
    gallery: "Галерея товара",
    info: "Характеристики",
    description: "Описание",
    related: "Другие товары",
    back: "К каталогу",
    viewProduct: "Подробнее",
    loading: "Загрузка…",
    notFound: "Товар не найден",
  },
};
