import { requireRole } from "@/lib/auth-mock";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { GlassCard } from "@/components/GlassCard";
import { StatusPill, statusToVariant } from "@/components/StatusPill";
import { clients, adAccounts, type Client } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Mail,
  Wallet,
  Pencil,
  PauseCircle,
  Trash2,
  Building2,
  X,
  AlertTriangle,
  Lock,
  CheckCircle2,
} from "lucide-react";

export const Route = createFileRoute("/agency/users_/$userId")({
  beforeLoad: () => requireRole("agency_admin"),
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
      <Link to="/agency/users" className="mt-2 inline-flex text-sm text-primary-glow">
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
  const [editing, setEditing] = useState(false);
  const userAccounts = adAccounts.slice(0, Math.max(1, user.accounts));

  return (
    <AppShell>
      <div className="animate-fade-in space-y-6">
        <Link
          to="/agency/users"
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
              <button
                onClick={() => setEditing(true)}
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium hover:bg-accent"
              >
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

      {editing && <EditClientModal user={user} onClose={() => setEditing(false)} />}
    </AppShell>
  );
}

/* ---------------- Edit Client Modal ---------------- */

function EditClientModal({ user, onClose }: { user: Client; onClose: () => void }) {
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState("+31 6 1234 5678");
  const [email, setEmail] = useState(user.email);
  const [confirmEmailOpen, setConfirmEmailOpen] = useState(false);
  const [saved, setSaved] = useState(false);

  // Mocked immutable company info (legal data)
  const company = {
    name: user.email.split("@")[1]?.split(".")[0]?.replace(/^\w/, (c) => c.toUpperCase()) + " B.V." || "—",
    kvk: "8821" + user.id.replace(/\D/g, "").padStart(4, "0"),
    vat: "NL" + ("8210" + user.id.replace(/\D/g, "").padStart(5, "0")) + "B01",
  };

  const emailChanged = email.trim() !== user.email;
  const valid = name.trim().length > 1 && /^\S+@\S+\.\S+$/.test(email);

  function handleSave() {
    if (!valid) return;
    if (emailChanged && !confirmEmailOpen) {
      setConfirmEmailOpen(true);
      return;
    }
    setSaved(true);
    setTimeout(onClose, 1100);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-elegant animate-fade-in max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold">
              Edit Client: <span className="text-primary-glow">{user.name}</span>
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Update contact details. Legal information is locked.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {saved ? (
          <div className="mt-6 flex flex-col items-center text-center">
            <div className="rounded-full bg-success/15 p-3 ring-1 ring-inset ring-success/25">
              <CheckCircle2 className="h-6 w-6 text-success" />
            </div>
            <h3 className="mt-4 text-base font-semibold">Changes saved</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Client details updated successfully.
            </p>
          </div>
        ) : (
          <div className="mt-5 space-y-5">
            {/* Editable fields */}
            <div className="space-y-3">
              <Field
                label="Full Name"
                value={name}
                onChange={setName}
                placeholder="Sofia Martinez"
              />
              <Field
                label="Phone"
                value={phone}
                onChange={setPhone}
                placeholder="+31 6 …"
              />
              <Field
                label="Email"
                value={email}
                onChange={setEmail}
                placeholder="user@company.com"
                type="email"
                hint={
                  emailChanged
                    ? "You'll be asked to confirm before this is saved."
                    : undefined
                }
              />
            </div>

            {/* Warning banner */}
            <div className="flex items-start gap-2.5 rounded-xl border border-warning/30 bg-warning/10 p-3 text-xs">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" />
              <p className="leading-relaxed text-foreground">
                <span className="font-semibold text-warning">Company name, KVK and VAT cannot be changed.</span>{" "}
                Contact support if any of these need to be updated for legal
                reasons.
              </p>
            </div>

            {/* Read-only legal fields */}
            <div className="space-y-2">
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Legal information (locked)
              </p>
              <ReadOnlyField label="Company Name" value={company.name} />
              <ReadOnlyField label="KVK Number" value={company.kvk} mono />
              <ReadOnlyField label="VAT Number" value={company.vat} mono />
            </div>

            {/* Footer */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={onClose}
                className="flex-1 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium hover:bg-accent"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!valid}
                className={cn(
                  "flex-1 rounded-lg gradient-primary px-3 py-2 text-sm font-semibold text-white shadow-glow transition",
                  valid ? "hover:brightness-110" : "cursor-not-allowed opacity-50",
                )}
              >
                Save Changes
              </button>
            </div>
          </div>
        )}

        {/* Email change confirmation */}
        {confirmEmailOpen && !saved && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-background/80 backdrop-blur-sm p-6">
            <div className="w-full max-w-sm rounded-xl border border-border bg-card p-5 shadow-elegant">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-warning/15 p-2 ring-1 ring-inset ring-warning/25">
                  <AlertTriangle className="h-4 w-4 text-warning" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold">Confirm email change</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Changing the email will require the client to verify the new
                    address before logging in. Proceed?
                  </p>
                  <div className="mt-3 rounded-lg border border-border bg-background/40 p-2.5 text-xs">
                    <p className="text-muted-foreground">From</p>
                    <p className="font-medium">{user.email}</p>
                    <p className="mt-2 text-muted-foreground">To</p>
                    <p className="font-medium text-primary-glow">{email}</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <button
                  onClick={() => setConfirmEmailOpen(false)}
                  className="flex-1 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium hover:bg-accent"
                >
                  Back
                </button>
                <button
                  onClick={() => {
                    setSaved(true);
                    setTimeout(onClose, 1100);
                  }}
                  className="flex-1 rounded-lg gradient-primary px-3 py-1.5 text-xs font-semibold text-white shadow-glow hover:brightness-110"
                >
                  Confirm change
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  hint?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-border bg-background/40 px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
      {hint && <p className="mt-1 text-[11px] text-warning">{hint}</p>}
    </div>
  );
}

function ReadOnlyField({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
        {label}
      </label>
      <div className="flex items-center gap-2 rounded-lg border border-border bg-background/20 px-3 py-2">
        <Lock className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        <span className={cn("flex-1 text-sm text-muted-foreground", mono && "font-mono")}>
          {value}
        </span>
      </div>
    </div>
  );
}
