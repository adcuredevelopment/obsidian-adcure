import { requireRole } from "@/lib/auth-mock";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { GlassCard } from "@/components/GlassCard";
import {
  Activity,
  Database,
  Mail,
  FileText,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Clock,
  PlayCircle,
  PauseCircle,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  BarChart,
  Bar,
} from "recharts";

export const Route = createFileRoute("/agency/system-health")({
  beforeLoad: () => requireRole("agency_admin"),
  head: () => ({
    meta: [
      { title: "System Health — Adcure Agency" },
      { name: "description", content: "Monitor supplier API, database, jobs, and recent errors." },
    ],
  }),
  component: SystemHealthPage,
});

type Status = "healthy" | "slow" | "down" | "synced" | "active" | "connected";

const services: Array<{
  name: string;
  status: Status;
  detail: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { name: "Supplier API", status: "healthy", detail: "142 ms avg · v2.4.1", icon: Activity },
  { name: "Database", status: "connected", detail: "Postgres · 12 conns", icon: Database },
  { name: "Email Service", status: "active", detail: "Resend · 99.9% delivery", icon: Mail },
  { name: "Moneybird", status: "synced", detail: "Last sync 2 min ago", icon: FileText },
];

const responseTimes = Array.from({ length: 24 }).map((_, i) => ({
  hour: `${i.toString().padStart(2, "0")}:00`,
  ms: 90 + Math.round(Math.sin(i / 3) * 35 + (i === 14 ? 180 : 0) + Math.random() * 25),
}));

const successRate = Array.from({ length: 7 }).map((_, i) => {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return { day: days[i], rate: 97.5 + Math.random() * 2.4 };
});

const txVolume = Array.from({ length: 30 }).map((_, i) => ({
  day: `${i + 1}`,
  count: 80 + Math.round(Math.sin(i / 4) * 40 + Math.random() * 30),
}));

const recentErrors = [
  {
    id: "err_8492",
    severity: "critical" as const,
    when: "12 min ago",
    source: "Supplier API",
    message: "Webhook /topup returned 500 — timeout after 30s",
  },
  {
    id: "err_8488",
    severity: "warning" as const,
    when: "47 min ago",
    source: "Moneybird",
    message: "Invoice 2026-0481 sync delayed (rate-limited)",
  },
  {
    id: "err_8475",
    severity: "info" as const,
    when: "2 h ago",
    source: "Email",
    message: "Bounce: support@unknown-domain.io",
  },
  {
    id: "err_8460",
    severity: "warning" as const,
    when: "5 h ago",
    source: "Reconciliation",
    message: "Mismatch €0.42 on tx_TXN-44919 — auto-flagged",
  },
];

const jobs = [
  {
    name: "Sync supplier accounts",
    schedule: "Every 5 min",
    last: "2 min ago",
    next: "in 3 min",
    status: "ok" as const,
  },
  {
    name: "Reconciliation check",
    schedule: "Every 15 min",
    last: "8 min ago",
    next: "in 7 min",
    status: "ok" as const,
  },
  {
    name: "Daily report generation",
    schedule: "Daily · 06:00 UTC",
    last: "Today, 06:00 UTC",
    next: "Tomorrow, 06:00 UTC",
    status: "ok" as const,
  },
  {
    name: "Wallet balance refresh",
    schedule: "Every 10 min",
    last: "4 min ago",
    next: "in 6 min",
    status: "warning" as const,
  },
  {
    name: "Cleanup audit archive",
    schedule: "Weekly · Sunday",
    last: "3 days ago",
    next: "in 4 days",
    status: "paused" as const,
  },
];

