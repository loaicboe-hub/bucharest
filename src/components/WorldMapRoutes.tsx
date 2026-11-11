import type { Lang } from "@/lib/i18n";

type Corridor = {
  id: string;
  x: number;
  y: number;
  labelX: number;
  labelY: number;
  delay: number;
  label: Record<Lang, string>;
};

// Egypt export origin hub (Cairo / Nile Delta / Alexandria port corridor)
const HUB = { x: 356, y: 266 };

const CORRIDORS: Corridor[] = [
  {
    id: "uk-eu",
    x: 248,
    y: 138,
    labelX: 196,
    labelY: 112,
    delay: 0,
    label: {
      en: "UK & EU",
      fr: "Royaume-Uni & UE",
      ar: "أوروبا وبريطانيا",
      ru: "ЕС и Великобритания",
    },
  },
  {
    id: "russia",
    x: 422,
    y: 102,
    labelX: 438,
    labelY: 74,
    delay: 0.7,
    label: {
      en: "Russia",
      fr: "Russie",
      ar: "روسيا",
      ru: "Россия",
    },
  },
  {
    id: "gulf",
    x: 454,
    y: 268,
    labelX: 512,
    labelY: 306,
    delay: 1.4,
    label: {
      en: "Saudi Arabia & UAE",
      fr: "Arabie Saoudite & EAU",
      ar: "السعودية والإمارات",
      ru: "Сауд. Аравия и ОАЭ",
    },
  },
  {
    id: "asia",
    x: 622,
    y: 258,
    labelX: 658,
    labelY: 230,
    delay: 2.1,
    label: {
      en: "India & Asia",
      fr: "Inde & Asie",
      ar: "الهند وآسيا",
      ru: "Индия и Азия",
    },
  },
  {
    id: "east-africa",
    x: 378,
    y: 392,
    labelX: 416,
    labelY: 422,
    delay: 2.8,
    label: {
      en: "East Africa",
      fr: "Afrique de l'Est",
      ar: "شرق أفريقيا",
      ru: "Вост. Африка",
    },
  },
  {
    id: "west-africa",
    x: 248,
    y: 356,
    labelX: 194,
    labelY: 386,
    delay: 3.5,
    label: {
      en: "West Africa",
      fr: "Afrique de l'Ouest",
      ar: "غرب أفريقيا",
      ru: "Зап. Африка",
    },
  },
];

function arcPath(a: { x: number; y: number }, b: { x: number; y: number }) {
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const dist = Math.hypot(dx, dy);
  const lift = Math.min(72, dist * 0.28);
  const nx = -dy / (dist || 1);
  const ny = dx / (dist || 1);
  const sign = b.x < a.x ? 1 : -1;
  return `M ${a.x} ${a.y} Q ${mx + nx * lift * sign} ${my + ny * lift * sign} ${b.x} ${b.y}`;
}

