import { createFileRoute } from "@tanstack/react-router";
import { ClientShell } from "@/components/ClientShell";
import { GlassCard } from "@/components/GlassCard";
import { StatusPill } from "@/components/StatusPill";
import { Download, FileText, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/portal/invoices")({
  head: () => ({
    meta: [
      { title: "Mijn Facturen — Adcure" },
      { name: "description", content: "Bekijk en download je facturen." },
    ],
  }),
  component: ClientInvoicesPage,
});

type Status = "Paid" | "Pending" | "Overdue";
type Inv = {
  id: string;
  number: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  status: Status;
};

const myInvoices: Inv[] = [
  { id: "1", number: "INV-2026-0184", issueDate: "12 apr 2026", dueDate: "26 apr 2026", amount: 4280.0, status: "Paid" },
  { id: "2", number: "INV-2026-0172", issueDate: "12 mrt 2026", dueDate: "26 mrt 2026", amount: 3920.5, status: "Paid" },
  { id: "3", number: "INV-2026-0188", issueDate: "18 apr 2026", dueDate: "2 mei 2026", amount: 1240.0, status: "Pending" },
  { id: "4", number: "INV-2026-0165", issueDate: "1 mrt 2026", dueDate: "15 mrt 2026", amount: 980.0, status: "Overdue" },
];

function statusVariant(s: Status) {
  if (s === "Paid") return "success" as const;
  if (s === "Pending") return "pending" as const;
  return "danger" as const;
}

function ClientInvoicesPage() {
  const overdue = myInvoices.filter((i) => i.status === "Overdue");

  return (
    <ClientShell>
      <div className="animate-fade-in space-y-6">
        <header>
          <h1 className="text-2xl font-semibold tracking-tight">Mijn Facturen</h1>
          <p className="mt-1 text-sm text-muted-foreground">Download en bekijk de status van je facturen.</p>
        </header>

        {overdue.length > 0 && (
          <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
            <div className="flex-1 text-sm">
              <p className="font-semibold text-destructive">
                {overdue.length} factuur achterstallig
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Betaal openstaande facturen om onderbreking te voorkomen.
              </p>
            </div>
            <button className="rounded-lg bg-destructive px-3 py-1.5 text-xs font-semibold text-destructive-foreground hover:brightness-110">
              Nu betalen
            </button>
          </div>
        )}

        <GlassCard className="!p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                  <th className="px-5 py-3 font-medium">Factuur</th>
                  <th className="px-5 py-3 font-medium">Uitgegeven</th>
                  <th className="px-5 py-3 font-medium">Vervaldatum</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium text-right">Bedrag</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {myInvoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-border/60 hover:bg-background/40">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary/30 to-violet/30 ring-1 ring-inset ring-border">
                          <FileText className="h-4 w-4" />
                        </div>
                        <p className="font-mono text-xs font-medium">{inv.number}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">{inv.issueDate}</td>
                    <td className="px-5 py-4 text-muted-foreground">{inv.dueDate}</td>
                    <td className="px-5 py-4">
                      <StatusPill variant={statusVariant(inv.status)}>{inv.status}</StatusPill>
                    </td>
                    <td className="px-5 py-4 text-right font-semibold tabular-nums">
                      €{inv.amount.toLocaleString("nl-NL", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium hover:bg-accent",
                        )}
                      >
                        <Download className="h-3.5 w-3.5" /> PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>
    </ClientShell>
  );
}
