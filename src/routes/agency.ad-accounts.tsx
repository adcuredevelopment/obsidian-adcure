import { requireRole } from "@/lib/auth-mock";
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
  AlertCircle,
  AlertTriangle,
  Info,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const Route = createFileRoute("/agency/ad-accounts")({
  beforeLoad: () => requireRole("agency_admin"),
  head: () => ({
    meta: [
      { title: "Ad Accounts — Adcure Agency" },
      { name: "description", content: "Manage ad accounts, requests, and top-ups." },
    ],
  }),
  component: AdAccountsPage,
});

const LOW_BALANCE_THRESHOLD = 100;

// ---------- Platform icons (brand-colored) ----------
type Platform = AdAccount["platform"];

const PLATFORM_META: Record<
  Platform,
  { label: string; gradient: string; ring: string; letter: string }
> = {
  Meta: {
    label: "Meta",
    gradient: "from-[#0866FF] to-[#1877F2]",
    ring: "ring-[#0866FF]/40",
    letter: "f",
  },
  Google: {
    label: "Google Ads",
    gradient: "from-[#FBBC05] via-[#EA4335] to-[#4285F4]",
    ring: "ring-[#EA4335]/40",
    letter: "G",
  },
  TikTok: {
    label: "TikTok Ads",
    gradient: "from-[#25F4EE] to-[#FE2C55]",
    ring: "ring-[#FE2C55]/40",
    letter: "T",
  },
  LinkedIn: {
    label: "LinkedIn",
    gradient: "from-[#0A66C2] to-[#004182]",
    ring: "ring-[#0A66C2]/40",
    letter: "in",
  },
};

function PlatformIcon({ platform, size = "md" }: { platform: Platform; size?: "sm" | "md" }) {
  const meta = PLATFORM_META[platform];
  const dim = size === "sm" ? "h-7 w-7 text-[10px]" : "h-10 w-10 text-sm";
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-lg bg-gradient-to-br font-bold text-white shadow-sm ring-1 ring-inset",
        meta.gradient,
        meta.ring,
        dim,
      )}
      aria-label={meta.label}
    >
      {meta.letter}
    </div>
  );
}