function SystemHealthPage() {
  const [refreshedAt, setRefreshedAt] = useState("just now");

  const refresh = () => {
    setRefreshedAt("refreshing…");
    setTimeout(() => setRefreshedAt("just now"), 700);
  };

  return (
    <AppShell>
      <div className="animate-fade-in space-y-6">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">System Health</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Live status of integrations, scheduled jobs, and recent incidents
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" /> Updated {refreshedAt}
            </span>
            <button
              onClick={refresh}
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium hover:bg-accent"
            >
              <RefreshCw className="h-4 w-4" /> Refresh
            </button>
          </div>
        </header>

        {/* Status grid */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((s) => (
            <StatusCard key={s.name} {...s} />
          ))}
        </section>

        {/* Charts */}
        <section className="grid gap-4 lg:grid-cols-2">
          <ChartCard title="API response times" subtitle="Last 24 hours · ms">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={responseTimes} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis
                  dataKey="hour"
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  interval={3}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<ChartTooltip unit=" ms" />} />
                <Area
                  type="monotone"
                  dataKey="ms"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill="url(#g1)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Success rate" subtitle="Last 7 days · %">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={successRate} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  domain={[95, 100]}
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<ChartTooltip unit=" %" digits={2} />} />
                <Line
                  type="monotone"
                  dataKey="rate"
                  stroke="hsl(var(--success))"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "hsl(var(--success))" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard
            title="Transaction volume"
            subtitle="Last 30 days · count"
            className="lg:col-span-2"
          >
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={txVolume} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  tickLine={false}
                  axisLine={false}
                  interval={2}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<ChartTooltip unit="" />} />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </section>

        {/* Errors + Jobs */}
        <section className="grid gap-4 lg:grid-cols-5">
          <GlassCard className="!p-0 overflow-hidden lg:col-span-3">
            <div className="flex items-center justify-between border-b border-border p-5">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-warning" />
                <h2 className="text-lg font-semibold">Recent errors</h2>
              </div>
              <span className="text-xs text-muted-foreground">{recentErrors.length} in last 24h</span>
            </div>
            <ul className="divide-y divide-border">
              {recentErrors.map((e) => (
                <li key={e.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-start">
                  <SeverityBadge severity={e.severity} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{e.source}</span>
                      <span className="text-xs text-muted-foreground">· {e.when}</span>
                    </div>
                    <p className="mt-0.5 truncate text-sm text-muted-foreground">{e.message}</p>
                    <code className="mt-1 inline-block font-mono text-[10px] text-muted-foreground">
                      {e.id}
                    </code>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium hover:bg-accent">
                      View Details
                    </button>
                    <button className="inline-flex items-center gap-1.5 rounded-lg gradient-primary px-3 py-1.5 text-xs font-semibold text-white shadow-glow transition hover:brightness-110">
                      <RefreshCw className="h-3 w-3" /> Retry
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </GlassCard>

          <GlassCard className="!p-0 overflow-hidden lg:col-span-2">
            <div className="flex items-center gap-2 border-b border-border p-5">
              <Clock className="h-4 w-4 text-primary-glow" />
              <h2 className="text-lg font-semibold">Scheduled jobs</h2>
            </div>
            <ul className="divide-y divide-border">
              {jobs.map((j) => (
                <li key={j.name} className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{j.name}</p>
                      <p className="text-xs text-muted-foreground">{j.schedule}</p>
                    </div>
                    <JobStatus status={j.status} />
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-md border border-border bg-background/40 px-2.5 py-1.5">
                      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                        Last run
                      </p>
                      <p className="mt-0.5 font-medium">{j.last}</p>
                    </div>
                    <div className="rounded-md border border-border bg-background/40 px-2.5 py-1.5">
                      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                        Next run
                      </p>
                      <p className="mt-0.5 font-medium">{j.next}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </GlassCard>
        </section>
      </div>
    </AppShell>
  );
}

function StatusCard({
  name,
  status,
  detail,
  icon: Icon,
}: {
  name: string;
  status: Status;
  detail: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  const t = statusTone(status);
  return (
    <GlassCard className="!p-0 overflow-hidden">
      <div className="flex items-start gap-3 p-5">
        <div className={cn("rounded-lg p-2 ring-1 ring-inset", t.iconBg)}>
          <Icon className={cn("h-4 w-4", t.iconColor)} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-sm font-semibold">{name}</p>
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 ring-inset",
                t.pill,
              )}
            >
              <t.PillIcon className="h-3 w-3" /> {t.label}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
        </div>
      </div>
    </GlassCard>
  );
}

function statusTone(status: Status) {
  switch (status) {
    case "down":
      return {
        label: "Down",
        pill: "bg-destructive/15 text-destructive ring-destructive/30",
        iconBg: "bg-destructive/15 ring-destructive/25",
        iconColor: "text-destructive",
        PillIcon: XCircle,
      };
    case "slow":
      return {
        label: "Slow",
        pill: "bg-warning/15 text-warning ring-warning/30",
        iconBg: "bg-warning/15 ring-warning/25",
        iconColor: "text-warning",
        PillIcon: AlertTriangle,
      };
    default:
      return {
        label:
          status === "synced"
            ? "Synced"
            : status === "active"
              ? "Active"
              : status === "connected"
                ? "Connected"
                : "Healthy",
        pill: "bg-success/15 text-success ring-success/30",
        iconBg: "bg-success/15 ring-success/25",
        iconColor: "text-success",
        PillIcon: CheckCircle2,
      };
  }
}

function ChartCard({
  title,
  subtitle,
  children,
  className,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <GlassCard className={cn("!p-0 overflow-hidden", className)}>
      <div className="flex items-center justify-between border-b border-border p-5">
        <div>
          <h3 className="text-sm font-semibold">{title}</h3>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      <div className="p-3">{children}</div>
    </GlassCard>
  );
}

type TipPayload = { value: number };
function ChartTooltip({
  active,
  payload,
  label,
  unit,
  digits = 0,
}: {
  active?: boolean;
  payload?: TipPayload[];
  label?: string;
  unit: string;
  digits?: number;
}) {
  if (!active || !payload || !payload.length) return null;
  const v = payload[0].value;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-lg">
      <p className="font-medium text-muted-foreground">{label}</p>
      <p className="mt-0.5 font-semibold">
        {digits ? v.toFixed(digits) : v.toLocaleString("nl-NL")}
        {unit}
      </p>
    </div>
  );
}

function SeverityBadge({ severity }: { severity: "critical" | "warning" | "info" }) {
  const map = {
    critical: {
      label: "Critical",
      cls: "bg-destructive/15 text-destructive ring-destructive/30",
      Icon: XCircle,
    },
    warning: {
      label: "Warning",
      cls: "bg-warning/15 text-warning ring-warning/30",
      Icon: AlertTriangle,
    },
    info: {
      label: "Info",
      cls: "bg-primary/15 text-primary-glow ring-primary/30",
      Icon: AlertCircle,
    },
  } as const;
  const t = map[severity];
  const Icon = t.Icon;
  return (
    <span
      className={cn(
        "inline-flex h-fit items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 ring-inset",
        t.cls,
      )}
    >
      <Icon className="h-3 w-3" /> {t.label}
    </span>
  );
}

function JobStatus({ status }: { status: "ok" | "warning" | "paused" }) {
  if (status === "paused") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground ring-1 ring-inset ring-border">
        <PauseCircle className="h-3 w-3" /> Paused
      </span>
    );
  }
  if (status === "warning") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-warning/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-warning ring-1 ring-inset ring-warning/30">
        <AlertTriangle className="h-3 w-3" /> Warning
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-success ring-1 ring-inset ring-success/30">
      <PlayCircle className="h-3 w-3" /> Running
    </span>
  );
}
