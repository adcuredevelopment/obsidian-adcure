import { requireRole } from "@/lib/auth-mock";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { GlassCard } from "@/components/GlassCard";
import { LifeBuoy } from "lucide-react";

export const Route = createFileRoute("/agency/support")({
  beforeLoad: () => requireRole("agency_admin"),
  head: () => ({ meta: [{ title: "Support — Adcure Agency" }] }),
  component: () => (
    <AppShell>
      <div className="animate-fade-in space-y-6">
        <header>
          <h1 className="text-2xl font-semibold tracking-tight">Support</h1>
          <p className="mt-1 text-sm text-muted-foreground">Conversations with your clients.</p>
        </header>
        <GlassCard className="flex flex-col items-center justify-center py-20 text-center">
          <div className="rounded-2xl bg-primary/15 p-4 ring-1 ring-inset ring-primary/25">
            <LifeBuoy className="h-6 w-6 text-primary-glow" />
          </div>
          <p className="mt-4 text-base font-semibold">Inbox coming soon</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Threaded conversations with realtime updates will land here.
          </p>
        </GlassCard>
      </div>
    </AppShell>
  ),
});
