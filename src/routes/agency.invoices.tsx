import { requireRole } from "@/lib/auth-mock";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { GlassCard } from "@/components/GlassCard";
import { StatusPill } from "@/components/StatusPill";
import {
  Search,
  Download,
  FileText,
  CheckCircle2,
  ExternalLink,
  Receipt,
  Info,
  X,
  Printer,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/agency/invoices")({
  beforeLoad: () => requireRole("agency_admin"),
  head: () => ({
    meta: [
      { title: "Receipts — Adcure Agency" },
      {
        name: "description",
        content: "Auto-generated receipts for completed top-ups.",
      },
    ],
  }),
  component: InvoicesPage,
});

type InvoiceStatus = "Paid" | "Draft";

type Invoice = {
  id: string;
  number: string;
  client: { name: string; email: string; initials: string };
  issueDate: string;
  issueDateRaw: Date;
  amount: number;
  status: InvoiceStatus;
  topUp: {
    amount: number;
    platform: "Meta" | "Google" | "TikTok" | "LinkedIn";
    accountId: string;
  };
  moneybirdUrl: string;
};

const invoices: Invoice[] = [
  {
    id: "1",
    number: "INV-2026-0184",
    client: { name: "Sofia Martinez", email: "sofia@northwind.io", initials: "SM" },
    issueDate: "Apr 12, 2026",
    issueDateRaw: new Date("2026-04-12"),
    amount: 106.05,
    status: "Paid",
    topUp: { amount: 100, platform: "Meta", accountId: "act_8821390" },
    moneybirdUrl: "https://moneybird.com/123456/invoices/INV-2026-0184",
  },
  {
    id: "2",
    number: "INV-2026-0183",
    client: { name: "Daniel Kim", email: "dan@helixlabs.com", initials: "DK" },
    issueDate: "Apr 10, 2026",
    issueDateRaw: new Date("2026-04-10"),
    amount: 530.25,
    status: "Paid",
    topUp: { amount: 500, platform: "Google", accountId: "act_7710291" },
    moneybirdUrl: "https://moneybird.com/123456/invoices/INV-2026-0183",
  },
  {
    id: "3",
    number: "INV-2026-0182",
    client: { name: "Marco Rossi", email: "marco@atlasdtc.eu", initials: "MR" },
    issueDate: "Apr 8, 2026",
    issueDateRaw: new Date("2026-04-08"),
    amount: 2120.5,
    status: "Paid",
    topUp: { amount: 2000, platform: "TikTok", accountId: "act_5544023" },
    moneybirdUrl: "https://moneybird.com/123456/invoices/INV-2026-0182",
  },
  {
    id: "4",
    number: "INV-2026-0181",
    client: { name: "Alicia Brooks", email: "alicia@quartzfin.com", initials: "AB" },
    issueDate: "Mar 28, 2026",
    issueDateRaw: new Date("2026-03-28"),
    amount: 265.13,
    status: "Paid",
    topUp: { amount: 250, platform: "LinkedIn", accountId: "act_4499182" },
    moneybirdUrl: "https://moneybird.com/123456/invoices/INV-2026-0181",
  },
  {
    id: "5",
    number: "INV-2026-0180",
    client: { name: "Jonas Weber", email: "jonas@novaoutdoor.com", initials: "JW" },
    issueDate: "Mar 25, 2026",
    issueDateRaw: new Date("2026-03-25"),
    amount: 795.38,
    status: "Paid",
    topUp: { amount: 750, platform: "Meta", accountId: "act_3382910" },
    moneybirdUrl: "https://moneybird.com/123456/invoices/INV-2026-0180",
  },
  {
    id: "6",
    number: "INV-2026-0179",
    client: { name: "Priya Nair", email: "priya@lumen.co", initials: "PN" },
    issueDate: "Apr 14, 2026",
    issueDateRaw: new Date("2026-04-14"),
    amount: 318.15,
    status: "Draft",
    topUp: { amount: 300, platform: "Meta", accountId: "act_6602114" },
    moneybirdUrl: "https://moneybird.com/123456/invoices/INV-2026-0179",
  },
  {
    id: "7",
    number: "INV-2026-0178",
    client: { name: "Riley Chen", email: "riley@embercoffee.co", initials: "RC" },
    issueDate: "Mar 20, 2026",
    issueDateRaw: new Date("2026-03-20"),
    amount: 1060.5,
    status: "Paid",
    topUp: { amount: 1000, platform: "Google", accountId: "act_2271504" },
    moneybirdUrl: "https://moneybird.com/123456/invoices/INV-2026-0178",
  },
  {
    id: "8",
    number: "INV-2026-0177",
    client: { name: "Emma Hughes", email: "emma@tideline.com", initials: "EH" },
    issueDate: "Mar 18, 2026",
    issueDateRaw: new Date("2026-03-18"),
    amount: 530.25,
    status: "Paid",
    topUp: { amount: 500, platform: "Meta", accountId: "act_1187320" },
    moneybirdUrl: "https://moneybird.com/123456/invoices/INV-2026-0177",
  },
];

