import { createServerFn } from "@tanstack/react-start";

export const listAdminUsersFn = createServerFn({ method: "POST" }).handler(async () => [
  {
    id: "admin-1",
    email: "admin@bucharestegyagro.com",
    full_name: "Super Administrator",
    isSuperAdmin: true,
    isAdmin: true,
  },
]);

export const createAdminUser = createServerFn({ method: "POST" })
  .inputValidator((input: { email: string; password: string; fullName: string; superAdmin?: boolean }) => {
    const email = String(input.email ?? "").trim().toLowerCase();
    const password = String(input.password ?? "");
    if (!email.includes("@")) throw new Error("A valid email is required");
    if (password.length < 8) throw new Error("Password must be at least 8 characters");
    return { email, password, fullName: String(input.fullName ?? "").trim(), superAdmin: Boolean(input.superAdmin) };
  })
  .handler(async () => ({ id: `user-${Date.now()}` }));

export const deleteAdminUser = createServerFn({ method: "POST" })
  .inputValidator((input: { userId: string }) => ({ userId: String(input.userId) }))
  .handler(async () => ({ ok: true }));

export const setAdminUserPassword = createServerFn({ method: "POST" })
  .inputValidator((input: { userId: string; password: string }) => {
    const password = String(input.password ?? "");
    if (password.length < 8) throw new Error("Password must be at least 8 characters");
    return { userId: String(input.userId), password };
  })
  .handler(async () => ({ ok: true }));

export const setSuperAdmin = createServerFn({ method: "POST" })
  .inputValidator((input: { userId: string; value: boolean }) => ({
    userId: String(input.userId),
    value: Boolean(input.value),
  }))
  .handler(async () => ({ ok: true }));
