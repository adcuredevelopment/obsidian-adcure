import { requireRole } from "@/lib/auth-mock";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ClientShell } from "@/components/ClientShell";
import { GlassCard } from "@/components/GlassCard";
import { StatusPill, statusToVariant } from "@/components/StatusPill";
import { adAccounts } from "@/lib/mock-data";
import { CreditCard, Plus, Megaphone, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/portal/ad-accounts")({
  beforeLoad: () => requireRole("client"),
  head: () => ({
    meta: [
      { title: "Mijn Ad Accounts — Adcure" },
      { name: "description", content: "Beheer je eigen ad accounts en vraag top-ups aan." },
    ],
  }),
  component: ClientAdAccountsPage,
});

// Mock: filter to only "this client's" accounts
const myActiveAccounts = adAccounts.slice(0, 4).filter((a) => a.status === "Active");
const myPendingRequests = [
  {
    id: "req1",
    name: "Lumen Skincare Expansion",
    platform: "Meta" as const,
    requestedAt: "1d geleden",
    status: "Pending" as const,
    note: "In review door Adcure team",
  },
];

function ClientAdAccountsPage() {
  const [tab, setTab] = useState<"active" | "pending">("active");

  return (
    <ClientShell>
      <div className="animate-fade-in space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Mijn Ad Accounts</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Beheer je actieve ad accounts en vraag nieuwe accounts aan.
            </p>
          </div>
          <button className="inline-flex items-center gap-2 self-start rounded-lg gradient-primary px-3.5 py-2 text-sm font-semibold text-white shadow-glow transition hover:brightness-110">
            <Plus className="h-4 w-4" /> Request New Account
          </button>
        </header>

        <div className="flex items-center gap-1 rounded-xl border border-border bg-card/60 p-1 w-fit">
          {[
            { id: "active", label: "Active", count: myActiveAccounts.length },
            { id: "pending", label: "Pending Requests", count: myPendingRequests.length },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as typeof tab)}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-sm font-medium transition",
                tab === t.id ? "bg-background text-foreground shadow-card" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t.label}
              <span
                className={cn(
                  "rounded-md px-1.5 text-[10px] font-semibold",
                  tab === t.id ? "bg-primary/20 text-primary-glow" : "bg-muted text-muted-foreground",
                )}
              >
                {t.count}
              </span>
            </button>
          ))}
        </div>

        {tab === "active" ? (
          <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {myActiveAccounts.map((a) => (
              <GlassCard key={a.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary/30 to-violet/30 text-xs font-semibold ring-1 ring-inset ring-border">
                      {a.platform[0]}
                    </div>
                    <div>
                      <p className="font-semibold">{a.name}</p>
                      <p className="font-mono text-xs text-muted-foreground">{a.accountId}</p>
                    </div>
                  </div>
                  <StatusPill variant={statusToVariant(a.status)}>{a.status}</StatusPill>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-border bg-background/40 p-3">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Balance</p>
                    <p className="mt-1 text-lg font-semibold tabular-nums">
                      €{a.balance.toLocaleString("nl-NL", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="rounded-xl border border-border bg-background/40 p-3">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">30D Spend</p>
                    <p className="mt-1 text-lg font-semibold tabular-nums">
                      €{a.spend.toLocaleString("nl-NL", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <button className="inline-flex items-center gap-2 rounded-lg gradient-primary px-3 py-2 text-xs font-semibold text-white shadow-glow transition hover:brightness-110">
                    <CreditCard className="h-3.5 w-3.5" /> Top-up
                  </button>
                  <button className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium hover:bg-accent">
                    Bekijk details
                  </button>
                </div>
              </GlassCard>
            ))}
          </section>
        ) : (
          <section className="space-y-3">
            {myPendingRequests.length === 0 ? (
              <GlassCard className="flex flex-col items-center justify-center py-16 text-center">
                <Megaphone className="h-6 w-6 text-muted-foreground" />
                <p className="mt-3 text-sm font-semibold">Geen openstaande aanvragen</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Vraag een nieuw ad account aan met de knop rechtsboven.
                </p>
              </GlassCard>
            ) : (
              myPendingRequests.map((r) => (
                <GlassCard key={r.id}>
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/15 text-warning ring-1 ring-inset ring-warning/25">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{r.name}</p>
                        <StatusPill variant="pending">{r.status}</StatusPill>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {r.platform} · Aangevraagd {r.requestedAt}
                      </p>
                      <p className="mt-2 text-xs text-foreground">{r.note}</p>
                    </div>
                  </div>
                </GlassCard>
              ))
            )}
          </section>
        )}
      </div>
    </ClientShell>
  );
}