function statusVariant(s: InvoiceStatus) {
  return s === "Paid" ? ("success" as const) : ("neutral" as const);
}

function formatEUR(n: number) {
  return `€${n.toLocaleString("nl-NL", { minimumFractionDigits: 2 })}`;
}

function InvoicesPage() {
  const [period, setPeriod] = useState<"all" | "month" | "quarter">("all");
  const [selected, setSelected] = useState<Invoice | null>(null);
  const [query, setQuery] = useState("");

  const now = new Date("2026-04-22");
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfQuarter = new Date(now.getFullYear(), now.getMonth() - 3, 1);

  const filtered = invoices.filter((inv) => {
    let matchesPeriod = true;
    if (period === "month") matchesPeriod = inv.issueDateRaw >= startOfMonth;
    if (period === "quarter") matchesPeriod = inv.issueDateRaw >= startOfQuarter;

    const q = query.trim().toLowerCase();
    const matchesQuery =
      !q ||
      inv.number.toLowerCase().includes(q) ||
      inv.client.name.toLowerCase().includes(q) ||
      inv.client.email.toLowerCase().includes(q);
    return matchesPeriod && matchesQuery;
  });

  const totalIssued = invoices.reduce((s, i) => s + i.amount, 0);
  const paidCount = invoices.filter((i) => i.status === "Paid").length;
  const draftCount = invoices.filter((i) => i.status === "Draft").length;

  return (
    <AppShell>
      <div className="animate-fade-in space-y-6">
        <header>
          <h1 className="text-2xl font-semibold tracking-tight">Receipts</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Auto-generated receipts for completed top-ups. All invoices are pre-paid via bank
            transfer.
          </p>
        </header>

        {/* Info note */}
        <div className="flex items-start gap-3 rounded-xl border border-primary/25 bg-primary/10 p-4">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary-glow" />
          <p className="text-sm text-muted-foreground">
            These are receipts for completed top-ups. Clients pay via bank transfer before each
            top-up; receipts are issued automatically once funds are reconciled.
          </p>
        </div>

        {/* Summary tiles */}
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {[
            {
              label: "Total Issued",
              value: formatEUR(totalIssued),
              icon: Receipt,
              accent: "primary" as const,
              hint: `${invoices.length} receipts`,
            },
            {
              label: "Paid",
              value: `${paidCount}`,
              icon: CheckCircle2,
              accent: "success" as const,
              hint: "Reconciled & sent",
            },
            {
              label: "Draft",
              value: `${draftCount}`,
              icon: FileText,
              accent: "neutral" as const,
              hint: "Auto-generation pending",
            },
          ].map((m) => (
            <GlassCard key={m.label} className="p-4">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "rounded-lg p-2 ring-1 ring-inset",
                    m.accent === "primary" && "bg-primary/15 text-primary-glow ring-primary/25",
                    m.accent === "success" && "bg-success/15 text-success ring-success/25",
                    m.accent === "neutral" && "bg-muted text-muted-foreground ring-border",
                  )}
                >
                  <m.icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    {m.label}
                  </p>
                  <p className="truncate text-lg font-semibold tabular-nums">{m.value}</p>
                  <p className="text-[11px] text-muted-foreground">{m.hint}</p>
                </div>
              </div>
            </GlassCard>
          ))}
        </section>

        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-1 rounded-xl border border-border bg-card/60 p-1 w-fit">
            {[
              { id: "all", label: "All Invoices" },
              { id: "month", label: "This Month" },
              { id: "quarter", label: "Last Quarter" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setPeriod(t.id as typeof period)}
                className={cn(
                  "rounded-lg px-3.5 py-1.5 text-sm font-medium transition",
                  period === t.id
                    ? "bg-background text-foreground shadow-card"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search client or invoice #…"
              className="w-full rounded-lg border border-border bg-card/60 py-2 pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        {/* Receipt cards grid */}
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((inv) => (
            <GlassCard key={inv.id} className="flex flex-col gap-4 p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary/30 to-violet/30 ring-1 ring-inset ring-border">
                    <FileText className="h-4 w-4" />
                  </div>
                  <p className="font-mono text-xs font-semibold">{inv.number}</p>
                </div>
                <StatusPill variant={statusVariant(inv.status)}>
                  {inv.status === "Paid" ? "Paid ✓" : "Draft"}
                </StatusPill>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-violet/40 to-primary/40 text-[10px] font-semibold text-white">
                    {inv.client.initials}
                  </div>
                  <p className="text-sm font-medium">{inv.client.name}</p>
                </div>
                <p className="pl-9 text-xs text-muted-foreground">
                  Top-up: {formatEUR(inv.topUp.amount)} ({inv.topUp.platform}{" "}
                  <span className="font-mono">{inv.topUp.accountId}</span>)
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 rounded-xl border border-border bg-background/40 p-3 text-sm">
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    Issued
                  </p>
                  <p className="mt-1 font-medium">{inv.issueDate}</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    Amount
                  </p>
                  <p className="mt-1 font-semibold tabular-nums">{formatEUR(inv.amount)}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelected(inv)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium hover:bg-accent"
                >
                  <Download className="h-3.5 w-3.5" /> Download PDF
                </button>
                <a
                  href={inv.moneybirdUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium hover:bg-accent"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> View in Moneybird
                </a>
              </div>
            </GlassCard>
          ))}

          {filtered.length === 0 && (
            <GlassCard className="md:col-span-2 xl:col-span-3 py-12 text-center">
              <p className="text-sm text-muted-foreground">No receipts match your filters.</p>
            </GlassCard>
          )}
        </section>
      </div>

      {selected && <InvoiceDrawer invoice={selected} onClose={() => setSelected(null)} />}
    </AppShell>
  );
}

function InvoiceDrawer({ invoice, onClose }: { invoice: Invoice; onClose: () => void }) {
  const subtotal = invoice.topUp.amount;
  const fee = invoice.amount - subtotal * 1.21;
  const tax = subtotal * 0.21;
  const total = invoice.amount;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-lg flex-col border-l border-border bg-card shadow-elegant animate-slide-in-right">
        <div className="flex items-start justify-between border-b border-border p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary/30 to-violet/30 ring-1 ring-inset ring-border">
              <FileText className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold">{invoice.number}</h2>
              <div className="mt-1 flex items-center gap-2">
                <StatusPill variant={statusVariant(invoice.status)}>
                  {invoice.status === "Paid" ? "Paid ✓" : "Draft"}
                </StatusPill>
                <span className="text-xs text-muted-foreground">
                  Issued on {invoice.issueDate}
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

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <div className="rounded-xl border border-border bg-background/40 p-4">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Receipt for
            </p>
            <div className="mt-2 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet/40 to-primary/40 text-xs font-semibold text-white">
                {invoice.client.initials}
              </div>
              <div>
                <p className="text-sm font-medium">{invoice.client.name}</p>
                <p className="text-xs text-muted-foreground">{invoice.client.email}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-background/40 p-4 space-y-2">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Related top-up
            </p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Platform</span>
              <span className="font-medium">{invoice.topUp.platform}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Ad account</span>
              <span className="font-mono text-xs">{invoice.topUp.accountId}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Top-up amount</span>
              <span className="font-medium tabular-nums">{formatEUR(invoice.topUp.amount)}</span>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-background/40 p-4 space-y-2 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Top-up subtotal</span>
              <span className="tabular-nums">{formatEUR(subtotal)}</span>
            </div>
            {fee > 0.01 && (
              <div className="flex justify-between text-muted-foreground">
                <span>Service fee</span>
                <span className="tabular-nums">{formatEUR(fee)}</span>
              </div>
            )}
            <div className="flex justify-between text-muted-foreground">
              <span>VAT (21%)</span>
              <span className="tabular-nums">{formatEUR(tax)}</span>
            </div>
            <div className="border-t border-border pt-2 flex justify-between font-semibold">
              <span>Total paid</span>
              <span className="tabular-nums">{formatEUR(total)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 border-t border-border p-4">
          <button
            onClick={onClose}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium hover:bg-accent"
          >
            <Printer className="h-4 w-4" /> Print
          </button>
          <a
            href={invoice.moneybirdUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg gradient-primary px-3 py-2 text-sm font-semibold text-white shadow-glow transition hover:brightness-110"
          >
            <ExternalLink className="h-4 w-4" /> Open in Moneybird
          </a>
        </div>
      </aside>
    </div>
  );
}
