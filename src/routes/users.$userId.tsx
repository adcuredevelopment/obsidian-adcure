import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { GlassCard } from "@/components/GlassCard";
import { StatusPill, statusToVariant } from "@/components/StatusPill";
import { clients, adAccounts } from "@/lib/mock-data";
import {
  ArrowLeft,
  Mail,
  Wallet,
  Pencil,
  PauseCircle,
  Trash2,
  Building2,
} from "lucide-react";

export const Route = createFileRoute("/users/$userId")({
  loader: ({ params }) => {
    const user = clients.find((c) => c.id === params.userId);
    if (!user) throw notFound();
    return { user };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.user.name ?? "User"} — Adcure Agency` },
      { name: "description", content: `Profile and accounts for ${loaderData?.user.name}.` },
    ],
  }),
  notFoundComponent: () => (
    <AppShell>
      <p className="text-sm text-muted-foreground">User not found.</p>
      <Link to="/users" className="mt-2 inline-flex text-sm text-primary-glow">
        Back to Users
      </Link>
    </AppShell>
  ),
  errorComponent: ({ error }) => (
    <AppShell>
      <p className="text-sm text-destructive">Error: {error.message}</p>
    </AppShell>
  ),
  component: UserProfile,
});

function UserProfile() {
  const { user } = Route.useLoaderData();
  const userAccounts = adAccounts.slice(0, Math.max(1, user.accounts));

  return (
    <AppShell>
      <div className="animate-fade-in space-y-6">
        <Link
          to="/users"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Users
        </Link>

        {/* Hero */}
        <GlassCard glow className="p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-violet text-lg font-semibold text-white shadow-glow">
                {user.initials}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-semibold tracking-tight">{user.name}</h1>
                  <StatusPill variant={statusToVariant(user.status)}>{user.status}</StatusPill>
                </div>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Mail className="h-3.5 w-3.5" /> {user.email}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium hover:bg-accent">
                <Pencil className="h-4 w-4" /> Edit
              </button>
              <button className="inline-flex items-center gap-2 rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-sm font-medium text-warning hover:bg-warning/20">
                <PauseCircle className="h-4 w-4" /> Deactivate
              </button>
              <button className="inline-flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/20">
                <Trash2 className="h-4 w-4" /> Delete
              </button>
            </div>
          </div>
        </GlassCard>

        {/* Stats */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <GlassCard className="p-4">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Role</p>
            <p className="mt-1 text-lg font-semibold">{user.role}</p>
          </GlassCard>
          <GlassCard className="p-4">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Ad Accounts</p>
            <p className="mt-1 flex items-center gap-2 text-lg font-semibold">
              <Building2 className="h-4 w-4 text-primary-glow" />
              {user.accounts}
            </p>
          </GlassCard>
          <GlassCard className="p-4">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Wallet Balance</p>
            <p className="mt-1 flex items-center gap-2 text-lg font-semibold tabular-nums">
              <Wallet className="h-4 w-4 text-violet" />
              ${user.walletBalance.toLocaleString()}
            </p>
          </GlassCard>
        </section>

        {/* Accounts */}
        <GlassCard className="!p-0 overflow-hidden">
          <div className="flex items-center justify-between border-b border-border p-5">
            <div>
              <h2 className="text-base font-semibold">Associated Ad Accounts</h2>
              <p className="text-xs text-muted-foreground">
                Accounts owned or managed by this user.
              </p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                  <th className="px-5 py-3 font-medium">Account</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium text-right">Balance</th>
                  <th className="px-5 py-3 font-medium">Last Activity</th>
                </tr>
              </thead>
              <tbody>
                {userAccounts.map((a) => (
                  <tr key={a.id} className="border-b border-border/60 hover:bg-background/40">
                    <td className="px-5 py-4">
                      <p className="font-medium">{a.name}</p>
                      <p className="font-mono text-xs text-muted-foreground">{a.accountId}</p>
                    </td>
                    <td className="px-5 py-4">
                      <StatusPill variant={statusToVariant(a.status)}>{a.status}</StatusPill>
                    </td>
                    <td className="px-5 py-4 text-right tabular-nums font-medium">
                      ${a.balance.toLocaleString()}
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">{a.lastActivity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>
    </AppShell>
  );
}
