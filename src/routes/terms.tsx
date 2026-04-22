import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicShell } from "@/components/PublicShell";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Algemene Voorwaarden — Adcure Agency" },
      { name: "description", content: "Algemene voorwaarden van Adcure Agency." },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <PublicShell width="wide">
      <article className="prose prose-invert max-w-none rounded-2xl border border-border bg-card/60 p-8 shadow-card">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Algemene Voorwaarden</h1>
        <p className="mt-2 text-sm text-muted-foreground">Laatst bijgewerkt: 22 april 2026</p>
        <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted-foreground">
          <p>Welkom bij Adcure Agency. Door gebruik te maken van onze diensten ga je akkoord met deze voorwaarden.</p>
          <h2 className="mt-6 text-lg font-semibold text-foreground">1. Diensten</h2>
          <p>Adcure biedt beheer van advertentie-accounts en wallet-services voor zakelijke klanten in de Europese Unie.</p>
          <h2 className="mt-6 text-lg font-semibold text-foreground">2. Account & Verificatie</h2>
          <p>Om te kunnen starten verifiëren we je KVK- en BTW-gegevens. We behouden ons het recht voor aanvragen te weigeren.</p>
          <h2 className="mt-6 text-lg font-semibold text-foreground">3. Betalingen</h2>
          <p>Top-ups worden direct verwerkt via iDEAL. Niet-gebruikte saldi kunnen binnen 30 dagen teruggestort worden.</p>
          <h2 className="mt-6 text-lg font-semibold text-foreground">4. Aansprakelijkheid</h2>
          <p>Adcure is niet aansprakelijk voor verliezen ten gevolge van platformwijzigingen door derden zoals Meta, Google of TikTok.</p>
        </div>
        <div className="mt-8 border-t border-border pt-6 text-sm">
          <Link to="/login" className="text-primary-glow hover:underline">← Terug naar inloggen</Link>
        </div>
      </article>
    </PublicShell>
  );
}
