import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { GlassCard } from "@/components/GlassCard";
import {
  User,
  Building2,
  Mail,
  Phone,
  MapPin,
  Lock,
  ShieldCheck,
  Smartphone,
  MessageSquare,
  Eye,
  EyeOff,
  Save,
  Copy,
  Download,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/agency/settings")({
  head: () => ({
    meta: [
      { title: "Account Settings — Adcure Agency" },
      { name: "description", content: "Manage your profile, security, and billing preferences." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const [tab, setTab] = useState<"profile" | "security">("profile");

  return (
    <AppShell>
      <div className="animate-fade-in mx-auto max-w-4xl space-y-6">
        <header>
          <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your profile, security, and billing preferences
          </p>
        </header>

        {/* Tabs */}
        <div className="grid grid-cols-2 gap-1 rounded-xl border border-border bg-card/60 p-1">
          {[
            { id: "profile", label: "Profile", icon: User },
            { id: "security", label: "Security", icon: ShieldCheck },
          ].map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id as typeof tab)}
                className={cn(
                  "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition",
                  active
                    ? "gradient-primary text-white shadow-glow"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" /> {t.label}
              </button>
            );
          })}
        </div>

        {tab === "profile" ? <ProfileTab /> : <SecurityTab />}
      </div>
    </AppShell>
  );
}

function ProfileTab() {
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    firstName: "David",
    lastName: "Otero",
    email: "service@adcure.agency",
    phone: "+31618879018",
    company: "DO Enterprise",
    kvk: "89821211",
    vat: "NL003924266B58",
    address: "Willem-Alexanderstraat 15",
    zip: "2855AR",
    city: "Vlist",
    country: "NL",
  });

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const onSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <form onSubmit={onSave}>
      <GlassCard className="!p-0 overflow-hidden">
        <div className="flex items-center justify-between border-b border-border p-5">
          <h2 className="text-lg font-semibold">Profile Information</h2>
          <span className="rounded-md border border-border bg-background/40 px-2.5 py-1 text-xs text-muted-foreground">
            Last updated: Apr 5, 2026
          </span>
        </div>

        <div className="space-y-8 p-5 sm:p-6">
          {/* Personal */}
          <section>
            <div className="mb-4 flex items-center gap-2">
              <User className="h-4 w-4 text-primary-glow" />
              <h3 className="text-sm font-semibold">Personal Information</h3>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="First Name" value={form.firstName} onChange={update("firstName")} />
              <Field label="Last Name" value={form.lastName} onChange={update("lastName")} />
            </div>
            <div className="mt-4">
              <Field
                label="Email"
                icon={Mail}
                value={form.email}
                onChange={update("email")}
                disabled
                hint="Email cannot be changed"
              />
            </div>
            <div className="mt-4">
              <Field label="Phone Number" icon={Phone} value={form.phone} onChange={update("phone")} />
            </div>
          </section>

          <div className="border-t border-border" />

          {/* Company */}
          <section>
            <div className="mb-4 flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary-glow" />
              <h3 className="text-sm font-semibold">Company Information</h3>
            </div>
            <div className="space-y-4">
              <Field label="Company Name" value={form.company} onChange={update("company")} />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Company Number (KVK)" value={form.kvk} onChange={update("kvk")} />
                <Field
                  label="VAT Number (BTW)"
                  required
                  value={form.vat}
                  onChange={update("vat")}
                />
              </div>
              <Field
                label="Business Address"
                icon={MapPin}
                value={form.address}
                onChange={update("address")}
              />
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Zip Code" value={form.zip} onChange={update("zip")} />
                <Field label="City" value={form.city} onChange={update("city")} />
                <Field label="Country" value={form.country} onChange={update("country")} />
              </div>
            </div>
          </section>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-border bg-background/30 p-5">
          {saved ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-success">
              <Check className="h-3.5 w-3.5" /> Changes saved
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">All fields marked * are required.</span>
          )}
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-lg gradient-primary px-4 py-2 text-sm font-semibold text-white shadow-glow transition hover:brightness-110"
          >
            <Save className="h-4 w-4" /> Save Changes
          </button>
        </div>
      </GlassCard>
    </form>
  );
}

