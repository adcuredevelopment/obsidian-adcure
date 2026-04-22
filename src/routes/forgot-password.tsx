import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Mail, ArrowRight, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import { PublicShell } from "@/components/PublicShell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Wachtwoord vergeten — Adcure Agency" },
      {
        name: "description",
        content:
          "Reset het wachtwoord van je Adcure Agency account. Vraag een reset link aan via email.",
      },
      { property: "og:title", content: "Wachtwoord vergeten — Adcure Agency" },
      {
        property: "og:description",
        content: "Vraag een reset link aan voor je Adcure account.",
      },
    ],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const validate = (value: string): string | null => {
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value.trim()) return "Email is verplicht";
    if (!emailRe.test(value.trim())) return "Ongeldig email adres";
    return null;
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const next = validate(email);
    setError(next);
    setTouched(true);
    if (next) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 800));
    setSubmitting(false);
    setSubmitted(true);
  };

  return (
    <PublicShell>
      {/* Heading */}
      <div className="mb-6 text-center">
        <h1 className="text-balance text-3xl font-semibold tracking-tight text-foreground">
          {submitted ? "Check je inbox" : "Wachtwoord vergeten?"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {submitted
            ? "Als er een account bestaat, ontvang je een reset link"
            : "Vul je email in en we sturen je een reset link"}
        </p>
      </div>

        {submitted ? (
          <GlassCard glow className="p-8">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <CheckCircle2 className="h-6 w-6 text-primary-glow" />
              </div>
              <p className="mt-5 text-balance text-sm text-foreground">
                Als het email adres bij ons bekend is, ontvang je binnen enkele
                minuten een link om je wachtwoord opnieuw in te stellen.
              </p>
              <p className="mt-3 text-balance text-xs text-muted-foreground">
                Geen email ontvangen? Controleer je spam folder of probeer het
                opnieuw met een ander adres.
              </p>
              <Link
                to="/login"
                className="mt-7 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground underline-offset-4 hover:text-primary-glow hover:underline"
              >
                <ArrowLeft className="h-4 w-4" />
                Terug naar inloggen
              </Link>
            </div>
          </GlassCard>
        ) : (
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
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (touched) setError(validate(e.target.value));
                    }}
                    onBlur={() => {
                      setTouched(true);
                      setError(validate(email));
                    }}
                    aria-invalid={Boolean(error)}
                    className={cn(
                      "h-11 rounded-lg border-border bg-background/40 pl-9 text-sm placeholder:text-muted-foreground/60 focus-visible:ring-primary/40",
                      error && touched &&
                        "border-destructive/60 focus-visible:ring-destructive/40",
                    )}
                  />
                </div>
                {error && touched ? (
                  <p className="text-xs font-medium text-destructive">{error}</p>
                ) : null}
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="mt-6 h-11 w-full bg-gradient-to-r from-primary to-primary-glow text-primary-foreground shadow-glow transition hover:opacity-95 disabled:opacity-70"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Versturen…
                  </>
                ) : (
                  <>
                    Reset Wachtwoord
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>

              <div className="mt-7 flex items-center justify-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground underline-offset-4 hover:text-primary-glow hover:underline"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Terug naar inloggen
                </Link>
              </div>
            </GlassCard>
          </form>
        )}

      <p className="mt-6 text-balance text-center text-xs text-muted-foreground">
        {submitted
          ? "Voor je veiligheid bevestigen we niet of een email adres bij ons geregistreerd is."
          : "Beschermd door enterprise-grade encryptie."}
      </p>
    </PublicShell>
  );
}