export default function WorldMapRoutes({
  hubLabel = "EGYPT",
  lang = "en",
}: {
  labels?: string[];
  hubLabel?: string;
  lang?: Lang;
}) {
  return (
    <div
      className="relative h-full w-full overflow-hidden bg-[oklch(0.22_0.04_170)]"
      style={{ transform: "translateZ(0)", willChange: "transform" }}
    >
      <svg
        viewBox="0 0 800 560"
        preserveAspectRatio="xMidYMid meet"
        className="h-full w-full"
        role="img"
        aria-label={hubLabel}
      >
        <defs>
          <linearGradient id="wm-bg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="oklch(0.25 0.045 174)" />
            <stop offset="55%" stopColor="oklch(0.20 0.038 166)" />
            <stop offset="100%" stopColor="oklch(0.17 0.04 158)" />
          </linearGradient>

          <linearGradient id="wm-land" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.36 0.055 162)" stopOpacity="0.92" />
            <stop offset="100%" stopColor="oklch(0.28 0.048 164)" stopOpacity="0.88" />
          </linearGradient>

          <linearGradient id="wm-route" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="oklch(0.84 0.14 90)" stopOpacity="0.95" />
            <stop offset="100%" stopColor="oklch(0.76 0.16 155)" stopOpacity="0.95" />
          </linearGradient>

          <radialGradient id="wm-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="oklch(0.84 0.14 90)" stopOpacity="0.5" />
            <stop offset="100%" stopColor="oklch(0.84 0.14 90)" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect width="800" height="560" fill="url(#wm-bg)" />

        {/* Subtle latitude / longitude grid */}
        <g opacity="0.1" stroke="oklch(0.88 0.05 160)" strokeWidth="0.7">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <line key={`h${i}`} x1="0" y1={i * 80} x2="800" y2={i * 80} />
          ))}
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <line key={`v${i}`} x1={i * 90} y1="0" x2={i * 90} y2="560" />
          ))}
        </g>

        {/* Recognizable Eastern Hemisphere landmasses (UK/Europe, Russia/Asia, Middle East, Africa) */}
        <g fill="url(#wm-land)" stroke="oklch(0.62 0.09 158)" strokeOpacity="0.4" strokeWidth="1.2" strokeLinejoin="round">
          {/* Great Britain & Ireland */}
          <path d="M198,116 L214,110 L218,136 L202,148 L192,138 Z" />
          {/* Iberia & Western/Central/Southern Europe */}
          <path d="M174,174 L216,154 L268,138 L314,142 L344,166 L338,196 L306,204 L286,216 L256,202 L222,208 L184,202 Z" />
          {/* Scandinavia */}
          <path d="M276,84 L322,68 L342,96 L316,126 L278,118 Z" />
          {/* Russia & Eurasia */}
          <path d="M336,142 L352,76 L456,54 L592,64 L682,92 L696,158 L628,194 L558,196 L486,182 L416,188 L352,182 Z" />
          {/* Arabian Peninsula & Levant (Middle East) */}
          <path d="M368,218 L428,212 L462,248 L478,284 L438,314 L394,296 L364,254 Z" />
          {/* South & Southeast Asia (India / Asia corridor) */}
          <path d="M498,198 L586,204 L668,214 L718,248 L692,312 L646,326 L608,292 L582,316 L546,274 L512,244 Z" />
          {/* Africa continent */}
          <path d="M204,242 L292,232 L356,246 L386,296 L418,342 L396,422 L356,492 L314,492 L292,418 L244,376 L196,356 L184,298 Z" />
        </g>

        {/* Highlight Egypt territory shape cleanly */}
        <path
          d="M334,242 L364,244 L368,280 L334,280 Z"
          fill="oklch(0.76 0.13 85)"
          fillOpacity="0.28"
          stroke="oklch(0.86 0.14 90)"
          strokeWidth="1.5"
        />

        {/* Concrete Sea & Air Shipping Corridors from Egypt */}
        {CORRIDORS.map((c) => {
          const p = arcPath(HUB, c);
          const text = c.label[lang] || c.label.en;
          const isRtlText = /[\u0600-\u06FF]/.test(text);
          const boxW = Math.max(92, text.length * 7.2 + 22);
          return (
            <g key={c.id}>
              {/* Always-visible base route line */}
              <path
                d={p}
                fill="none"
                stroke="url(#wm-route)"
                strokeWidth="2.2"
                strokeDasharray="6 5"
                strokeLinecap="round"
                opacity="0.72"
              />
              {/* Animated moving shipping pulse */}
              <path
                d={p}
                fill="none"
                stroke="oklch(0.9 0.14 90)"
                strokeWidth="2.8"
                strokeLinecap="round"
                strokeDasharray="12 180"
              >
                <animate
                  attributeName="stroke-dashoffset"
                  from="192"
                  to="0"
                  dur="3.4s"
                  begin={`${c.delay}s`}
                  repeatCount="indefinite"
                />
              </path>
              <circle r="3.4" fill="oklch(0.92 0.14 90)">
                <animateMotion dur="3.4s" begin={`${c.delay}s`} repeatCount="indefinite" path={p} />
              </circle>

              {/* Destination port/market node */}
              <circle cx={c.x} cy={c.y} r="4.5" fill="oklch(0.86 0.14 90)" />
              <circle cx={c.x} cy={c.y} r="8" fill="none" stroke="oklch(0.86 0.14 90)" strokeWidth="1.2" opacity="0.65">
                <animate attributeName="r" values="5;12;5" dur="3.2s" begin={`${c.delay}s`} repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.7;0.1;0.7" dur="3.2s" begin={`${c.delay}s`} repeatCount="indefinite" />
              </circle>

              {/* Crisp high-contrast destination badge */}
              <g transform={`translate(${c.labelX}, ${c.labelY})`}>
                <rect
                  x={-boxW / 2}
                  y={-12}
                  width={boxW}
                  height={24}
                  rx={12}
                  fill="oklch(0.15 0.04 166 / 0.92)"
                  stroke="oklch(0.82 0.13 85 / 0.55)"
                  strokeWidth="1"
                />
                <text
                  x={0}
                  y={4}
                  textAnchor="middle"
                  fill="oklch(0.96 0.02 150)"
                  style={{
                    font: "600 11px Cairo, Inter, sans-serif",
                    letterSpacing: isRtlText ? "0" : "0.02em",
                  }}
                >
                  {text}
                </text>
              </g>
            </g>
          );
        })}

        {/* Egypt origin hub marker */}
        <circle cx={HUB.x} cy={HUB.y} r="48" fill="url(#wm-glow)">
          <animate attributeName="r" values="34;52;34" dur="3.8s" repeatCount="indefinite" />
        </circle>
        <circle cx={HUB.x} cy={HUB.y} r="7" fill="oklch(0.88 0.15 88)" stroke="oklch(0.18 0.04 166)" strokeWidth="2" />
        <circle cx={HUB.x} cy={HUB.y} r="13" fill="none" stroke="oklch(0.88 0.15 88)" strokeWidth="1.5" opacity="0.85" />
        <g transform={`translate(${HUB.x}, ${HUB.y + 26})`}>
          <rect
            x={-40}
            y={-11}
            width={80}
            height={22}
            rx={11}
            fill="oklch(0.82 0.14 88)"
          />
          <text
            x={0}
            y={4}
            textAnchor="middle"
            fill="oklch(0.18 0.04 160)"
            style={{
              font: "800 11px Cairo, Inter, sans-serif",
              letterSpacing: /[\u0600-\u06FF]/.test(hubLabel) ? "0" : "0.1em",
            }}
          >
            {hubLabel}
          </text>
        </g>
      </svg>
    </div>
  );
}
