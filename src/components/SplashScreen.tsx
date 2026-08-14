import { useEffect, useLayoutEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Leaf } from "lucide-react";
import { getCachedLogoUrl, getLogoUrl } from "@/lib/admin-branding";
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
  const [logo, setLogo] = useState<string | null>(() => getCachedLogoUrl());
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
    getLogoUrl().then((u) => setLogo((prev) => (u && u !== prev ? u : prev))).catch(() => undefined);

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


  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="splash"
          role="presentation"
          className="fixed inset-0 z-[400] flex items-center justify-center overflow-hidden"
          style={{ backgroundColor: bg }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.9, ease: "easeInOut" } }}
        >
          {/* Cinematic camera zoom: one continuous scale from far-away to full size. */}
          <motion.div
            key={logo ?? "fallback"}
            className="flex h-full w-full items-center justify-center"
            style={{
              willChange: "transform, opacity",
              transform: "translateZ(0)",
            }}
            initial={{ scale: 0.02, opacity: 0, filter: "blur(10px)" }}
            animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
            transition={{
              duration: 5.5,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {logo ? (
              <img
                src={logo}
                alt={`${brand} logo`}
                crossOrigin="anonymous"
                onLoad={(e) => syncBackground(e.currentTarget)}
                className="h-full w-full object-contain"
                style={{ transform: "translateZ(0)" }}
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
