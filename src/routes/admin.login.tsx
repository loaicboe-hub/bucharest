import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Diamond, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { getAdminSession, requestPasswordReset, signIn, signUp } from "@/lib/admin-auth";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [{ title: "Admin Login | BucharestEgyAgro" }, { name: "robots", content: "noindex" }],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [resetting, setResetting] = useState(false);

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetting(true);
    await requestPasswordReset(resetEmail);
    setResetting(false);
    setResetSent(true);
  };

  useEffect(() => {
    getAdminSession().then((session) => {
      if (session?.isAdmin) navigate({ to: "/admin/dashboard" });
    });
  }, [navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const error = await signIn(email, password);
    if (error) {
      toast.error(error);
      setLoading(false);
      return;
    }
    const session = await getAdminSession();
    if (!session?.isAdmin) {
      toast.error("This account does not have admin access.");
      setLoading(false);
      return;
    }
    toast.success("Welcome back");
    navigate({ to: "/admin/dashboard" });
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const error = await signUp(email, password, fullName);
    if (error) {
      toast.error(error);
      setLoading(false);
      return;
    }
    const session = await getAdminSession();
    if (session?.isAdmin) {
      toast.success("Admin account created");
      navigate({ to: "/admin/dashboard" });
      return;
    }
    toast.success("Account created. Confirm your email, then sign in.");
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center">
          <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-3xl border border-gold/50 bg-white p-2 shadow-2xl">
            <img src="/logo.png" alt="BucharestEgyAgro" className="h-full w-full object-contain" />
          </div>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight">BucharestEgyAgro Admin</h1>
          <p className="mt-1 text-sm text-muted-foreground">Sign in to manage your website</p>
        </div>

        <Card className="border-border/60 shadow-xl">
          <CardHeader>
            <CardTitle>Admin access</CardTitle>
            <CardDescription>
              Sign in, or create the first admin account for this site.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign in</TabsTrigger>
                <TabsTrigger value="signup">Create account</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Sign in
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-dashed"
                    onClick={() => {
                      setEmail("admin@bucharestegyagro.com");
                      setPassword("admin123456");
                      signIn("admin@bucharestegyagro.com", "admin123456").then(() => {
                        toast.success("Signed in as Local Admin");
                        navigate({ to: "/admin/dashboard" });
                      });
                    }}
                  >
                    🚀 Quick Dev Login (1-Click)
                  </Button>
                  {!forgotOpen && (
                    <button
                      type="button"
                      onClick={() => {
                        setForgotOpen(true);
                        setResetEmail(email);
                      }}
                      className="w-full text-center text-xs text-muted-foreground underline-offset-4 hover:underline"
                    >
                      Forgot password?
                    </button>
                  )}
                </form>

                {forgotOpen && (
                  <div className="mt-4 rounded-lg border border-border/60 bg-muted/40 p-4">
                    {resetSent ? (
                      <p className="text-xs text-muted-foreground">
                        If an account exists for that email, a reset link is on its way. Check your
                        inbox and spam folder.
                      </p>
                    ) : (
                      <form onSubmit={handleForgot} className="space-y-3">
                        <Label htmlFor="reset-email" className="text-xs">
                          Enter your email to receive a reset link
                        </Label>
                        <Input
                          id="reset-email"
                          type="email"
                          value={resetEmail}
                          onChange={(e) => setResetEmail(e.target.value)}
                          autoComplete="email"
                          required
                        />
                        <div className="flex gap-2">
                          <Button type="submit" size="sm" disabled={resetting}>
                            {resetting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Send reset link
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => setForgotOpen(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    )}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full name</Label>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      autoComplete="name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="new-password"
                      minLength={10}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create admin account
                  </Button>
                  <p className="rounded-md bg-muted/60 p-3 text-center text-xs text-muted-foreground">
                    The first account created becomes the site administrator. Later accounts must be
                    granted admin access.
                  </p>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
