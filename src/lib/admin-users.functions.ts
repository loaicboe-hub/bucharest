import { createServerFn } from "@tanstack/react-start";

const DISABLED_MSG = "Admin user management is protected and handled via authenticated Hostinger API.";

export const listAdminUsersFn = createServerFn({ method: "POST" }).handler(async () => {
  throw new Error(DISABLED_MSG);
});

export const createAdminUser = createServerFn({ method: "POST" })
  .inputValidator((input: { email: string; password: string; fullName: string; superAdmin?: boolean }) => input)
  .handler(async () => {
    throw new Error(DISABLED_MSG);
  });

export const deleteAdminUser = createServerFn({ method: "POST" })
  .inputValidator((input: { userId: string }) => input)
  .handler(async () => {
    throw new Error(DISABLED_MSG);
  });

export const setAdminUserPassword = createServerFn({ method: "POST" })
  .inputValidator((input: { userId: string; password: string }) => input)
  .handler(async () => {
    throw new Error(DISABLED_MSG);
  });

export const setSuperAdmin = createServerFn({ method: "POST" })
  .inputValidator((input: { userId: string; value: boolean }) => input)
  .handler(async () => {
    throw new Error(DISABLED_MSG);
  });
