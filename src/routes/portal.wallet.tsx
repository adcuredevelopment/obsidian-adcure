import { requireRole } from "@/lib/auth-mock";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ClientShell } from "@/components/ClientShell";
import { GlassCard } from "@/components/GlassCard";
import { StatusPill } from "@/components/StatusPill";
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  CreditCard,
  Search,
  Filter,
  X,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/portal/wallet")({
  beforeLoad: () => requireRole("client"),
  head: () => ({
    meta: [
      { title: "Mijn Wallet — Adcure" },
      { name: "description", content: "Bekijk je wallet balance, top-ups en transacties." },
    ],
  }),
  component: ClientWalletPage,
});

type Tx = {
  id: string;
  type: "in" | "out" | "pending";
  title: string;
  meta: string;
  amount: number;
  status: "Completed" | "Pending" | "Failed";
  time: string;
};

const transactions: Tx[] = [
  { id: "1", type: "in", title: "Wallet top-up", meta: "iDEAL · ING Bank", amount: 2500, status: "Completed", time: "2u geleden" },
  { id: "2", type: "out", title: "Account top-up", meta: "Northwind Performance · Meta", amount: 1200, status: "Completed", time: "5u geleden" },
  { id: "3", type: "pending", title: "Top-up aangevraagd", meta: "Atlas DTC — EU · TikTok", amount: 800, status: "Pending", time: "1d geleden" },
  { id: "4", type: "out", title: "Account top-up", meta: "Helix Labs Growth · Google", amount: 450, status: "Completed", time: "2d geleden" },
  { id: "5", type: "in", title: "Refund verwerkt", meta: "Lumen Skincare · Meta", amount: 120, status: "Completed", time: "3d geleden" },
  { id: "6", type: "in", title: "Wallet top-up", meta: "iDEAL · Rabobank", amount: 5000, status: "Completed", time: "1w geleden" },
];

