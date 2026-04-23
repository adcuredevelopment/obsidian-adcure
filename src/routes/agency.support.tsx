import { requireRole } from "@/lib/auth-mock";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { GlassCard } from "@/components/GlassCard";
import { StatusPill } from "@/components/StatusPill";
import {
  Search,
  Send,
  Paperclip,
  UserPlus,
  CheckCircle2,
  MoreHorizontal,
  Inbox,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/agency/support")({
  beforeLoad: () => requireRole("agency_admin"),
  head: () => ({
    meta: [
      { title: "Support Inbox — Adcure Agency" },
      { name: "description", content: "Klantgesprekken en support tickets." },
    ],
  }),
  component: AgencySupportPage,
});

type Status = "open" | "in_progress" | "resolved";

type Message = {
  id: string;
  from: "admin" | "client";
  author: string;
  text: string;
  time: string;
  attachment?: { name: string; size: string };
};

type Conversation = {
  id: string;
  client: { name: string; email: string; initials: string; company: string };
  subject: string;
  lastTime: string;
  unread: number;
  status: Status;
  assignee?: string;
  messages: Message[];
};

const conversations: Conversation[] = [
  {
    id: "c1",
    client: {
      name: "Sofia Martinez",
      email: "sofia@northwind.io",
      initials: "SM",
      company: "Northwind Studio",
    },
    subject: "Top-up van €500 nog niet zichtbaar",
    lastTime: "2m",
    unread: 2,
    status: "open",
    messages: [
      {
        id: "m1",
        from: "client",
        author: "Sofia Martinez",
        text: "Hoi! Ik heb gisteravond rond 22:00 een bankoverschrijving gedaan van €500 voor mijn Meta account, maar het saldo staat er nog niet op. Kunnen jullie meekijken?",
        time: "Yesterday 22:14",
        attachment: { name: "betaalbewijs-rabobank.pdf", size: "84 KB" },
      },
      {
        id: "m2",
        from: "admin",
        author: "You",
        text: "Hi Sofia, ik kijk er nu naar. Bankoverschrijvingen na 21:00 worden meestal pas de volgende ochtend geboekt — even geduld.",
        time: "08:32",
      },
      {
        id: "m3",
        from: "client",
        author: "Sofia Martinez",
        text: "Oké top, en hoe lang duurt het ongeveer voordat het op het Meta account staat?",
        time: "08:45",
      },
    ],
  },
  {
    id: "c2",
    client: {
      name: "Daniel Kim",
      email: "dan@helixlabs.com",
      initials: "DK",
      company: "Helix Labs",
    },
    subject: "Ad account aanvraag voor nieuwe brand",
    lastTime: "27m",
    unread: 1,
    status: "open",
    messages: [
      {
        id: "m1",
        from: "client",
        author: "Daniel Kim",
        text: "We launchen volgende week een nieuwe brand (Helix Outdoor). Kunnen jullie alvast een Google Ads account aanmaken? Domain: helixoutdoor.com",
        time: "08:00",
      },
      {
        id: "m2",
        from: "client",
        author: "Daniel Kim",
        text: "Belangrijk: graag in USD, niet EUR.",
        time: "08:18",
      },
    ],
  },
  {
    id: "c3",
    client: {
      name: "Marco Rossi",
      email: "marco@atlasdtc.eu",
      initials: "MR",
      company: "Atlas DTC",
    },
    subject: "TikTok account is gepauzeerd",
    lastTime: "1h",
    unread: 0,
    status: "in_progress",
    assignee: "Lena",
    messages: [
      {
        id: "m1",
        from: "client",
        author: "Marco Rossi",
        text: "Onze TikTok ad account act_5544023 staat sinds vanmorgen op paused. We hebben niets aangepast. Kunnen jullie checken wat er aan de hand is?",
        time: "07:11",
      },
      {
        id: "m2",
        from: "admin",
        author: "Lena",
        text: "Hi Marco, ik heb het escalated naar onze TikTok rep. Kom binnen het uur terug met een update.",
        time: "07:35",
      },
    ],
  },
  {
    id: "c4",
    client: {
      name: "Alicia Brooks",
      email: "alicia@quartzfin.com",
      initials: "AB",
      company: "Quartz Financial",
    },
    subject: "Factuur INV-2026-0181 — VAT vraag",
    lastTime: "3h",
    unread: 0,
    status: "in_progress",
    assignee: "You",
    messages: [
      {
        id: "m1",
        from: "client",
        author: "Alicia Brooks",
        text: "Hoi, op factuur INV-2026-0181 staat 21% BTW maar ons bedrijf valt onder reverse charge (UK VAT). Kunnen jullie dit aanpassen?",
        time: "Yesterday 14:02",
      },
      {
        id: "m2",
        from: "admin",
        author: "You",
        text: "Hi Alicia, ik check je VAT-nummer en kom terug met een gecorrigeerde factuur.",
        time: "Yesterday 15:11",
      },
    ],
  },
  {
    id: "c5",
    client: {
      name: "Jonas Weber",
      email: "jonas@novaoutdoor.com",
      initials: "JW",
      company: "Nova Outdoor",
    },
    subject: "Withdrawal aangevraagd",
    lastTime: "1d",
    unread: 0,
    status: "resolved",
    messages: [
      {
        id: "m1",
        from: "client",
        author: "Jonas Weber",
        text: "Kunnen jullie €1.200 terugstorten naar onze IBAN? We schalen tijdelijk af.",
        time: "2 days ago",
      },
      {
        id: "m2",
        from: "admin",
        author: "You",
        text: "Done — vandaag overgemaakt, zou maandag binnen moeten zijn.",
        time: "Yesterday 10:30",
      },
      {
        id: "m3",
        from: "client",
        author: "Jonas Weber",
        text: "Top, bedankt!",
        time: "Yesterday 11:02",
      },
    ],
  },
  {
    id: "c6",
    client: {
      name: "Riley Chen",
      email: "riley@embercoffee.co",
      initials: "RC",
      company: "Ember Coffee",
    },
    subject: "Hulp bij setup pixel",
    lastTime: "3d",
    unread: 0,
    status: "resolved",
    messages: [
      {
        id: "m1",
        from: "client",
        author: "Riley Chen",
        text: "Onze Meta pixel firet niet op de checkout. Kunnen jullie meekijken?",
        time: "4 days ago",
      },
      {
        id: "m2",
        from: "admin",
        author: "You",
        text: "Fix gevonden — Shopify thema overschreef de pixel. Ik heb het script in checkout.liquid gezet.",
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

function AgencySupportPage() {
  const [filter, setFilter] = useState<"all" | Status>("all");
  const [activeId, setActiveId] = useState<string>(conversations[0].id);
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState("");

  const filtered = conversations.filter((c) => {
    const matchesFilter = filter === "all" || c.status === filter;
    const q = query.trim().toLowerCase();
    const matchesQuery =
      !q ||
      c.client.name.toLowerCase().includes(q) ||
      c.subject.toLowerCase().includes(q) ||
      c.client.company.toLowerCase().includes(q);
    return matchesFilter && matchesQuery;
  });

  const active = conversations.find((c) => c.id === activeId) ?? filtered[0];

  const counts = {
    all: conversations.length,
    open: conversations.filter((c) => c.status === "open").length,
    in_progress: conversations.filter((c) => c.status === "in_progress").length,
    resolved: conversations.filter((c) => c.status === "resolved").length,
  };

  return (
    <AppShell>
      <div className="animate-fade-in space-y-5">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Support Inbox</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Klantgesprekken en open tickets in één overzicht.
            </p>
          </div>
          <div className="flex items-center gap-1 rounded-xl border border-border bg-card/60 p-1">
            {([
              { id: "all", label: "All" },
              { id: "open", label: "Open" },
              { id: "in_progress", label: "In Progress" },
              { id: "resolved", label: "Resolved" },
            ] as const).map((t) => (
              <button
                key={t.id}
                onClick={() => setFilter(t.id)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition",
                  filter === t.id
                    ? "bg-background text-foreground shadow-card"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {t.label}
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[10px] tabular-nums",
                    filter === t.id ? "bg-primary/20 text-primary-glow" : "bg-muted text-muted-foreground",
                  )}
                >
                  {counts[t.id]}
                </span>
              </button>
            ))}
          </div>
        </header>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[340px_1fr]">
          {/* Conversation list */}
          <GlassCard className="!p-0 overflow-hidden">
            <div className="border-b border-border p-3">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search conversations…"
                  className="w-full rounded-lg border border-border bg-background/40 py-2 pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
            <ul className="max-h-[640px] divide-y divide-border overflow-y-auto">
              {filtered.length === 0 && (
                <li className="flex flex-col items-center gap-2 py-10 text-center text-sm text-muted-foreground">
                  <Inbox className="h-5 w-5" />
                  Geen gesprekken
                </li>
              )}
              {filtered.map((c) => {
                const last = c.messages[c.messages.length - 1];
                const isActive = c.id === active?.id;
                return (
                  <li key={c.id}>
                    <button
                      onClick={() => setActiveId(c.id)}
                      className={cn(
                        "w-full px-4 py-3.5 text-left transition",
                        isActive ? "bg-background/60" : "hover:bg-background/40",
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className="relative">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet/40 to-primary/40 text-[11px] font-semibold text-white">
                            {c.client.initials}
                          </div>
                          {c.unread > 0 && (
                            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground ring-2 ring-card">
                              {c.unread}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="truncate text-sm font-medium">{c.client.name}</p>
                            <span className="shrink-0 text-[11px] text-muted-foreground">
                              {c.lastTime}
                            </span>
                          </div>
                          <p className="mt-0.5 truncate text-xs font-medium text-foreground/80">
                            {c.subject}
                          </p>
                          <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                            {last.from === "admin" ? "You: " : ""}
                            {last.text}
                          </p>
                          <div className="mt-2">
                            <StatusPill variant={statusMeta[c.status].variant}>
                              {statusMeta[c.status].label}
                            </StatusPill>
                          </div>
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </GlassCard>

          {/* Active conversation */}
          {active ? (
            <GlassCard className="!p-0 flex h-[720px] flex-col overflow-hidden">
              <div className="flex items-center justify-between gap-3 border-b border-border p-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet/40 to-primary/40 text-xs font-semibold text-white">
                    {active.client.initials}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{active.client.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {active.client.company} · {active.client.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusPill variant={statusMeta[active.status].variant}>
                    {statusMeta[active.status].label}
                  </StatusPill>
                  <button className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium hover:bg-accent">
                    <UserPlus className="h-3.5 w-3.5" /> Assign
                  </button>
                  <button className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium hover:bg-accent">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Close
                  </button>
                  <button className="rounded-lg border border-border bg-card p-1.5 hover:bg-accent">
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="border-b border-border bg-background/30 px-5 py-3">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Subject</p>
                <p className="mt-1 text-sm font-medium">{active.subject}</p>
              </div>

              <div className="flex-1 space-y-5 overflow-y-auto p-5">
                {active.messages.map((m) => {
                  const isAdmin = m.from === "admin";
                  return (
                    <div
                      key={m.id}
                      className={cn(
                        "flex gap-3",
                        isAdmin ? "flex-row-reverse" : "flex-row",
                      )}
                    >
                      <div
                        className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-white",
                          isAdmin
                            ? "bg-gradient-to-br from-primary to-primary-glow"
                            : "bg-gradient-to-br from-violet/40 to-primary/40",
                        )}
                      >
                        {isAdmin ? "Y" : active.client.initials}
                      </div>
                      <div
                        className={cn(
                          "flex max-w-[78%] flex-col gap-1.5",
                          isAdmin ? "items-end" : "items-start",
                        )}
                      >
                        <div
                          className={cn(
                            "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                            isAdmin
                              ? "rounded-tr-sm bg-gradient-to-br from-primary to-primary-glow text-primary-foreground shadow-glow"
                              : "rounded-tl-sm border border-border bg-card text-foreground",
                          )}
                        >
                          {m.text}
                        </div>
                        {m.attachment && (
                          <a
                            href="#"
                            className={cn(
                              "inline-flex items-center gap-2 rounded-lg border border-border bg-background/60 px-2.5 py-1.5 text-xs hover:bg-accent",
                            )}
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
                    placeholder={`Reply to ${active.client.name}…`}
                    className="w-full resize-none bg-transparent px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none"
                  />
                  <div className="flex items-center justify-between gap-2 border-t border-border px-2 py-2">
                    <button className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground">
                      <Paperclip className="h-3.5 w-3.5" /> Attach
                    </button>
                    <button
                      onClick={() => setDraft("")}
                      disabled={!draft.trim()}
                      className="inline-flex items-center gap-2 rounded-lg gradient-primary px-3.5 py-2 text-sm font-semibold text-white shadow-glow transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Send className="h-4 w-4" /> Send
                    </button>
                  </div>
                </div>
              </div>
            </GlassCard>
          ) : (
            <GlassCard className="flex h-[720px] items-center justify-center">
              <p className="text-sm text-muted-foreground">Selecteer een gesprek</p>
            </GlassCard>
          )}
        </div>
      </div>
    </AppShell>
  );
}
