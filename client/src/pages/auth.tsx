import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Mail, Lock, ArrowRight, Loader2, ChevronLeft } from "lucide-react";

export default function AuthPage() {
  const [, navigate] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const [mode, setMode] = useState<"login" | "register">(
    searchParams.get("mode") === "register" ? "register" : "login"
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, register, isLoggingIn, isRegistering } = useAuth();
  const { toast } = useToast();

  const isPending = isLoggingIn || isRegistering;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    try {
      if (mode === "login") {
        await login({ email: email.trim(), password });
      } else {
        await register({ email: email.trim(), password });
      }
    } catch (error: any) {
      const msg = error.message?.includes(":")
        ? error.message.split(":").slice(1).join(":").trim()
        : error.message;
      toast({ title: "Error", description: msg || "Something went wrong", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:underline"
          data-testid="link-back-to-landing"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to home
        </button>
        <div className="flex flex-col items-center gap-2">
          <img src="/images/crew-mark.png" alt="thecrew" className="w-12 h-12" />
          <h1 className="text-2xl font-extrabold tracking-[0.08em] uppercase"><span className="text-muted-foreground font-semibold text-sm tracking-[0.12em] mr-0.5">the</span>crew</h1>
          <p className="text-[10px] font-medium tracking-[0.08em] uppercase text-muted-foreground -mt-1">
            Creator Editor Workspace
          </p>
          <p className="text-sm text-muted-foreground">
            {mode === "login" ? "Welcome back" : "Create your account"}
          </p>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">
              {mode === "login" ? "Sign In" : "Sign Up"}
            </CardTitle>
            <CardDescription>
              {mode === "login"
                ? "Enter your email and password to continue"
                : "Enter your email and password to get started"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9"
                    required
                    data-testid="input-email"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9"
                    required
                    minLength={6}
                    data-testid="input-password"
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={isPending}
                data-testid="button-submit-auth"
              >
                {isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <ArrowRight className="w-4 h-4 mr-2" />
                )}
                {mode === "login" ? "Sign In" : "Sign Up"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          {mode === "login" ? (
            <>
              Don't have an account?{" "}
              <button
                onClick={() => setMode("register")}
                className="text-primary font-medium hover:underline"
                data-testid="link-switch-to-register"
              >
                Sign Up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                onClick={() => setMode("login")}
                className="text-primary font-medium hover:underline"
                data-testid="link-switch-to-login"
              >
                Sign In
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
