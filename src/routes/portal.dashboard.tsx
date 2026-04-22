import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Megaphone,
  Wallet,
  TrendingUp,
  Clock,
  CreditCard,
  Send,
  Plus,
  ArrowUpRight,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";
import { ClientShell } from "@/components/ClientShell";
import { GlassCard } from "@/components/GlassCard";
import { KpiCard } from "@/components/KpiCard";
import { StatusPill } from "@/components/StatusPill";
import { adAccounts } from "@/lib/mock-data";
import { CURRENT_CLIENT } from "@/lib/auth-mock";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/portal/dashboard")({
  head: () => ({
    meta: [
      { title: "Mijn Dashboard — Adcure" },
      {
        name: "description",
        content:
          "Beheer je ad accounts, wallet en top-ups vanuit je persoonlijke client dashboard.",
      },
    ],
  }),
  component: ClientDashboard,
});

type ClientTransaction = {
  id: string;
  type: "topup" | "spend" | "refund" | "request";
  title: string;
  meta: string;
  amount: string;
  status: "Completed" | "Pending" | "Failed";
  time: string;
};

const recentTransactions: ClientTransaction[] = [
  { id: "tx1", type: "topup", title: "Wallet top-up", meta: "iDEAL · ING Bank", amount: "+€2,500.00", status: "Completed", time: "2u geleden" },
  { id: "tx2", type: "spend", title: "Account top-up", meta: "Northwind Performance · Meta", amount: "−€1,200.00", status: "Completed", time: "5u geleden" },
  { id: "tx3", type: "request", title: "Top-up aangevraagd", meta: "Atlas DTC — EU · TikTok", amount: "€800.00", status: "Pending", time: "1d geleden" },
  { id: "tx4", type: "spend", title: "Account top-up", meta: "Helix Labs Growth · Google", amount: "−€450.00", status: "Completed", time: "2d geleden" },
  { id: "tx5", type: "refund", title: "Refund verwerkt", meta: "Lumen Skincare · Meta", amount: "+€120.00", status: "Completed", time: "3d geleden" },
];

function ClientDashboard() {
  const myAccounts = adAccounts.slice(0, 4);
  const activeAccounts = myAccounts.filter((a) => a.status === "Active");
  const previewAccounts = activeAccounts.slice(0, 3);

  const today = new Date().toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <ClientShell>
      <div className="animate-fade-in space-y-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                Welkom, {CURRENT_CLIENT.firstName}
              </h1>
              <StatusPill variant="success">Live · {today}</StatusPill>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Hier is een overzicht van je accounts en wallet.
            </p>
          </div>
        </header>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard label="Active Ad Accounts" value={String(activeAccounts.length)} icon={Megaphone} accent="primary" hint={`van ${myAccounts.length} totaal`} />
          <KpiCard label="Wallet Balance" value="€18,240.00" delta={{ value: "+€2,500", positive: true }} icon={Wallet} accent="success" />
          <KpiCard label="Spend deze maand" value="€7,431.62" delta={{ value: "+12.4%", positive: true }} icon={TrendingUp} accent="violet" hint="t.o.v. vorige maand" />
          <KpiCard label="Pending Top-ups" value="2" icon={Clock} accent="warning" hint="€1,250 in behandeling" />
        </section>

        <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Link
            to="/portal/wallet"
            className="group flex items-center gap-3 rounded-xl gradient-primary p-4 text-left text-white shadow-glow transition hover:brightness-110"
          >
            <span className="rounded-lg bg-white/15 p-2 ring-1 ring-inset ring-white/20">
              <CreditCard className="h-4 w-4" />
            </span>
            <span className="flex-1">
              <span className="block text-sm font-semibold">Top-up Wallet</span>
              <span className="block text-[11px] text-white/80">Voeg saldo toe via iDEAL</span>
            </span>
            <ArrowUpRight className="h-4 w-4 opacity-80 transition group-hover:opacity-100" />
          </Link>

          <Link
            to="/portal/ad-accounts"
            className="group flex items-center gap-3 rounded-xl border border-border bg-card/60 p-4 text-left transition hover:border-border-strong hover:bg-card"
          >
            <span className="rounded-lg bg-violet/15 p-2 text-violet ring-1 ring-inset ring-violet/25">
              <Send className="h-4 w-4" />
            </span>
            <span className="flex-1">
              <span className="block text-sm font-semibold text-foreground">Request Top-up</span>
              <span className="block text-[11px] text-muted-foreground">Top-up voor een ad account</span>
            </span>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground transition group-hover:text-foreground" />
          </Link>

          <Link
            to="/portal/ad-accounts"
            className="group flex items-center gap-3 rounded-xl border border-border bg-card/60 p-4 text-left transition hover:border-border-strong hover:bg-card"
          >
            <span className="rounded-lg bg-warning/15 p-2 text-warning ring-1 ring-inset ring-warning/25">
              <Plus className="h-4 w-4" />
            </span>
            <span className="flex-1">
              <span className="block text-sm font-semibold text-foreground">Request Account</span>
              <span className="block text-[11px] text-muted-foreground">Vraag een nieuw ad account aan</span>
            </span>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground transition group-hover:text-foreground" />
          </Link>
        </section>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <RecentTransactions transactions={recentTransactions} />
          <AdAccountsPreview accounts={previewAccounts} />
        </section>
      </div>
    </ClientShell>
  );
}

