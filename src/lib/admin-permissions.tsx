import { createContext, useContext } from "react";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";
import { apiAuth, type HostingerUser } from "./hostinger-api";
import type { PermissionAction } from "./admin-modules";

export type ModulePermission = {
  module_key: string;
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
};

export type PermissionMap = Record<string, ModulePermission>;

export type AdminUserRow = {
  id: string;
  email: string;
  full_name: string;
  isSuperAdmin: boolean;
  isAdmin: boolean;
};

const LOCAL_USERS_KEY = "app_admin_users_v2";
const LOCAL_PERMS_KEY = "app_user_permissions_v2";

const DEFAULT_USERS: AdminUserRow[] = [
  {
    id: "admin-1",
    email: "admin@bucharestegyagro.com",
    full_name: "Super Administrator",
    isSuperAdmin: true,
    isAdmin: true,
  },
];

function getLocalUsers(): AdminUserRow[] {
  if (typeof window === "undefined") return DEFAULT_USERS;
  try {
    const raw = localStorage.getItem(LOCAL_USERS_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(DEFAULT_USERS));
      return DEFAULT_USERS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_USERS;
  } catch {
    return DEFAULT_USERS;
  }
}

function setLocalUsers(users: AdminUserRow[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
  } catch {
    /* ignore */
  }
}

function getLocalPerms(userId: string): PermissionMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(`${LOCAL_PERMS_KEY}_${userId}`);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function setLocalPerms(userId: string, perms: PermissionMap) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`${LOCAL_PERMS_KEY}_${userId}`, JSON.stringify(perms));
  } catch {
    /* ignore */
  }
}

export function emptyPermission(module_key: string): ModulePermission {
  return { module_key, can_view: false, can_create: false, can_edit: false, can_delete: false };
}

export async function isSuperAdmin(userId: string): Promise<boolean> {
  const users = getLocalUsers();
  const user = users.find((u) => u.id === userId);
  if (user) return user.isSuperAdmin;
  if (!isSupabaseConfigured()) return true;
  try {
    const { data } = await supabase.rpc("is_super_admin", { _user_id: userId });
    return Boolean(data);
  } catch {
    return true;
  }
}

export async function fetchPermissions(userId: string): Promise<PermissionMap> {
  // 1. Try Hostinger API
  try {
    const hostingerPerms = await apiAuth.getPermissions(userId);
    if (Array.isArray(hostingerPerms)) {
      const map: PermissionMap = {};
      for (const row of hostingerPerms) {
        map[row.module_key] = {
          module_key: row.module_key,
          can_view: Boolean(Number(row.can_view)),
          can_create: Boolean(Number(row.can_create)),
          can_edit: Boolean(Number(row.can_edit)),
          can_delete: Boolean(Number(row.can_delete)),
        };
      }
      setLocalPerms(userId, map);
      return map;
    }
  } catch {
    /* fallback to local / supabase */
  }

  // 2. Try Supabase if configured
  if (isSupabaseConfigured()) {
    try {
      const { data } = await supabase
        .from("user_permissions")
        .select("module_key, can_view, can_create, can_edit, can_delete")
        .eq("user_id", userId);
      if (data && data.length > 0) {
        const map: PermissionMap = {};
        for (const row of data) map[row.module_key] = row as ModulePermission;
        setLocalPerms(userId, map);
        return map;
      }
    } catch {
      /* fallback to local */
    }
  }

  // 3. Fallback to localStorage
  return getLocalPerms(userId);
}

export async function savePermissions(userId: string, perms: ModulePermission[]): Promise<string | null> {
  // Always update localStorage immediately for instant reactive UI
  const currentMap = getLocalPerms(userId);
  for (const p of perms) {
    currentMap[p.module_key] = p;
  }
  setLocalPerms(userId, currentMap);

  // 1. Try Hostinger API
  try {
    await apiAuth.savePermissions(userId, perms);
  } catch {
    /* fallback */
  }

  // 2. Try Supabase if configured
  if (isSupabaseConfigured()) {
    try {
      const rows = perms.map((p) => ({ ...p, user_id: userId }));
      await supabase.from("user_permissions").upsert(rows, { onConflict: "user_id,module_key" });
    } catch {
      /* ignore */
    }
  }

  return null;
}

export async function listAdminUsers(): Promise<AdminUserRow[]> {
  // 1. Try Hostinger API
  try {
    const remote = await apiAuth.listUsers();
    if (Array.isArray(remote) && remote.length > 0) {
      const rows: AdminUserRow[] = remote.map((u: HostingerUser) => ({
        id: String(u.id),
        email: u.email,
        full_name: u.full_name || u.email.split("@")[0],
        isSuperAdmin: u.isSuperAdmin || u.role === "super_admin",
        isAdmin: true,
      }));
      setLocalUsers(rows);
      return rows;
    }
  } catch {
    /* fallback to local cache */
  }

  // 2. Try Supabase if configured
  if (isSupabaseConfigured()) {
    try {
      const { listAdminUsersFn } = await import("./admin-users.functions");
      const result = await listAdminUsersFn();
      if (Array.isArray(result) && result.length > 0) {
        setLocalUsers(result as AdminUserRow[]);
        return result as AdminUserRow[];
      }
    } catch {
      /* fallback to local */
    }
  }

  // 3. Return local users
  return getLocalUsers();
}

