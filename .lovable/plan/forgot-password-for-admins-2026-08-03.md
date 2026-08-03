# Forgot Password for Admins

Let any admin reset their own password by email, without needing a Super Admin.

## What the user sees

1. On the admin login page, a "Forgot password?" link under the password field.
2. Clicking it opens a small form: enter your email, press "Send reset link".
3. A confirmation message appears ("If an account exists for that email, a reset link is on its way"), so the page never reveals which emails exist.
4. The emailed link opens a new page at `/reset-password` with "New password" and "Confirm password" fields (minimum 10 characters, must match).
5. On success, a toast confirms the change and the admin is sent to `/admin/dashboard` (already signed in from the recovery link).
6. Expired or already-used links show a clear "This reset link is invalid or has expired — request a new one" message with a link back to the login page.

Arabic/English admin labels follow the existing admin translation setup.

## Technical notes

- `src/lib/admin-auth.ts`: add `requestPasswordReset(email)` calling `supabase.auth.resetPasswordForEmail(email, { redirectTo: \`${window.location.origin}/reset-password\` })`, and `updatePassword(password)` calling `supabase.auth.updateUser({ password })`.
- `src/routes/admin.login.tsx`: add the "Forgot password?" toggle and the email-only reset form; always show a neutral success message.
- New public route `src/routes/reset-password.tsx` (top-level, not under `admin/_authed`, no auth gate). It waits for the Supabase recovery session via `onAuthStateChange` / `getSession`, then renders the new-password form; shows the invalid-link state when no recovery session arrives.
- Password rules match existing admin rules: minimum 10 characters, client-side validated before the call.
- Route `head()` with its own title/description for the new page.

## Email delivery

Reset emails currently go out through Lovable's default sender, since this project has no sender domain configured yet. That works, but the email comes from a generic Lovable address and can land in spam more often.

Optional follow-up (not part of this plan unless you want it): set up your own sending domain so reset emails come from your brand.