function RecentTransactions({ transactions }: { transactions: ClientTransaction[] }) {
  const iconMap = {
    topup: { icon: CreditCard, color: "text-success bg-success/15 ring-success/25" },
    spend: { icon: TrendingUp, color: "text-violet bg-violet/15 ring-violet/25" },
    refund: { icon: CheckCircle2, color: "text-primary-glow bg-primary/15 ring-primary/25" },
    request: { icon: AlertTriangle, color: "text-warning bg-warning/15 ring-warning/25" },
  } as const;

  return (
    <GlassCard>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Recente Activiteit</p>
          <p className="mt-1 text-base font-semibold">Laatste 5 transacties</p>
        </div>
        <Link to="/portal/wallet" className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition hover:text-foreground">
          Bekijk alles
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>
      <ul className="space-y-2">
        {transactions.map((t) => {
          const I = iconMap[t.type].icon;
          const amountColor = t.amount.startsWith("+") ? "text-success" : t.amount.startsWith("−") ? "text-foreground" : "text-muted-foreground";
          return (
            <li key={t.id}>
              <button type="button" className="flex w-full items-start gap-3 rounded-xl border border-border bg-background/30 p-3 text-left transition hover:border-border-strong hover:bg-background/60">
                <div className={cn("mt-0.5 rounded-lg p-2 ring-1 ring-inset", iconMap[t.type].color)}>
                  <I className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium leading-tight text-foreground">{t.title}</p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">{t.meta} · {t.time}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={cn("text-sm font-semibold tabular-nums", amountColor)}>{t.amount}</span>
                  <StatusPill variant={t.status === "Completed" ? "success" : t.status === "Pending" ? "pending" : "danger"}>
                    {t.status}
                  </StatusPill>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </GlassCard>
  );
}

function AdAccountsPreview({ accounts }: { accounts: typeof adAccounts }) {
  const platformColor: Record<string, string> = {
    Meta: "text-primary-glow bg-primary/15 ring-primary/25",
    Google: "text-success bg-success/15 ring-success/25",
    TikTok: "text-violet bg-violet/15 ring-violet/25",
    LinkedIn: "text-warning bg-warning/15 ring-warning/25",
  };

  return (
    <GlassCard>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Mijn Ad Accounts</p>
          <p className="mt-1 text-base font-semibold">Eerste 3 actieve accounts</p>
        </div>
        <Link to="/portal/ad-accounts" className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition hover:text-foreground">
          Bekijk alles
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>
      <ul className="space-y-2">
        {accounts.map((a) => (
          <li key={a.id} className="flex items-center gap-3 rounded-xl border border-border bg-background/30 p-3 transition hover:border-border-strong hover:bg-background/60">
            <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[10px] font-semibold uppercase ring-1 ring-inset", platformColor[a.platform] ?? "text-muted-foreground bg-muted/40")}>
              {a.platform.slice(0, 2)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">{a.name}</p>
              <p className="truncate text-xs text-muted-foreground">
                {a.platform} · <span className="tabular-nums text-foreground">€{a.balance.toLocaleString("nl-NL", { minimumFractionDigits: 2 })}</span>
              </p>
            </div>
            <button type="button" className="inline-flex items-center gap-1.5 rounded-lg bg-primary/15 px-2.5 py-1.5 text-xs font-semibold text-primary-glow ring-1 ring-inset ring-primary/25 transition hover:bg-primary/25">
              <CreditCard className="h-3 w-3" />
              Top-up
            </button>
          </li>
        ))}
      </ul>
    </GlassCard>
  );
}
