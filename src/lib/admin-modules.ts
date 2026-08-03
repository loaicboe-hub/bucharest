// Auto-discovers the admin panel modules from the router's registered routes.
// Any new page added under /admin/... automatically shows up in the
// permission manager — no code changes required.

import { adminDict, type AdminLang } from "./admin-i18n";

export type AdminModule = {
  key: string;
  path: string;
};

export const PERMISSION_ACTIONS = ["view", "create", "edit", "delete"] as const;
export type PermissionAction = (typeof PERMISSION_ACTIONS)[number];

// Pages that are not permission-controlled modules.
const EXCLUDED = new Set(["", "login", "users"]);

export function moduleKeyFromPath(pathname: string): string | null {
  if (!pathname.startsWith("/admin")) return null;
  const rest = pathname.slice("/admin".length).replace(/^\/+/, "");
  const first = rest.split("/")[0] ?? "";
  if (!first || first.startsWith("$")) return null;
  return first;
}

export function discoverModules(paths: string[]): AdminModule[] {
  const keys = new Set<string>();
  for (const p of paths) {
    if (!p.startsWith("/admin")) continue;
    const key = moduleKeyFromPath(p);
    if (!key || EXCLUDED.has(key)) continue;
    keys.add(key);
  }
  return [...keys].sort().map((key) => ({ key, path: `/admin/${key}` }));
}

export function moduleLabel(key: string, lang: AdminLang): string {
  const dict = adminDict[lang] as Record<string, string>;
  const fallback = adminDict.en as Record<string, string>;
  return (
    dict[`nav.${key}`] ??
    fallback[`nav.${key}`] ??
    key
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ")
  );
}
