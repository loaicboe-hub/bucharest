import { createFileRoute, Link } from "@tanstack/react-router";
import { Diamond } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  component: ResetPasswordPage,
  head: () => ({
    meta: [
      { title: "Reset your password | BucharestEgyAgro" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
            <Diamond className="h-7 w-7" />
          </div>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight">Reset your password</h1>
        </div>

        <Card className="border-border/60 shadow-xl">
          <CardHeader>
            <CardTitle>Password reset</CardTitle>
            <CardDescription>Use the Hostinger admin panel to manage admin passwords.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Password reset is managed through the Hostinger MySQL backend and admin account setup. Please use the admin panel or your Hostinger database user tools to update credentials.
            </p>
            <Button asChild className="w-full">
              <Link to="/admin/login">Back to sign in</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