export async function createAdminUser(form: {
  email: string;
  password: string;
  fullName: string;
  superAdmin?: boolean;
}): Promise<{ id: string }> {
  const email = form.email.trim().toLowerCase();
  if (!email.includes("@")) throw new Error("A valid email address is required");
  if (!form.password || form.password.length < 8) {
    throw new Error("Password must be at least 8 characters");
  }

  let createdId = `user-${Date.now()}`;

  // 1. Try Hostinger API
  try {
    const res = await apiAuth.createUser({
      email,
      password: form.password,
      fullName: form.fullName.trim(),
      superAdmin: Boolean(form.superAdmin),
    });
    if (res?.id) createdId = String(res.id);
  } catch (err: any) {
    console.warn("[Hostinger API] Create user offline/failed:", err.message);
  }

  // 2. Try Supabase if configured
  if (isSupabaseConfigured()) {
    try {
      const { createAdminUser: createServerFnUser } = await import("./admin-users.functions");
      const res = await createServerFnUser({ data: form });
      if (res?.id) createdId = res.id;
    } catch {
      /* ignore */
    }
  }

  // 3. Store in localStorage
  const users = getLocalUsers();
  const existingIdx = users.findIndex((u) => u.email.toLowerCase() === email);
  const newUser: AdminUserRow = {
    id: createdId,
    email,
    full_name: form.fullName.trim() || email.split("@")[0],
    isSuperAdmin: Boolean(form.superAdmin),
    isAdmin: true,
  };

  if (existingIdx >= 0) {
    users[existingIdx] = newUser;
  } else {
    users.push(newUser);
  }
  setLocalUsers(users);

  return { id: createdId };
}

export async function deleteAdminUser(input: { userId: string }): Promise<{ ok: boolean }> {
  // 1. Try Hostinger API
  try {
    await apiAuth.deleteUser(input.userId);
  } catch (err: any) {
    console.warn("[Hostinger API] Delete user offline/failed:", err.message);
  }

  // 2. Try Supabase if configured
  if (isSupabaseConfigured()) {
    try {
      const { deleteAdminUser: deleteServerFnUser } = await import("./admin-users.functions");
      await deleteServerFnUser({ data: input });
    } catch {
      /* ignore */
    }
  }

  // 3. Update localStorage
  const users = getLocalUsers().filter((u) => u.id !== input.userId);
  setLocalUsers(users.length > 0 ? users : DEFAULT_USERS);

  return { ok: true };
}

export async function setAdminUserPassword(input: { userId: string; password: string }): Promise<{ ok: boolean }> {
  if (!input.password || input.password.length < 8) {
    throw new Error("Password must be at least 8 characters");
  }

  // 1. Try Hostinger API
  try {
    await apiAuth.setPassword(input.userId, input.password);
  } catch (err: any) {
    console.warn("[Hostinger API] Set password offline/failed:", err.message);
  }

  // 2. Try Supabase if configured
  if (isSupabaseConfigured()) {
    try {
      const { setAdminUserPassword: setPassServerFn } = await import("./admin-users.functions");
      await setPassServerFn({ data: input });
    } catch {
      /* ignore */
    }
  }

  return { ok: true };
}

export async function setSuperAdmin(input: { userId: string; value: boolean }): Promise<{ ok: boolean }> {
  // 1. Try Hostinger API
  try {
    await apiAuth.setRole(input.userId, input.value);
  } catch (err: any) {
    console.warn("[Hostinger API] Set role offline/failed:", err.message);
  }

  // 2. Try Supabase if configured
  if (isSupabaseConfigured()) {
    try {
      const { setSuperAdmin: setSuperServerFn } = await import("./admin-users.functions");
      await setSuperServerFn({ data: input });
    } catch {
      /* ignore */
    }
  }

  // 3. Update localStorage
  const users = getLocalUsers().map((u) => (u.id === input.userId ? { ...u, isSuperAdmin: input.value } : u));
  setLocalUsers(users);

  return { ok: true };
}

// ---- React context -------------------------------------------------------

type PermissionsCtx = {
  isSuper: boolean;
  permissions: PermissionMap;
};

const Ctx = createContext<PermissionsCtx>({ isSuper: false, permissions: {} });

export const PermissionsProvider = Ctx.Provider;

export function useAdminPermissions() {
  const ctx = useContext(Ctx);
  const can = (moduleKey: string, action: PermissionAction) => {
    if (ctx?.isSuper) return true;
    const p = ctx?.permissions?.[moduleKey];
    if (!p) return false;
    return action === "view" ? p.can_view : action === "create" ? p.can_create : action === "edit" ? p.can_edit : p.can_delete;
  };
  return { isSuper: Boolean(ctx?.isSuper), permissions: ctx?.permissions ?? {}, can };
}
