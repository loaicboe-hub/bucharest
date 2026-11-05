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
  fr: { name: string; intro: string; description: string; specs: ProductSpecs };
  ar?: { name: string; intro: string; description: string; specs: ProductSpecs };
};

const CERT_EN = "GLOBALG.A.P., Phytosanitary Certificate, Certificate of Origin";
const CERT_FR = "GLOBALG.A.P., Certificat Phytosanitaire, Certificat d'Origine";

function build(
  slug: string,
  group: "fruits" | "vegetables",
  main: string,
  extra: string,
  en: { name: string; intro: string; description: string; specs: Omit<ProductSpecs, "origin" | "category" | "certifications"> },
  fr: { name: string; intro: string; description: string; specs: Omit<ProductSpecs, "origin" | "category" | "certifications"> },
): CatalogProduct {
  const frProduct = {
    name: fr.name,
    intro: fr.intro,
    description: fr.description,
    specs: {
      ...fr.specs,
      origin: "Égypte",
      category: group === "fruits" ? "Fruits Frais" : "Légumes Frais",
      certifications: CERT_FR,
    },
  };
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
    fr: frProduct,
    ar: frProduct, // Compatibility alias
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
      name: "Oranges",
      intro: "Agrumes égyptiens mûris au soleil avec une douceur éclatante et une teneur exceptionnelle en jus.",
      description:
        "Les oranges Navel et Valencia d'Égypte comptent parmi les variétés les plus recherchées au monde, reconnues pour leur couleur intense, leur taux de Brix élevé et leur excellente tenue au transport. Cultivées dans les terres fertiles du delta du Nil et de Haute-Égypte, nos oranges sont cueillies à maturité optimale, lavées, cirées, calibrées et conditionnées le jour même sous contrôle qualité rigoureux. Chaque lot est pré-refroidi et expédié en conteneurs frigorifiques reefer pour garantir une fraîcheur intacte.",
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
      name: "Raisins",
      intro: "Raisins de table récoltés à la main, charnus, croquants et ultra-frais.",
      description:
        "Nos raisins de table sans pépins sont cultivés dans des terroirs précoces d'Égypte, nous permettant d'approvisionner les marchés européens et internationaux plusieurs semaines avant d'autres origines. Les grappes sont emballées directement au champ en barquettes avec buvards SO₂, pré-refroidies rapidement et stockées sous atmosphère contrôlée avec traçabilité intégrale.",
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
      name: "Mangues",
      intro: "Mangues tropicales parfumées, douces comme le miel, issues des vergers d'Ismaïlia.",
      description:
        "Les mangues égyptiennes sont réputées pour leur parfum envoûtant, leur chair fondante sans fibres et leur douceur naturelle. Nous exportons des variétés premium sélectionnées pour leur fermeté et leur excellente tenue au transport, récoltées au degré optimal de maturité et conditionnées en plateaux alvéolés à simple couche.",
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
      name: "Grenades",
      intro: "Grains rubis éclatants gorgés de jus, riches en saveur et antioxydants.",
      description:
        "La grenade égyptienne Wonderful offre des arilles d'un rouge rubis intense, une écorce fine et un équilibre gustatif parfait entre douceur et acidité. Chaque fruit est soigneusement brossé, trié et conditionné en plateaux alvéolés pour supporter de longs trajets maritimes vers l'Europe et le monde.",
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
      name: "Fraises",
      intro: "Baies d'hiver parfumées, récoltées et refroidies dans les heures qui suivent la cueillette.",
      description:
        "L'hiver tempéré d'Égypte permet la production de fraises d'une couleur rouge éclatante et d'un arôme intense de novembre à avril. Les fruits sont emballés au champ, refroidis par ventilation forcée sous deux heures et acheminés en chaîne du froid absolue par avion en frais ou par mer en surgelé IQF.",
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
      name: "Citrons",
      intro: "Citrons frais à peau fine et jus intense, sélectionnés pour l'exportation.",
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
      name: "Pommes de Terre",
      intro: "Pommes de terre fermes et polyvalentes de qualité export pour la consommation et l'industrie.",
      description:
        "Les pommes de terre égyptiennes sont cultivées dans des sols sablonneux exempts de virus et certifiées pour les marchés les plus exigeants de l'UE et du monde. Nous fournissons des variétés de table et d'industrie avec un taux de matière sèche régulier, une belle chair et un lavage soigné.",
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
      name: "Oignons",
      intro: "Oignons dorés et rouges à longue conservation, peaux fermes et goût prononcé.",
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
      name: "Ail",
      intro: "Saveur intense, têtes homogènes de première qualité à tunique blanche ou pourpre.",
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
      name: "Patates Douces",
      intro: "Racines naturellement sucrées à chair orange fondante et peau lisse.",
      description:
        "Nos patates douces Beauregard sont affinées pendant 7 jours pour stabiliser la peau et développer la teneur en sucres, puis calibrées selon les standards européens les plus rigoureux. Riches en bêta-carotène, elles offrent une texture crémeuse et savoureuse.",
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
      name: "Haricots Verts",
      intro: "Gousses fines et extra-fines, croquantes et tendres, récoltées à la main.",
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
  ),
  build(
    "peppers",
    "vegetables",
    peppers,
    peppersB,
    {
      name: "Peppers",
      intro: "Thick-walled, vibrant bell and chili peppers with bright crunch.",
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
      intro: "Poivrons charnus et colorés, croquants et juteux, cultivés sous serre moderne.",
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
    certifications: "Certifications",
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
    certifications: "Certifications",
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
  fr: {
    home: "Accueil",
    products: "Produits",
    premium: "Qualité Exportation Supérieure",
    requestQuote: "Demander un Devis",
    gallery: "Galerie du Produit",
    info: "Fiche Technique",
    description: "Description",
    related: "Autres Produits",
    back: "Retour aux Produits",
    viewProduct: "Voir le Produit",
  },
} as const;
