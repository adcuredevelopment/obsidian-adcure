import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { GlassCard } from "@/components/GlassCard";
import { StatusPill, statusToVariant } from "@/components/StatusPill";
import { clients } from "@/lib/mock-data";
import { Search, UserPlus, Mail, Wallet } from "lucide-react";

export const Route = createFileRoute("/agency/users")({
  head: () => ({
    meta: [
      { title: "Users — Adcure Agency" },
      { name: "description", content: "Manage clients and team members." },
    ],
  }),
  component: UsersPage,
});

function UsersPage() {
  return (
    <AppShell>
      <div className="animate-fade-in space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage clients, roles, and access.
            </p>
          </div>
          <button className="inline-flex items-center gap-2 self-start rounded-lg gradient-primary px-3.5 py-2 text-sm font-semibold text-white shadow-glow transition hover:brightness-110">
            <UserPlus className="h-4 w-4" /> Invite User
          </button>
        </header>

        <div className="relative max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            placeholder="Search users…"
            className="w-full rounded-lg border border-border bg-card/60 py-2 pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {clients.map((c) => (
            <Link
              key={c.id}
              to="/users/$userId"
              params={{ userId: c.id }}
              className="group block"
            >
              <GlassCard className="transition hover:border-border-strong hover:shadow-glow">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-primary/40 to-violet/40 text-sm font-semibold text-white">
                    {c.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{c.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{c.email}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <StatusPill variant={statusToVariant(c.status)}>{c.status}</StatusPill>
                  <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                    {c.role}
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2 border-t border-border pt-4 text-xs">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Mail className="h-3 w-3" /> {c.accounts} accts
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Wallet className="h-3 w-3" /> ${c.walletBalance.toLocaleString()}
                  </div>
                </div>
              </GlassCard>
            </Link>
          ))}
        </section>
      </div>
    </AppShell>
  );
}
