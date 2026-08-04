import { useEffect, useLayoutEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Leaf } from "lucide-react";
import { getLogoUrl } from "@/lib/admin-branding";
import { loadSiteSettings } from "@/lib/site-settings";

const SESSION_KEY = "nv_splash_seen";


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
  const [brand, setBrand] = useState("Nailvlora Import and Export");

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
          className="fixed inset-0 z-[400] flex items-center justify-center bg-white"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
        >
          <motion.div
            className="flex flex-col items-center gap-6 px-8 text-center"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease }}
          >
            <motion.div
              className="grid h-32 w-32 shrink-0 place-items-center overflow-hidden rounded-[2rem] gradient-primary shadow-[var(--shadow-glow)] sm:h-40 sm:w-40"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.1, delay: 0.2, ease }}
            >
              {logo ? (
                <img
                  src={logo}
                  alt={`${brand} logo`}
                  className="h-full w-full scale-[1.5] object-contain p-0"
                />
              ) : (
                <Leaf className="h-14 w-14 text-white" />
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.0, delay: 1.0, ease }}
            >
              <div className="font-display text-3xl font-bold leading-none text-primary sm:text-4xl">
                {brand}
              </div>
              <div className="mt-3 text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
                Import and Export
              </div>
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
