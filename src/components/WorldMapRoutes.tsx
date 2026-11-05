type Dest = { x: number; y: number; label?: string; delay: number };

// Egypt — export hub
const HUB = { x: 548, y: 232 };

const DESTS: Dest[] = [
  { x: 432, y: 120, delay: 0 },    // UK / North Europe
  { x: 486, y: 143, delay: 0.6 },  // Central Europe
  { x: 604, y: 214, delay: 1.2 },  // Gulf / Middle East
  { x: 664, y: 236, delay: 1.8 },  // India
  { x: 726, y: 176, delay: 2.4 },  // East Asia
  { x: 722, y: 288, delay: 3.0 },  // SE Asia
  { x: 468, y: 282, delay: 3.6 },  // West Africa
  { x: 522, y: 352, delay: 4.2 },  // Southern Africa
];

function arcPath(a: { x: number; y: number }, b: { x: number; y: number }) {
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const dist = Math.hypot(dx, dy);
  // lift the control point perpendicular to the segment for a flight-path arc
  const lift = Math.min(120, dist * 0.42);
  const nx = -dy / (dist || 1);
  const ny = dx / (dist || 1);
  const sign = b.x < a.x ? -1 : 1;
  return `M ${a.x} ${a.y} Q ${mx + nx * lift * sign} ${my + ny * lift * sign} ${b.x} ${b.y}`;
}

export default function WorldMapRoutes({ labels = [] as string[] }) {
  return (
    <div
      className="relative h-full w-full overflow-hidden bg-[oklch(0.24_0.035_170)]"
      style={{ transform: "translateZ(0)", willChange: "transform" }}
    >
      <svg viewBox="0 0 900 450" preserveAspectRatio="xMidYMid slice" className="h-full w-full" style={{ transform: "translateZ(0)" }}>
        <defs>
          <linearGradient id="wm-bg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="oklch(0.27 0.04 175)" />
            <stop offset="55%" stopColor="oklch(0.22 0.035 168)" />
            <stop offset="100%" stopColor="oklch(0.19 0.04 158)" />
          </linearGradient>

          <linearGradient id="wm-arc" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="oklch(0.75 0.13 85)" stopOpacity="0.15" />
            <stop offset="50%" stopColor="oklch(0.8 0.16 155)" stopOpacity="0.95" />
            <stop offset="100%" stopColor="oklch(0.75 0.13 85)" stopOpacity="0.35" />
          </linearGradient>

          <pattern id="wm-dots" x="0" y="0" width="7" height="7" patternUnits="userSpaceOnUse">
            <circle cx="1.6" cy="1.6" r="1.35" fill="oklch(0.86 0.09 158)" opacity="0.55" />
          </pattern>

          <radialGradient id="wm-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="oklch(0.82 0.16 155)" stopOpacity="0.55" />
            <stop offset="100%" stopColor="oklch(0.82 0.16 155)" stopOpacity="0" />
          </radialGradient>

          <mask id="wm-continents">
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

        <rect width="900" height="450" fill="url(#wm-bg)" />

        {/* faint latitude/longitude grid */}
        <g opacity="0.12" stroke="oklch(0.9 0.06 160)" strokeWidth="0.6">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <line key={`h${i}`} x1="0" y1={i * 56 + 28} x2="900" y2={i * 56 + 28} />
          ))}
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => (
            <line key={`v${i}`} x1={i * 75 + 37} y1="0" x2={i * 75 + 37} y2="450" />
          ))}
        </g>

        {/* topographic dotted landmasses */}
        <rect width="900" height="450" fill="url(#wm-dots)" mask="url(#wm-continents)" />

        {/* flight paths */}
        {DESTS.map((d, i) => {
          const p = arcPath(HUB, d);
          return (
            <g key={i}>
              <path d={p} fill="none" stroke="oklch(0.8 0.16 155)" strokeWidth="1" opacity="0.3" />
              <path
                d={p}
                fill="none"
                stroke="url(#wm-arc)"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeDasharray="10 190"
              >
                <animate
                  attributeName="stroke-dashoffset"
                  from="200"
                  to="0"
                  dur="3.2s"
                  begin={`${d.delay}s`}
                  repeatCount="indefinite"
                />
              </path>

              {/* travelling shipment pulse */}
              <circle r="3.2" fill="oklch(0.86 0.14 95)">
                <animateMotion dur="3.2s" begin={`${d.delay}s`} repeatCount="indefinite" path={p} />
                <animate
                  attributeName="opacity"
                  values="0;1;1;0"
                  dur="3.2s"
                  begin={`${d.delay}s`}
                  repeatCount="indefinite"
                />
              </circle>

              {/* destination node */}
              <circle cx={d.x} cy={d.y} r="3" fill="oklch(0.86 0.09 158)" opacity="0.9" />
              <circle cx={d.x} cy={d.y} r="6" fill="none" stroke="oklch(0.8 0.16 155)" strokeWidth="1" opacity="0.5">
                <animate attributeName="r" values="4;11;4" dur="3.2s" begin={`${d.delay}s`} repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.6;0;0.6" dur="3.2s" begin={`${d.delay}s`} repeatCount="indefinite" />
              </circle>
            </g>
          );
        })}

        {/* Egypt hub */}
        <circle cx={HUB.x} cy={HUB.y} r="60" fill="url(#wm-glow)">
          <animate attributeName="r" values="42;72;42" dur="4s" repeatCount="indefinite" />
        </circle>
        <circle cx={HUB.x} cy={HUB.y} r="6" fill="oklch(0.86 0.14 95)" />
        <circle cx={HUB.x} cy={HUB.y} r="12" fill="none" stroke="oklch(0.86 0.14 95)" strokeWidth="1.4" opacity="0.8" />
        <text
          x={HUB.x}
          y={HUB.y + 30}
          textAnchor="middle"
          fill="oklch(0.92 0.05 100)"
          style={{ font: "700 12px Inter, sans-serif", letterSpacing: "0.12em" }}
        >
          EGYPT
        </text>

        {/* region labels */}
        {labels.slice(0, 4).map((l, i) => {
          const pos = [
            { x: 462, y: 92 },
            { x: 626, y: 178 },
            { x: 500, y: 392 },
            { x: 706, y: 128 },
          ][i];
          if (!pos) return null;
          return (
            <text
              key={l}
              x={pos.x}
              y={pos.y}
              textAnchor="middle"
              fill="oklch(0.88 0.06 158)"
              opacity="0.85"
              style={{ font: "600 11px Inter, sans-serif", letterSpacing: "0.1em" }}
            >
              {l}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
