import { requireRole } from "@/lib/auth-mock";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { GlassCard } from "@/components/GlassCard";
import { KpiCard } from "@/components/KpiCard";
import { StatusPill } from "@/components/StatusPill";
import {
  Users,
  Wallet,
  MessageSquare,
  TrendingUp,
  Plus,
  CreditCard,
  UserPlus,
  Send,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowUpRight,
  Bell,
  ShieldAlert,
  ListChecks,
  RefreshCw,
  ArrowRight,
  ClipboardCheck,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  revenueSeries,
  accountStatusBreakdown,
  recentActivity,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";

type CriticalAlert = {
  id: string;
  title: string;
  meta: string;
  time: string;
  severity: "error" | "warning";
  href: "/agency/wallets" | "/agency/account-applications" | "/agency/system-health";
};

const CRITICAL_ALERTS: CriticalAlert[] = [
  {
    id: "a1",
    title: "Wallet mismatch detected",
    meta: "Northwind Performance · €482 variance",
    time: "4m",
    severity: "error",
    href: "/agency/wallets",
  },
  {
    id: "a2",
    title: "Top-up failed at supplier",
    meta: "Atlas DTC — EU · TikTok",
    time: "22m",
    severity: "error",
    href: "/agency/account-applications",
  },
  {
    id: "a3",
    title: "Supplier sync delayed",
    meta: "Last sync 38m ago (target ≤15m)",
    time: "38m",
    severity: "warning",
    href: "/agency/system-health",
  },
];

const PENDING_ACCOUNT_REQUESTS = 4;
const PENDING_TOPUPS = 7;
const PENDING_SIGNUPS = 2;
const PENDING_TOTAL = PENDING_ACCOUNT_REQUESTS + PENDING_TOPUPS + PENDING_SIGNUPS;

export const Route = createFileRoute("/agency/dashboard")({
  beforeLoad: () => requireRole("agency_admin"),
  head: () => ({
    meta: [
      { title: "Dashboard — Adcure Agency" },
      { name: "description", content: "Overview of clients, balances and activity." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const today = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <AppShell>
      <div className="animate-fade-in space-y-8">
        {/* Header */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                Good afternoon, David
              </h1>
              <StatusPill variant="success">
                Live · {today}
              </StatusPill>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Here's how your agency is performing today.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <CriticalAlertsBell alerts={CRITICAL_ALERTS} />
            <button className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3.5 py-2 text-sm font-medium text-foreground transition hover:border-border-strong hover:bg-accent">
              <CreditCard className="h-4 w-4" /> New Top-up
            </button>
            <button className="inline-flex items-center gap-2 rounded-lg gradient-primary px-3.5 py-2 text-sm font-semibold text-white shadow-glow transition hover:brightness-110">
              <Plus className="h-4 w-4" /> New Account
            </button>
          </div>
        </header>

        {/* KPIs */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <KpiCard
            label="Total Clients"
            value="58"
            delta={{ value: "+1", positive: true }}
            icon={Users}
            accent="primary"
            hint="this week"
          />
          <KpiCard
            label="Ad Account Balance"
            value="$184,210"
            delta={{ value: "+8.2%", positive: true }}
            icon={TrendingUp}
            accent="success"
          />
          <KpiCard
            label="Client Wallet Balance"
            value="$72,940"
            delta={{ value: "−2.1%", positive: false }}
            icon={Wallet}
            accent="violet"
          />
          <KpiCard
            label="Open Conversations"
            value="14"
            delta={{ value: "+3", positive: true }}
            icon={MessageSquare}
            accent="warning"
          />
          <PendingApprovalsCard />
        </section>

        {/* Charts */}
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <GlassCard className="lg:col-span-2" glow>
            <div className="mb-4 flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Revenue Overview
                </p>
                <p className="mt-1 text-xl font-semibold tracking-tight">
                  $42,840 <span className="ml-1 text-xs font-normal text-success">+12.4%</span>
                </p>
              </div>
              <div className="flex items-center gap-1 rounded-lg border border-border bg-background/40 p-0.5">
                {["7D", "30D", "90D"].map((r, i) => (
                  <button
                    key={r}
                    className={cn(
                      "rounded-md px-2.5 py-1 text-xs font-medium transition",
                      i === 0
                        ? "bg-card text-foreground shadow-card"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueSeries} margin={{ left: -12, right: 8, top: 8 }}>
                  <defs>
                    <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="spd" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-violet)" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="var(--color-violet)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="day"
                    stroke="var(--color-muted-foreground)"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="var(--color-muted-foreground)"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--color-popover)",
                      border: "1px solid var(--color-border-strong)",
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                    labelStyle={{ color: "var(--color-muted-foreground)" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="var(--color-primary)"
                    strokeWidth={2}
                    fill="url(#rev)"
                  />
                  <Area
                    type="monotone"
                    dataKey="spend"
                    stroke="var(--color-violet)"
                    strokeWidth={2}
                    fill="url(#spd)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="mb-4">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Account Status
              </p>
              <p className="mt-1 text-xl font-semibold tracking-tight">58 accounts</p>
            </div>
            <div className="relative h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={accountStatusBreakdown}
                    innerRadius={56}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {accountStatusBreakdown.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-semibold">72%</span>
                <span className="text-[11px] text-muted-foreground">Active</span>
              </div>
            </div>
            <ul className="mt-4 space-y-2">
              {accountStatusBreakdown.map((s) => (
                <li key={s.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: s.color }}
                    />
                    <span className="text-muted-foreground">{s.name}</span>
                  </div>
                  <span className="font-medium tabular-nums">{s.value}</span>
                </li>
              ))}
            </ul>
          </GlassCard>
        </section>

        {/* Activity */}
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <PendingActions />
          <RecentActivity />
        </section>

        {/* Today's Summary */}
        <TodaysSummary />

        {/* Quick actions */}
        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Quick Actions
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Link
              to="/agency/account-applications"
              className="group flex items-center gap-3 rounded-xl border border-border bg-card/60 p-3.5 text-left transition hover:border-border-strong hover:bg-card"
            >
              <span className="rounded-lg bg-success/15 p-2 text-success ring-1 ring-inset ring-success/25">
                <ClipboardCheck className="h-4 w-4" />
              </span>
              <span className="flex-1">
                <span className="block text-sm font-medium">Approve Pending</span>
                <span className="block text-[11px] text-muted-foreground">
                  {PENDING_TOTAL} items waiting
                </span>
              </span>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground transition group-hover:text-foreground" />
            </Link>
            <Link
              to="/agency/wallets"
              className="group flex items-center gap-3 rounded-xl border border-border bg-card/60 p-3.5 text-left transition hover:border-border-strong hover:bg-card"
            >
              <span className="rounded-lg bg-warning/15 p-2 text-warning ring-1 ring-inset ring-warning/25">
                <ShieldAlert className="h-4 w-4" />
              </span>
              <span className="flex-1">
                <span className="block text-sm font-medium">View Mismatches</span>
                <span className="block text-[11px] text-muted-foreground">
                  3 wallet variances
                </span>
              </span>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground transition group-hover:text-foreground" />
            </Link>
            <Link
              to="/agency/system-health"
              className="group flex items-center gap-3 rounded-xl border border-border bg-card/60 p-3.5 text-left transition hover:border-border-strong hover:bg-card"
            >
              <span className="rounded-lg bg-violet/15 p-2 text-violet ring-1 ring-inset ring-violet/25">
                <RefreshCw className="h-4 w-4" />
              </span>
              <span className="flex-1">
                <span className="block text-sm font-medium">Run Reconciliation</span>
                <span className="block text-[11px] text-muted-foreground">
                  Last run 2h ago
                </span>
              </span>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground transition group-hover:text-foreground" />
            </Link>
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function PendingActions() {
  const [tab, setTab] = useState<"accounts" | "topups">("accounts");
  const accountReqs = [
    { id: 1, name: "Ember Coffee", platform: "Google Ads", time: "1h" },
    { id: 2, name: "Lumen Skincare", platform: "Meta", time: "3h" },
  ];
  const topUpReqs = [
    { id: 1, name: "Helix Labs Growth", amount: "$1,200", time: "2h" },
    { id: 2, name: "Quartz Finance", amount: "$500", time: "yesterday" },
  ];
  return (
    <GlassCard>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Pending Actions
          </p>
          <p className="mt-1 text-base font-semibold">Needs your attention</p>
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-border bg-background/40 p-0.5">
          <button
            onClick={() => setTab("accounts")}
            className={cn(
              "rounded-md px-2.5 py-1 text-xs font-medium transition",
              tab === "accounts" ? "bg-card text-foreground shadow-card" : "text-muted-foreground",
            )}
          >
            Account Requests
          </button>
          <button
            onClick={() => setTab("topups")}
            className={cn(
              "rounded-md px-2.5 py-1 text-xs font-medium transition",
              tab === "topups" ? "bg-card text-foreground shadow-card" : "text-muted-foreground",
            )}
          >
            Top-up Requests
          </button>
        </div>
      </div>
      <ul className="space-y-2">
        {(tab === "accounts" ? accountReqs : topUpReqs).map((r) => (
          <li
            key={r.id}
            className="flex items-center gap-3 rounded-xl border border-border bg-background/30 p-3 transition hover:bg-background/60"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary-glow ring-1 ring-inset ring-primary/25">
              {tab === "accounts" ? <Plus className="h-4 w-4" /> : <CreditCard className="h-4 w-4" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{r.name}</p>
              <p className="truncate text-xs text-muted-foreground">
                {tab === "accounts"
                  ? (r as { platform: string }).platform
                  : (r as { amount: string }).amount}{" "}
                · {r.time} ago
              </p>
            </div>
            <button className="rounded-lg bg-success/15 px-3 py-1.5 text-xs font-semibold text-success ring-1 ring-inset ring-success/25 transition hover:bg-success/25">
              Review
            </button>
          </li>
        ))}
      </ul>
    </GlassCard>
  );
}

function RecentActivity() {
  const iconMap = {
    topup: { icon: CreditCard, color: "text-violet bg-violet/15 ring-violet/25" },
    request: { icon: Plus, color: "text-primary-glow bg-primary/15 ring-primary/25" },
    approval: { icon: CheckCircle2, color: "text-success bg-success/15 ring-success/25" },
    alert: { icon: AlertTriangle, color: "text-warning bg-warning/15 ring-warning/25" },
  } as const;
  return (
    <GlassCard>
      <div className="mb-4">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Recent Activity
        </p>
        <p className="mt-1 text-base font-semibold">Last 24 hours</p>
      </div>
      <ul className="space-y-3">
        {recentActivity.map((a) => {
          const I = iconMap[a.type].icon;
          return (
            <li key={a.id} className="flex items-start gap-3">
              <div
                className={cn(
                  "rounded-lg p-2 ring-1 ring-inset",
                  iconMap[a.type].color,
                )}
              >
                <I className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium leading-tight">{a.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{a.meta}</p>
              </div>
              <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {a.time}
              </span>
            </li>
          );
        })}
      </ul>
    </GlassCard>
  );
}

function CriticalAlertsBell({ alerts }: { alerts: CriticalAlert[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const count = alerts.length;
  const hasErrors = alerts.some((a) => a.severity === "error");

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn(
          "relative inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition",
          count > 0 && hasErrors
            ? "border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive/15"
            : count > 0
              ? "border-warning/40 bg-warning/10 text-warning hover:bg-warning/15"
              : "border-border bg-card text-foreground hover:border-border-strong hover:bg-accent",
        )}
      >
        <Bell className="h-4 w-4" />
        Critical Alerts
        {count > 0 && (
          <span
            className={cn(
              "ml-0.5 inline-flex min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-semibold leading-none",
              hasErrors
                ? "bg-destructive text-destructive-foreground"
                : "bg-warning text-warning-foreground",
            )}
          >
            {count}
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-40 mt-2 w-[360px] origin-top-right rounded-xl border border-border bg-popover shadow-elegant animate-fade-in"
        >
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="text-sm font-semibold">Critical Alerts</p>
            <span className="text-[11px] text-muted-foreground">{count} active</span>
          </div>
          <ul className="max-h-[320px] overflow-y-auto p-2">
            {alerts.length === 0 ? (
              <li className="p-4 text-center text-xs text-muted-foreground">
                Nothing to worry about — all systems healthy.
              </li>
            ) : (
              alerts.map((a) => (
                <li key={a.id}>
                  <Link
                    to={a.href}
                    onClick={() => setOpen(false)}
                    className="flex items-start gap-3 rounded-lg p-2.5 transition hover:bg-background/60"
                  >
                    <div
                      className={cn(
                        "mt-0.5 rounded-lg p-1.5 ring-1 ring-inset",
                        a.severity === "error"
                          ? "bg-destructive/15 text-destructive ring-destructive/25"
                          : "bg-warning/15 text-warning ring-warning/25",
                      )}
                    >
                      <AlertTriangle className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{a.title}</p>
                      <p className="truncate text-xs text-muted-foreground">{a.meta}</p>
                    </div>
                    <span className="shrink-0 text-[11px] text-muted-foreground">{a.time}</span>
                  </Link>
                </li>
              ))
            )}
          </ul>
          <div className="border-t border-border px-4 py-2 text-right">
            <Link
              to="/agency/system-health"
              onClick={() => setOpen(false)}
              className="inline-flex items-center gap-1 text-xs font-medium text-primary-glow hover:text-primary"
            >
              View system health <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function PendingApprovalsCard() {
  return (
    <Link
      to="/agency/account-applications"
      className="group block rounded-2xl border border-border bg-card/80 p-5 shadow-card backdrop-blur-xl transition hover:border-border-strong hover:bg-card"
    >
      <div className="flex items-center justify-between">
        <div className="rounded-lg bg-warning/15 p-2 text-warning ring-1 ring-inset ring-warning/25">
          <ListChecks className="h-4 w-4" />
        </div>
        <ArrowUpRight className="h-4 w-4 text-muted-foreground transition group-hover:text-foreground" />
      </div>
      <p className="mt-3 text-[11px] uppercase tracking-wider text-muted-foreground">
        Pending Approvals
      </p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{PENDING_TOTAL}</p>
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
        <span>{PENDING_ACCOUNT_REQUESTS} accounts</span>
        <span className="text-border">·</span>
        <span>{PENDING_TOPUPS} top-ups</span>
        <span className="text-border">·</span>
        <span>{PENDING_SIGNUPS} sign-ups</span>
      </div>
    </Link>
  );
}

function TodaysSummary() {
  const processed = 142;
  const amount = 184320;
  const successRate = 98.6;
  const failed = 2;

  return (
    <GlassCard>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Today's Summary
          </p>
          <p className="mt-1 text-base font-semibold">Operational snapshot</p>
        </div>
        <Link
          to="/agency/audit-log"
          className="inline-flex items-center gap-1 text-xs font-medium text-primary-glow hover:text-primary"
        >
          View audit log <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-background/40 p-3">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Transactions
          </p>
          <p className="mt-1 text-lg font-semibold tabular-nums">{processed}</p>
        </div>
        <div className="rounded-xl border border-border bg-background/40 p-3">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Volume</p>
          <p className="mt-1 text-lg font-semibold tabular-nums">
            ${amount.toLocaleString()}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-background/40 p-3">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Success Rate
          </p>
          <p className="mt-1 text-lg font-semibold tabular-nums text-success">{successRate}%</p>
        </div>
        <div className="rounded-xl border border-border bg-background/40 p-3">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Failed</p>
          <p
            className={cn(
              "mt-1 text-lg font-semibold tabular-nums",
              failed > 0 ? "text-destructive" : "text-foreground",
            )}
          >
            {failed}
          </p>
        </div>
      </div>
    </GlassCard>
  );
}
