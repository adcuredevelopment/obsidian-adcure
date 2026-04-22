import { requireRole } from "@/lib/auth-mock";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { GlassCard } from "@/components/GlassCard";
import { StatusPill } from "@/components/StatusPill";
import { CheckCircle2, X, Building2, Mail, Phone, FileBadge, Hash } from "lucide-react";

export const Route = createFileRoute("/agency/account-applications")({
  beforeLoad: () => requireRole("agency_admin"),
  head: () => ({ meta: [{ title: "Account Applications — Adcure Agency" }] }),
  component: AccountApplicationsPage,
});

type Application = {
  id: string;
  company: string;
  contact: string;
  email: string;
  phone: string;
  kvk: string;
  vat: string;
  submittedAt: string;
  status: "Pending" | "Approved" | "Rejected";
};

const initial: Application[] = [
  { id: "1", company: "Helix Labs B.V.", contact: "Daniel Kim", email: "dan@helixlabs.com", phone: "+31612345678", kvk: "12345678", vat: "NL001234567B89", submittedAt: "2u geleden", status: "Pending" },
  { id: "2", company: "Ember Coffee Co.", contact: "Riley Chen", email: "riley@embercoffee.co", phone: "+31687654321", kvk: "23456789", vat: "NL002345678B90", submittedAt: "5u geleden", status: "Pending" },
  { id: "3", company: "Tideline Apparel", contact: "Emma Hughes", email: "emma@tideline.com", phone: "+31611223344", kvk: "34567890", vat: "NL003456789B01", submittedAt: "1d geleden", status: "Pending" },
  { id: "4", company: "Lumen Skincare", contact: "Priya Nair", email: "priya@lumen.co", phone: "+31655667788", kvk: "45678901", vat: "NL004567890B12", submittedAt: "2d geleden", status: "Pending" },
];

function AccountApplicationsPage() {
  const [apps, setApps] = useState(initial);

  const decide = (id: string, status: "Approved" | "Rejected") =>
    setApps((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));

  const pending = apps.filter((a) => a.status === "Pending");

  return (
    <AppShell>
      <div className="animate-fade-in space-y-6">
        <header>
          <h1 className="text-2xl font-semibold tracking-tight">Account Applications</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Pending sign-ups awaiting verification and approval.
          </p>
        </header>

        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Tile label="Pending" value={pending.length.toString()} tone="warning" />
          <Tile label="Approved (24h)" value="3" tone="success" />
          <Tile label="Rejected (24h)" value="0" tone="danger" />
          <Tile label="Total this week" value="11" tone="primary" />
        </section>

        <div className="space-y-3">
          {apps.map((a) => (
            <GlassCard key={a.id}>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary/30 to-violet/30 ring-1 ring-inset ring-border">
                    <Building2 className="h-5 w-5 text-primary-glow" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{a.company}</p>
                      <StatusPill variant={a.status === "Pending" ? "pending" : a.status === "Approved" ? "success" : "danger"}>
                        {a.status}
                      </StatusPill>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">{a.contact} · ingediend {a.submittedAt}</p>
                    <div className="mt-3 grid gap-x-6 gap-y-1 text-xs text-muted-foreground sm:grid-cols-2">
                      <span className="inline-flex items-center gap-1.5"><Mail className="h-3 w-3" /> {a.email}</span>
                      <span className="inline-flex items-center gap-1.5"><Phone className="h-3 w-3" /> {a.phone}</span>
                      <span className="inline-flex items-center gap-1.5"><Hash className="h-3 w-3" /> KVK {a.kvk}</span>
                      <span className="inline-flex items-center gap-1.5"><FileBadge className="h-3 w-3" /> {a.vat}</span>
                    </div>
                  </div>
                </div>
                {a.status === "Pending" && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => decide(a.id, "Rejected")}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs font-semibold text-destructive hover:bg-destructive/20"
                    >
                      <X className="h-3.5 w-3.5" /> Reject
                    </button>
                    <button
                      onClick={() => decide(a.id, "Approved")}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-success px-3 py-2 text-xs font-semibold text-success-foreground shadow-elegant hover:brightness-110"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                    </button>
                  </div>
                )}
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </AppShell>
  );
}

function Tile({ label, value, tone }: { label: string; value: string; tone: "primary" | "success" | "warning" | "danger" }) {
  const cls =
    tone === "primary"
      ? "bg-primary/15 text-primary-glow ring-primary/25"
      : tone === "success"
        ? "bg-success/15 text-success ring-success/25"
        : tone === "warning"
          ? "bg-warning/15 text-warning ring-warning/25"
          : "bg-destructive/15 text-destructive ring-destructive/25";
  return (
    <GlassCard className="p-4">
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <div className="mt-2 flex items-center gap-3">
        <span className={`rounded-lg px-2 py-1 text-sm font-semibold ring-1 ring-inset tabular-nums ${cls}`}>{value}</span>
      </div>
    </GlassCard>
  );
}
