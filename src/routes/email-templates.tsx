import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { GlassCard } from "@/components/GlassCard";
import { Mail } from "lucide-react";

export const Route = createFileRoute("/email-templates")({
  head: () => ({ meta: [{ title: "Email Templates — Adcure Agency" }] }),
  component: () => (
    <AppShell>
      <div className="animate-fade-in space-y-6">
        <header>
          <h1 className="text-2xl font-semibold tracking-tight">Email Templates</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage transactional emails.</p>
        </header>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {["Welcome", "Account Approved", "Top-up Confirmation", "Account Rejected"].map((t) => (
            <GlassCard key={t} className="transition hover:border-border-strong">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/15 p-2 ring-1 ring-inset ring-primary/25">
                  <Mail className="h-4 w-4 text-primary-glow" />
                </div>
                <div>
                  <p className="font-medium">{t}</p>
                  <p className="text-xs text-muted-foreground">Last edited 2d ago</p>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </AppShell>
  ),
});
