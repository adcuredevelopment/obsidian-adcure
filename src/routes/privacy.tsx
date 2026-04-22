import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicShell } from "@/components/PublicShell";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacybeleid — Adcure Agency" },
      { name: "description", content: "Privacybeleid van Adcure Agency." },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <PublicShell width="wide">
      <article className="prose prose-invert max-w-none rounded-2xl border border-border bg-card/60 p-8 shadow-card">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Privacybeleid</h1>
        <p className="mt-2 text-sm text-muted-foreground">Laatst bijgewerkt: 22 april 2026</p>
        <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted-foreground">
          <p>Adcure Agency respecteert je privacy en verwerkt persoonsgegevens conform de AVG.</p>
          <h2 className="mt-6 text-lg font-semibold text-foreground">1. Welke gegevens verzamelen we?</h2>
          <p>Bedrijfsgegevens (KVK, BTW, IBAN), contactgegevens (naam, email, telefoon) en gebruiksdata van het platform.</p>
          <h2 className="mt-6 text-lg font-semibold text-foreground">2. Doel van verwerking</h2>
          <p>Voor identiteitsverificatie, facturatie, support en het leveren van onze diensten.</p>
          <h2 className="mt-6 text-lg font-semibold text-foreground">3. Bewaartermijn</h2>
          <p>Gegevens worden bewaard zolang je een account hebt en daarna 7 jaar voor wettelijke administratieplicht.</p>
          <h2 className="mt-6 text-lg font-semibold text-foreground">4. Jouw rechten</h2>
          <p>Je hebt recht op inzage, correctie en verwijdering. Stuur een verzoek naar privacy@adcure.agency.</p>
        </div>
        <div className="mt-8 border-t border-border pt-6 text-sm">
          <Link to="/login" className="text-primary-glow hover:underline">← Terug naar inloggen</Link>
        </div>
      </article>
    </PublicShell>
  );
}
