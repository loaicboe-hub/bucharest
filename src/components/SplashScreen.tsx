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


  const ease = [0.16, 0.7, 0.28, 1] as const;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="splash"
          role="presentation"
          className="fixed inset-0 z-[400] flex items-center justify-center overflow-hidden"
          style={{ backgroundColor: bg, perspective: 1400, perspectiveOrigin: "50% 50%" }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.9, ease: "easeInOut" } }}
        >
          {/* Camera dolly: the logo travels along Z from very far away toward the viewer. */}
          <motion.div
            className="flex h-full w-full items-center justify-center"
            style={{ transformStyle: "preserve-3d", willChange: "transform, filter, opacity" }}
            initial={{ z: -2600, opacity: 0, filter: "blur(14px)" }}
            animate={{
              z: [-2600, -900, -40, 0],
              opacity: [0, 0.45, 1, 1],
              filter: ["blur(14px)", "blur(6px)", "blur(0.5px)", "blur(0px)"],
            }}
            transition={{
              duration: 6,
              times: [0, 0.45, 0.86, 1],
              ease: [ease, ease, "easeOut"],
            }}
          >
            {logo ? (
              <motion.img
                src={logo}
                alt={`${brand} logo`}
                crossOrigin="anonymous"
                onLoad={(e) => syncBackground(e.currentTarget)}
                className="h-full w-full object-contain"
                initial={{ scale: 1.3 }}
                animate={{ scale: [1.3, 1.35, 1.35] }}
                transition={{ duration: 6, times: [0, 0.86, 1], ease: "easeOut" }}
              />
            ) : (
              <Leaf className="h-14 w-14 text-primary" />
            )}
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
