import { useState } from "react";
import { toast } from "sonner";
import { Loader2, ShieldCheck, Mail } from "lucide-react";
import { GradientBackground } from "@/components/animate-ui/backgrounds/gradient";
import { Sparkles } from "@/components/animate-ui/icons/sparkles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/lib/auth";
import { ApiError } from "@/lib/api";

export default function LoginPage() {
  const { login, verifyMfa, startEmailOtp, mfaPending } = useAuth();
  const [email, setEmail] = useState("admin@peoplehub.io");
  const [password, setPassword] = useState("Password123!");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await login(email, password);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Login failed");
    } finally {
      setBusy(false);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await verifyMfa(code.trim());
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Verification failed");
    } finally {
      setBusy(false);
    }
  }

  async function handleEmailOtp() {
    const otp = await startEmailOtp();
    toast.success(otp ? `Dev code: ${otp}` : "A code was sent to your email");
  }

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-background p-4">
      <GradientBackground className="absolute inset-0 bg-gradient-to-br from-primary/30 via-chart-2/20 to-chart-5/20" />
      <Card className="relative z-10 w-full max-w-sm shadow-xl">
        <CardHeader className="items-center text-center">
          <div className="mb-2 flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Sparkles className="size-6" animateOnHover />
          </div>
          <CardTitle className="text-xl">
            {mfaPending ? "Two-factor verification" : "Welcome to PeopleHub"}
          </CardTitle>
          <CardDescription>
            {mfaPending
              ? "Enter the 6-digit code from your authenticator, a backup code, or an emailed code."
              : "Sign in to your HRMS workspace."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!mfaPending ? (
            <form className="grid gap-4" onSubmit={handleLogin}>
              <div className="grid gap-2">
                <Label htmlFor="login-email">Email</Label>
                <Input id="login-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="login-password">Password</Label>
                <Input id="login-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <Button type="submit" disabled={busy}>
                {busy ? <Loader2 className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />}
                Sign in
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Demo users share the password <code className="font-mono">Password123!</code>
              </p>
            </form>
          ) : (
            <form className="grid gap-4" onSubmit={handleVerify}>
              <div className="grid gap-2">
                <Label htmlFor="mfa-code">Verification code</Label>
                <Input
                  id="mfa-code"
                  inputMode="text"
                  autoComplete="one-time-code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="123456 or ABCD-EF12"
                  required
                />
              </div>
              <Button type="submit" disabled={busy}>
                {busy ? <Loader2 className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />}
                Verify
              </Button>
              <Button type="button" variant="outline" onClick={handleEmailOtp}>
                <Mail className="size-4" /> Email me a code instead
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
