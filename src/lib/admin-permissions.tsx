import { createContext, useContext } from "react";

import { supabase } from "@/integrations/supabase/client";
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

export function emptyPermission(module_key: string): ModulePermission {
  return { module_key, can_view: false, can_create: false, can_edit: false, can_delete: false };
}

export async function isSuperAdmin(userId: string): Promise<boolean> {
  const { data } = await supabase.rpc("is_super_admin", { _user_id: userId });
  return Boolean(data);
}

export async function fetchPermissions(userId: string): Promise<PermissionMap> {
  const { data } = await supabase
    .from("user_permissions")
    .select("module_key, can_view, can_create, can_edit, can_delete")
    .eq("user_id", userId);
  const map: PermissionMap = {};
  for (const row of data ?? []) map[row.module_key] = row as ModulePermission;
  return map;
}

export async function savePermissions(userId: string, perms: ModulePermission[]) {
  const rows = perms.map((p) => ({ ...p, user_id: userId }));
  const { error } = await supabase
    .from("user_permissions")
    .upsert(rows, { onConflict: "user_id,module_key" });
  return error?.message ?? null;
}

export async function listAdminUsers(): Promise<AdminUserRow[]> {
  const [{ data: profiles }, { data: roles }] = await Promise.all([
    supabase.from("profiles").select("id, email, full_name").order("created_at"),
    supabase.from("user_roles").select("user_id, role"),
  ]);
  return (profiles ?? []).map((p) => ({
    id: p.id,
    email: p.email ?? "",
    full_name: p.full_name ?? "",
    isSuperAdmin: (roles ?? []).some((r) => r.user_id === p.id && r.role === "super_admin"),
    isAdmin: (roles ?? []).some((r) => r.user_id === p.id && r.role === "admin"),
  }));
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
