import { useEffect, useLayoutEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const SESSION_KEY = "nv_splash_seen";

function removeCover() {
  const cover = document.getElementById("splash-cover");
  if (cover?.parentNode) cover.parentNode.removeChild(cover);
}

/**
 * Premium logo splash. Pure SVG + Framer Motion (no media files),
 * shown once per browser session, fully skippable.
 * Renders before the page paints (a static cover in the HTML shell
 * hides everything until this mounts).
 */
export function SplashScreen() {
  const [visible, setVisible] = useState(false);
  const [showSkip, setShowSkip] = useState(false);

  // Runs synchronously before the browser paints the hydrated page.
  useLayoutEffect(() => {
    let seen = true;
    try {
      seen = window.sessionStorage.getItem(SESSION_KEY) === "1";
    } catch {
      seen = false;
    }
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (seen || reduced) {
      try {
        window.sessionStorage.setItem(SESSION_KEY, "1");
      } catch {
        /* ignore */
      }
      removeCover();
      return;
    }
    setVisible(true);
  }, []);

  useEffect(() => {
    if (!visible) return;
    // Splash now paints over everything: drop the static cover.
    removeCover();
    document.body.style.overflow = "hidden";

    const skipTimer = window.setTimeout(() => setShowSkip(true), 1000);
    const endTimer = window.setTimeout(() => dismiss(), 5400);

    return () => {
      window.clearTimeout(skipTimer);
      window.clearTimeout(endTimer);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  function dismiss() {
    try {
      window.sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      /* ignore */
    }
    document.body.style.overflow = "";
    removeCover();
    setVisible(false);
  }


  const ease = [0.65, 0, 0.35, 1] as const;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="splash"
          role="presentation"
          className="fixed inset-0 z-[200] flex items-center justify-center bg-white"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
        >
          <svg
            viewBox="0 0 400 280"
            className="w-[78vw] max-w-[520px] sm:w-[62vw] md:w-[46vw]"
            style={{ willChange: "transform, opacity" }}
          >
            <defs>
              <linearGradient id="nvGlobe" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#6f9c4a" />
                <stop offset="100%" stopColor="#2f5d2f" />
              </linearGradient>
              <linearGradient id="nvGold" x1="0" y1="1" x2="1" y2="0">
                <stop offset="0%" stopColor="#c99a3c" />
                <stop offset="100%" stopColor="#e6c46a" />
              </linearGradient>
              <clipPath id="nvGlobeClip">
                <circle cx="252" cy="74" r="32" />
              </clipPath>
              <clipPath id="nvWordClip">
                <motion.rect
                  x="30"
                  y="180"
                  height="60"
                  initial={{ width: 0 }}
                  animate={{ width: 340 }}
                  transition={{ duration: 1.1, delay: 3.0, ease }}
                />
              </clipPath>
            </defs>

            {/* 5. The large N (painted under the globe) */}
            <motion.text
              x="196"
              y="166"
              textAnchor="middle"
              fontFamily='"Playfair Display", Georgia, serif'
              fontSize="150"
              fontWeight="700"
              fill="#1E4620"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, delay: 2.0, ease }}
              style={{ transformOrigin: "196px 120px" }}
            >
              N
            </motion.text>

            {/* 2. Globe — fades in and rotates */}
            <motion.g
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.0, ease }}
              style={{ transformOrigin: "252px 74px" }}
            >
              <circle cx="252" cy="74" r="32" fill="#ffffff" />
              <g clipPath="url(#nvGlobeClip)">
                <motion.g
                  animate={{ x: [-64, 0] }}
                  transition={{ duration: 6.5, ease: "linear", repeat: Infinity }}
                >
                  {[0, 64, 128].map((dx) => (
                    <g key={dx} transform={`translate(${dx - 128} -22) scale(0.7)`}>
                      <path
                        d="M172 66c10-6 22-4 30 2s2 14-6 16-14 8-8 14 18 2 20 12-10 16-20 12-14-14-26-12"
                        fill="url(#nvGlobe)"
                        opacity="0.95"
                        transform="translate(140 20)"
                      />
                      <path
                        d="M212 62c14-4 26 2 30 12s-6 16-4 26 10 18 4 26-18 6-24-2-4-20-10-28-10-28 4-34z"
                        fill="url(#nvGlobe)"
                        opacity="0.95"
                        transform="translate(140 20)"
                      />
                    </g>
                  ))}
                </motion.g>
                {[-24, -12, 0, 12, 24].map((o) => (
                  <ellipse
                    key={o}
                    cx="252"
                    cy="74"
                    rx={Math.max(4, 32 - Math.abs(o) * 1.15)}
                    ry="32"
                    fill="none"
                    stroke="#2f5d2f"
                    strokeOpacity="0.18"
                  />
                ))}
                <line x1="220" y1="74" x2="284" y2="74" stroke="#2f5d2f" strokeOpacity="0.18" />
              </g>
              <circle cx="252" cy="74" r="32" fill="none" stroke="#2f5d2f" strokeOpacity="0.35" />
            </motion.g>

            {/* 3. Green ring drawn around the globe */}
            <motion.circle
              cx="252"
              cy="74"
              r="44"
              fill="none"
              stroke="#1E4620"
              strokeWidth="5"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.0, delay: 0.7, ease }}
              transform="rotate(-90 252 74)"
            />

            {/* 4. Golden arrow drawn around the globe */}
            <motion.g initial="hidden" animate="shown" transition={{ delayChildren: 1.5 }}>
              <motion.path
                d="M206 118c14 16 38 22 60 14 24-9 38-30 40-56"
                fill="none"
                stroke="url(#nvGold)"
                strokeWidth="6"
                strokeLinecap="round"
                variants={{ hidden: { pathLength: 0 }, shown: { pathLength: 1 } }}
                transition={{ duration: 1.1, ease }}
              />
              <motion.path
                d="M292 84l14 6 10-14"
                fill="none"
                stroke="url(#nvGold)"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
                variants={{ hidden: { opacity: 0, scale: 0.6 }, shown: { opacity: 1, scale: 1 } }}
                transition={{ duration: 0.45, delay: 0.95, ease }}
                style={{ transformOrigin: "304px 82px" }}
              />
            </motion.g>

            {/* 6. Leaf growing on the left stem */}
            <motion.g
              initial={{ opacity: 0, scale: 0.2, rotate: -25 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.95, delay: 2.55, ease }}
              style={{ transformOrigin: "142px 132px" }}
            >
              <path d="M142 132c-2-18 12-34 34-36 2 20-12 36-34 36z" fill="#3d7a33" />
              <path
                d="M142 132c6-16 22-28 42-31"
                fill="none"
                stroke="#1E4620"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </motion.g>

            {/* 7. Wordmark revealed left → right */}
            <g clipPath="url(#nvWordClip)">
              <text
                x="200"
                y="222"
                textAnchor="middle"
                fontFamily='"Playfair Display", Georgia, serif'
                fontSize="56"
                fontWeight="700"
                fill="#1E4620"
              >
                Nail
                <tspan fill="#c99a3c">vlora</tspan>
              </text>
            </g>


            {/* 8. Subtitle */}
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 3.9, ease: "easeInOut" }}
            >
              <line x1="60" y1="244" x2="112" y2="244" stroke="#c99a3c" strokeWidth="1.5" />
              <text
                x="200"
                y="249"
                textAnchor="middle"
                fontFamily='"Inter", system-ui, sans-serif'
                fontSize="15"
                letterSpacing="4"
                fill="#1E4620"
              >
                IMPORT AND EXPORT
              </text>
              <line x1="288" y1="244" x2="340" y2="244" stroke="#c99a3c" strokeWidth="1.5" />
            </motion.g>
          </svg>

          {showSkip && (
            <motion.button
              type="button"
              onClick={dismiss}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="absolute bottom-8 right-6 rounded-full border border-border px-4 py-2 text-xs font-medium tracking-[0.15em] text-muted-foreground transition-colors hover:text-foreground sm:bottom-10 sm:right-10"
            >
              SKIP
            </motion.button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default SplashScreen;
