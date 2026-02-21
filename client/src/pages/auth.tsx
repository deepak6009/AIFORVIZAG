import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, ArrowRight, Loader2, ChevronLeft, Eye, EyeOff, Check } from "lucide-react";

export default function AuthPage() {
  const [, navigate] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const [mode, setMode] = useState<"login" | "register">(
    searchParams.get("mode") === "register" ? "register" : "login"
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login, register, isLoggingIn, isRegistering } = useAuth();
  const { toast } = useToast();

  const isPending = isLoggingIn || isRegistering;

  const passwordStrength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    try {
      if (mode === "login") {
        await login({ email: email.trim(), password });
      } else {
        await register({ email: email.trim(), password });
      }
      navigate("/");
    } catch (error: any) {
      const msg = error.message?.includes(":")
        ? error.message.split(":").slice(1).join(":").trim()
        : error.message;
      toast({ title: "Error", description: msg || "Something went wrong", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="px-4 sm:px-6 pt-5 sm:pt-6">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors group"
          data-testid="link-back-to-landing"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to home
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 pb-12">
        <div className="w-full max-w-[400px] space-y-7">
          <div className="flex flex-col items-center gap-3">
            <h1 className="text-3xl tracking-[0.02em] lowercase">
              <span className="font-light">the</span>
              <span className="font-extrabold">crew</span>
            </h1>
            <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-muted-foreground">
              Creator Editor Workspace
            </p>
          </div>

          <div className="rounded-2xl border bg-card p-6 sm:p-7 shadow-sm space-y-6">
            <div className="grid grid-cols-2 bg-muted/60 rounded-full p-1 relative" data-testid="auth-mode-toggle">
              <div
                className="absolute top-1 bottom-1 rounded-full bg-background shadow-sm transition-all duration-300 ease-out"
                style={{
                  width: "calc(50% - 4px)",
                  left: "4px",
                  transform: mode === "register" ? "translateX(calc(100% + 4px))" : "translateX(0)",
                }}
              />
              <button
                type="button"
                onClick={() => setMode("login")}
                className={`relative z-10 py-2.5 text-sm font-medium rounded-full text-center transition-colors duration-200 ${
                  mode === "login" ? "text-foreground" : "text-muted-foreground"
                }`}
                data-testid="toggle-sign-in"
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setMode("register")}
                className={`relative z-10 py-2.5 text-sm font-medium rounded-full text-center transition-colors duration-200 ${
                  mode === "register" ? "text-foreground" : "text-muted-foreground"
                }`}
                data-testid="toggle-sign-up"
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 h-11"
                    required
                    autoComplete="email"
                    data-testid="input-email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={mode === "register" ? "At least 6 characters" : "Enter your password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 pr-10 h-11"
                    required
                    minLength={6}
                    autoComplete={mode === "login" ? "current-password" : "new-password"}
                    data-testid="input-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {mode === "register" && password.length > 0 && (
                  <div className="flex items-center gap-1.5 pt-1">
                    {[1, 2, 3].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                          passwordStrength >= level
                            ? level === 1
                              ? "bg-red-400"
                              : level === 2
                              ? "bg-yellow-400"
                              : "bg-green-400"
                            : "bg-muted"
                        }`}
                      />
                    ))}
                    <span className="text-[10px] text-muted-foreground ml-1">
                      {passwordStrength === 1 ? "Weak" : passwordStrength === 2 ? "Good" : "Strong"}
                    </span>
                  </div>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-11 rounded-lg font-medium text-sm group"
                disabled={isPending}
                data-testid="button-submit-auth"
              >
                {isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <ArrowRight className="w-4 h-4 mr-2 group-hover:translate-x-0.5 transition-transform" />
                )}
                {mode === "login" ? "Sign In" : "Create Account"}
              </Button>
            </form>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            {mode === "login"
              ? "New here? Switch to Sign Up above to create an account."
              : "Already have an account? Switch to Sign In above."}
          </p>
        </div>
      </div>
    </div>
  );
}
