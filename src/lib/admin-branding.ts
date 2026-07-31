// Local-storage backed brand logo store (data URL).
// Replace with Lovable Cloud storage when backend integration begins.

const KEY = "fd_brand_logo";

export function loadLogo(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function saveLogo(dataUrl: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, dataUrl);
}

export function clearLogo() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
