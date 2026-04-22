import { requireRole } from "@/lib/auth-mock";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { GlassCard } from "@/components/GlassCard";
import { cn } from "@/lib/utils";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Plus,
  Minus,
  RefreshCw,
  Server,
  Layers,
  Clock,
  AlertTriangle,
  Send,
  Eye,
  Search,
} from "lucide-react";

export const Route = createFileRoute("/agency/wallets")({
  beforeLoad: () => requireRole("agency_admin"),
  head: () => ({ meta: [{ title: "Wallets — Adcure Agency" }] }),
  component: WalletsPage,
});

type Currency = "EUR" | "USD";
type TxType = "charge" | "withdrawal" | "bundle";

type Tx = {
  id: number;
  type: TxType;
  currency: Currency;
  client: string;
  amount: number;
  time: string;
};

const txns: Tx[] = [
  { id: 1, type: "charge", currency: "EUR", client: "Northwind Performance", amount: 2500, time: "2m ago" },
  { id: 2, type: "withdrawal", currency: "USD", client: "Helix Labs Growth", amount: 980, time: "1h ago" },
  { id: 3, type: "charge", currency: "EUR", client: "Atlas DTC — EU", amount: 5200, time: "3h ago" },
  { id: 4, type: "bundle", currency: "EUR", client: "Bundle → Supplier", amount: 12400, time: "6h ago" },
  { id: 5, type: "withdrawal", currency: "EUR", client: "Quartz Finance", amount: 110, time: "yesterday" },
  { id: 6, type: "charge", currency: "USD", client: "Lumen Skincare US", amount: 1450, time: "yesterday" },
  { id: 7, type: "bundle", currency: "USD", client: "Bundle → Supplier", amount: 3200, time: "2d ago" },
  { id: 8, type: "charge", currency: "EUR", client: "Tideline Apparel", amount: 760, time: "2d ago" },
];

const bundlePreview = [
  { client: "Northwind Performance", currency: "EUR" as Currency, amount: 2500 },
  { client: "Atlas DTC — EU", currency: "EUR" as Currency, amount: 5200 },
  { client: "Tideline Apparel", currency: "EUR" as Currency, amount: 760 },
  { client: "Lumen Skincare US", currency: "USD" as Currency, amount: 1450 },
];

