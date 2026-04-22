import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ClientShell } from "@/components/ClientShell";
import { GlassCard } from "@/components/GlassCard";
import {
  User,
  Building2,
  Mail,
  Phone,
  Lock,
  ShieldCheck,
  Bell,
  Save,
  Check,
  Eye,
  EyeOff,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CURRENT_CLIENT } from "@/lib/auth-mock";

export const Route = createFileRoute("/portal/settings")({
  head: () => ({
    meta: [
      { title: "Instellingen — Adcure" },
      { name: "description", content: "Beheer je profiel, beveiliging en notificaties." },
    ],
  }),
  component: ClientSettingsPage,
});

function ClientSettingsPage() {
  const [tab, setTab] = useState<"profile" | "security" | "notifications">("profile");

  return (
    <ClientShell>
      <div className="animate-fade-in mx-auto max-w-4xl space-y-6">
        <header>
          <h1 className="text-3xl font-bold tracking-tight">Instellingen</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Beheer je profiel, beveiliging en notificatievoorkeuren.
          </p>
        </header>

        <div className="grid grid-cols-3 gap-1 rounded-xl border border-border bg-card/60 p-1">
          {[
            { id: "profile", label: "Profiel", icon: User },
            { id: "security", label: "Beveiliging", icon: ShieldCheck },
            { id: "notifications", label: "Notificaties", icon: Bell },
          ].map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id as typeof tab)}
                className={cn(
                  "inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition",
                  active ? "gradient-primary text-white shadow-glow" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" /> {t.label}
              </button>
            );
          })}
        </div>

        {tab === "profile" && <ProfileTab />}
        {tab === "security" && <SecurityTab />}
        {tab === "notifications" && <NotificationsTab />}
      </div>
    </ClientShell>
  );
}

function ProfileTab() {
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    firstName: CURRENT_CLIENT.firstName,
    lastName: "Martinez",
    email: CURRENT_CLIENT.email,
    phone: "+31612345678",
  });

  const company = {
    name: CURRENT_CLIENT.company,
    kvk: "87654321",
    vat: "NL001234567B89",
  };

  const onSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <form onSubmit={onSave} className="space-y-6">
      <GlassCard className="!p-0 overflow-hidden">
        <div className="flex items-center gap-2 border-b border-border p-5">
          <User className="h-4 w-4 text-primary-glow" />
          <h2 className="text-lg font-semibold">Persoonlijke gegevens</h2>
        </div>
        <div className="space-y-4 p-5 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Voornaam" value={form.firstName} onChange={(v) => setForm({ ...form, firstName: v })} />
            <Field label="Achternaam" value={form.lastName} onChange={(v) => setForm({ ...form, lastName: v })} />
          </div>
          <Field label="Email" icon={Mail} value={form.email} onChange={(v) => setForm({ ...form, email: v })} disabled hint="Email kan niet gewijzigd worden" />
          <Field label="Telefoon" icon={Phone} value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-border bg-background/30 p-5">
          {saved ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-success">
              <Check className="h-3.5 w-3.5" /> Wijzigingen opgeslagen
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">Wijzig je persoonlijke gegevens.</span>
          )}
          <button type="submit" className="inline-flex items-center gap-2 rounded-lg gradient-primary px-4 py-2 text-sm font-semibold text-white shadow-glow transition hover:brightness-110">
            <Save className="h-4 w-4" /> Opslaan
          </button>
        </div>
      </GlassCard>

      <GlassCard className="!p-0 overflow-hidden">
        <div className="flex items-center gap-2 border-b border-border p-5">
          <Building2 className="h-4 w-4 text-primary-glow" />
          <h2 className="text-lg font-semibold">Bedrijfsgegevens</h2>
        </div>
        <div className="space-y-4 p-5 sm:p-6">
          <div className="rounded-lg border border-border bg-background/30 p-3 text-xs text-muted-foreground">
            Deze gegevens zijn vergrendeld. Neem contact op met support voor wijzigingen.
          </div>
          <Field label="Bedrijfsnaam" value={company.name} onChange={() => {}} disabled />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="KVK Nummer" value={company.kvk} onChange={() => {}} disabled />
            <Field label="BTW Nummer" value={company.vat} onChange={() => {}} disabled />
          </div>
        </div>
      </GlassCard>
    </form>
  );
}