function ClientWalletPage() {
  const [filter, setFilter] = useState<"all" | "in" | "out" | "pending">("all");
  const [showTopUp, setShowTopUp] = useState(false);

  const filtered = transactions.filter((t) => filter === "all" || t.type === filter);
  const totalDeposited = transactions.filter((t) => t.type === "in" && t.status === "Completed").reduce((s, t) => s + t.amount, 0);
  const totalSpent = transactions.filter((t) => t.type === "out" && t.status === "Completed").reduce((s, t) => s + t.amount, 0);

  return (
    <ClientShell>
      <div className="animate-fade-in space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Mijn Wallet</h1>
            <p className="mt-1 text-sm text-muted-foreground">Beheer je saldo en bekijk transacties.</p>
          </div>
        </header>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <GlassCard glow className="p-6">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Huidig saldo</p>
            <p className="mt-2 text-4xl font-semibold tabular-nums">€18,240.00</p>
            <button
              onClick={() => setShowTopUp(true)}
              className="mt-4 inline-flex items-center gap-2 rounded-lg gradient-primary px-3.5 py-2 text-sm font-semibold text-white shadow-glow transition hover:brightness-110"
            >
              <Plus className="h-4 w-4" /> Top-up Wallet
            </button>
          </GlassCard>
          <GlassCard className="p-6">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Totaal gestort</p>
            <p className="mt-2 text-3xl font-semibold tabular-nums text-success">€{totalDeposited.toLocaleString("nl-NL", { minimumFractionDigits: 2 })}</p>
            <p className="mt-1 text-xs text-muted-foreground">Deze maand</p>
          </GlassCard>
          <GlassCard className="p-6">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Totaal besteed</p>
            <p className="mt-2 text-3xl font-semibold tabular-nums">€{totalSpent.toLocaleString("nl-NL", { minimumFractionDigits: 2 })}</p>
            <p className="mt-1 text-xs text-muted-foreground">Naar ad accounts</p>
          </GlassCard>
        </section>

        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-1 rounded-xl border border-border bg-card/60 p-1">
            {[
              { id: "all", label: "Alles" },
              { id: "in", label: "Binnenkomend" },
              { id: "out", label: "Uitgaand" },
              { id: "pending", label: "In behandeling" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setFilter(t.id as typeof filter)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-medium transition",
                  filter === t.id ? "bg-background text-foreground shadow-card" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                placeholder="Zoek transactie…"
                className="w-full rounded-lg border border-border bg-card/60 py-2 pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 sm:w-56"
              />
            </div>
            <button className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium hover:bg-accent">
              <Filter className="h-4 w-4" /> Filter
            </button>
          </div>
        </div>

        <GlassCard className="!p-0 overflow-hidden">
          <div className="border-b border-border p-5">
            <h2 className="text-base font-semibold">Transacties</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">{filtered.length} resultaten</p>
          </div>
          <ul className="divide-y divide-border">
            {filtered.map((t) => (
              <li key={t.id} className="flex items-center gap-4 px-5 py-4">
                <div
                  className={cn(
                    "rounded-lg p-2 ring-1 ring-inset",
                    t.type === "in" && "bg-success/15 text-success ring-success/25",
                    t.type === "out" && "bg-violet/15 text-violet ring-violet/25",
                    t.type === "pending" && "bg-warning/15 text-warning ring-warning/25",
                  )}
                >
                  {t.type === "in" ? (
                    <ArrowDownLeft className="h-4 w-4" />
                  ) : t.type === "out" ? (
                    <ArrowUpRight className="h-4 w-4" />
                  ) : (
                    <CreditCard className="h-4 w-4" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{t.title}</p>
                  <p className="truncate text-xs text-muted-foreground">{t.meta} · {t.time}</p>
                </div>
                <StatusPill variant={t.status === "Completed" ? "success" : t.status === "Pending" ? "pending" : "danger"}>
                  {t.status}
                </StatusPill>
                <p className={cn("w-28 text-right tabular-nums font-semibold", t.type === "in" ? "text-success" : "text-foreground")}>
                  {t.type === "in" ? "+" : t.type === "out" ? "−" : ""}€{t.amount.toLocaleString("nl-NL", { minimumFractionDigits: 2 })}
                </p>
              </li>
            ))}
          </ul>
        </GlassCard>
      </div>

      {showTopUp && <TopUpModal onClose={() => setShowTopUp(false)} />}
    </ClientShell>
  );
}

function TopUpModal({ onClose }: { onClose: () => void }) {
  const [amount, setAmount] = useState(500);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-elegant animate-fade-in">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold">Top-up Wallet</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">Voeg saldo toe via iDEAL</p>
          </div>
          <button onClick={onClose} className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-5 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Bedrag (€)</label>
            <input
              type="number"
              value={amount}
              min={10}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full rounded-lg border border-border bg-background/40 px-3 py-2 text-lg font-semibold tabular-nums focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[100, 500, 1000, 2500].map((a) => (
              <button
                key={a}
                onClick={() => setAmount(a)}
                className="rounded-lg border border-border bg-background/40 py-2 text-xs font-semibold hover:bg-accent"
              >
                €{a}
              </button>
            ))}
          </div>
          <div className="rounded-lg border border-border bg-background/30 p-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Bedrag</span>
              <span className="tabular-nums">€{amount.toLocaleString("nl-NL", { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Transactiekosten</span>
              <span className="tabular-nums text-muted-foreground">€0.00</span>
            </div>
            <div className="mt-2 flex items-center justify-between border-t border-border pt-2 text-sm font-semibold">
              <span>Totaal</span>
              <span className="tabular-nums">€{amount.toLocaleString("nl-NL", { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>
        <div className="mt-5 flex items-center gap-2">
          <button onClick={onClose} className="flex-1 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium hover:bg-accent">
            Annuleren
          </button>
          <button className="flex-1 rounded-lg gradient-primary px-3 py-2 text-sm font-semibold text-white shadow-glow transition hover:brightness-110">
            Bevestigen via iDEAL
          </button>
        </div>
      </div>
    </div>
  );
}
