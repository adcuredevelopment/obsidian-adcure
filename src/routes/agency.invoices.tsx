import { requireRole } from "@/lib/auth-mock";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { GlassCard } from "@/components/GlassCard";
import { StatusPill } from "@/components/StatusPill";
import {
  Search,
  Filter,
  Download,
  Plus,
  MoreHorizontal,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  Send,
  Printer,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/agency/invoices")({
  beforeLoad: () => requireRole("agency_admin"),
  head: () => ({
    meta: [
      { title: "Invoices — Adcure Agency" },
      { name: "description", content: "Manage and review invoices sent to customers." },
    ],
  }),
  component: InvoicesPage,
});

type InvoiceStatus = "Paid" | "Pending" | "Overdue" | "Draft";

type Invoice = {
  id: string;
  number: string;
  client: { name: string; email: string; initials: string };
  issueDate: string;
  dueDate: string;
  amount: number;
  status: InvoiceStatus;
  items: { description: string; qty: number; price: number }[];
};

const invoices: Invoice[] = [
  {
    id: "1",
    number: "INV-2026-0184",
    client: { name: "Sofia Martinez", email: "sofia@northwind.io", initials: "SM" },
    issueDate: "Apr 12, 2026",
    dueDate: "Apr 26, 2026",
    amount: 4280.0,
    status: "Paid",
    items: [
      { description: "Meta Ads Management — March", qty: 1, price: 2800 },
      { description: "Creative production (3 ads)", qty: 3, price: 360 },
      { description: "Strategy consultation", qty: 4, price: 100 },
    ],
  },
  {
    id: "2",
    number: "INV-2026-0183",
    client: { name: "Daniel Kim", email: "dan@helixlabs.com", initials: "DK" },
    issueDate: "Apr 10, 2026",
    dueDate: "Apr 24, 2026",
    amount: 2150.5,
    status: "Pending",
    items: [
      { description: "Google Ads Management — March", qty: 1, price: 1800 },
      { description: "Landing page audit", qty: 1, price: 350.5 },
    ],
  },
  {
    id: "3",
    number: "INV-2026-0182",
    client: { name: "Marco Rossi", email: "marco@atlasdtc.eu", initials: "MR" },
    issueDate: "Apr 8, 2026",
    dueDate: "Apr 22, 2026",
    amount: 8920.0,
    status: "Paid",
    items: [{ description: "Full-funnel campaign — Q2 retainer", qty: 1, price: 8920 }],
  },
  {
    id: "4",
    number: "INV-2026-0181",
    client: { name: "Alicia Brooks", email: "alicia@quartzfin.com", initials: "AB" },
    issueDate: "Mar 28, 2026",
    dueDate: "Apr 11, 2026",
    amount: 1240.0,
    status: "Overdue",
    items: [{ description: "LinkedIn Ads Management — March", qty: 1, price: 1240 }],
  },
  {
    id: "5",
    number: "INV-2026-0180",
    client: { name: "Jonas Weber", email: "jonas@novaoutdoor.com", initials: "JW" },
    issueDate: "Mar 25, 2026",
    dueDate: "Apr 8, 2026",
    amount: 3680.25,
    status: "Paid",
    items: [
      { description: "Meta Ads Management — March", qty: 1, price: 2800 },
      { description: "Creative production", qty: 2, price: 440.13 },
    ],
  },
  {
    id: "6",
    number: "INV-2026-0179",
    client: { name: "Priya Nair", email: "priya@lumen.co", initials: "PN" },
    issueDate: "Apr 14, 2026",
    dueDate: "Apr 28, 2026",
    amount: 980.0,
    status: "Draft",
    items: [{ description: "Onboarding & setup fee", qty: 1, price: 980 }],
  },
  {
    id: "7",
    number: "INV-2026-0178",
    client: { name: "Riley Chen", email: "riley@embercoffee.co", initials: "RC" },
    issueDate: "Mar 20, 2026",
    dueDate: "Apr 3, 2026",
    amount: 2480.0,
    status: "Overdue",
    items: [{ description: "Google Ads Management — March", qty: 1, price: 2480 }],
  },
  {
    id: "8",
    number: "INV-2026-0177",
    client: { name: "Emma Hughes", email: "emma@tideline.com", initials: "EH" },
    issueDate: "Mar 18, 2026",
    dueDate: "Apr 1, 2026",
    amount: 5120.0,
    status: "Paid",
    items: [{ description: "Meta + TikTok retainer — March", qty: 1, price: 5120 }],
  },
];

