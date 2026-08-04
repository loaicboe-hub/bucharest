import { useEffect, useLayoutEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Leaf } from "lucide-react";
import { getLogoUrl } from "@/lib/admin-branding";
import { loadSiteSettings } from "@/lib/site-settings";

const SESSION_KEY = "nv_splash_seen";

/** Globe position inside the square brand logo, as fractions of the image. */
const GLOBE = { cx: 0.527, cy: 0.371, r: 0.086 };



function removeCover() {
  const cover = document.getElementById("splash-cover");
  if (cover) cover.style.display = "none";
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
  const [logo, setLogo] = useState<string | null>(null);
  const [bg, setBg] = useState("#ffffff");
  const [brand, setBrand] = useState("Nailvlora Import and Export");

  // Sample the logo's own corner pixel so the splash background matches it exactly.
  function syncBackground(img: HTMLImageElement) {
    try {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, 0, 0);
      const [r, g, b, a] = ctx.getImageData(1, 1, 1, 1).data;
      if (a < 10) return; // transparent logo: keep white
      setBg(`rgb(${r}, ${g}, ${b})`);
    } catch {
      /* cross-origin or unsupported: keep white */
    }
  }

  useEffect(() => {
    getLogoUrl().then(setLogo).catch(() => setLogo(null));
    loadSiteSettings()
      .then((s) => s.companyName && setBrand(s.companyName))
      .catch(() => undefined);
  }, []);


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
    const endTimer = window.setTimeout(() => dismiss(), 7400);

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
          className="fixed inset-0 z-[400] flex items-center justify-center"
          style={{ backgroundColor: bg }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
        >
          <motion.div
            className="flex h-full w-full items-center justify-center"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease }}
          >
            <motion.div
              className="flex h-full w-full shrink-0 items-center justify-center"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: [16, 0, -6, 0] }}
              transition={{
                opacity: { duration: 1.1, delay: 0.2, ease },
                y: { duration: 4.5, delay: 0.2, ease: "easeInOut", times: [0, 0.25, 0.6, 1] },
              }}
            >
              {logo ? (
                <motion.div
                  className="relative aspect-square h-full max-h-full max-w-full"
                  initial={{ scale: 1.2 }}
                  animate={{ scale: [1.2, 1.42, 1.35] }}
                  transition={{ scale: { duration: 5, ease: "easeInOut", times: [0, 0.6, 1] } }}
                >
                  {/* Left half slides in from the left */}
                  <motion.img
                    src={logo}
                    alt={`${brand} logo`}
                    crossOrigin="anonymous"
                    onLoad={(e) => syncBackground(e.currentTarget)}
                    className="absolute inset-0 h-full w-full object-contain"
                    style={{ clipPath: "inset(0 50% 0 0)" }}
                    initial={{ x: "-55%", opacity: 0, rotate: -4 }}
                    animate={{ x: 0, opacity: 1, rotate: 0 }}
                    transition={{ duration: 1.8, ease }}
                  />
                  {/* Right half slides in from the right */}
                  <motion.img
                    src={logo}
                    alt=""
                    aria-hidden
                    crossOrigin="anonymous"
                    className="absolute inset-0 h-full w-full object-contain"
                    style={{ clipPath: "inset(0 0 0 50%)" }}
                    initial={{ x: "55%", opacity: 0, rotate: 4 }}
                    animate={{ x: 0, opacity: 1, rotate: 0 }}
                    transition={{ duration: 1.8, ease }}
                  />

                  {/* Globe-only spin: a circular crop of the logo's earth sits
                      exactly on top of it and turns on its own axis. Only this
                      disc rotates in 3D — the rest of the logo stays still. */}
                  <motion.div
                    className="absolute overflow-hidden rounded-full"
                    style={{
                      left: `${(GLOBE.cx - GLOBE.r) * 100}%`,
                      top: `${(GLOBE.cy - GLOBE.r) * 100}%`,
                      width: `${GLOBE.r * 200}%`,
                      height: `${GLOBE.r * 200}%`,
                      backgroundImage: logo ? `url(${logo})` : undefined,
                      backgroundRepeat: "no-repeat",
                      backgroundSize: `${100 / (GLOBE.r * 2)}% ${100 / (GLOBE.r * 2)}%`,
                      backgroundPosition: `${((GLOBE.r - GLOBE.cx) / (2 * GLOBE.r - 1)) * 100}% ${((GLOBE.r - GLOBE.cy) / (2 * GLOBE.r - 1)) * 100}%`,
                      transformOrigin: "50% 50%",
                      transformPerspective: 800,
                      backfaceVisibility: "visible",
                      willChange: "transform",
                    }}
                    initial={{ opacity: 0, rotateY: 0 }}
                    animate={{ opacity: 1, rotateY: 360 }}
                    transition={{
                      opacity: { duration: 0.4, delay: 1.8 },
                      rotateY: { duration: 5, delay: 1.8, ease: "linear", repeat: Infinity },
                    }}
                  />

                </motion.div>




              ) : (
                <motion.div
                  animate={{ scale: [1, 1.12, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Leaf className="h-14 w-14 text-primary" />
                </motion.div>
              )}
            </motion.div>

          </motion.div>


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
