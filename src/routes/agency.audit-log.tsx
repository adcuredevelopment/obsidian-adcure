import { requireRole } from "@/lib/auth-mock";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { format } from "date-fns";
import { AppShell } from "@/components/AppShell";
import { GlassCard } from "@/components/GlassCard";
import { StatusPill } from "@/components/StatusPill";
import { KpiCard } from "@/components/KpiCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  ArrowDownCircle,
  ArrowUpCircle,
  CalendarIcon,
  CheckCircle2,
  ListChecks,
  Activity,
  Bug,
  Zap,
  RefreshCw,
  Search,
  Eye,
  Wrench,
  Wand2,
  Clock,
  TrendingUp,
  XCircle,
  Server,
  AlertCircle,
} from "lucide-react";
import type { DateRange } from "react-day-picker";

export const Route = createFileRoute("/agency/audit-log")({
  beforeLoad: () => requireRole("agency_admin"),
  head: () => ({ meta: [{ title: "Audit Log & Reconciliation — Adcure Agency" }] }),
  component: AuditLogPage,
});

// ============= Types =============

type TxType = "top_up" | "deposit" | "withdrawal" | "adjustment";
type TxStatus = "Completed" | "Pending" | "Failed" | "Mismatch";

type Transaction = {
  id: string;
  ts: string;
  type: TxType;
  client: string;
  account?: string;
  amount: number; // positive = in, negative = out
  status: TxStatus;
  reference: string;
  initiator: string;
  steps: { ts: string; label: string; ok: boolean }[];
};

type ApiCall = {
  id: string;
  ts: string;
  endpoint: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  status: number;
  durationMs: number;
  request?: string;
  response?: string;
};

type ErrorEntry = {
  id: string;
  ts: string;
  type: string;
  context: string;
  message: string;
  resolved?: boolean;
};

type Mismatch = {
  id: string;
  ts: string;
  client: string;
  account: string;
  expected: number;
  received: number;
  reason: "supplier_fee" | "fx_conversion" | "UNEXPECTED";
  resolved?: boolean;
};

// ============= Mock data =============

const transactions: Transaction[] = [
  {
    id: "t1",
    ts: "2026-04-22 14:02:11",
    type: "top_up",
    client: "Northwind Performance",
    account: "Meta act_8821390",
    amount: 2500,
    status: "Completed",
    reference: "ADC-NW-7K3M",
    initiator: "system",
    steps: [
      { ts: "14:02:11", label: "Bank transfer received", ok: true },
      { ts: "14:02:13", label: "Wallet credited €2500.00", ok: true },
      { ts: "14:02:14", label: "Meta API top-up call", ok: true },
      { ts: "14:02:15", label: "Confirmation email sent", ok: true },
    ],
  },
  {
    id: "t2",
    ts: "2026-04-22 13:48:20",
    type: "top_up",
    client: "Helix Labs B.V.",
    account: "Google 481-220-3349",
    amount: 1200,
    status: "Completed",
    reference: "ADC-HX-2P9Q",
    initiator: "david@adcure",
    steps: [
      { ts: "13:48:20", label: "Manual approval", ok: true },
      { ts: "13:48:22", label: "Google Ads API top-up", ok: true },
      { ts: "13:48:24", label: "Invoice generated", ok: true },
    ],
  },
  {
    id: "t3",
    ts: "2026-04-22 12:15:03",
    type: "withdrawal",
    client: "Quartz Finance",
    account: "Meta act_5512098",
    amount: -110.25,
    status: "Mismatch",
    reference: "ADC-QF-1L8X",
    initiator: "system",
    steps: [
      { ts: "12:15:03", label: "Spend reconciliation started", ok: true },
      { ts: "12:15:05", label: "Internal records: €110.25", ok: true },
      { ts: "12:15:06", label: "Meta reported: €112.10", ok: false },
      { ts: "12:15:07", label: "Mismatch flagged for review", ok: false },
    ],
  },
  {
    id: "t4",
    ts: "2026-04-22 11:20:00",
    type: "deposit",
    client: "Tideline Apparel",
    amount: 750,
    status: "Pending",
    reference: "ADC-TL-9F2R",
    initiator: "client",
    steps: [
      { ts: "11:20:00", label: "Deposit request submitted", ok: true },
      { ts: "11:20:01", label: "Awaiting bank confirmation", ok: true },
    ],
  },
  {
    id: "t5",
    ts: "2026-04-22 09:33:51",
    type: "adjustment",
    client: "Lumen Skincare",
    account: "Meta act_3098711",
    amount: 0.4,
    status: "Completed",
    reference: "ADC-LM-4D1V",
    initiator: "david@adcure",
    steps: [
      { ts: "09:33:51", label: "Manual adjustment +€0.40", ok: true },
      { ts: "09:33:52", label: "Audit note added", ok: true },
    ],
  },
  {
    id: "t6",
    ts: "2026-04-22 08:10:42",
    type: "top_up",
    client: "Ember Coffee Co.",
    account: "TikTok 7282119",
    amount: 500,
    status: "Failed",
    reference: "ADC-EM-6H3K",
    initiator: "client",
    steps: [
      { ts: "08:10:42", label: "Top-up requested", ok: true },
      { ts: "08:10:44", label: "Insufficient wallet balance", ok: false },
    ],
  },
  {
    id: "t7",
    ts: "2026-04-22 07:55:10",
    type: "deposit",
    client: "Bramble & Co.",
    amount: 3000,
    status: "Completed",
    reference: "ADC-BR-8M2Z",
    initiator: "client",
    steps: [
      { ts: "07:55:10", label: "Bank transfer received", ok: true },
      { ts: "07:55:12", label: "Wallet credited €3000.00", ok: true },
    ],
  },
];