function SecurityTab() {
  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });

  return (
    <div className="space-y-6">
      <GlassCard className="!p-0 overflow-hidden">
        <div className="flex items-center gap-2 border-b border-border p-5">
          <Lock className="h-4 w-4 text-primary-glow" />
          <h2 className="text-lg font-semibold">Wachtwoord wijzigen</h2>
        </div>
        <div className="space-y-4 p-5 sm:p-6">
          <PasswordField label="Huidig wachtwoord" value={pw.current} onChange={(v) => setPw({ ...pw, current: v })} show={show1} setShow={setShow1} />
          <PasswordField label="Nieuw wachtwoord" value={pw.next} onChange={(v) => setPw({ ...pw, next: v })} show={show2} setShow={setShow2} />
          <PasswordField label="Bevestig nieuw wachtwoord" value={pw.confirm} onChange={(v) => setPw({ ...pw, confirm: v })} show={show2} setShow={setShow2} />
        </div>
        <div className="flex items-center justify-end gap-3 border-t border-border bg-background/30 p-5">
          <button className="inline-flex items-center gap-2 rounded-lg gradient-primary px-4 py-2 text-sm font-semibold text-white shadow-glow transition hover:brightness-110">
            <Lock className="h-4 w-4" /> Wachtwoord bijwerken
          </button>
        </div>
      </GlassCard>

      <GlassCard className="!p-0 overflow-hidden">
        <div className="flex items-center gap-3 border-b border-border p-5">
          <div className="rounded-lg bg-violet/15 p-2 ring-1 ring-inset ring-violet/25">
            <ShieldCheck className="h-4 w-4 text-violet" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Tweestapsverificatie</h2>
            <p className="text-xs text-muted-foreground">Extra beveiliging voor je account</p>
          </div>
        </div>
        <div className="flex items-center justify-between p-5 sm:p-6">
          <div>
            <p className="text-sm font-medium">2FA is uitgeschakeld</p>
            <p className="text-xs text-muted-foreground">Schakel in voor extra beveiliging.</p>
          </div>
          <button className="rounded-lg gradient-primary px-3.5 py-2 text-sm font-semibold text-white shadow-glow hover:brightness-110">
            Inschakelen
          </button>
        </div>
      </GlassCard>
    </div>
  );
}

function NotificationsTab() {
  const [prefs, setPrefs] = useState({
    invoice: true,
    topup: true,
    lowBalance: true,
    accountStatus: false,
    marketing: false,
  });

  const items: Array<{ key: keyof typeof prefs; label: string; desc: string }> = [
    { key: "invoice", label: "Nieuwe factuur", desc: "Email als er een nieuwe factuur klaarstaat" },
    { key: "topup", label: "Top-up status", desc: "Updates over je wallet top-ups" },
    { key: "lowBalance", label: "Laag saldo", desc: "Waarschuwing als wallet onder €100 zakt" },
    { key: "accountStatus", label: "Account status", desc: "Statuswijzigingen van je ad accounts" },
    { key: "marketing", label: "Productupdates", desc: "Nieuws en aanbiedingen van Adcure" },
  ];

  return (
    <GlassCard className="!p-0 overflow-hidden">
      <div className="flex items-center gap-2 border-b border-border p-5">
        <Bell className="h-4 w-4 text-primary-glow" />
        <h2 className="text-lg font-semibold">Email notificaties</h2>
      </div>
      <ul className="divide-y divide-border">
        {items.map((i) => (
          <li key={i.key} className="flex items-center justify-between gap-4 px-5 py-4">
            <div>
              <p className="text-sm font-medium">{i.label}</p>
              <p className="text-xs text-muted-foreground">{i.desc}</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={prefs[i.key]}
              onClick={() => setPrefs({ ...prefs, [i.key]: !prefs[i.key] })}
              className={cn(
                "relative h-6 w-11 rounded-full transition-colors",
                prefs[i.key] ? "bg-primary" : "bg-muted",
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
                  prefs[i.key] ? "translate-x-5" : "translate-x-0.5",
                )}
              />
            </button>
          </li>
        ))}
      </ul>
    </GlassCard>
  );
}

function Field({
  label,
  value,
  onChange,
  icon: Icon,
  disabled,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  icon?: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
  hint?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        {Icon && <Icon className="h-3.5 w-3.5" />}
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
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
