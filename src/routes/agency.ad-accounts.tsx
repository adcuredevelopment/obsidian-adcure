import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { GlassCard } from "@/components/GlassCard";
import { StatusPill, statusToVariant } from "@/components/StatusPill";
import { adAccounts, type AdAccount } from "@/lib/mock-data";
import {
  MoreHorizontal,
  Search,
  Filter,
  Download,
  Plus,
  X,
  Wallet as WalletIcon,
  TrendingUp,
  Users,
  CheckCircle2,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/agency/ad-accounts")({
  head: () => ({
    meta: [
      { title: "Ad Accounts — Adcure Agency" },
      { name: "description", content: "Manage ad accounts, requests, and top-ups." },
    ],
  }),
  component: AdAccountsPage,
});

function AdAccountsPage() {
  const [tab, setTab] = useState<"accounts" | "requests" | "topups">("accounts");
  const [selected, setSelected] = useState<AdAccount | null>(null);

  return (
    <AppShell>
      <div className="animate-fade-in space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Ad Accounts</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage all client ad accounts across platforms.
            </p>
          </div>
          <button className="inline-flex items-center gap-2 self-start rounded-lg gradient-primary px-3.5 py-2 text-sm font-semibold text-white shadow-glow transition hover:brightness-110">
            <Plus className="h-4 w-4" /> New Account
          </button>
        </header>

        {/* Tabs */}
        <div className="flex items-center gap-1 rounded-xl border border-border bg-card/60 p-1 w-fit">
          {[
            { id: "accounts", label: "Ad Accounts", count: 58 },
            { id: "requests", label: "Account Requests", count: 4 },
            { id: "topups", label: "Top-Up Requests", count: 7 },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as typeof tab)}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-sm font-medium transition",
                tab === t.id
                  ? "bg-background text-foreground shadow-card"
                  : "text-muted-foreground hover:text-foreground",
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

        {/* Summary tiles */}
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Total Accounts", value: "58", icon: Users, accent: "primary" },
            { label: "Active", value: "42", icon: CheckCircle2, accent: "success" },
            { label: "Total Balance", value: "$184,210", icon: WalletIcon, accent: "violet" },
            { label: "30D Spend", value: "$62,140", icon: TrendingUp, accent: "warning" },
          ].map((m) => (
            <GlassCard key={m.label} className="p-4">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "rounded-lg p-2 ring-1 ring-inset",
                    m.accent === "primary" && "bg-primary/15 text-primary-glow ring-primary/25",
                    m.accent === "success" && "bg-success/15 text-success ring-success/25",
                    m.accent === "violet" && "bg-violet/15 text-violet ring-violet/25",
                    m.accent === "warning" && "bg-warning/15 text-warning ring-warning/25",
                  )}
                >
                  <m.icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    {m.label}
                  </p>
                  <p className="text-lg font-semibold tabular-nums">{m.value}</p>
                </div>
              </div>
            </GlassCard>
          ))}
        </section>

        {/* Toolbar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search accounts…"
              className="w-full rounded-lg border border-border bg-card/60 py-2 pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium hover:bg-accent">
              <Filter className="h-4 w-4" /> Filter
            </button>
            <button className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium hover:bg-accent">
              <Download className="h-4 w-4" /> Export
            </button>
          </div>
        </div>

        {/* Table */}
        <GlassCard className="!p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                  <th className="px-5 py-3 font-medium">Account</th>
                  <th className="px-5 py-3 font-medium">Owner</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium text-right">Balance</th>
                  <th className="px-5 py-3 font-medium text-right">30D Spend</th>
                  <th className="px-5 py-3 font-medium">Last Activity</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {adAccounts.map((a) => (
                  <tr
                    key={a.id}
                    onClick={() => setSelected(a)}
                    className="cursor-pointer border-b border-border/60 transition hover:bg-background/40"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary/30 to-violet/30 text-xs font-semibold ring-1 ring-inset ring-border">
                          {a.platform[0]}
                        </div>
                        <div>
                          <p className="font-medium">{a.name}</p>
                          <p className="font-mono text-xs text-muted-foreground">{a.accountId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-violet/40 to-primary/40 text-[10px] font-semibold text-white">
                          {a.owner.initials}
                        </div>
                        <div className="leading-tight">
                          <p className="text-sm">{a.owner.name}</p>
                          <p className="text-xs text-muted-foreground">{a.owner.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <StatusPill variant={statusToVariant(a.status)}>{a.status}</StatusPill>
                    </td>
                    <td className="px-5 py-4 text-right font-medium tabular-nums">
                      ${a.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-5 py-4 text-right tabular-nums text-muted-foreground">
                      ${a.spend.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">{a.lastActivity}</td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>

      {/* Drawer */}
      {selected && (
        <AccountDrawer account={selected} onClose={() => setSelected(null)} />
      )}
    </AppShell>
  );
}

function AccountDrawer({
  account,
  onClose,
}: {
  account: AdAccount;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-border bg-card shadow-elegant animate-slide-in-right">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary/30 to-violet/30 ring-1 ring-inset ring-border">
              <span className="text-sm font-semibold">{account.platform[0]}</span>
            </div>
            <div>
              <h2 className="text-base font-semibold">{account.name}</h2>
              <div className="mt-1 flex items-center gap-2">
                <StatusPill variant={statusToVariant(account.status)}>
                  {account.status}
                </StatusPill>
                <span className="font-mono text-xs text-muted-foreground">
                  {account.accountId}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-border bg-background/40 p-3">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                Balance
              </p>
              <p className="mt-1 text-lg font-semibold tabular-nums">
                ${account.balance.toLocaleString()}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-background/40 p-3">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                30D Spend
              </p>
              <p className="mt-1 text-lg font-semibold tabular-nums">
                ${account.spend.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <Field label="Account Name" defaultValue={account.name} />
            <Field label="Owner Email" defaultValue={account.owner.email} />
            <Field label="Platform" defaultValue={account.platform} />
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Notes
              </label>
              <textarea
                rows={3}
                placeholder="Add internal notes…"
                className="w-full resize-none rounded-lg border border-border bg-background/40 px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-2 border-t border-border p-4">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium hover:bg-accent"
          >
            Cancel
          </button>
          <button className="flex-1 rounded-lg bg-success px-3 py-2 text-sm font-semibold text-success-foreground shadow-elegant transition hover:brightness-110">
            Approve & Create
          </button>
        </div>
      </aside>
    </div>
  );
}

function Field({ label, defaultValue }: { label: string; defaultValue: string }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</label>
      <input
        defaultValue={defaultValue}
        className="w-full rounded-lg border border-border bg-background/40 px-3 py-2 text-sm focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
    </div>
  );
}
