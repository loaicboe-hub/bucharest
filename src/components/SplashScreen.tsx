import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const SESSION_KEY = "nv_splash_seen";

/**
 * Premium logo splash. Pure SVG + Framer Motion (no media files),
 * shown once per browser session, fully skippable.
 */
export function SplashScreen() {
  const [visible, setVisible] = useState(false);
  const [showSkip, setShowSkip] = useState(false);

  useEffect(() => {
    let seen = true;
    try {
      seen = window.sessionStorage.getItem(SESSION_KEY) === "1";
    } catch {
      seen = false;
    }
    if (seen) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      try {
        window.sessionStorage.setItem(SESSION_KEY, "1");
      } catch {
        /* ignore */
      }
      return;
    }

    setVisible(true);
    document.body.style.overflow = "hidden";

    const skipTimer = window.setTimeout(() => setShowSkip(true), 1000);
    const endTimer = window.setTimeout(() => dismiss(), 2900);

    return () => {
      window.clearTimeout(skipTimer);
      window.clearTimeout(endTimer);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function dismiss() {
    try {
      window.sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      /* ignore */
    }
    document.body.style.overflow = "";
    setVisible(false);
  }

  const ease = [0.22, 1, 0.36, 1] as const;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="splash"
          aria-hidden="true"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-white"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.45, ease: "easeInOut" } }}
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
                <circle cx="212" cy="96" r="46" />
              </clipPath>
              <clipPath id="nvWordClip">
                <motion.rect
                  x="40"
                  y="180"
                  height="60"
                  initial={{ width: 0 }}
                  animate={{ width: 330 }}
                  transition={{ duration: 0.6, delay: 1.75, ease }}
                />
              </clipPath>
            </defs>

            {/* 2. Globe — fades in and rotates */}
            <motion.g
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease }}
              style={{ transformOrigin: "212px 96px" }}
            >
              <circle cx="212" cy="96" r="46" fill="#ffffff" />
              <g clipPath="url(#nvGlobeClip)">
                <motion.g
                  animate={{ x: [-92, 0] }}
                  transition={{ duration: 3.4, ease: "linear", repeat: Infinity }}
                >
                  {[0, 92, 184].map((dx) => (
                    <g key={dx} transform={`translate(${dx - 92} 0)`}>
                      <path
                        d="M172 66c10-6 22-4 30 2s2 14-6 16-14 8-8 14 18 2 20 12-10 16-20 12-14-14-26-12"
                        fill="url(#nvGlobe)"
                        opacity="0.95"
                      />
                      <path
                        d="M212 62c14-4 26 2 30 12s-6 16-4 26 10 18 4 26-18 6-24-2-4-20-10-28-10-28 4-34z"
                        fill="url(#nvGlobe)"
                        opacity="0.95"
                      />
                    </g>
                  ))}
                </motion.g>
                {[-30, -15, 0, 15, 30].map((o) => (
                  <ellipse
                    key={o}
                    cx="212"
                    cy="96"
                    rx={Math.max(6, 46 - Math.abs(o) * 1.3)}
                    ry="46"
                    fill="none"
                    stroke="#2f5d2f"
                    strokeOpacity="0.18"
                  />
                ))}
                <line x1="166" y1="96" x2="258" y2="96" stroke="#2f5d2f" strokeOpacity="0.18" />
              </g>
              <circle cx="212" cy="96" r="46" fill="none" stroke="#2f5d2f" strokeOpacity="0.35" />
            </motion.g>

            {/* 3. Green ring drawn around the globe */}
            <motion.circle
              cx="208"
              cy="96"
              r="62"
              fill="none"
              stroke="#1E4620"
              strokeWidth="5"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.55, delay: 0.35, ease }}
              transform="rotate(-90 208 96)"
            />

            {/* 4. Golden arrow drawn around the globe */}
            <motion.g
              initial="hidden"
              animate="shown"
              transition={{ delayChildren: 0.85 }}
            >
              <motion.path
                d="M136 158c34 26 78 20 106-6 20-19 32-40 40-62"
                fill="none"
                stroke="url(#nvGold)"
                strokeWidth="6"
                strokeLinecap="round"
                variants={{ hidden: { pathLength: 0 }, shown: { pathLength: 1 } }}
                transition={{ duration: 0.65, ease }}
              />
              <motion.path
                d="M263 84l19 6 3-20"
                fill="none"
                stroke="url(#nvGold)"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
                variants={{ hidden: { opacity: 0, scale: 0.6 }, shown: { opacity: 1, scale: 1 } }}
                transition={{ duration: 0.25, delay: 0.55, ease }}
                style={{ transformOrigin: "276px 78px" }}
              />
            </motion.g>

            {/* 5. The large N */}
            <motion.text
              x="150"
              y="140"
              textAnchor="middle"
              fontFamily='"Playfair Display", Georgia, serif'
              fontSize="118"
              fontWeight="700"
              fill="#1E4620"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 1.15, ease }}
              style={{ transformOrigin: "150px 110px" }}
            >
              N
            </motion.text>

            {/* 6. Leaf growing */}
            <motion.g
              initial={{ opacity: 0, scale: 0.2, rotate: -25 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.55, delay: 1.45, ease }}
              style={{ transformOrigin: "108px 122px" }}
            >
              <path
                d="M108 122c0-16 14-30 34-30 0 20-14 34-34 34z"
                fill="#3d7a33"
              />
              <path
                d="M108 122c6-16 22-26 40-26"
                fill="none"
                stroke="#1E4620"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </motion.g>

            {/* 7. Wordmark revealed left → right */}
            <g clipPath="url(#nvWordClip)">
              <text
                x="46"
                y="222"
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
              transition={{ duration: 0.4, delay: 2.2, ease: "easeOut" }}
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
