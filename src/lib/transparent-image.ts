// Client-side white-background removal so logos can sit on any backdrop.
import { useEffect, useState } from "react";

/** Returns a data URL of `src` with near-white pixels made transparent. */
export async function makeWhiteTransparent(src: string, threshold = 238): Promise<string | null> {
  try {
    const img = new Image();
    img.crossOrigin = "anonymous";
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("load failed"));
      img.src = src;
    });

    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0);

    const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const px = data.data;
    for (let i = 0; i < px.length; i += 4) {
      const r = px[i];
      const g = px[i + 1];
      const b = px[i + 2];
      if (r >= threshold && g >= threshold && b >= threshold) {
        px[i + 3] = 0;
      } else {
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        // Soften the halo around the removed white area.
        if (max >= threshold - 24 && max - min < 14) {
          px[i + 3] = Math.round(px[i + 3] * ((threshold - max) / 24));
        }
      }
    }
    ctx.putImageData(data, 0, 0);
    return canvas.toDataURL("image/png");
  } catch {
    return null;
  }
}

/** Hook version: falls back to the original URL if processing fails. */
export function useTransparentLogo(src: string | null): string | null {
  const [out, setOut] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    if (!src) {
      setOut(null);
      return;
    }
    setOut(src);
    makeWhiteTransparent(src).then((res) => {
      if (alive && res) setOut(res);
    });
    return () => {
      alive = false;
    };
  }, [src]);

  return out;
}
