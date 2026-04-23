import { requireRole } from "@/lib/auth-mock";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ClientShell } from "@/components/ClientShell";
import { GlassCard } from "@/components/GlassCard";
import { StatusPill } from "@/components/StatusPill";
import {
  Plus,
  Send,
  Paperclip,
  ArrowLeft,
  LifeBuoy,
  MessageSquare,
  X,
  FileText,
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

type Status = "open" | "in_progress" | "resolved";

type Message = {
  id: string;
  from: "client" | "agency";
  author: string;
  text: string;
  time: string;
  attachment?: { name: string; size: string };
};

type Ticket = {
  id: string;
  subject: string;
  status: Status;
  lastTime: string;
  messages: Message[];
};

const tickets: Ticket[] = [
  {
    id: "t1",
    subject: "Top-up van €500 nog niet zichtbaar",
    status: "open",
    lastTime: "2m",
    messages: [
      {
        id: "m1",
        from: "client",
        author: "You",
        text: "Hoi! Ik heb gisteravond rond 22:00 een bankoverschrijving gedaan van €500 voor mijn Meta account, maar het saldo staat er nog niet op. Kunnen jullie meekijken?",
        time: "Yesterday 22:14",
        attachment: { name: "betaalbewijs-rabobank.pdf", size: "84 KB" },
      },
      {
        id: "m2",
        from: "agency",
        author: "Adcure Support",
        text: "Hi Sofia, ik kijk er nu naar. Bankoverschrijvingen na 21:00 worden meestal pas de volgende ochtend geboekt — even geduld.",
        time: "08:32",
      },
    ],
  },
  {
    id: "t2",
    subject: "Factuur INV-2026-0181 — VAT vraag",
    status: "in_progress",
    lastTime: "3h",
    messages: [
      {
        id: "m1",
        from: "client",
        author: "You",
        text: "Hoi, op factuur INV-2026-0181 staat 21% BTW maar ons bedrijf valt onder reverse charge. Kunnen jullie dit aanpassen?",
        time: "Yesterday 14:02",
      },
      {
        id: "m2",
        from: "agency",
        author: "Adcure Support",
        text: "Hi, ik check je VAT-nummer en kom terug met een gecorrigeerde factuur.",
        time: "Yesterday 15:11",
      },
    ],
  },
  {
    id: "t3",
    subject: "Hulp bij setup Meta pixel",
    status: "resolved",
    lastTime: "3d",
    messages: [
      {
        id: "m1",
        from: "client",
        author: "You",
        text: "Onze Meta pixel firet niet op de checkout. Kunnen jullie meekijken?",
        time: "4 days ago",
      },
      {
        id: "m2",
        from: "agency",
        author: "Adcure Support",
        text: "Fix gevonden — Shopify thema overschreef de pixel. Ik heb het script in checkout.liquid gezet.",
        time: "3 days ago",
      },
      {
        id: "m3",
        from: "client",
        author: "You",
        text: "Top, werkt nu perfect. Bedankt!",
        time: "3 days ago",
      },
    ],
  },
];

const statusMeta: Record<Status, { label: string; variant: "info" | "pending" | "success" }> = {
  open: { label: "Open", variant: "info" },
  in_progress: { label: "In Progress", variant: "pending" },
  resolved: { label: "Resolved", variant: "success" },
};

function ClientSupportPage() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [draft, setDraft] = useState("");

  const active = tickets.find((t) => t.id === activeId) ?? null;

  return (
    <ClientShell>
      <div className="animate-fade-in space-y-6">
        {!active ? (
          <>
            <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary shadow-glow">
                  <LifeBuoy className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-semibold tracking-tight">Support</h1>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    Hulp nodig? Stuur ons een bericht.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowNew(true)}
                className="inline-flex items-center gap-2 rounded-lg gradient-primary px-3.5 py-2 text-sm font-semibold text-white shadow-glow transition hover:brightness-110"
              >
                <Plus className="h-4 w-4" /> Nieuw ticket
              </button>
            </header>

            <GlassCard className="!p-0 overflow-hidden">
              <div className="border-b border-border p-5">
                <h2 className="text-base font-semibold">Jouw gesprekken</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {tickets.length} {tickets.length === 1 ? "ticket" : "tickets"}
                </p>
              </div>
              <ul className="divide-y divide-border">
                {tickets.length === 0 && (
                  <li className="flex flex-col items-center gap-2 py-12 text-center text-sm text-muted-foreground">
                    <MessageSquare className="h-5 w-5" />
                    Nog geen tickets
                  </li>
                )}
                {tickets.map((t) => {
                  const last = t.messages[t.messages.length - 1];
                  return (
                    <li key={t.id}>
                      <button
                        onClick={() => setActiveId(t.id)}
                        className="flex w-full items-center gap-4 px-5 py-4 text-left transition hover:bg-background/40"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary-glow ring-1 ring-inset ring-primary/25">
                          <MessageSquare className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-3">
                            <p className="truncate text-sm font-semibold">{t.subject}</p>
                            <span className="shrink-0 text-xs text-muted-foreground">
                              {t.lastTime}
                            </span>
                          </div>
                          <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                            {last.from === "client" ? "You: " : "Adcure: "}
                            {last.text}
                          </p>
                        </div>
                        <div className="shrink-0">
                          <StatusPill variant={statusMeta[t.status].variant}>
                            {statusMeta[t.status].label}
                          </StatusPill>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </GlassCard>
          </>
        ) : (
          <>
            <header className="flex items-center justify-between gap-3">
              <button
                onClick={() => setActiveId(null)}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" /> Terug naar gesprekken
              </button>
              <StatusPill variant={statusMeta[active.status].variant}>
                {statusMeta[active.status].label}
              </StatusPill>
            </header>

            <GlassCard className="!p-0 flex h-[680px] flex-col overflow-hidden">
              <div className="border-b border-border p-5">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Onderwerp</p>
                <h2 className="mt-1 text-base font-semibold">{active.subject}</h2>
              </div>

              <div className="flex-1 space-y-5 overflow-y-auto p-5">
                {active.messages.map((m) => {
                  const isMe = m.from === "client";
                  return (
                    <div
                      key={m.id}
                      className={cn("flex gap-3", isMe ? "flex-row-reverse" : "flex-row")}
                    >
                      <div
                        className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-white",
                          isMe
                            ? "bg-gradient-to-br from-primary to-primary-glow"
                            : "bg-gradient-to-br from-violet/40 to-primary/40",
                        )}
                      >
                        {isMe ? "Y" : "A"}
                      </div>
                      <div
                        className={cn(
                          "flex max-w-[78%] flex-col gap-1.5",
                          isMe ? "items-end" : "items-start",
                        )}
                      >
                        <div
                          className={cn(
                            "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                            isMe
                              ? "rounded-tr-sm bg-gradient-to-br from-primary to-primary-glow text-primary-foreground shadow-glow"
                              : "rounded-tl-sm border border-border bg-card text-foreground",
                          )}
                        >
                          {m.text}
                        </div>
                        {m.attachment && (
                          <a
                            href="#"
                            className="inline-flex items-center gap-2 rounded-lg border border-border bg-background/60 px-2.5 py-1.5 text-xs hover:bg-accent"
                          >
                            <FileText className="h-3.5 w-3.5 text-primary-glow" />
                            <span className="font-medium">{m.attachment.name}</span>
                            <span className="text-muted-foreground">{m.attachment.size}</span>
                          </a>
                        )}
                        <span className="text-[11px] text-muted-foreground">
                          {m.author} · {m.time}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-border p-4">
                <div className="rounded-xl border border-border bg-background/40 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20">
                  <textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    rows={3}
                    placeholder="Typ je antwoord…"
                    className="w-full resize-none bg-transparent px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none"
                  />
                  <div className="flex items-center justify-between gap-2 border-t border-border px-2 py-2">
                    <button className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground">
                      <Paperclip className="h-3.5 w-3.5" /> Bijlage
                    </button>
                    <button
                      onClick={() => setDraft("")}
                      disabled={!draft.trim()}
                      className="inline-flex items-center gap-2 rounded-lg gradient-primary px-3.5 py-2 text-sm font-semibold text-white shadow-glow transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Send className="h-4 w-4" /> Verstuur
                    </button>
                  </div>
                </div>
              </div>
            </GlassCard>
          </>
        )}
      </div>

      {showNew && <NewTicketModal onClose={() => setShowNew(false)} />}
    </ClientShell>
  );
}

function NewTicketModal({ onClose }: { onClose: () => void }) {
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(onClose, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative w-full max-w-lg animate-fade-in rounded-2xl border border-border bg-card shadow-elegant">
        <div className="flex items-center justify-between border-b border-border p-5">
          <div>
            <h2 className="text-base font-semibold">Nieuw ticket</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">We reageren binnen ~2 uur.</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={onSubmit} className="space-y-4 p-5">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Onderwerp
            </label>
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
              required
              rows={6}
              placeholder="Beschrijf je vraag of probleem zo specifiek mogelijk…"
              className="w-full resize-none rounded-lg border border-border bg-background/40 px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium hover:bg-accent"
            >
              Annuleren
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg gradient-primary px-3.5 py-2 text-sm font-semibold text-white shadow-glow transition hover:brightness-110"
            >
              <Send className="h-4 w-4" /> {submitted ? "Verstuurd ✓" : "Verstuur"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