const fmt = (v: number, c: Currency) =>
  `${c === "EUR" ? "€" : "$"}${v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function WalletsPage() {
  const [currencyFilter, setCurrencyFilter] = useState<"All" | Currency>("All");
  const [typeFilter, setTypeFilter] = useState<"all" | TxType>("all");

  const filtered = useMemo(
    () =>
      txns.filter(
        (t) =>
          (currencyFilter === "All" || t.currency === currencyFilter) &&
          (typeFilter === "all" || t.type === typeFilter),
      ),
    [currencyFilter, typeFilter],
  );

  // Per-currency running balance (oldest → newest)
  const runningBalances = useMemo(() => {
    const ordered = [...filtered].reverse();
    let eur = 0;
    let usd = 0;
    const map = new Map<number, number>();
    for (const t of ordered) {
      const sign = t.type === "charge" ? 1 : -1;
      if (t.currency === "EUR") {
        eur += sign * t.amount;
        map.set(t.id, eur);
      } else {
        usd += sign * t.amount;
        map.set(t.id, usd);
      }
    }
    return map;
  }, [filtered]);

  const supplierLow = { EUR: false, USD: true };

  return (
    <AppShell>
      <div className="animate-fade-in space-y-6">
        <header>
          <h1 className="text-2xl font-semibold tracking-tight">Wallets</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage agency multi-currency wallets, supplier balance and auto-bundling.
          </p>
        </header>

        {/* Agency Wallets */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold">Agency Wallets</h2>
              <p className="text-xs text-muted-foreground">Operational balances per currency</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <WalletCard currency="EUR" balance={72940.2} lastTx="2m ago" />
            <WalletCard currency="USD" balance={1178} lastTx="1h ago" />
          </div>
        </section>

        {/* Supplier Wallet */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold">Supplier Platform Balance</h2>
              <p className="text-xs text-muted-foreground">Funds held at our upstream supplier</p>
            </div>
          </div>
          <GlassCard className="p-5">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet/30 to-primary/30 text-violet ring-1 ring-inset ring-border">
                  <Server className="h-5 w-5" />
                </div>
                <div className="grid grid-cols-2 gap-x-8 gap-y-1">
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground">EUR</p>
                    <p className="text-2xl font-semibold tabular-nums">{fmt(5230, "EUR")}</p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground">USD</p>
                    <p className="flex items-center gap-2 text-2xl font-semibold tabular-nums">
                      {fmt(890, "USD")}
                      {supplierLow.USD && (
                        <span className="inline-flex items-center gap-1 rounded-md border border-warning/30 bg-warning/10 px-1.5 py-0.5 text-[10px] font-medium text-warning">
                          <AlertTriangle className="h-3 w-3" /> Low
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" /> Last synced: 2m ago
                </p>
                <div className="flex items-center gap-2">
                  <button className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium hover:bg-accent">
                    <RefreshCw className="h-3.5 w-3.5" /> Sync Now
                  </button>
                  <button className="inline-flex items-center gap-2 rounded-lg gradient-primary px-3 py-2 text-xs font-semibold text-white shadow-glow transition hover:brightness-110">
                    <Send className="h-3.5 w-3.5" /> Bundle &amp; Send
                  </button>
                </div>
              </div>
            </div>
          </GlassCard>
        </section>

        {/* Smart bundling widget */}
        <section>
          <GlassCard className="!p-0 overflow-hidden">
            <div className="flex items-center justify-between gap-3 border-b border-border p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/15 p-2 text-primary-glow ring-1 ring-inset ring-primary/25">
                  <Layers className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-base font-semibold">Smart Bundling</h2>
                  <p className="text-xs text-muted-foreground">
                    Next auto-bundle: <span className="font-medium text-foreground">Tomorrow 9:00 AM</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium hover:bg-accent">
                  <Eye className="h-3.5 w-3.5" /> Review
                </button>
                <button className="inline-flex items-center gap-2 rounded-lg gradient-primary px-3 py-2 text-xs font-semibold text-white shadow-glow transition hover:brightness-110">
                  <Send className="h-3.5 w-3.5" /> Send Now
                </button>
              </div>
            </div>
            <div className="divide-y divide-border">
              {bundlePreview.map((b, i) => (
                <div key={i} className="flex items-center justify-between px-5 py-3 text-sm">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-6 w-10 items-center justify-center rounded-md border border-border bg-background/40 text-[10px] font-semibold text-muted-foreground">
                      {b.currency}
                    </span>
                    <span className="font-medium">{b.client}</span>
                  </div>
                  <span className="tabular-nums font-semibold">{fmt(b.amount, b.currency)}</span>
                </div>
              ))}
              <div className="flex items-center justify-between bg-background/40 px-5 py-3 text-xs">
                <span className="text-muted-foreground">Bundle total</span>
                <span className="flex items-center gap-3 font-semibold">
                  <span>{fmt(2500 + 5200 + 760, "EUR")}</span>
                  <span className="text-muted-foreground">·</span>
                  <span>{fmt(1450, "USD")}</span>
                </span>
              </div>
            </div>
          </GlassCard>
        </section>

        {/* Transaction history */}
        <section>
          <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold">Transaction History</h2>
              <p className="text-xs text-muted-foreground">{filtered.length} results</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <SegmentedFilter
                value={currencyFilter}
                onChange={(v) => setCurrencyFilter(v as typeof currencyFilter)}
                options={[
                  { id: "All", label: "All" },
                  { id: "EUR", label: "EUR" },
                  { id: "USD", label: "USD" },
                ]}
              />
              <SegmentedFilter
                value={typeFilter}
                onChange={(v) => setTypeFilter(v as typeof typeFilter)}
                options={[
                  { id: "all", label: "All types" },
                  { id: "charge", label: "Charge" },
                  { id: "withdrawal", label: "Withdrawal" },
                  { id: "bundle", label: "Bundle" },
                ]}
              />
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  placeholder="Search…"
                  className="w-full rounded-lg border border-border bg-card/60 py-2 pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 sm:w-48"
                />
              </div>
            </div>
          </div>

          <GlassCard className="!p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                    <th className="px-5 py-3 font-medium">Type</th>
                    <th className="px-5 py-3 font-medium">Counterparty</th>
                    <th className="px-5 py-3 font-medium">When</th>
                    <th className="px-5 py-3 font-medium text-right">Amount</th>
                    <th className="px-5 py-3 font-medium text-right">Running Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((t) => {
                    const sign = t.type === "charge" ? "+" : "−";
                    const tone =
                      t.type === "charge"
                        ? "bg-success/15 text-success ring-success/25"
                        : t.type === "bundle"
                          ? "bg-primary/15 text-primary-glow ring-primary/25"
                          : "bg-violet/15 text-violet ring-violet/25";
                    const Icon =
                      t.type === "charge" ? ArrowDownLeft : t.type === "bundle" ? Layers : ArrowUpRight;
                    return (
                      <tr key={t.id} className="border-b border-border/60 hover:bg-background/40">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2.5">
                            <div className={cn("rounded-lg p-1.5 ring-1 ring-inset", tone)}>
                              <Icon className="h-3.5 w-3.5" />
                            </div>
                            <span className="text-xs font-medium capitalize">{t.type}</span>
                            <span className="rounded-md border border-border bg-background/40 px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                              {t.currency}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4 font-medium">{t.client}</td>
                        <td className="px-5 py-4 text-muted-foreground">{t.time}</td>
                        <td
                          className={cn(
                            "px-5 py-4 text-right tabular-nums font-semibold",
                            t.type === "charge" ? "text-success" : "text-foreground",
                          )}
                        >
                          {sign}
                          {fmt(t.amount, t.currency)}
                        </td>
                        <td className="px-5 py-4 text-right tabular-nums text-muted-foreground">
                          {fmt(runningBalances.get(t.id) ?? 0, t.currency)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </section>
      </div>
    </AppShell>
  );
}

function WalletCard({
  currency,
  balance,
  lastTx,
}: {
  currency: Currency;
  balance: number;
  lastTx: string;
}) {
  const accent =
    currency === "EUR"
      ? "from-primary/30 to-violet/20 ring-primary/30 text-primary-glow"
      : "from-success/30 to-primary/20 ring-success/30 text-success";
  return (
    <GlassCard glow className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br text-sm font-bold ring-1 ring-inset",
              accent,
            )}
          >
            {currency === "EUR" ? "€" : "$"}
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
              {currency} Wallet
            </p>
            <p className="text-xs text-muted-foreground">Agency operational</p>
          </div>
        </div>
        <span className="rounded-md border border-border bg-background/40 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
          {currency}
        </span>
      </div>

      <p className="mt-5 text-4xl font-semibold tabular-nums">{fmt(balance, currency)}</p>
      <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
        <Clock className="h-3 w-3" /> Last transaction: {lastTx}
      </p>

      <div className="mt-5 flex items-center gap-2">
        <button className="inline-flex items-center gap-2 rounded-lg gradient-primary px-3.5 py-2 text-xs font-semibold text-white shadow-glow transition hover:brightness-110">
          <Plus className="h-3.5 w-3.5" /> Charge Wallet
        </button>
        <button className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3.5 py-2 text-xs font-medium hover:bg-accent">
          <Minus className="h-3.5 w-3.5" /> Withdraw
        </button>
      </div>
    </GlassCard>
  );
}

function SegmentedFilter({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { id: string; label: string }[];
}) {
  return (
    <div className="flex items-center gap-1 rounded-xl border border-border bg-card/60 p-1">
      {options.map((o) => (
        <button
          key={o.id}
          onClick={() => onChange(o.id)}
          className={cn(
            "rounded-lg px-3 py-1.5 text-xs font-medium transition",
            value === o.id
              ? "bg-background text-foreground shadow-card"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
