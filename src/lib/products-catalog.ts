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

export type CatalogProduct = {
  slug: string;
  group: "fruits" | "vegetables";
  main: string;
  gallery: string[];
  en: { name: string; intro: string; description: string; specs: ProductSpecs };
  ar: { name: string; intro: string; description: string; specs: ProductSpecs };
};

const CERT_EN = "ISO 9001, GLOBALG.A.P., Phytosanitary Certificate, Certificate of Origin";
const CERT_AR = "أيزو 9001، جلوبال جاب، الشهادة الزراعية، شهادة المنشأ";

function build(
  slug: string,
  group: "fruits" | "vegetables",
  main: string,
  extra: string,
  en: { name: string; intro: string; description: string; specs: Omit<ProductSpecs, "origin" | "category" | "certifications"> },
  ar: { name: string; intro: string; description: string; specs: Omit<ProductSpecs, "origin" | "category" | "certifications"> },
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
      intro: "Sun-ripened Egyptian citrus with vibrant sweetness and outstanding juice content.",
      description:
        "Egyptian Navel and Valencia oranges are among the most sought-after citrus varieties in the world, prized for their deep orange colour, high Brix level and excellent shipping performance. Grown in the fertile soils of the Nile Delta and Upper Egypt, our oranges are hand-picked at optimum maturity, washed, waxed, graded by weight and packed the same day under strict quality control. Every consignment is pre-cooled and shipped in temperature-controlled reefer containers, guaranteeing arrival in perfect condition for supermarkets, wholesalers and juice processors worldwide.",
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
      name: "برتقال",
      intro: "حمضيات مصرية ناضجة تحت الشمس بحلاوة مميزة ونسبة عصير عالية.",
      description:
        "يعد البرتقال المصري من أشهر أنواع الحمضيات في العالم بفضل لونه الغني ونسبة السكر المرتفعة وقدرته الممتازة على تحمل الشحن الطويل. يزرع في أراضي الدلتا وصعيد مصر، ويُقطف يدويًا في ذروة النضج ثم يُغسل ويُدرّج ويُعبأ في نفس اليوم تحت رقابة جودة صارمة، ويُشحن مبردًا في حاويات مبردة لضمان وصوله بحالة مثالية إلى الأسواق العالمية.",
      specs: {
        scientificName: "Citrus sinensis",
        variety: "نافل، فالنسيا، بلدي",
        season: "ديسمبر – مايو (نافل) / مارس – يوليو (فالنسيا)",
        sizes: "48 / 56 / 64 / 72 / 80 / 88 / 100 / 113",
        color: "برتقالي زاهي",
        taste: "حلو مع حموضة متوازنة",
        packaging: "كرتون 15 كجم / 7 كجم أو شبكات حسب الطلب",
        shelfLife: "حتى 45 يومًا في الظروف الموصى بها",
        storageTemp: "3 – 5 °م، رطوبة 85–90%",
        transportation: "حاوية مبردة 40 قدم، درجة حرارة 4.0 °م، تهوية 15 م³/س",
        moq: "حاوية واحدة 40 قدم",
        loading: "24 – 27 طن للحاوية 40 قدم",
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
      intro: "Hand-picked table grapes, plump, crisp and cold-chain fresh.",
      description:
        "Our seedless table grapes are cultivated on selected farms in Egypt's early-season regions, allowing us to supply European and Gulf markets weeks ahead of most origins. Bunches are field-packed into punnets with SO₂ pads, rapidly pre-cooled and stored in dedicated grape chambers. Strict residue monitoring and GLOBALG.A.P. traceability make our grapes a reliable programme item for retail chains.",
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
      name: "عنب",
      intro: "عنب مائدة مقطوف يدويًا، ممتلئ ومقرمش ومحفوظ بسلسلة تبريد كاملة.",
      description:
        "يُزرع العنب اللاذري في مزارع مختارة بمناطق التبكير في مصر، مما يتيح تزويد أسواق أوروبا والخليج قبل معظم المناشئ الأخرى. يُعبأ في الحقل داخل عبوات مع وسائد ثاني أكسيد الكبريت ويُبرد سريعًا ويُخزن في غرف مخصصة، مع متابعة صارمة للمتبقيات وتتبع كامل.",
      specs: {
        scientificName: "Vitis vinifera",
        variety: "إيرلي سويت، فليم، سوبيريور، كريمسون",
        season: "مايو – أغسطس",
        sizes: "وزن العنقود 400 – 800 جم، حبة 17 – 22 مم",
        color: "أخضر ذهبي أو أحمر أو قرمزي",
        taste: "حلو جدًا ومقرمش وبدون بذور",
        packaging: "كرتون 4.5 / 5 كجم بعبوات 500 جم مع وسادة SO₂",
        shelfLife: "30 – 45 يومًا",
        storageTemp: "0 – 1 °م، رطوبة 90–95%",
        transportation: "حاوية مبردة، 0.5 °م، رطوبة مضبوطة",
        moq: "حاوية واحدة 40 قدم",
        loading: "18 – 20 طن للحاوية 40 قدم",
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
      intro: "Fragrant, honey-sweet tropical mangoes from Ismailia and Sharkia farms.",
      description:
        "Egyptian mangoes are famous for their intense aroma, fiberless flesh and exceptional sweetness. We export premium varieties selected for export firmness and shelf life, harvested at the correct dry-matter level and hot-water treated where the destination market requires it. Careful single-layer packing protects the fruit during transit by sea or air.",
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
        transportation: "Reefer container 11 °C, or air freight for premium orders",
        moq: "1 x 40' HC container or 1 ton by air",
        loading: "16 – 18 tons per 40' HC container",
      },
    },
    {
      name: "مانجو",
      intro: "مانجو استوائية عطرة بحلاوة العسل من مزارع الإسماعيلية والشرقية.",
      description:
        "تشتهر المانجو المصرية برائحتها القوية ولبها الخالي من الألياف وحلاوتها الاستثنائية. نصدّر أصنافًا فاخرة مختارة لصلابتها وعمرها التخزيني، ويتم الحصاد عند النضج المناسب مع المعالجة الحرارية عند الحاجة، والتعبئة بطبقة واحدة لحماية الثمار أثناء الشحن.",
      specs: {
        scientificName: "Mangifera indica",
        variety: "كيت، كنت، نعومي، زبدة، فجر كلان",
        season: "يونيو – أكتوبر",
        sizes: "250 – 400 جم / 400 – 600 جم / 600 – 900 جم",
        color: "أخضر إلى أصفر ذهبي مع احمرار",
        taste: "غني وحلو وعطري بدون ألياف",
        packaging: "كرتون 4 / 5 كجم بطبقة واحدة",
        shelfLife: "21 – 28 يومًا",
        storageTemp: "10 – 12 °م، رطوبة 85–90%",
        transportation: "حاوية مبردة 11 °م أو شحن جوي للطلبات المميزة",
        moq: "حاوية 40 قدم أو طن واحد جوًا",
        loading: "16 – 18 طن للحاوية 40 قدم",
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
      intro: "Ruby-red arils bursting with flavour and antioxidants.",
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
      name: "رمان",
      intro: "حبات ياقوتية غنية بالنكهة ومضادات الأكسدة.",
      description:
        "يتميز الرمان المصري صنف وندرفول بحبات حمراء داكنة وقشرة رفيعة وتوازن مثالي بين الحلاوة والحموضة. يتم فحص كل ثمرة وتنظيفها وتدريجها وتعبئتها في أطباق واقية، ويتحمل الشحن الطويل إلى أوروبا وروسيا والخليج والشرق الأقصى.",
      specs: {
        scientificName: "Punica granatum",
        variety: "وندرفول، 116، مبكر أجنبي",
        season: "سبتمبر – ديسمبر",
        sizes: "6 / 8 / 10 / 12 حبة لكل 4 كجم",
        color: "أحمر ياقوتي غامق",
        taste: "حلو حامض وعصيري وعطري",
        packaging: "كرتون 4 / 5 كجم بأطباق",
        shelfLife: "60 – 90 يومًا",
        storageTemp: "5 – 7 °م، رطوبة 90%",
        transportation: "حاوية مبردة 6 °م، تهوية 20 م³/س",
        moq: "حاوية واحدة 40 قدم",
        loading: "22 – 24 طن للحاوية 40 قدم",
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
      intro: "Aromatic winter berries harvested and cooled within hours.",
      description:
        "Egypt's mild winter produces intensely coloured, highly aromatic strawberries from November through April. Fruit is field-packed, force-air cooled within two hours of harvest and moved through an unbroken cold chain. We supply fresh berries by air freight and IQF-grade fruit by sea for processors and retailers.",
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
      name: "فراولة",
      intro: "ثمار شتوية عطرة تُحصد وتُبرَّد خلال ساعات.",
      description:
        "ينتج الشتاء المصري المعتدل فراولة عالية اللون والرائحة من نوفمبر حتى أبريل. تُعبأ في الحقل وتُبرد خلال ساعتين من الحصاد ضمن سلسلة تبريد متصلة، ونوفر الفراولة الطازجة جوًا والمجمدة IQF بحرًا للمصانع وسلاسل التجزئة.",
      specs: {
        scientificName: "Fragaria × ananassa",
        variety: "فورتونا، فستيفال، سنسيشن، وينتر ستار",
        season: "نوفمبر – أبريل",
        sizes: "25 – 45 جم للثمرة",
        color: "أحمر لامع",
        taste: "حلو وعطري ولب متماسك",
        packaging: "عبوات 250 / 500 جم في كرتون 2 كجم أو IQF 10 كجم",
        shelfLife: "7 – 10 أيام طازجة، 24 شهرًا مجمدة",
        storageTemp: "0 – 2 °م طازجة، -18 °م مجمدة",
        transportation: "شحن جوي عند 1 °م أو حاوية مبردة -18 °م",
        moq: "500 كجم جوًا / حاوية 40 قدم للمجمد",
        loading: "حتى 22 طن للحاوية 40 قدم",
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
      intro: "Zesty, thin-skinned premium lemons with high juice yield.",
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
      name: "ليمون",
      intro: "ليمون فاخر رقيق القشرة وغني بالعصير.",
      description:
        "يوفر الليمون الأضاليا والبلدي حموضة قوية وزيوت قشرة عطرية وتدريجًا ثابتًا للأحجام. تُعالج الثمار وتُشمّع بشمع غذائي وتُعبأ حسب مواصفات المشتري، وهو منتج متاح على مدار العام تقريبًا.",
      specs: {
        scientificName: "Citrus limon",
        variety: "أضاليا، بلدي، يوريكا",
        season: "أغسطس – مارس (الذروة) ومتاح طوال العام",
        sizes: "80 – 100 جم / 100 – 130 جم / 130 – 180 جم",
        color: "أصفر زاهي إلى أخضر فاتح",
        taste: "حموضة منعشة وقشرة عطرية",
        packaging: "كرتون 15 كجم أو 10 كجم أو شبكات",
        shelfLife: "45 – 60 يومًا",
        storageTemp: "8 – 10 °م، رطوبة 85–90%",
        transportation: "حاوية مبردة 9 °م، تهوية 15 م³/س",
        moq: "حاوية واحدة 40 قدم",
        loading: "24 – 27 طن للحاوية 40 قدم",
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
      intro: "Firm, versatile export-grade potatoes for retail and processing.",
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
      name: "بطاطس",
      intro: "بطاطس متماسكة بدرجة تصديرية للتجزئة والتصنيع.",
      description:
        "تُزرع البطاطس المصرية في أراضٍ رملية خالية من الأمراض ومعتمدة لأسواق صارمة مثل الاتحاد الأوروبي وروسيا. نوفر أصناف المائدة والتصنيع بمحتوى مادة جافة ثابت ولون قلي ممتاز، مع الغسل والتدريج والفحص قبل الشحن.",
      specs: {
        scientificName: "Solanum tuberosum",
        variety: "سبونتا، كارا، هيرمز، ليدي روزيتا، دياموند",
        season: "يناير – مايو وأكتوبر – ديسمبر",
        sizes: "35/55، 45/65، 50/70، 60/80، 70+ مم",
        color: "قشرة صفراء إلى بنية فاتحة ولب كريمي",
        taste: "طعم معتدل وقوام متماسك",
        packaging: "شكائر 25 كجم أو أكياس 10 / 5 كجم",
        shelfLife: "3 – 6 أشهر",
        storageTemp: "6 – 10 °م، رطوبة 90%",
        transportation: "حاوية مبردة أو مهواة عند 7 °م، تهوية 25 م³/س",
        moq: "حاوية واحدة 40 قدم",
        loading: "26 – 28 طن للحاوية 40 قدم",
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
      intro: "Golden and red bulbs with long shelf life and firm necks.",
      description:
        "Egyptian onions are known worldwide for their high dry matter, strong pungency and outstanding storability. We supply fresh and cured golden, red and white onions in bulk or retail packaging, all machine-graded, hand-sorted and cured to ensure tight skins and minimal transit losses.",
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
      name: "بصل",
      intro: "بصل ذهبي وأحمر بعمر تخزيني طويل وأعناق متماسكة.",
      description:
        "يشتهر البصل المصري بمحتواه العالي من المادة الجافة ونفاذته القوية وقدرته الممتازة على التخزين. نوفر البصل الذهبي والأحمر والأبيض معالجًا ومدرجًا آليًا ومفرزًا يدويًا لضمان قشرة محكمة وأقل فاقد أثناء الشحن.",
      specs: {
        scientificName: "Allium cepa",
        variety: "جيزة 6، ذهبي، أحمر، أبيض",
        season: "مارس – أغسطس (طازج) وعلى مدار العام (مخزن)",
        sizes: "40/60، 50/70، 60/80، 70/90 مم",
        color: "ذهبي أو أحمر داكن أو أبيض",
        taste: "نفاذ ويتحول لحلو بعد الطهي",
        packaging: "شبكات 25 / 20 / 10 كجم وأكياس تجزئة 5 كجم",
        shelfLife: "4 – 6 أشهر",
        storageTemp: "0 – 2 °م، رطوبة 65–70%",
        transportation: "حاوية مهواة أو مبردة عند 1 °م، تهوية 30 م³/س",
        moq: "حاوية واحدة 40 قدم",
        loading: "26 – 28 طن للحاوية 40 قدم",
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
      intro: "Robust flavour, uniform premium bulbs with tight white skin.",
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
      name: "ثوم",
      intro: "نكهة قوية ورؤوس متجانسة فاخرة بقشرة بيضاء محكمة.",
      description:
        "يجمع الثوم المصري بين الرائحة القوية والتجانس الممتاز في حجم الرؤوس. تُجفف الرؤوس حقليًا وتُنظف وتُقص جذورها وتُدرج حسب القطر، ويتوفر طازجًا أو مجففًا أو فصوصًا مقشرة للأسواق الأوروبية والخليجية والأفريقية.",
      specs: {
        scientificName: "Allium sativum",
        variety: "أبيض مصري، أبيض صيني، بلدي أحمر",
        season: "مارس – يوليو (طازج) وطوال العام (مجفف)",
        sizes: "4.5 – 5.5 سم / 5.5 – 6.5 سم / أكبر من 6.5 سم",
        color: "أبيض ناصع إلى بنفسجي فاتح",
        taste: "قوي ونفاذ وعطري",
        packaging: "كرتون 10 كجم، شبكة 20 كجم، عبوات تجزئة 500 جم",
        shelfLife: "6 – 8 أشهر",
        storageTemp: "-1 – 0 °م، رطوبة 60–70%",
        transportation: "حاوية مبردة عند 0 °م، تهوية 20 م³/س",
        moq: "حاوية واحدة 40 قدم",
        loading: "22 – 25 طن للحاوية 40 قدم",
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
      intro: "Naturally sweet roots with rich orange flesh and smooth skin.",
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
      name: "بطاطا حلوة",
      intro: "جذور حلوة طبيعيًا بلب برتقالي غني وقشرة ناعمة.",
      description:
        "تُعالج البطاطا الحلوة صنف بوريجارد لمدة سبعة أيام لتثبيت القشرة وتطوير السكريات، ثم تُدرج حسب الشكل والحجم. تتميز بلب برتقالي غني بالبيتا كاروتين ونكهة حلوة نظيفة مناسبة للتجزئة والمطاعم.",
      specs: {
        scientificName: "Ipomoea batatas",
        variety: "بوريجارد، كوفينجتون، بنفسجية يابانية",
        season: "سبتمبر – مارس",
        sizes: "200 – 400 جم / 400 – 600 جم / 100 – 200 جم",
        color: "قشرة نحاسية ولب برتقالي غامق",
        taste: "حلو وكريمي وناعم",
        packaging: "كرتون 5 / 6 / 10 كجم أو عبوات كبيرة",
        shelfLife: "4 – 6 أشهر بعد المعالجة",
        storageTemp: "12 – 14 °م، رطوبة 85–90%",
        transportation: "حاوية مبردة عند 13 °م، تهوية 20 م³/س",
        moq: "حاوية واحدة 40 قدم",
        loading: "24 – 26 طن للحاوية 40 قدم",
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
      intro: "Crisp, tender pods harvested young and cooled immediately.",
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
      name: "فاصوليا خضراء",
      intro: "قرون طرية مقرمشة تُقطف مبكرًا وتُبرد فورًا.",
      description:
        "تُقطف الفاصوليا الرفيعة وفائقة الرفع يدويًا يوميًا وتُفرز حسب الاستقامة واللون وتُبرد مائيًا خلال ساعات للحفاظ على قرمشتها. تُشحن طازجة جوًا إلى أوروبا أو مجمدة IQF بحرًا، وهي من أثبت خطوط برنامجنا الشتوي.",
      specs: {
        scientificName: "Phaseolus vulgaris",
        variety: "بوليستا، نوماد، سيرينجيتي",
        season: "أكتوبر – مايو",
        sizes: "فائق الرفع 6 مم، رفيع 6 – 9 مم، عادي 9 – 12 مم",
        color: "أخضر زاهٍ متجانس",
        taste: "حلو ومقرمش وطري بدون ألياف",
        packaging: "عبوات 250 / 500 جم في كرتون 3 كجم أو 5 كجم سائب",
        shelfLife: "10 – 14 يومًا طازجة، 24 شهرًا مجمدة",
        storageTemp: "5 – 7 °م طازجة، -18 °م مجمدة",
        transportation: "شحن جوي عند 6 °م أو حاوية مبردة للمجمد",
        moq: "500 كجم جوًا / حاوية 40 قدم للمجمد",
        loading: "حتى 22 طن للحاوية 40 قدم",
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
      intro: "Colourful thick-walled bell peppers grown under protected cultivation.",
      description:
        "Our bell peppers are grown in greenhouses and net houses for blemish-free skin, uniform blocky shape and thick walls that hold up in transit. Available in red, yellow, green and orange, they are graded by colour and calibre and packed in ventilated cartons for fresh export or supplied IQF for processors.",
      specs: {
        scientificName: "Capsicum annuum",
        variety: "Blocky bell (red, yellow, orange, green), chili on request",
        season: "October – June",
        sizes: "150 – 200 g / 200 – 250 g / 250 g+",
        color: "Red, yellow, orange, green",
        taste: "Sweet, crisp, mild and juicy",
        packaging: "5 kg carton, 3 kg punnet carton, IQF 10 kg",
        shelfLife: "18 – 25 days under recommended conditions",
        storageTemp: "7 – 9 °C, 90–95% RH",
        transportation: "Reefer container at 8 °C, ventilation 20 m³/h",
        moq: "1 x 40' HC container",
        loading: "18 – 20 tons per 40' HC container",
      },
    },
    {
      name: "فلفل ألوان",
      intro: "فلفل رومي ملوّن سميك اللب مزروع في بيوت محمية.",
      description:
        "يُزرع الفلفل الرومي في صوب وبيوت شبكية للحصول على قشرة نظيفة وشكل متجانس وجدران سميكة تتحمل الشحن. يتوفر بالأحمر والأصفر والأخضر والبرتقالي مدرجًا حسب اللون والحجم ومعبأ في كراتين مهواة أو مجمدًا للمصانع.",
      specs: {
        scientificName: "Capsicum annuum",
        variety: "فلفل رومي (أحمر، أصفر، برتقالي، أخضر)",
        season: "أكتوبر – يونيو",
        sizes: "150 – 200 جم / 200 – 250 جم / أكثر من 250 جم",
        color: "أحمر، أصفر، برتقالي، أخضر",
        taste: "حلو ومقرمش وعصيري",
        packaging: "كرتون 5 كجم أو 3 كجم أو مجمد 10 كجم",
        shelfLife: "18 – 25 يومًا",
        storageTemp: "7 – 9 °م، رطوبة 90–95%",
        transportation: "حاوية مبردة عند 8 °م، تهوية 20 م³/س",
        moq: "حاوية واحدة 40 قدم",
        loading: "18 – 20 طن للحاوية 40 قدم",
      },
    },
  ),
];

export function getProduct(slug: string) {
  return CATALOG.find((p) => p.slug === slug);
}

export const SPEC_LABELS: Record<Lang, Record<keyof ProductSpecs, string>> = {
  en: {
    scientificName: "Scientific Name",
    origin: "Origin",
    category: "Category",
    variety: "Variety",
    season: "Season Availability",
    sizes: "Sizes",
    color: "Color",
    taste: "Taste",
    packaging: "Packaging",
    shelfLife: "Shelf Life",
    storageTemp: "Storage Temperature",
    transportation: "Transportation",
    moq: "MOQ",
    loading: "Loading Capacity",
    certifications: "Certifications",
  },
  ar: {
    scientificName: "الاسم العلمي",
    origin: "بلد المنشأ",
    category: "الفئة",
    variety: "الأصناف",
    season: "موسم التوافر",
    sizes: "الأحجام",
    color: "اللون",
    taste: "المذاق",
    packaging: "التعبئة",
    shelfLife: "العمر التخزيني",
    storageTemp: "درجة حرارة التخزين",
    transportation: "النقل",
    moq: "أقل كمية للطلب",
    loading: "سعة التحميل",
    certifications: "الشهادات",
  },
};

export const PAGE_UI = {
  en: {
    home: "Home",
    products: "Products",
    premium: "Premium Export Grade",
    requestQuote: "Request Quote",
    gallery: "Product Gallery",
    info: "Product Information",
    description: "Description",
    related: "Other Products",
    back: "Back to Products",
    viewProduct: "View Product",
  },
  ar: {
    home: "الرئيسية",
    products: "المنتجات",
    premium: "درجة تصدير فاخرة",
    requestQuote: "اطلب عرض سعر",
    gallery: "معرض صور المنتج",
    info: "معلومات المنتج",
    description: "الوصف",
    related: "منتجات أخرى",
    back: "العودة للمنتجات",
    viewProduct: "عرض المنتج",
  },
} as const;