const apiCalls: ApiCall[] = [
  {
    id: "a1",
    ts: "2026-04-22 14:02:14",
    endpoint: "/v19.0/act_8821390/topup",
    method: "POST",
    status: 200,
    durationMs: 412,
    request: '{ "amount": 2500, "currency": "EUR" }',
    response: '{ "success": true, "id": "topup_8821390_a3f" }',
  },
  {
    id: "a2",
    ts: "2026-04-22 13:48:22",
    endpoint: "/v17/customers/481-220-3349/budgets",
    method: "POST",
    status: 200,
    durationMs: 689,
    request: '{ "amount_micros": 1200000000 }',
    response: '{ "resourceName": "customers/4812203349/budgets/91" }',
  },
  {
    id: "a3",
    ts: "2026-04-22 12:15:06",
    endpoint: "/v19.0/act_5512098/insights",
    method: "GET",
    status: 200,
    durationMs: 1120,
    response: '{ "spend": "112.10", "currency": "EUR" }',
  },
  {
    id: "a4",
    ts: "2026-04-22 08:10:44",
    endpoint: "/v1/wallet/debit",
    method: "POST",
    status: 400,
    durationMs: 88,
    request: '{ "client_id": "ember", "amount": 500 }',
    response: '{ "error": "INSUFFICIENT_FUNDS" }',
  },
  {
    id: "a5",
    ts: "2026-04-22 06:01:00",
    endpoint: "/v19.0/act_3098711/insights",
    method: "GET",
    status: 500,
    durationMs: 4002,
    response: '{ "error": { "code": 1, "message": "Internal server error" } }',
  },
];

const errors: ErrorEntry[] = [
  {
    id: "e1",
    ts: "2026-04-22 08:10:44",
    type: "InsufficientFunds",
    context: "Top-up Ember Coffee Co. → TikTok 7282119",
    message: "Wallet balance €310.20 below requested €500.00",
  },
  {
    id: "e2",
    ts: "2026-04-22 06:01:00",
    type: "MetaApiTimeout",
    context: "Daily insights sync for Lumen Skincare",
    message: "Meta Graph API responded 500 after 4002ms",
  },
  {
    id: "e3",
    ts: "2026-04-21 23:42:11",
    type: "WebhookSignature",
    context: "Revolut deposit webhook",
    message: "Invalid HMAC signature on payload f3a9…",
    resolved: true,
  },
];

const mismatches: Mismatch[] = [
  {
    id: "m1",
    ts: "2026-04-22 12:15:06",
    client: "Quartz Finance",
    account: "Meta act_5512098",
    expected: 110.25,
    received: 112.1,
    reason: "supplier_fee",
  },
  {
    id: "m2",
    ts: "2026-04-21 19:30:00",
    client: "Atlas DTC",
    account: "Google 992-118-2210",
    expected: 480.0,
    received: 472.36,
    reason: "fx_conversion",
  },
  {
    id: "m3",
    ts: "2026-04-21 11:08:42",
    client: "Helix Labs B.V.",
    account: "Meta act_4408120",
    expected: 200.0,
    received: 187.55,
    reason: "UNEXPECTED",
  },
];

