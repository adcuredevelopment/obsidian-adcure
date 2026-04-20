import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { GlassCard } from "@/components/GlassCard";
import { Activity } from "lucide-react";

export const Route = createFileRoute("/monitoring")({
  head: () => ({ meta: [{ title: "Monitoring — Adcure Agency" }] }),
  component: () => (
    <AppShell>
      <div className="animate-fade-in space-y-6">
        <header>
          <h1 className="text-2xl font-semibold tracking-tight">Monitoring</h1>
          <p className="mt-1 text-sm text-muted-foreground">System health and platform status.</p>
        </header>
        <GlassCard className="flex items-center gap-4 p-6">
          <div className="rounded-2xl bg-success/15 p-3 ring-1 ring-inset ring-success/25">
            <Activity className="h-5 w-5 text-success" />
          </div>
          <div>
            <p className="font-semibold">All systems operational</p>
            <p className="text-sm text-muted-foreground">99.99% uptime over the last 30 days</p>
          </div>
        </GlassCard>
      </div>
    </AppShell>
  ),
});
