import { requireRole } from "@/lib/auth-mock";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { GlassCard } from "@/components/GlassCard";
import { StatusPill } from "@/components/StatusPill";
import { ClipboardList, AlertTriangle, CheckCircle2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/agency/audit-log")({
  beforeLoad: () => requireRole("agency_admin"),
  head: () => ({ meta: [{ title: "Audit Log — Adcure Agency" }] }),
  component: AuditLogPage,
});

type Entry = {
  id: string;
  ts: string;
  actor: string;
  action: string;
  target: string;
  delta?: string;
  status: "OK" | "Mismatch" | "Reconciled";
};

const entries: Entry[] = [
  { id: "1", ts: "2026-04-22 14:02:11", actor: "system", action: "Wallet sync", target: "Northwind Performance", delta: "+€2,500.00", status: "OK" },
  { id: "2", ts: "2026-04-22 13:48:20", actor: "david@adcure", action: "Approve top-up", target: "Helix Labs Growth", delta: "+€1,200.00", status: "OK" },
  { id: "3", ts: "2026-04-22 12:15:03", actor: "system", action: "Spend reconcile", target: "Quartz Finance", delta: "−€110.25 / €112.10 reported", status: "Mismatch" },
  { id: "4", ts: "2026-04-22 09:33:51", actor: "david@adcure", action: "Create account", target: "Atlas DTC — EU", status: "OK" },
  { id: "5", ts: "2026-04-21 22:10:42", actor: "system", action: "Daily snapshot", target: "All wallets", status: "OK" },
  { id: "6", ts: "2026-04-21 18:02:09", actor: "system", action: "Spend reconcile", target: "Lumen Skincare", delta: "fixed €0.40", status: "Reconciled" },
];

function AuditLogPage() {
  const mismatches = entries.filter((e) => e.status === "Mismatch").length;

  return (
    <AppShell>
      <div className="animate-fade-in space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Audit Log</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Reconciliation between wallet, ad account spend, and platform reports.
            </p>
          </div>
          <button className="inline-flex items-center gap-2 self-start rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium hover:bg-accent">
            <RefreshCw className="h-4 w-4" /> Re-sync now
          </button>
        </header>

        {mismatches > 0 && (
          <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
            <div className="flex-1 text-sm">
              <p className="font-semibold text-destructive">{mismatches} mismatch needs attention</p>
              <p className="mt-0.5 text-xs text-muted-foreground">Reported spend differs from internal records.</p>
            </div>
          </div>
        )}

        <GlassCard className="!p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                  <th className="px-5 py-3 font-medium">Timestamp</th>
                  <th className="px-5 py-3 font-medium">Actor</th>
                  <th className="px-5 py-3 font-medium">Action</th>
                  <th className="px-5 py-3 font-medium">Target</th>
                  <th className="px-5 py-3 font-medium">Delta</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((e) => (
                  <tr key={e.id} className="border-b border-border/60 hover:bg-background/40">
                    <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{e.ts}</td>
                    <td className="px-5 py-3 text-xs">
                      <span className={cn("rounded-md px-1.5 py-0.5", e.actor === "system" ? "bg-violet/15 text-violet" : "bg-primary/15 text-primary-glow")}>
                        {e.actor}
                      </span>
                    </td>
                    <td className="px-5 py-3">{e.action}</td>
                    <td className="px-5 py-3 text-muted-foreground">{e.target}</td>
                    <td className="px-5 py-3 font-mono text-xs tabular-nums">{e.delta ?? "—"}</td>
                    <td className="px-5 py-3">
                      {e.status === "OK" ? (
                        <span className="inline-flex items-center gap-1 text-xs text-success">
                          <CheckCircle2 className="h-3 w-3" /> OK
                        </span>
                      ) : e.status === "Mismatch" ? (
                        <StatusPill variant="danger">Mismatch</StatusPill>
                      ) : (
                        <StatusPill variant="info">Reconciled</StatusPill>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center gap-2 border-t border-border bg-background/30 px-5 py-3 text-xs text-muted-foreground">
            <ClipboardList className="h-3.5 w-3.5" />
            Showing {entries.length} entries
          </div>
        </GlassCard>
      </div>
    </AppShell>
  );
}