// ============= Helpers =============

const TYPE_LABEL: Record<TxType, string> = {
  top_up: "Top-up",
  deposit: "Deposit",
  withdrawal: "Withdrawal",
  adjustment: "Adjustment",
};

const TYPE_TONE: Record<TxType, string> = {
  top_up: "bg-primary/15 text-primary-glow ring-primary/25",
  deposit: "bg-success/15 text-success ring-success/25",
  withdrawal: "bg-destructive/15 text-destructive ring-destructive/25",
  adjustment: "bg-violet/15 text-violet ring-violet/25",
};

function statusVariant(s: TxStatus) {
  if (s === "Completed") return "success" as const;
  if (s === "Pending") return "pending" as const;
  if (s === "Mismatch") return "danger" as const;
  return "danger" as const;
}

function fmtAmount(n: number) {
  const sign = n > 0 ? "+" : n < 0 ? "−" : "";
  return `${sign}€${Math.abs(n).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function methodTone(m: ApiCall["method"]) {
  return m === "GET"
    ? "bg-primary/15 text-primary-glow ring-primary/25"
    : m === "POST"
      ? "bg-success/15 text-success ring-success/25"
      : m === "PUT"
        ? "bg-warning/15 text-warning ring-warning/25"
        : "bg-destructive/15 text-destructive ring-destructive/25";
}

function statusTone(code: number) {
  if (code < 300) return "text-success";
  if (code < 500) return "text-warning";
  return "text-destructive";
}

const REASON_LABEL: Record<Mismatch["reason"], string> = {
  supplier_fee: "Supplier fee",
  fx_conversion: "FX conversion",
  UNEXPECTED: "Unexpected",
};

// ============= Page =============

type Tab = "transactions" | "api" | "errors" | "mismatches";

function AuditLogPage() {
  const [tab, setTab] = useState<Tab>("transactions");
  const [detail, setDetail] = useState<Transaction | null>(null);
  const [apiDetail, setApiDetail] = useState<ApiCall | null>(null);

  const mismatchCount = mismatches.filter((m) => !m.resolved).length;
  const completedCount = transactions.filter((t) => t.status === "Completed").length;
  const successRate = Math.round((completedCount / transactions.length) * 100);

  return (
    <AppShell>
      <div className="animate-fade-in space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Audit Log & Reconciliation</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Full transparency on every financial operation, API call, and mismatch.
            </p>
          </div>
          <Button variant="outline" className="self-start">
            <RefreshCw className="h-4 w-4" /> Re-sync now
          </Button>
        </header>

        {mismatchCount > 0 && (
          <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
            <div className="flex-1 text-sm">
              <p className="font-semibold text-destructive">
                {mismatchCount} mismatch{mismatchCount > 1 ? "es" : ""} need attention
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Internal ledger differs from supplier-reported values.
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive/20"
              onClick={() => setTab("mismatches")}
            >
              Review
            </Button>
          </div>
        )}

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            label="Transactions today"
            value={transactions.length.toString()}
            icon={Activity}
            accent="primary"
            hint="Across all clients"
          />
          <KpiCard
            label="Pending reconciliation"
            value={transactions.filter((t) => t.status === "Pending").length.toString()}
            icon={Clock}
            accent="warning"
            hint="Awaiting confirmation"
          />
          <KpiCard
            label="Mismatches detected"
            value={mismatchCount.toString()}
            icon={AlertTriangle}
            accent={mismatchCount > 0 ? "warning" : "success"}
            hint={mismatchCount > 0 ? "Requires review" : "All clear"}
          />
          <KpiCard
            label="Success rate"
            value={`${successRate}%`}
            icon={TrendingUp}
            accent="success"
            hint="Completed / total"
          />
        </section>

        <Tabs value={tab} onChange={setTab} mismatchCount={mismatchCount} />

        {tab === "transactions" && (
          <TransactionsTab onView={(t) => setDetail(t)} />
        )}
        {tab === "api" && <ApiTab onView={(c) => setApiDetail(c)} />}
        {tab === "errors" && <ErrorsTab />}
        {tab === "mismatches" && <MismatchesTab />}
      </div>

      <TransactionDetailDialog tx={detail} onClose={() => setDetail(null)} />
      <ApiCallDialog call={apiDetail} onClose={() => setApiDetail(null)} />
    </AppShell>
  );
}

// ============= Tabs =============

function Tabs({
  value,
  onChange,
  mismatchCount,
}: {
  value: Tab;
  onChange: (t: Tab) => void;
  mismatchCount: number;
}) {
  const items: { key: Tab; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number; danger?: boolean }[] = [
    { key: "transactions", label: "Transactions", icon: ListChecks },
    { key: "api", label: "API Calls", icon: Server },
    { key: "errors", label: "Errors", icon: Bug, badge: errors.filter((e) => !e.resolved).length },
    { key: "mismatches", label: "Mismatches", icon: AlertTriangle, badge: mismatchCount, danger: true },
  ];
  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-border pb-1">
      {items.map((it) => {
        const active = value === it.key;
        const Icon = it.icon;
        return (
          <button
            key={it.key}
            onClick={() => onChange(it.key)}
            className={cn(
              "relative inline-flex items-center gap-2 rounded-t-md px-3 py-2 text-sm font-medium transition",
              active
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="h-4 w-4" />
            {it.label}
            {it.badge !== undefined && it.badge > 0 && (
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[10px] font-semibold ring-1 ring-inset",
                  it.danger
                    ? "bg-destructive/20 text-destructive ring-destructive/30"
                    : "bg-warning/20 text-warning ring-warning/30",
                )}
              >
                {it.badge}
              </span>
            )}
            {active && (
              <span className="absolute -bottom-[5px] left-0 right-0 h-0.5 rounded-full gradient-primary" />
            )}
          </button>
        );
      })}
    </div>
  );
}

// ============= Transactions Tab =============

function TransactionsTab({ onView }: { onView: (t: Transaction) => void }) {
  const [range, setRange] = useState<DateRange | undefined>();
  const [type, setType] = useState<"all" | TxType>("all");
  const [status, setStatus] = useState<"all" | TxStatus>("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      if (type !== "all" && t.type !== type) return false;
      if (status !== "all" && t.status !== status) return false;
      if (query && !t.client.toLowerCase().includes(query.toLowerCase())) return false;
      if (range?.from) {
        const d = new Date(t.ts);
        if (d < range.from) return false;
        if (range.to && d > range.to) return false;
      }
      return true;
    });
  }, [range, type, status, query]);

  return (
    <div className="space-y-4">
      <GlassCard className="!p-4">
        <div className="grid gap-3 md:grid-cols-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal",
                  !range && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="h-4 w-4" />
                {range?.from ? (
                  range.to ? (
                    <>
                      {format(range.from, "LLL d")} – {format(range.to, "LLL d, y")}
                    </>
                  ) : (
                    format(range.from, "LLL d, y")
                  )
                ) : (
                  <span>Date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                selected={range}
                onSelect={setRange}
                numberOfMonths={2}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>

          <Select value={type} onValueChange={(v) => setType(v as typeof type)}>
            <SelectTrigger>
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="top_up">Top-up</SelectItem>
              <SelectItem value="deposit">Deposit</SelectItem>
              <SelectItem value="withdrawal">Withdrawal</SelectItem>
              <SelectItem value="adjustment">Adjustment</SelectItem>
            </SelectContent>
          </Select>

          <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Failed">Failed</SelectItem>
              <SelectItem value="Mismatch">Mismatch</SelectItem>
            </SelectContent>
          </Select>

          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search client…"
              className="pl-9"
            />
          </div>
        </div>
      </GlassCard>

      <GlassCard className="!p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-3 font-medium">Timestamp</th>
                <th className="px-5 py-3 font-medium">Type</th>
                <th className="px-5 py-3 font-medium">Client</th>
                <th className="px-5 py-3 font-medium">Amount</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Reference</th>
                <th className="px-5 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-sm text-muted-foreground">
                    No transactions match the current filters.
                  </td>
                </tr>
              ) : (
                filtered.map((t) => (
                  <tr
                    key={t.id}
                    className={cn(
                      "border-b border-border/60 hover:bg-background/40",
                      t.status === "Mismatch" && "bg-destructive/5",
                    )}
                  >
                    <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{t.ts}</td>
                    <td className="px-5 py-3">
                      <span
                        className={cn(
                          "rounded-md px-1.5 py-0.5 text-[11px] font-medium ring-1 ring-inset",
                          TYPE_TONE[t.type],
                        )}
                      >
                        {TYPE_LABEL[t.type]}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="font-medium">{t.client}</div>
                      {t.account && (
                        <div className="text-xs text-muted-foreground">{t.account}</div>
                      )}
                    </td>
                    <td
                      className={cn(
                        "px-5 py-3 font-mono text-sm tabular-nums font-semibold",
                        t.amount > 0 ? "text-success" : t.amount < 0 ? "text-destructive" : "text-muted-foreground",
                      )}
                    >
                      <span className="inline-flex items-center gap-1">
                        {t.amount > 0 ? (
                          <ArrowDownCircle className="h-3.5 w-3.5" />
                        ) : t.amount < 0 ? (
                          <ArrowUpCircle className="h-3.5 w-3.5" />
                        ) : null}
                        {fmtAmount(t.amount)}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <StatusPill variant={statusVariant(t.status)}>{t.status}</StatusPill>
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{t.reference}</td>
                    <td className="px-5 py-3 text-right">
                      <Button size="sm" variant="outline" onClick={() => onView(t)}>
                        <Eye className="h-3.5 w-3.5" /> View
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center gap-2 border-t border-border bg-background/30 px-5 py-3 text-xs text-muted-foreground">
          <ListChecks className="h-3.5 w-3.5" />
          Showing {filtered.length} of {transactions.length} transactions
        </div>
      </GlassCard>
    </div>
  );
}

// ============= API Tab =============

function ApiTab({ onView }: { onView: (c: ApiCall) => void }) {
  return (
    <GlassCard className="!p-0 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-[11px] uppercase tracking-wider text-muted-foreground">
              <th className="px-5 py-3 font-medium">Timestamp</th>
              <th className="px-5 py-3 font-medium">Method</th>
              <th className="px-5 py-3 font-medium">Endpoint</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Response time</th>
              <th className="px-5 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {apiCalls.map((c) => (
              <tr
                key={c.id}
                onClick={() => onView(c)}
                className={cn(
                  "cursor-pointer border-b border-border/60 hover:bg-background/40",
                  c.status >= 500 && "bg-destructive/5",
                )}
              >
                <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{c.ts}</td>
                <td className="px-5 py-3">
                  <span
                    className={cn(
                      "rounded-md px-1.5 py-0.5 text-[11px] font-mono font-semibold ring-1 ring-inset",
                      methodTone(c.method),
                    )}
                  >
                    {c.method}
                  </span>
                </td>
                <td className="px-5 py-3 font-mono text-xs">{c.endpoint}</td>
                <td className={cn("px-5 py-3 font-mono text-sm font-semibold", statusTone(c.status))}>
                  {c.status}
                </td>
                <td className="px-5 py-3 font-mono text-xs tabular-nums text-muted-foreground">
                  {c.durationMs} ms
                </td>
                <td className="px-5 py-3 text-right">
                  <Button size="sm" variant="ghost">
                    <Eye className="h-3.5 w-3.5" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}

// ============= Errors Tab =============

function ErrorsTab() {
  const [items, setItems] = useState(errors);
  const update = (id: string, patch: Partial<ErrorEntry>) =>
    setItems((p) => p.map((e) => (e.id === id ? { ...e, ...patch } : e)));

  return (
    <div className="space-y-3">
      {items.map((e) => (
        <GlassCard
          key={e.id}
          className={cn(
            !e.resolved && "border-destructive/30",
          )}
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <div
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ring-1 ring-inset",
                  e.resolved
                    ? "bg-success/15 text-success ring-success/25"
                    : "bg-destructive/15 text-destructive ring-destructive/25",
                )}
              >
                {e.resolved ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-sm font-semibold">{e.type}</span>
                  {e.resolved ? (
                    <StatusPill variant="success">Resolved</StatusPill>
                  ) : (
                    <StatusPill variant="danger">Open</StatusPill>
                  )}
                </div>
                <p className="mt-1 text-sm text-foreground">{e.context}</p>
                <p className="mt-2 rounded-md bg-background/40 px-2.5 py-1.5 font-mono text-xs text-muted-foreground">
                  {e.message}
                </p>
                <p className="mt-2 font-mono text-[11px] text-muted-foreground">{e.ts}</p>
              </div>
            </div>
            {!e.resolved && (
              <div className="flex shrink-0 items-center gap-2">
                <Button size="sm" variant="outline">
                  <RefreshCw className="h-3.5 w-3.5" /> Retry
                </Button>
                <Button
                  size="sm"
                  onClick={() => update(e.id, { resolved: true })}
                  className="bg-success text-success-foreground hover:brightness-110"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" /> Resolve
                </Button>
              </div>
            )}
          </div>
        </GlassCard>
      ))}
    </div>
  );
}

// ============= Mismatches Tab =============

function MismatchesTab() {
  const [items, setItems] = useState(mismatches);
  const resolve = (id: string) =>
    setItems((p) => p.map((m) => (m.id === id ? { ...m, resolved: true } : m)));

  return (
    <div className="space-y-3">
      {items.length === 0 ? (
        <GlassCard className="py-12 text-center">
          <CheckCircle2 className="mx-auto h-8 w-8 text-success" />
          <p className="mt-3 text-sm text-muted-foreground">No mismatches detected.</p>
        </GlassCard>
      ) : (
        items.map((m) => {
          const diff = m.received - m.expected;
          const reasonTone =
            m.reason === "UNEXPECTED"
              ? "bg-destructive/15 text-destructive ring-destructive/25"
              : "bg-warning/15 text-warning ring-warning/25";
          return (
            <GlassCard
              key={m.id}
              className={cn(
                m.resolved
                  ? "border-success/30"
                  : "border-destructive/30 ring-1 ring-destructive/10",
              )}
            >
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset",
                      m.resolved
                        ? "bg-success/15 text-success ring-success/25"
                        : "bg-destructive/15 text-destructive ring-destructive/25",
                    )}
                  >
                    {m.resolved ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <AlertCircle className="h-5 w-5" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">{m.client}</p>
                      <span className="text-xs text-muted-foreground">· {m.account}</span>
                      <span
                        className={cn(
                          "rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 ring-inset",
                          reasonTone,
                        )}
                      >
                        {REASON_LABEL[m.reason]}
                      </span>
                      {m.resolved && <StatusPill variant="success">Resolved</StatusPill>}
                    </div>
                    <p className="mt-1 font-mono text-[11px] text-muted-foreground">{m.ts}</p>

                    <div className="mt-3 grid gap-2 sm:grid-cols-3">
                      <Stat label="Expected" value={fmtAmount(m.expected)} tone="muted" />
                      <Stat label="Received" value={fmtAmount(m.received)} tone="muted" />
                      <Stat
                        label="Difference"
                        value={fmtAmount(diff)}
                        tone={diff < 0 ? "danger" : "warning"}
                        highlight
                      />
                    </div>
                  </div>
                </div>

                {!m.resolved && (
                  <div className="flex shrink-0 flex-wrap items-center gap-2 lg:flex-col lg:items-stretch">
                    <Button size="sm" variant="outline">
                      <Search className="h-3.5 w-3.5" /> Investigate
                    </Button>
                    <Button size="sm" variant="outline">
                      <Wand2 className="h-3.5 w-3.5" /> Manual Adjust
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => resolve(m.id)}
                      className="bg-success text-success-foreground hover:brightness-110"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" /> Mark Resolved
                    </Button>
                  </div>
                )}
              </div>
            </GlassCard>
          );
        })
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  tone = "muted",
  highlight,
}: {
  label: string;
  value: string;
  tone?: "muted" | "danger" | "warning" | "success";
  highlight?: boolean;
}) {
  const toneCls =
    tone === "danger"
      ? "text-destructive"
      : tone === "warning"
        ? "text-warning"
        : tone === "success"
          ? "text-success"
          : "text-foreground";
  return (
    <div
      className={cn(
        "rounded-lg border p-2.5",
        highlight ? "border-destructive/30 bg-destructive/10" : "border-border bg-background/40",
      )}
    >
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={cn("mt-1 font-mono text-sm font-semibold tabular-nums", toneCls)}>{value}</p>
    </div>
  );
}

// ============= Detail Dialogs =============

function TransactionDetailDialog({
  tx,
  onClose,
}: {
  tx: Transaction | null;
  onClose: () => void;
}) {
  if (!tx) return null;
  const relatedApi = apiCalls.filter((c) =>
    tx.steps.some((s) => s.label.toLowerCase().includes("api") || s.label.toLowerCase().includes("meta") || s.label.toLowerCase().includes("google") || s.label.toLowerCase().includes("tiktok")),
  );
  return (
    <Dialog open={!!tx} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl border-border bg-card/95 backdrop-blur-xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-xl ring-1 ring-inset",
                TYPE_TONE[tx.type],
              )}
            >
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="flex items-center gap-2">
                {TYPE_LABEL[tx.type]} · {tx.client}
                <StatusPill variant={statusVariant(tx.status)}>{tx.status}</StatusPill>
              </DialogTitle>
              <DialogDescription className="font-mono text-xs">
                {tx.reference} · initiated by {tx.initiator} · {tx.ts}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="grid gap-3 sm:grid-cols-3">
          <Stat label="Amount" value={fmtAmount(tx.amount)} tone={tx.amount < 0 ? "danger" : "success"} />
          <Stat label="Status" value={tx.status} />
          <Stat label="Initiator" value={tx.initiator} />
        </div>

        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Step-by-step trail
          </p>
          <ol className="space-y-2 rounded-lg border border-border bg-background/40 p-3">
            {tx.steps.map((s, i) => (
              <li key={i} className="flex items-start gap-3 text-sm">
                <span
                  className={cn(
                    "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold",
                    s.ok
                      ? "bg-success/15 text-success ring-1 ring-inset ring-success/30"
                      : "bg-destructive/15 text-destructive ring-1 ring-inset ring-destructive/30",
                  )}
                >
                  {s.ok ? "✓" : "!"}
                </span>
                <div className="min-w-0 flex-1">
                  <p className={cn("text-sm", s.ok ? "text-foreground" : "text-destructive")}>{s.label}</p>
                  <p className="font-mono text-[11px] text-muted-foreground">{s.ts}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {relatedApi.length > 0 && (
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Related API calls
            </p>
            <div className="space-y-1.5">
              {relatedApi.slice(0, 3).map((c) => (
                <div
                  key={c.id}
                  className="flex items-center gap-2 rounded-md border border-border bg-background/40 px-2.5 py-1.5 font-mono text-xs"
                >
                  <span
                    className={cn(
                      "rounded px-1.5 py-0.5 text-[10px] font-semibold ring-1 ring-inset",
                      methodTone(c.method),
                    )}
                  >
                    {c.method}
                  </span>
                  <span className="flex-1 truncate">{c.endpoint}</span>
                  <span className={cn("font-semibold", statusTone(c.status))}>{c.status}</span>
                  <span className="text-muted-foreground">{c.durationMs}ms</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {tx.status === "Mismatch" && (
            <Button variant="outline">
              <Wrench className="h-4 w-4" /> Investigate
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ApiCallDialog({ call, onClose }: { call: ApiCall | null; onClose: () => void }) {
  if (!call) return null;
  return (
    <Dialog open={!!call} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl border-border bg-card/95 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-mono text-base">
            <span
              className={cn(
                "rounded px-1.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset",
                methodTone(call.method),
              )}
            >
              {call.method}
            </span>
            <span className="truncate">{call.endpoint}</span>
          </DialogTitle>
          <DialogDescription className="font-mono text-xs">
            {call.ts} · <span className={statusTone(call.status)}>{call.status}</span> · {call.durationMs}ms
          </DialogDescription>
        </DialogHeader>

        {call.request && (
          <div>
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Request
            </p>
            <pre className="overflow-x-auto rounded-lg border border-border bg-background/60 p-3 font-mono text-xs text-foreground">
              {call.request}
            </pre>
          </div>
        )}

        {call.response && (
          <div>
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Response
            </p>
            <pre
              className={cn(
                "overflow-x-auto rounded-lg border p-3 font-mono text-xs",
                call.status >= 400
                  ? "border-destructive/30 bg-destructive/10 text-destructive"
                  : "border-border bg-background/60 text-foreground",
              )}
            >
              {call.response}
            </pre>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