function statusVariant(s: InvoiceStatus) {
  switch (s) {
    case "Paid":
      return "success" as const;
    case "Pending":
      return "pending" as const;
    case "Overdue":
      return "danger" as const;
    case "Draft":
      return "neutral" as const;
  }
}

function InvoicesPage() {
  const [tab, setTab] = useState<"all" | "paid" | "pending" | "overdue" | "draft">("all");
  const [selected, setSelected] = useState<Invoice | null>(null);
  const [query, setQuery] = useState("");

  const filtered = invoices.filter((inv) => {
    const matchesTab =
      tab === "all" ? true : inv.status.toLowerCase() === tab;
    const q = query.trim().toLowerCase();
    const matchesQuery =
      !q ||
      inv.number.toLowerCase().includes(q) ||
      inv.client.name.toLowerCase().includes(q) ||
      inv.client.email.toLowerCase().includes(q);
    return matchesTab && matchesQuery;
  });

  const totals = invoices.reduce(
    (acc, inv) => {
      acc.total += inv.amount;
      if (inv.status === "Paid") acc.paid += inv.amount;
      if (inv.status === "Pending") acc.pending += inv.amount;
      if (inv.status === "Overdue") acc.overdue += inv.amount;
      return acc;
    },
    { total: 0, paid: 0, pending: 0, overdue: 0 },
  );

  return (
    <AppShell>
      <div className="animate-fade-in space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Invoices</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Review and manage invoices sent to customers.
            </p>
          </div>
          <button className="inline-flex items-center gap-2 self-start rounded-lg gradient-primary px-3.5 py-2 text-sm font-semibold text-white shadow-glow transition hover:brightness-110">
            <Plus className="h-4 w-4" /> New Invoice
          </button>
        </header>

        {/* Summary tiles */}
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            {
              label: "Total Billed",
              value: `$${totals.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
              icon: FileText,
              accent: "primary" as const,
              hint: `${invoices.length} invoices`,
            },
            {
              label: "Paid",
              value: `$${totals.paid.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
              icon: CheckCircle2,
              accent: "success" as const,
              hint: `${invoices.filter((i) => i.status === "Paid").length} invoices`,
            },
            {
              label: "Pending",
              value: `$${totals.pending.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
              icon: Clock,
              accent: "warning" as const,
              hint: `${invoices.filter((i) => i.status === "Pending").length} invoices`,
            },
            {
              label: "Overdue",
              value: `$${totals.overdue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
              icon: AlertCircle,
              accent: "danger" as const,
              hint: `${invoices.filter((i) => i.status === "Overdue").length} invoices`,
            },
          ].map((m) => (
            <GlassCard key={m.label} className="p-4">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "rounded-lg p-2 ring-1 ring-inset",
                    m.accent === "primary" && "bg-primary/15 text-primary-glow ring-primary/25",
                    m.accent === "success" && "bg-success/15 text-success ring-success/25",
                    m.accent === "warning" && "bg-warning/15 text-warning ring-warning/25",
                    m.accent === "danger" && "bg-destructive/15 text-destructive ring-destructive/25",
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

        {/* Tabs */}
        <div className="flex items-center gap-1 rounded-xl border border-border bg-card/60 p-1 w-fit">
          {[
            { id: "all", label: "All", count: invoices.length },
            { id: "paid", label: "Paid", count: invoices.filter((i) => i.status === "Paid").length },
            { id: "pending", label: "Pending", count: invoices.filter((i) => i.status === "Pending").length },
            { id: "overdue", label: "Overdue", count: invoices.filter((i) => i.status === "Overdue").length },
            { id: "draft", label: "Draft", count: invoices.filter((i) => i.status === "Draft").length },
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

        {/* Toolbar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search invoice or client…"
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
                  <th className="px-5 py-3 font-medium">Invoice</th>
                  <th className="px-5 py-3 font-medium">Client</th>
                  <th className="px-5 py-3 font-medium">Issued</th>
                  <th className="px-5 py-3 font-medium">Due</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium text-right">Amount</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((inv) => (
                  <tr
                    key={inv.id}
                    onClick={() => setSelected(inv)}
                    className="cursor-pointer border-b border-border/60 transition hover:bg-background/40"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary/30 to-violet/30 ring-1 ring-inset ring-border">
                          <FileText className="h-4 w-4" />
                        </div>
                        <p className="font-mono text-xs font-medium">{inv.number}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-violet/40 to-primary/40 text-[10px] font-semibold text-white">
                          {inv.client.initials}
                        </div>
                        <div className="leading-tight">
                          <p className="text-sm">{inv.client.name}</p>
                          <p className="text-xs text-muted-foreground">{inv.client.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">{inv.issueDate}</td>
                    <td className="px-5 py-4 text-muted-foreground">{inv.dueDate}</td>
                    <td className="px-5 py-4">
                      <StatusPill variant={statusVariant(inv.status)}>{inv.status}</StatusPill>
                    </td>
                    <td className="px-5 py-4 text-right font-semibold tabular-nums">
                      ${inv.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
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
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-sm text-muted-foreground">
                      No invoices match your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>

      {selected && <InvoiceDrawer invoice={selected} onClose={() => setSelected(null)} />}
    </AppShell>
  );
}

function InvoiceDrawer({ invoice, onClose }: { invoice: Invoice; onClose: () => void }) {
  const subtotal = invoice.items.reduce((s, i) => s + i.qty * i.price, 0);
  const tax = subtotal * 0.21;
  const total = subtotal + tax;

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
                <StatusPill variant={statusVariant(invoice.status)}>{invoice.status}</StatusPill>
                <span className="text-xs text-muted-foreground">Issued {invoice.issueDate}</span>
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
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Billed To</p>
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

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-border bg-background/40 p-3">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Issued</p>
              <p className="mt-1 text-sm font-medium">{invoice.issueDate}</p>
            </div>
            <div className="rounded-xl border border-border bg-background/40 p-3">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Due</p>
              <p className="mt-1 text-sm font-medium">{invoice.dueDate}</p>
            </div>
          </div>

          <div>
            <p className="mb-2 text-[11px] uppercase tracking-wider text-muted-foreground">
              Line Items
            </p>
            <div className="overflow-hidden rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead className="bg-background/40 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 font-medium">Description</th>
                    <th className="px-3 py-2 font-medium text-right">Qty</th>
                    <th className="px-3 py-2 font-medium text-right">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((it, i) => (
                    <tr key={i} className="border-t border-border">
                      <td className="px-3 py-2">{it.description}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{it.qty}</td>
                      <td className="px-3 py-2 text-right tabular-nums">
                        ${it.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-background/40 p-4 space-y-2 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span className="tabular-nums">
                ${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>VAT (21%)</span>
              <span className="tabular-nums">
                ${tax.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="border-t border-border pt-2 flex justify-between font-semibold">
              <span>Total</span>
              <span className="tabular-nums">
                ${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
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
          <button className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg gradient-primary px-3 py-2 text-sm font-semibold text-white shadow-glow transition hover:brightness-110">
            <Send className="h-4 w-4" /> Resend
          </button>
        </div>
      </aside>
    </div>
  );
}
