import { createServerFn } from "@tanstack/react-start";

/**
 * Hostinger-only bootstrap is handled by the PHP/MySQL backend.
 */
export const claimFirstAdmin = createServerFn({ method: "POST" }).handler(async () => {
  throw new Error("Bootstrap endpoint disabled.");
});
