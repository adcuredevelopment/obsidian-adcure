import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState, type FormEvent } from "react";
import {
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Check,
  X,
} from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import { PublicShell } from "@/components/PublicShell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/set-password")({
  head: () => ({
    meta: [
      { title: "Wachtwoord instellen — Adcure Agency" },
      {
        name: "description",
        content:
          "Stel je wachtwoord in om je Adcure Agency account te activeren na goedkeuring.",
      },
      { property: "og:title", content: "Wachtwoord instellen — Adcure Agency" },
      {
        property: "og:description",
        content: "Activeer je Adcure account door een veilig wachtwoord in te stellen.",
      },
    ],
  }),
  component: SetPasswordPage,
});

type Requirement = {
  id: string;
  label: string;
  test: (v: string) => boolean;
};

const REQUIREMENTS: Requirement[] = [
  { id: "len", label: "Minimaal 8 karakters", test: (v) => v.length >= 8 },
  { id: "upper", label: "Minimaal 1 hoofdletter", test: (v) => /[A-Z]/.test(v) },
  { id: "digit", label: "Minimaal 1 cijfer", test: (v) => /\d/.test(v) },
  {
    id: "special",
    label: "Minimaal 1 speciaal teken",
    test: (v) => /[^A-Za-z0-9]/.test(v),
  },
];

function SetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [touchedPwd, setTouchedPwd] = useState(false);
  const [touchedConfirm, setTouchedConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const checks = useMemo(
    () => REQUIREMENTS.map((r) => ({ ...r, ok: r.test(password) })),
    [password],
  );
  const passedCount = checks.filter((c) => c.ok).length;
  const allPassed = passedCount === REQUIREMENTS.length;
  const matches = confirm.length > 0 && confirm === password;
  const confirmError =
    touchedConfirm && confirm.length > 0 && confirm !== password
      ? "Wachtwoorden komen niet overeen"
      : null;

  const strengthLabel =
    passedCount <= 1 ? "Zwak" : passedCount === 2 ? "Matig" : passedCount === 3 ? "Goed" : "Sterk";
  const strengthColor =
    passedCount <= 1
      ? "bg-destructive"
      : passedCount === 2
        ? "bg-warning"
        : passedCount === 3
          ? "bg-primary"
          : "bg-success";

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setTouchedPwd(true);
    setTouchedConfirm(true);
    if (!allPassed || !matches) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 800));
    setSubmitting(false);
    setSuccess(true);
    setTimeout(() => {
      navigate({ to: "/login" });
    }, 1800);
  };

  return (
    <PublicShell>
      {/* Heading */}
      <div className="mb-6 text-center">
        <h1 className="text-balance text-3xl font-semibold tracking-tight text-foreground">
          {success ? "Wachtwoord ingesteld" : "Stel je wachtwoord in"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {success
            ? "Je wordt doorgestuurd naar de inlogpagina…"
            : "Welkom bij Adcure. Kies een sterk wachtwoord om je account te activeren."}
        </p>
      </div>

        {success ? (
          <GlassCard glow className="p-8">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/15 ring-1 ring-success/30">
                <CheckCircle2 className="h-6 w-6 text-success" />
              </div>
              <p className="mt-5 text-sm text-foreground">
                Je wachtwoord is succesvol ingesteld
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                Je kunt nu inloggen met je nieuwe wachtwoord.
              </p>
              <Button
                asChild
                className="mt-6 h-11 w-full bg-gradient-to-r from-primary to-primary-glow text-primary-foreground shadow-glow hover:opacity-95"
              >
                <Link to="/login">
                  Naar inloggen
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </GlassCard>
        ) : (
          <form onSubmit={onSubmit} noValidate>
            <GlassCard glow className="p-8">
              {/* New password */}
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
                >
                  Nieuw Wachtwoord
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPwd ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => setTouchedPwd(true)}
                    aria-invalid={touchedPwd && !allPassed}
                    className={cn(
                      "h-11 rounded-lg border-border bg-background/40 pl-9 pr-10 text-sm placeholder:text-muted-foreground/60 focus-visible:ring-primary/40",
                      touchedPwd && !allPassed &&
                        "border-destructive/60 focus-visible:ring-destructive/40",
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd((s) => !s)}
                    aria-label={showPwd ? "Verberg wachtwoord" : "Toon wachtwoord"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
                  >
                    {showPwd ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>

                {/* Strength meter */}
                {password.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <div className="flex h-1.5 gap-1">
                      {[0, 1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className={cn(
                            "h-full flex-1 rounded-full transition-colors",
                            i < passedCount ? strengthColor : "bg-border",
                          )}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between text-[11px] text-muted-foreground">
                      <span>Sterkte</span>
                      <span className="font-medium text-foreground">
                        {strengthLabel}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm password */}
              <div className="mt-6 space-y-2">
                <label
                  htmlFor="confirm"
                  className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
                >
                  Bevestig Wachtwoord
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="confirm"
                    type={showConfirm ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    onBlur={() => setTouchedConfirm(true)}
                    aria-invalid={Boolean(confirmError)}
                    className={cn(
                      "h-11 rounded-lg border-border bg-background/40 pl-9 pr-10 text-sm placeholder:text-muted-foreground/60 focus-visible:ring-primary/40",
                      confirmError &&
                        "border-destructive/60 focus-visible:ring-destructive/40",
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((s) => !s)}
                    aria-label={showConfirm ? "Verberg wachtwoord" : "Toon wachtwoord"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
                  >
                    {showConfirm ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {confirmError ? (
                  <p className="text-xs font-medium text-destructive">
                    {confirmError}
                  </p>
                ) : matches ? (
                  <p className="inline-flex items-center gap-1 text-xs font-medium text-success">
                    <Check className="h-3 w-3" />
                    Wachtwoorden komen overeen
                  </p>
                ) : null}
              </div>

              {/* Requirements */}
              <div className="mt-6 rounded-lg border border-border bg-background/30 p-4">
                <p className="mb-2.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Vereisten
                </p>
                <ul className="space-y-1.5">
                  {checks.map((c) => (
                    <li
                      key={c.id}
                      className="flex items-center gap-2 text-xs"
                    >
                      <span
                        className={cn(
                          "flex h-4 w-4 items-center justify-center rounded-full transition-colors",
                          c.ok
                            ? "bg-success/15 text-success"
                            : "bg-muted/40 text-muted-foreground",
                        )}
                      >
                        {c.ok ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <X className="h-3 w-3" />
                        )}
                      </span>
                      <span
                        className={cn(
                          "transition-colors",
                          c.ok ? "text-foreground" : "text-muted-foreground",
                        )}
                      >
                        {c.label}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <Button
                type="submit"
                disabled={submitting || !allPassed || !matches}
                className="mt-6 h-11 w-full bg-gradient-to-r from-primary to-primary-glow text-primary-foreground shadow-glow transition hover:opacity-95 disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Instellen…
                  </>
                ) : (
                  <>
                    Wachtwoord Instellen
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </GlassCard>
          </form>
        )}

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Beschermd door enterprise-grade encryptie.
      </p>
    </PublicShell>
  );
}
