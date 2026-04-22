import { requireRole } from "@/lib/auth-mock";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ClientShell } from "@/components/ClientShell";
import { GlassCard } from "@/components/GlassCard";
import {
  LifeBuoy,
  Send,
  ChevronDown,
  Mail,
  BookOpen,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/portal/support")({
  beforeLoad: () => requireRole("client"),
  head: () => ({
    meta: [
      { title: "Support — Adcure" },
      { name: "description", content: "Krijg hulp van het Adcure support team." },
    ],
  }),
  component: ClientSupportPage,
});

const FAQ = [
  {
    q: "Hoe lang duurt een top-up?",
    a: "Bankoverschrijvingen worden meestal binnen 30 minuten verwerkt nadat we je betaalbewijs hebben ontvangen. Buiten kantooruren kan dit langer duren.",
  },
  {
    q: "Hoe vraag ik een nieuw ad account aan?",
    a: "Ga naar 'Mijn Ad Accounts' en klik op 'Request New Account'. We verwerken je aanvraag binnen 24 uur.",
  },
  {
    q: "Wat doe ik bij een afgekeurde campagne?",
    a: "Open een ticket via het formulier hieronder. Vermeld het ad account en de campagne ID, dan kijken we mee.",
  },
  {
    q: "Kan ik geld terugkrijgen uit mijn wallet?",
    a: "Ja, ongebruikt saldo kan binnen 30 dagen worden teruggestort naar je IBAN. Vraag dit aan via support.",
  },
];

function ClientSupportPage() {
  const [submitted, setSubmitted] = useState(false);
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <ClientShell>
      <div className="animate-fade-in space-y-6">
        <header className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary shadow-glow">
            <LifeBuoy className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Support</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              We helpen je graag — gemiddelde reactietijd: 2 uur.
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Contact form */}
          <GlassCard className="!p-0 overflow-hidden">
            <div className="border-b border-border p-5">
              <h2 className="text-base font-semibold">Stuur een bericht</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">We reageren via email.</p>
            </div>
            <form onSubmit={onSubmit} className="space-y-4 p-5 sm:p-6">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Onderwerp</label>
                <select className="w-full rounded-lg border border-border bg-background/40 px-3 py-2 text-sm focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20">
                  <option>Algemene vraag</option>
                  <option>Top-up probleem</option>
                  <option>Account aanvraag</option>
                  <option>Factuur / betaling</option>
                  <option>Anders</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Bericht</label>
                <textarea
                  rows={6}
                  placeholder="Beschrijf je vraag of probleem zo specifiek mogelijk…"
                  className="w-full resize-none rounded-lg border border-border bg-background/40 px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="flex items-center justify-between">
                {submitted ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-success">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Bericht verzonden
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground">We sturen een kopie naar je email.</span>
                )}
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-lg gradient-primary px-3.5 py-2 text-sm font-semibold text-white shadow-glow transition hover:brightness-110"
                >
                  <Send className="h-4 w-4" /> Verstuur
                </button>
              </div>
            </form>
          </GlassCard>

          {/* Quick links */}
          <div className="space-y-4">
            <GlassCard>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary-glow ring-1 ring-inset ring-primary/25">
                  <Mail className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">Email support</p>
                  <p className="text-xs text-muted-foreground">support@adcure.agency</p>
                </div>
              </div>
            </GlassCard>
            <GlassCard>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet/15 text-violet ring-1 ring-inset ring-violet/25">
                  <BookOpen className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">Help docs</p>
                  <p className="text-xs text-muted-foreground">Antwoorden op veelgestelde vragen</p>
                </div>
                <a
                  href="https://help.adcure.agency"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium hover:bg-accent"
                >
                  Open <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </GlassCard>

            <GlassCard className="!p-0 overflow-hidden">
              <div className="border-b border-border p-5">
                <h2 className="text-base font-semibold">Veelgestelde vragen</h2>
              </div>
              <ul className="divide-y divide-border">
                {FAQ.map((f, i) => (
                  <li key={i}>
                    <button
                      onClick={() => setOpenIdx(openIdx === i ? null : i)}
                      className="flex w-full items-center justify-between gap-3 px-5 py-3 text-left text-sm hover:bg-background/40"
                    >
                      <span className="font-medium">{f.q}</span>
                      <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", openIdx === i && "rotate-180")} />
                    </button>
                    {openIdx === i && (
                      <p className="px-5 pb-4 text-xs text-muted-foreground">{f.a}</p>
                    )}
                  </li>
                ))}
              </ul>
            </GlassCard>
          </div>
        </div>
      </div>
    </ClientShell>
  );
}