// ---------- Tiny sparkline for spend trend ----------
function Sparkline({
  values,
  className,
  stroke = "currentColor",
}: {
  values: number[];
  className?: string;
  stroke?: string;
}) {
  const w = 80;
  const h = 24;
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const step = values.length > 1 ? w / (values.length - 1) : 0;
  const points = values
    .map((v, i) => {
      const x = i * step;
      const y = h - ((v - min) / range) * h;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  const last = values[values.length - 1] ?? 0;
  const first = values[0] ?? 0;
  const trendUp = last >= first;
  const lineColor = stroke === "currentColor" ? (trendUp ? "var(--success)" : "var(--destructive)") : stroke;

  if (values.every((v) => v === 0)) {
    return (
      <span className={cn("inline-block text-[10px] text-muted-foreground", className)}>—</span>
    );
  }

  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      className={cn("overflow-visible", className)}
      aria-hidden
    >
      <polyline
        fill="none"
        stroke={lineColor}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

function AdAccountsPage() {
  const [tab, setTab] = useState<"accounts" | "requests" | "topups">("accounts");
  const [selected, setSelected] = useState<AdAccount | null>(null);
  const [showNew, setShowNew] = useState(false);

  return (
    <TooltipProvider delayDuration={150}>
      <AppShell>
        <div className="animate-fade-in space-y-6">
          <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Ad Accounts</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Manage all client ad accounts across platforms.
              </p>
            </div>
            <button
              onClick={() => setShowNew(true)}
              className="inline-flex items-center gap-2 self-start rounded-lg gradient-primary px-3.5 py-2 text-sm font-semibold text-white shadow-glow transition hover:brightness-110"
            >
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
                    tab === t.id
                      ? "bg-primary/20 text-primary-glow"
                      : "bg-muted text-muted-foreground",
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
                    <th className="px-5 py-3 font-medium">7D Trend</th>
                    <th className="px-5 py-3 font-medium">Last Activity</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {adAccounts.map((a) => {
                    const lowBalance =
                      a.balance < LOW_BALANCE_THRESHOLD && a.status !== "Pending" && a.status !== "Rejected";
                    return (
                      <tr
                        key={a.id}
                        onClick={() => setSelected(a)}
                        className="cursor-pointer border-b border-border/60 transition hover:bg-background/40"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <PlatformIcon platform={a.platform} />
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="font-medium truncate">{a.name}</p>
                                {!a.viaMainSupplier && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <span
                                        onClick={(e) => e.stopPropagation()}
                                        className="inline-flex items-center gap-1 rounded-full border border-warning/30 bg-warning/15 px-2 py-0.5 text-[10px] font-semibold text-warning"
                                      >
                                        <AlertCircle className="h-3 w-3" />
                                        External
                                      </span>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="max-w-xs">
                                      Managed via external supplier — manual processing
                                    </TooltipContent>
                                  </Tooltip>
                                )}
                              </div>
                              <p className="font-mono text-xs text-muted-foreground">
                                {a.accountId} · {PLATFORM_META[a.platform].label}
                              </p>
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
                        <td className="px-5 py-4 text-right">
                          <div className="inline-flex items-center justify-end gap-1.5 font-medium tabular-nums">
                            {lowBalance && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span
                                    onClick={(e) => e.stopPropagation()}
                                    className="inline-flex items-center text-destructive"
                                  >
                                    <AlertTriangle className="h-3.5 w-3.5" />
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                  Low balance — below €{LOW_BALANCE_THRESHOLD}
                                </TooltipContent>
                              </Tooltip>
                            )}
                            <span className={cn(lowBalance && "text-destructive")}>
                              ${a.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-right tabular-nums text-muted-foreground">
                          ${a.spend.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-5 py-4">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span
                                onClick={(e) => e.stopPropagation()}
                                className="inline-block"
                              >
                                <Sparkline values={a.spendTrend} />
                              </span>
                            </TooltipTrigger>
                            <TooltipContent side="top">Spend, last 7 days</TooltipContent>
                          </Tooltip>
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
                    );
                  })}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>

        {/* Drawer */}
        {selected && <AccountDrawer account={selected} onClose={() => setSelected(null)} />}

        {/* New account modal */}
        {showNew && <NewAccountModal onClose={() => setShowNew(false)} />}
      </AppShell>
    </TooltipProvider>
  );
}

function AccountDrawer({ account, onClose }: { account: AdAccount; onClose: () => void }) {
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
            <PlatformIcon platform={account.platform} />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold">{account.name}</h2>
                {!account.viaMainSupplier && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-warning/30 bg-warning/15 px-2 py-0.5 text-[10px] font-semibold text-warning">
                    <AlertCircle className="h-3 w-3" />
                    External
                  </span>
                )}
              </div>
              <div className="mt-1 flex items-center gap-2">
                <StatusPill variant={statusToVariant(account.status)}>{account.status}</StatusPill>
                <span className="font-mono text-xs text-muted-foreground">{account.accountId}</span>
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
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Balance</p>
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

          <div className="rounded-xl border border-border bg-background/40 p-3">
            <div className="flex items-center justify-between">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                Spend trend (7D)
              </p>
              <Sparkline values={account.spendTrend} className="text-foreground" />
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

// ---------- New Account modal ----------
function NewAccountModal({ onClose }: { onClose: () => void }) {
  const [platform, setPlatform] = useState<Platform>("Meta");
  const [viaMainSupplier, setViaMainSupplier] = useState(true);
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [bm, setBm] = useState("");

  const platforms: Platform[] = ["Meta", "Google", "TikTok", "LinkedIn"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card shadow-elegant animate-fade-in">
        <div className="flex items-start justify-between border-b border-border p-5">
          <div>
            <h2 className="text-base font-semibold">New Ad Account</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Create a new account on behalf of a client.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-5 p-5">
          {/* Platform */}
          <div>
            <label className="mb-2 block text-xs font-medium text-muted-foreground">
              Platform
            </label>
            <div className="grid grid-cols-4 gap-2">
              {platforms.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPlatform(p)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 rounded-lg border p-2.5 text-xs font-medium transition",
                    platform === p
                      ? "border-primary/50 bg-primary/10 text-foreground shadow-glow"
                      : "border-border bg-background/40 text-muted-foreground hover:text-foreground",
                  )}
                >
                  <PlatformIcon platform={p} size="sm" />
                  {PLATFORM_META[p].label}
                </button>
              ))}
            </div>
          </div>

          <Field label="Account Name" defaultValue="" />
          <FieldControlled label="Account Name *" value={name} onChange={setName} placeholder="Northwind Performance" hidden />
          <FieldControlled label="Domain *" value={domain} onChange={setDomain} placeholder="northwind.io" />
          <FieldControlled label="Business Manager ID *" value={bm} onChange={setBm} placeholder="123456789012345" />

          {/* Supplier toggle */}
          <div
            className={cn(
              "rounded-xl border p-4 transition",
              viaMainSupplier
                ? "border-border bg-background/40"
                : "border-warning/40 bg-warning/10",
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "rounded-lg p-2 ring-1 ring-inset",
                    viaMainSupplier
                      ? "bg-primary/15 text-primary-glow ring-primary/25"
                      : "bg-warning/15 text-warning ring-warning/25",
                  )}
                >
                  <Info className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">Managed by main supplier</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Routes top-ups and approvals automatically through the primary supplier.
                  </p>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={viaMainSupplier}
                onClick={() => setViaMainSupplier((v) => !v)}
                className={cn(
                  "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition",
                  viaMainSupplier ? "bg-primary" : "bg-muted",
                )}
              >
                <span
                  className={cn(
                    "inline-block h-4 w-4 transform rounded-full bg-background shadow transition",
                    viaMainSupplier ? "translate-x-4" : "translate-x-0.5",
                  )}
                />
              </button>
            </div>

            {!viaMainSupplier && (
              <div className="mt-3 flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/15 p-3 text-xs text-warning">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <p>
                  This account will require manual processing. Top-ups and approvals will not be
                  routed through the main supplier.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 border-t border-border p-4">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium hover:bg-accent"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="flex-1 rounded-lg gradient-primary px-3 py-2 text-sm font-semibold text-white shadow-glow transition hover:brightness-110"
          >
            Create Account
          </button>
        </div>
      </div>
    </div>
  );
}

function FieldControlled({
  label,
  value,
  onChange,
  placeholder,
  hidden,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hidden?: boolean;
}) {
  if (hidden) return null;
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-border bg-background/40 px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
    </div>
  );
}
