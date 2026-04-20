import { createFileRoute } from "@tanstack/react-router";
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
} from "lucide-react";
import { useState } from "react";
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

export const Route = createFileRoute("/")({
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
            <button className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3.5 py-2 text-sm font-medium text-foreground transition hover:border-border-strong hover:bg-accent">
              <CreditCard className="h-4 w-4" /> New Top-up
            </button>
            <button className="inline-flex items-center gap-2 rounded-lg gradient-primary px-3.5 py-2 text-sm font-semibold text-white shadow-glow transition hover:brightness-110">
              <Plus className="h-4 w-4" /> New Account
            </button>
          </div>
        </header>

        {/* KPIs */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
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

        {/* Quick actions */}
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Create account", icon: Plus, accent: "primary" },
            { label: "Top up wallet", icon: CreditCard, accent: "success" },
            { label: "Invite client", icon: UserPlus, accent: "violet" },
            { label: "Send message", icon: Send, accent: "warning" },
          ].map((q) => (
            <button
              key={q.label}
              className="group flex items-center gap-3 rounded-xl border border-border bg-card/60 p-3.5 text-left transition hover:border-border-strong hover:bg-card"
            >
              <span
                className={cn(
                  "rounded-lg p-2 ring-1 ring-inset",
                  q.accent === "primary" && "bg-primary/15 text-primary-glow ring-primary/25",
                  q.accent === "success" && "bg-success/15 text-success ring-success/25",
                  q.accent === "violet" && "bg-violet/15 text-violet ring-violet/25",
                  q.accent === "warning" && "bg-warning/15 text-warning ring-warning/25",
                )}
              >
                <q.icon className="h-4 w-4" />
              </span>
              <span className="text-sm font-medium">{q.label}</span>
              <ArrowUpRight className="ml-auto h-4 w-4 text-muted-foreground transition group-hover:text-foreground" />
            </button>
          ))}
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
