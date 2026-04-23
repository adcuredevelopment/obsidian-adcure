import { requireRole } from "@/lib/auth-mock";
import { createFileRoute } from "@tanstack/react-router";
import { ClientShell } from "@/components/ClientShell";
import { GlassCard } from "@/components/GlassCard";
import { StatusPill } from "@/components/StatusPill";
import { Download, FileText, Info } from "lucide-react";

export const Route = createFileRoute("/portal/invoices")({
  beforeLoad: () => requireRole("client"),
  head: () => ({
    meta: [
      { title: "Mijn Bonnetjes — Adcure" },
      {
        name: "description",
        content: "Bekijk en download bonnetjes voor je top-ups.",
      },
    ],
  }),
  component: ClientInvoicesPage,
});

type Inv = {
  id: string;
  number: string;
  issueDate: string;
  amount: number;
  topUp: { amount: number; platform: string; accountId: string };
  moneybirdUrl: string;
};

const myInvoices: Inv[] = [
  {
    id: "1",
    number: "INV-2026-0184",
    issueDate: "12 apr 2026",
    amount: 106.05,
    topUp: { amount: 100, platform: "Meta", accountId: "act_8821390" },
    moneybirdUrl: "https://moneybird.com/123456/invoices/INV-2026-0184",
  },
  {
    id: "2",
    number: "INV-2026-0172",
    issueDate: "12 mrt 2026",
    amount: 530.25,
    topUp: { amount: 500, platform: "Meta", accountId: "act_8821390" },
    moneybirdUrl: "https://moneybird.com/123456/invoices/INV-2026-0172",
  },
  {
    id: "3",
    number: "INV-2026-0188",
    issueDate: "18 apr 2026",
    amount: 1322.5,
    topUp: { amount: 1250, platform: "Google", accountId: "act_7710291" },
    moneybirdUrl: "https://moneybird.com/123456/invoices/INV-2026-0188",
  },
  {
    id: "4",
    number: "INV-2026-0165",
    issueDate: "1 mrt 2026",
    amount: 265.13,
    topUp: { amount: 250, platform: "Meta", accountId: "act_8821390" },
    moneybirdUrl: "https://moneybird.com/123456/invoices/INV-2026-0165",
  },
];

function formatEUR(n: number) {
  return `€${n.toLocaleString("nl-NL", { minimumFractionDigits: 2 })}`;
}

function ClientInvoicesPage() {
  return (
    <ClientShell>
      <div className="animate-fade-in space-y-6">
        <header>
          <h1 className="text-2xl font-semibold tracking-tight">Recente Bonnetjes</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Download bonnetjes voor je voltooide top-ups.
          </p>
        </header>

        <div className="flex items-start gap-3 rounded-xl border border-primary/25 bg-primary/10 p-4">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary-glow" />
          <p className="text-sm text-muted-foreground">
            Dit zijn bonnetjes voor voltooide top-ups. Ze zijn al betaald via bankoverschrijving
            voorafgaand aan de top-up.
          </p>
        </div>

        <GlassCard className="!p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                  <th className="px-5 py-3 font-medium">Bonnetje</th>
                  <th className="px-5 py-3 font-medium">Top-up</th>
                  <th className="px-5 py-3 font-medium">Uitgegeven</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium text-right">Bedrag</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {myInvoices.map((inv) => (
                  <tr
                    key={inv.id}
                    className="border-b border-border/60 hover:bg-background/40"
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
                      <p className="text-sm">
                        {formatEUR(inv.topUp.amount)}{" "}
                        <span className="text-muted-foreground">({inv.topUp.platform})</span>
                      </p>
                      <p className="font-mono text-[11px] text-muted-foreground">
                        {inv.topUp.accountId}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">
                      Issued on {inv.issueDate}
                    </td>
                    <td className="px-5 py-4">
                      <StatusPill variant="success">Paid ✓</StatusPill>
                    </td>
                    <td className="px-5 py-4 text-right font-semibold tabular-nums">
                      {formatEUR(inv.amount)}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end">
                        <button className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium hover:bg-accent">
                          <Download className="h-3.5 w-3.5" /> PDF
                        </button>
                      </div>
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
