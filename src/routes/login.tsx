import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login — Adcure Agency" },
      {
        name: "description",
        content: "Log in op je Adcure Agency account om je ad accounts en wallets te beheren.",
      },
      { property: "og:title", content: "Welkom terug — Adcure Agency" },
      {
        property: "og:description",
        content: "Log in op je Adcure account.",
      },
    ],
  }),
  component: LoginPage,
});

type FormState = {
  email: string;
  password: string;
  remember: boolean;
};

type FormErrors = Partial<Record<"email" | "password", string>>;

function validate(values: FormState): FormErrors {
  const errors: FormErrors = {};
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!values.email.trim()) {
    errors.email = "Email is verplicht";
  } else if (!emailRe.test(values.email.trim())) {
    errors.email = "Ongeldig email adres";
  }
  if (!values.password) {
    errors.password = "Wachtwoord is verplicht";
  } else if (values.password.length < 6) {
    errors.password = "Minimaal 6 tekens";
  }
  return errors;
}

function LoginPage() {
  const [values, setValues] = useState<FormState>({
    email: "",
    password: "",
    remember: true,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<"email" | "password", boolean>>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setValues((prev) => {
      const next = { ...prev, [key]: value };
      if (Object.keys(errors).length) {
        setErrors(validate(next));
      }
      return next;
    });
  };

  const handleBlur = (key: "email" | "password") => {
    setTouched((prev) => ({ ...prev, [key]: true }));
    setErrors(validate(values));
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const next = validate(values);
    setErrors(next);
    setTouched({ email: true, password: true });
    if (Object.keys(next).length > 0) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 800));
    setSubmitting(false);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background px-4 py-12">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[480px] gradient-glow opacity-80" />
      <div className="relative mx-auto w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="mb-7 flex flex-col items-center gap-3">
          <div className="relative flex h-12 w-12 items-center justify-center rounded-xl gradient-primary shadow-glow">
            <svg viewBox="0 0 24 24" className="h-6 w-6 text-white" fill="currentColor">
              <path d="M12 3 L21 20 L3 20 Z" />
            </svg>
          </div>
          <div className="text-center">
            <div className="text-sm font-semibold tracking-tight text-foreground">
              Adcure
            </div>
            <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Agency
            </div>
          </div>
        </div>

        {/* Heading */}
        <div className="mb-6 text-center">
          <h1 className="text-balance text-3xl font-semibold tracking-tight text-foreground">
            Welkom terug
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Log in op je Adcure account
          </p>
        </div>

        <form onSubmit={onSubmit} noValidate>
          <GlassCard glow className="p-8">
            {/* Email */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
              >
                Email
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="jan@bedrijf.nl"
                  value={values.email}
                  onChange={(e) => setField("email", e.target.value)}
                  onBlur={() => handleBlur("email")}
                  aria-invalid={Boolean(errors.email)}
                  className={cn(
                    "h-11 rounded-lg border-border bg-background/40 pl-9 text-sm placeholder:text-muted-foreground/60 focus-visible:ring-primary/40",
                    errors.email && touched.email &&
                      "border-destructive/60 focus-visible:ring-destructive/40",
                  )}
                />
              </div>
              {errors.email && touched.email ? (
                <p className="text-xs font-medium text-destructive">{errors.email}</p>
              ) : null}
            </div>

            {/* Password */}
            <div className="mt-6 space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
                >
                  Wachtwoord
                </label>
                <Link
                  to="/forgot-password"
                  className="text-[11px] font-medium text-muted-foreground underline-offset-4 hover:text-primary-glow hover:underline"
                >
                  Vergeten?
                </Link>
              </div>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={values.password}
                  onChange={(e) => setField("password", e.target.value)}
                  onBlur={() => handleBlur("password")}
                  aria-invalid={Boolean(errors.password)}
                  className={cn(
                    "h-11 rounded-lg border-border bg-background/40 pl-9 pr-10 text-sm placeholder:text-muted-foreground/60 focus-visible:ring-primary/40",
                    errors.password && touched.password &&
                      "border-destructive/60 focus-visible:ring-destructive/40",
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? "Verberg wachtwoord" : "Toon wachtwoord"}
                  className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition hover:bg-surface-elevated hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && touched.password ? (
                <p className="text-xs font-medium text-destructive">{errors.password}</p>
              ) : null}
            </div>

            {/* Remember me */}
            <div className="mt-6 flex items-center gap-3">
              <Checkbox
                id="remember"
                checked={values.remember}
                onCheckedChange={(c) => setField("remember", c === true)}
              />
              <label
                htmlFor="remember"
                className="text-sm text-muted-foreground"
              >
                Onthoud mij
              </label>
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="mt-6 h-11 w-full bg-gradient-to-r from-primary to-primary-glow text-primary-foreground shadow-glow transition hover:opacity-95 disabled:opacity-70"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Inloggen…
                </>
              ) : (
                <>
                  Inloggen
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>

            <div className="mt-7 flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                of
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <p className="mt-5 text-center text-sm text-muted-foreground">
              Nog geen account?{" "}
              <Link
                to="/sign-up"
                className="font-medium text-foreground underline-offset-4 hover:text-primary-glow hover:underline"
              >
                Aanmelden
              </Link>
            </p>
          </GlassCard>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Beschermd door enterprise-grade encryptie.
        </p>
      </div>
    </div>
  );
}
