import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Loader2,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Mail,
  RefreshCw,
} from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import { PublicShell } from "@/components/PublicShell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/verify-email")({
  head: () => ({
    meta: [
      { title: "Email verifiëren — Adcure Agency" },
      {
        name: "description",
        content:
          "Verifieer je email adres om je Adcure Agency account te activeren.",
      },
      { property: "og:title", content: "Email verifiëren — Adcure Agency" },
      {
        property: "og:description",
        content: "Activeer je Adcure account door je email te verifiëren.",
      },
    ],
  }),
  validateSearch: (search: Record<string, unknown>) => ({
    token: typeof search.token === "string" ? search.token : undefined,
  }),
  component: VerifyEmailPage,
});

type Status = "loading" | "success" | "error";

function VerifyEmailPage() {
  const navigate = useNavigate();
  const { token } = Route.useSearch();
  const [status, setStatus] = useState<Status>("loading");
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(() => {
      if (cancelled) return;
      // Mock: any token containing "expired" or no token at all = error
      const expired = !token || /expired|invalid/i.test(token);
      setStatus(expired ? "error" : "success");
    }, 1400);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [token]);

  useEffect(() => {
    if (status !== "success") return;
    const t = setTimeout(() => {
      navigate({ to: "/login" });
    }, 2200);
    return () => clearTimeout(t);
  }, [status, navigate]);

  const requestNew = async () => {
    setResending(true);
    await new Promise((r) => setTimeout(r, 800));
    setResending(false);
    setResent(true);
  };

  return (
    <PublicShell>
      {/* Heading */}
      <div className="mb-6 text-center">
        <h1 className="text-balance text-3xl font-semibold tracking-tight text-foreground">
          {status === "loading" && "Email verifiëren…"}
          {status === "success" && "Email geverifieerd"}
          {status === "error" && "Link is verlopen"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {status === "loading" && "Even geduld terwijl we je link controleren"}
          {status === "success" && "Je wordt doorgestuurd naar de inlogpagina…"}
          {status === "error" && "Deze verificatielink is niet meer geldig"}
        </p>
      </div>

        <GlassCard glow className="p-8">
          {status === "loading" && (
            <div className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Loader2 className="h-6 w-6 animate-spin text-primary-glow" />
              </div>
              <p className="mt-5 text-sm text-foreground">
                Bezig met verifiëren van je email
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                Dit duurt slechts een paar seconden.
              </p>
            </div>
          )}

          {status === "success" && (
            <div className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/15 ring-1 ring-success/30">
                <CheckCircle2 className="h-6 w-6 text-success" />
              </div>
              <p className="mt-5 text-sm text-foreground">
                Je email adres is succesvol geverifieerd
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                Je account is nu actief. Een moment, we sturen je door…
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
          )}

          {status === "error" && (
            <div className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/15 ring-1 ring-destructive/30">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <p className="mt-5 text-balance text-sm text-foreground">
                {resent
                  ? "We hebben een nieuwe verificatielink verstuurd"
                  : "De verificatielink is verlopen of al gebruikt"}
              </p>
              <p className="mt-2 text-balance text-xs text-muted-foreground">
                {resent
                  ? "Check je inbox en klik op de nieuwe link om je email te verifiëren."
                  : "Vraag een nieuwe link aan om je email adres te verifiëren."}
              </p>

              {!resent && (
                <Button
                  type="button"
                  onClick={requestNew}
                  disabled={resending}
                  className="mt-6 h-11 w-full bg-gradient-to-r from-primary to-primary-glow text-primary-foreground shadow-glow transition hover:opacity-95 disabled:opacity-70"
                >
                  {resending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Versturen…
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4" />
                      Nieuwe link aanvragen
                    </>
                  )}
                </Button>
              )}

              {resent && (
                <div className="mt-6 inline-flex items-center gap-2 rounded-lg border border-border bg-background/40 px-3 py-2 text-xs text-muted-foreground">
                  <Mail className="h-3.5 w-3.5 text-primary-glow" />
                  Check je inbox voor de nieuwe link
                </div>
              )}

              <Link
                to="/login"
                className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground underline-offset-4 hover:text-primary-glow hover:underline"
              >
                Terug naar inloggen
              </Link>
            </div>
          )}
        </GlassCard>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Beschermd door enterprise-grade encryptie.
      </p>
    </PublicShell>
  );
}