function SecurityTab() {
  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);
  const [show3, setShow3] = useState(false);
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [pwSaved, setPwSaved] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const secret = "A4XBRC6FOGEZNJPIECVDUED35QNH2OES";

  const checks = [
    { ok: pw.next.length >= 8, label: "At least 8 characters" },
    { ok: /[A-Z]/.test(pw.next), label: "One uppercase letter" },
    { ok: /[0-9]/.test(pw.next), label: "One number" },
    { ok: /[^A-Za-z0-9]/.test(pw.next), label: "One special character" },
  ];

  const onPwSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checks.every((c) => c.ok) || pw.next !== pw.confirm || !pw.current) return;
    setPwSaved(true);
    setPw({ current: "", next: "", confirm: "" });
    setTimeout(() => setPwSaved(false), 2000);
  };

  const copySecret = async () => {
    try {
      await navigator.clipboard.writeText(secret);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 1500);
    } catch {
      /* noop */
    }
  };

  return (
    <div className="space-y-6">
      {/* Change password */}
      <form onSubmit={onPwSubmit}>
        <GlassCard className="!p-0 overflow-hidden">
          <div className="flex items-center gap-2 border-b border-border p-5">
            <Lock className="h-4 w-4 text-primary-glow" />
            <h2 className="text-lg font-semibold">Change Password</h2>
          </div>
          <div className="space-y-4 p-5 sm:p-6">
            <PasswordField
              label="Current Password"
              value={pw.current}
              onChange={(v) => setPw({ ...pw, current: v })}
              show={show1}
              setShow={setShow1}
            />
            <PasswordField
              label="New Password"
              value={pw.next}
              onChange={(v) => setPw({ ...pw, next: v })}
              show={show2}
              setShow={setShow2}
            />

            <div className="rounded-lg border border-border bg-background/40 p-3.5">
              <p className="mb-2 text-xs font-medium text-muted-foreground">
                Password must contain:
              </p>
              <ul className="space-y-1.5">
                {checks.map((c) => (
                  <li
                    key={c.label}
                    className={cn(
                      "flex items-center gap-2 text-xs",
                      c.ok ? "text-success" : "text-muted-foreground",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-3.5 w-3.5 items-center justify-center rounded-full ring-1 ring-inset",
                        c.ok
                          ? "bg-success/15 text-success ring-success/25"
                          : "ring-border",
                      )}
                    >
                      {c.ok && <Check className="h-2.5 w-2.5" />}
                    </span>
                    {c.label}
                  </li>
                ))}
              </ul>
            </div>

            <PasswordField
              label="Confirm New Password"
              value={pw.confirm}
              onChange={(v) => setPw({ ...pw, confirm: v })}
              show={show3}
              setShow={setShow3}
            />
            {pw.confirm && pw.next !== pw.confirm && (
              <p className="text-xs text-destructive">Passwords do not match.</p>
            )}
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-border bg-background/30 p-5">
            {pwSaved ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-success">
                <Check className="h-3.5 w-3.5" /> Password updated
              </span>
            ) : (
              <span className="text-xs text-muted-foreground">
                Use a strong, unique password.
              </span>
            )}
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg gradient-primary px-4 py-2 text-sm font-semibold text-white shadow-glow transition hover:brightness-110"
            >
              <Lock className="h-4 w-4" /> Update Password
            </button>
          </div>
        </GlassCard>
      </form>

      {/* 2FA */}
      <GlassCard className="!p-0 overflow-hidden">
        <div className="flex items-center gap-3 border-b border-border p-5">
          <div className="rounded-lg bg-violet/15 p-2 ring-1 ring-inset ring-violet/25">
            <ShieldCheck className="h-4 w-4 text-violet" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Two-Factor Authentication</h2>
            <p className="text-xs text-muted-foreground">Add an extra layer of security</p>
          </div>
        </div>

        {/* Authenticator app */}
        <div className="border-b border-border p-5 sm:p-6">
          <div className="mb-4 flex flex-col items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-primary shadow-glow">
              <Smartphone className="h-5 w-5 text-white" />
            </div>
            <h3 className="mt-3 text-base font-semibold">Set Up Authenticator App</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Use Google Authenticator, Microsoft Authenticator, or Authy
            </p>
          </div>

          <div className="rounded-xl border border-primary/30 bg-primary/5 p-5">
            <p className="mb-3 text-center text-xs font-medium text-muted-foreground">
              1. Scan this QR code with your authenticator app
            </p>
            <div className="mx-auto flex h-44 w-44 items-center justify-center rounded-lg bg-white p-3">
              {/* Decorative QR placeholder */}
              <svg viewBox="0 0 100 100" className="h-full w-full text-black">
                <rect width="100" height="100" fill="white" />
                {Array.from({ length: 10 }).map((_, r) =>
                  Array.from({ length: 10 }).map((_, c) => {
                    const filled = (r * 7 + c * 3 + (r * c) % 5) % 3 === 0;
                    return filled ? (
                      <rect
                        key={`${r}-${c}`}
                        x={c * 10}
                        y={r * 10}
                        width="10"
                        height="10"
                        fill="currentColor"
                      />
                    ) : null;
                  }),
                )}
                <rect x="0" y="0" width="30" height="30" fill="white" />
                <rect x="5" y="5" width="20" height="20" fill="currentColor" />
                <rect x="10" y="10" width="10" height="10" fill="white" />
                <rect x="70" y="0" width="30" height="30" fill="white" />
                <rect x="75" y="5" width="20" height="20" fill="currentColor" />
                <rect x="80" y="10" width="10" height="10" fill="white" />
                <rect x="0" y="70" width="30" height="30" fill="white" />
                <rect x="5" y="75" width="20" height="20" fill="currentColor" />
                <rect x="10" y="80" width="10" height="10" fill="white" />
              </svg>
            </div>

            <p className="mt-4 mb-2 text-center text-xs font-medium text-muted-foreground">
              2. Or enter this secret key manually
            </p>
            <div className="flex items-center gap-2 rounded-lg border border-border bg-background/60 p-2">
              <code className="flex-1 truncate text-center font-mono text-xs">{secret}</code>
              <button
                type="button"
                onClick={copySecret}
                className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                {copiedKey ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              type="button"
              className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-accent"
            >
              Cancel
            </button>
            <button
              type="button"
              className="rounded-lg gradient-primary px-4 py-2 text-sm font-semibold text-white shadow-glow transition hover:brightness-110"
            >
              Next
            </button>
          </div>
        </div>

        {/* SMS */}
        <div className="border-b border-border p-5 sm:p-6">
          <div className="mb-4 flex flex-col items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 ring-1 ring-inset ring-primary/25">
              <MessageSquare className="h-5 w-5 text-primary-glow" />
            </div>
            <h3 className="mt-3 text-base font-semibold">Set Up SMS Authentication</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Receive verification codes via text message
            </p>
          </div>

          <div className="rounded-xl border border-primary/30 bg-primary/5 p-5 space-y-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Phone Number
              </label>
              <input
                type="tel"
                placeholder="(555) 123-4567"
                className="w-full rounded-lg border border-border bg-background/60 px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Enter your phone number to receive verification codes
              </p>
            </div>
            <div className="flex items-start gap-2 rounded-lg border border-border bg-background/40 p-2.5 text-xs text-muted-foreground">
              <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary-glow" />
              Standard SMS rates may apply. Make sure you have reliable cellular service.
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              type="button"
              className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-accent"
            >
              Cancel
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-lg gradient-primary px-4 py-2 text-sm font-semibold text-white shadow-glow transition hover:brightness-110"
            >
              <MessageSquare className="h-4 w-4" /> Send Code
            </button>
          </div>
        </div>

        {/* Backup codes */}
        <div className="flex items-center gap-3 p-5 sm:p-6">
          <div className="rounded-lg bg-muted p-2 ring-1 ring-inset ring-border">
            <Download className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold">Backup Codes</p>
            <p className="text-xs text-muted-foreground">
              Enable two-factor authentication to generate backup codes for account recovery.
            </p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  icon: Icon,
  disabled,
  required,
  hint,
}: {
  label: string;
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon?: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
  required?: boolean;
  hint?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        {Icon && <Icon className="h-3.5 w-3.5" />}
        {label}
        {required && <span className="text-destructive">*</span>}
      </label>
      <input
        type="text"
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={cn(
          "w-full rounded-lg border border-border bg-background/40 px-3 py-2 text-sm focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20",
          disabled && "cursor-not-allowed opacity-60",
        )}
      />
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function PasswordField({
  label,
  value,
  onChange,
  show,
  setShow,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  setShow: (b: boolean) => void;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-border bg-background/40 px-3 py-2 pr-10 text-sm focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          {show ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
        </button>
      </div>
    </div>
  );
}
