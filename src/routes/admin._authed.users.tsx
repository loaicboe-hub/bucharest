import { useMemo, useState } from "react";
import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { KeyRound, Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useAdminLang } from "@/lib/admin-i18n";
import {
  PERMISSION_ACTIONS,
  discoverModules,
  moduleLabel,
  type PermissionAction,
} from "@/lib/admin-modules";
import {
  emptyPermission,
  fetchPermissions,
  listAdminUsers,
  savePermissions,
  type ModulePermission,
} from "@/lib/admin-permissions";
import {
  createAdminUser,
  deleteAdminUser,
  setAdminUserPassword,
  setSuperAdmin,
} from "@/lib/admin-users.functions";

export const Route = createFileRoute("/admin/_authed/users")({
  beforeLoad: ({ context }) => {
    if (!context.isSuper) throw redirect({ to: "/admin/dashboard" });
  },
  component: UsersPage,
  head: () => ({
    meta: [{ title: "Users & Permissions | Nailvlora Admin" }],
  }),
});

function UsersPage() {
  const { t, lang } = useAdminLang();
  const router = useRouter();
  const qc = useQueryClient();

  const modules = useMemo(() => {
    const ids = Object.keys((router as unknown as { routesById: Record<string, unknown> }).routesById);
    return discoverModules(ids.map((id) => id.replace("/_authed", "")));
  }, [router]);


  const usersQuery = useQuery({ queryKey: ["admin-users"], queryFn: listAdminUsers });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const activeId = selectedId ?? usersQuery.data?.[0]?.id ?? null;
  const activeUser = usersQuery.data?.find((u) => u.id === activeId) ?? null;

  const permsQuery = useQuery({
    queryKey: ["admin-user-permissions", activeId],
    queryFn: () => fetchPermissions(activeId!),
    enabled: Boolean(activeId),
  });

  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", fullName: "", superAdmin: false });

  const createFn = useServerFn(createAdminUser);
  const deleteFn = useServerFn(deleteAdminUser);
  const passwordFn = useServerFn(setAdminUserPassword);
  const superFn = useServerFn(setSuperAdmin);

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!form.email.includes("@")) throw new Error("A valid email is required");
      if (form.password.length < 10) throw new Error("Password must be at least 10 characters");
      return createFn({ data: form });
    },
    onSuccess: () => {
      toast.success("User created");
      setAddOpen(false);
      setForm({ email: "", password: "", fullName: "", superAdmin: false });
      qc.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const togglePermission = async (moduleKey: string, action: PermissionAction, value: boolean) => {
    if (!activeId) return;
    const current = permsQuery.data?.[moduleKey] ?? emptyPermission(moduleKey);
    const next: ModulePermission = {
      ...current,
      can_view: action === "view" ? value : current.can_view || value,
      can_create: action === "create" ? value : current.can_create,
      can_edit: action === "edit" ? value : current.can_edit,
      can_delete: action === "delete" ? value : current.can_delete,
    };
    if (action === "view" && !value) {
      next.can_create = false;
      next.can_edit = false;
      next.can_delete = false;
    }
    const error = await savePermissions(activeId, [next]);
    if (error) {
      toast.error(error);
      return;
    }
    await qc.invalidateQueries({ queryKey: ["admin-user-permissions", activeId] });
    toast.success(t("users.saved"));
  };

  const handleDelete = async (userId: string) => {
    if (!window.confirm("Delete this user permanently?")) return;
    try {
      await deleteFn({ data: { userId } });
      setSelectedId(null);
      await qc.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("User deleted");
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const handlePassword = async (userId: string) => {
    const password = window.prompt("New password (min 10 characters)");
    if (!password) return;
    if (password.length < 10) {
      toast.error("Password must be at least 10 characters");
      return;
    }
    try {
      await passwordFn({ data: { userId, password } });
      toast.success("Password updated");
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const handleSuper = async (userId: string, value: boolean) => {
    try {
      await superFn({ data: { userId, value } });
      await qc.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success(value ? "Super admin granted" : "Super admin removed");
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <div>
      <PageHeader
        title={t("nav.users")}
        description={t("users.desc")}
        actions={
          <Button onClick={() => setAddOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" /> {t("users.add")}
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Users</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {usersQuery.isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : (
              (usersQuery.data ?? []).map((u) => (
                <button
                  key={u.id}
                  onClick={() => setSelectedId(u.id)}
                  className={`w-full rounded-lg border p-3 text-start transition ${
                    u.id === activeId ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-medium">{u.full_name || u.email}</span>
                    {u.isSuperAdmin && <Badge variant="secondary">{t("users.superAdmin")}</Badge>}
                  </div>
                  <span className="truncate text-xs text-muted-foreground">{u.email}</span>
                </button>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
            <CardTitle className="text-base">
              {activeUser ? `${t("users.permissions")} — ${activeUser.email}` : t("users.permissions")}
            </CardTitle>
            {activeUser && (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={activeUser.isSuperAdmin}
                    onCheckedChange={(v) => handleSuper(activeUser.id, v)}
                    id="super"
                  />
                  <Label htmlFor="super" className="text-xs">
                    {t("users.superAdmin")}
                  </Label>
                </div>
                <Button variant="outline" size="sm" onClick={() => handlePassword(activeUser.id)}>
                  <KeyRound className="h-4 w-4" />
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(activeUser.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {!activeUser ? (
              <p className="text-sm text-muted-foreground">Select a user to manage permissions.</p>
            ) : activeUser.isSuperAdmin ? (
              <p className="text-sm text-muted-foreground">
                Super admins have full access to every module.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-xs uppercase text-muted-foreground">
                      <th className="p-2 text-start">Module</th>
                      {PERMISSION_ACTIONS.map((a) => (
                        <th key={a} className="p-2 text-center">
                          {a}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {modules.map((m) => {
                      const p = permsQuery.data?.[m.key] ?? emptyPermission(m.key);
                      return (
                        <tr key={m.key} className="border-b last:border-0">
                          <td className="p-2 font-medium">{moduleLabel(m.key, lang)}</td>
                          {PERMISSION_ACTIONS.map((a) => {
                            const checked =
                              a === "view"
                                ? p.can_view
                                : a === "create"
                                  ? p.can_create
                                  : a === "edit"
                                    ? p.can_edit
                                    : p.can_delete;
                            return (
                              <td key={a} className="p-2 text-center">
                                <Checkbox
                                  checked={checked}
                                  disabled={a !== "view" && !p.can_view}
                                  onCheckedChange={(v) => togglePermission(m.key, a, Boolean(v))}
                                />
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("users.add")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input
                id="fullName"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password (min 10 characters)</Label>
              <Input
                id="password"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="newSuper"
                checked={form.superAdmin}
                onCheckedChange={(v) => setForm({ ...form, superAdmin: v })}
              />
              <Label htmlFor="newSuper">{t("users.superAdmin")}</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>
              {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("users.add")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
