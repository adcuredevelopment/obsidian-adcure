import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { GlassCard } from "@/components/GlassCard";
import { Wallet, ArrowDownLeft, ArrowUpRight } from "lucide-react";

export const Route = createFileRoute("/wallets")({
  head: () => ({ meta: [{ title: "Wallets — Adcure Agency" }] }),
  component: WalletsPage,
});

const txns = [
  { id: 1, type: "in", client: "Northwind Performance", amount: 2500, time: "2m ago" },
  { id: 2, type: "out", client: "Helix Labs Growth", amount: 980, time: "1h ago" },
  { id: 3, type: "in", client: "Atlas DTC — EU", amount: 5200, time: "3h ago" },
  { id: 4, type: "out", client: "Quartz Finance", amount: 110, time: "yesterday" },
];

function WalletsPage() {
  return (
    <AppShell>
      <div className="animate-fade-in space-y-6">
        <header>
          <h1 className="text-2xl font-semibold tracking-tight">Wallets</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track client wallets and transactions.
          </p>
        </header>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <GlassCard glow className="p-5">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Agency Wallet
            </p>
            <p className="mt-2 text-3xl font-semibold tabular-nums">$72,940.20</p>
            <div className="mt-4 flex items-center gap-2">
              <button className="rounded-lg gradient-primary px-3 py-1.5 text-xs font-semibold text-white shadow-glow">
                Top up
              </button>
              <button className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium">
                Withdraw
              </button>
            </div>
          </GlassCard>
          <GlassCard className="p-5">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Pending Transfers
            </p>
            <p className="mt-2 text-3xl font-semibold tabular-nums">$4,820</p>
            <p className="mt-1 text-xs text-muted-foreground">3 transactions awaiting</p>
          </GlassCard>
          <GlassCard className="p-5">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
              30D Volume
            </p>
            <p className="mt-2 text-3xl font-semibold tabular-nums">$184,230</p>
            <p className="mt-1 text-xs text-success">+18.4% vs last month</p>
          </GlassCard>
        </section>

        <GlassCard className="!p-0 overflow-hidden">
          <div className="border-b border-border p-5">
            <h2 className="text-base font-semibold">Recent Transactions</h2>
          </div>
          <ul className="divide-y divide-border">
            {txns.map((t) => (
              <li key={t.id} className="flex items-center gap-4 px-5 py-4">
                <div
                  className={`rounded-lg p-2 ring-1 ring-inset ${
                    t.type === "in"
                      ? "bg-success/15 text-success ring-success/25"
                      : "bg-violet/15 text-violet ring-violet/25"
                  }`}
                >
                  {t.type === "in" ? (
                    <ArrowDownLeft className="h-4 w-4" />
                  ) : (
                    <ArrowUpRight className="h-4 w-4" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{t.client}</p>
                  <p className="text-xs text-muted-foreground">{t.time}</p>
                </div>
                <p
                  className={`tabular-nums font-semibold ${
                    t.type === "in" ? "text-success" : "text-foreground"
                  }`}
                >
                  {t.type === "in" ? "+" : "−"}${t.amount.toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        </GlassCard>
      </div>
    </AppShell>
  );
}
