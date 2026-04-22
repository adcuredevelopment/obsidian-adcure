import { requireRole } from "@/lib/auth-mock";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { ClientShell } from "@/components/ClientShell";
import { GlassCard } from "@/components/GlassCard";
import { StatusPill } from "@/components/StatusPill";
import {
  ArrowDownLeft,
  ArrowUpRight,
  CreditCard,
  Search,
  Filter,
  X,
  Plus,
  Copy,
  Check,
  Upload,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/portal/wallet")({
  beforeLoad: () => requireRole("client"),
  head: () => ({
    meta: [
      { title: "Mijn Wallet — Adcure" },
      { name: "description", content: "Bekijk je wallet balance, top-ups en transacties." },
    ],
  }),
  component: ClientWalletPage,
});

type Tx = {
  id: string;
  type: "in" | "out" | "pending";
  title: string;
  meta: string;
  amount: number;
  status: "Completed" | "Pending" | "Failed";
  time: string;
};

const transactions: Tx[] = [
  { id: "1", type: "in", title: "Wallet top-up", meta: "Bank transfer · ING Bank", amount: 2500, status: "Completed", time: "2u geleden" },
  { id: "2", type: "out", title: "Account top-up", meta: "Northwind Performance · Meta", amount: 1200, status: "Completed", time: "5u geleden" },
  { id: "3", type: "pending", title: "Top-up aangevraagd", meta: "Atlas DTC — EU · TikTok", amount: 800, status: "Pending", time: "1d geleden" },
  { id: "4", type: "out", title: "Account top-up", meta: "Helix Labs Growth · Google", amount: 450, status: "Completed", time: "2d geleden" },
  { id: "5", type: "in", title: "Refund verwerkt", meta: "Lumen Skincare · Meta", amount: 120, status: "Completed", time: "3d geleden" },
  { id: "6", type: "in", title: "Wallet top-up", meta: "Bank transfer · Rabobank", amount: 5000, status: "Completed", time: "1w geleden" },
];

function ClientWalletPage() {
  const [filter, setFilter] = useState<"all" | "in" | "out" | "pending">("all");
  const [showTopUp, setShowTopUp] = useState(false);

  const filtered = transactions.filter((t) => filter === "all" || t.type === filter);
  const totalDeposited = transactions.filter((t) => t.type === "in" && t.status === "Completed").reduce((s, t) => s + t.amount, 0);
  const totalSpent = transactions.filter((t) => t.type === "out" && t.status === "Completed").reduce((s, t) => s + t.amount, 0);

  return (
    <ClientShell>
      <div className="animate-fade-in space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Mijn Wallet</h1>
            <p className="mt-1 text-sm text-muted-foreground">Beheer je saldo en bekijk transacties.</p>
          </div>
        </header>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <GlassCard glow className="p-6">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Huidig saldo</p>
            <p className="mt-2 text-4xl font-semibold tabular-nums">€18,240.00</p>
            <button
              onClick={() => setShowTopUp(true)}
              className="mt-4 inline-flex items-center gap-2 rounded-lg gradient-primary px-3.5 py-2 text-sm font-semibold text-white shadow-glow transition hover:brightness-110"
            >
              <Plus className="h-4 w-4" /> Top-up Wallet
            </button>
          </GlassCard>
          <GlassCard className="p-6">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Totaal gestort</p>
            <p className="mt-2 text-3xl font-semibold tabular-nums text-success">€{totalDeposited.toLocaleString("nl-NL", { minimumFractionDigits: 2 })}</p>
            <p className="mt-1 text-xs text-muted-foreground">Deze maand</p>
          </GlassCard>
          <GlassCard className="p-6">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Totaal besteed</p>
            <p className="mt-2 text-3xl font-semibold tabular-nums">€{totalSpent.toLocaleString("nl-NL", { minimumFractionDigits: 2 })}</p>
            <p className="mt-1 text-xs text-muted-foreground">Naar ad accounts</p>
          </GlassCard>
        </section>

        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-1 rounded-xl border border-border bg-card/60 p-1">
            {[
              { id: "all", label: "Alles" },
              { id: "in", label: "Binnenkomend" },
              { id: "out", label: "Uitgaand" },
              { id: "pending", label: "In behandeling" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setFilter(t.id as typeof filter)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-medium transition",
                  filter === t.id ? "bg-background text-foreground shadow-card" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                placeholder="Zoek transactie…"
                className="w-full rounded-lg border border-border bg-card/60 py-2 pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 sm:w-56"
              />
            </div>
            <button className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium hover:bg-accent">
              <Filter className="h-4 w-4" /> Filter
            </button>
          </div>
        </div>

        <GlassCard className="!p-0 overflow-hidden">
          <div className="border-b border-border p-5">
            <h2 className="text-base font-semibold">Transacties</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">{filtered.length} resultaten</p>
          </div>
          <ul className="divide-y divide-border">
            {filtered.map((t) => (
              <li key={t.id} className="flex items-center gap-4 px-5 py-4">
                <div
                  className={cn(
                    "rounded-lg p-2 ring-1 ring-inset",
                    t.type === "in" && "bg-success/15 text-success ring-success/25",
                    t.type === "out" && "bg-violet/15 text-violet ring-violet/25",
                    t.type === "pending" && "bg-warning/15 text-warning ring-warning/25",
                  )}
                >
                  {t.type === "in" ? (
                    <ArrowDownLeft className="h-4 w-4" />
                  ) : t.type === "out" ? (
                    <ArrowUpRight className="h-4 w-4" />
                  ) : (
                    <CreditCard className="h-4 w-4" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{t.title}</p>
                  <p className="truncate text-xs text-muted-foreground">{t.meta} · {t.time}</p>
                </div>
                <StatusPill variant={t.status === "Completed" ? "success" : t.status === "Pending" ? "pending" : "danger"}>
                  {t.status}
                </StatusPill>
                <p className={cn("w-28 text-right tabular-nums font-semibold", t.type === "in" ? "text-success" : "text-foreground")}>
                  {t.type === "in" ? "+" : t.type === "out" ? "−" : ""}€{t.amount.toLocaleString("nl-NL", { minimumFractionDigits: 2 })}
                </p>
              </li>
            ))}
          </ul>
        </GlassCard>
      </div>

      {showTopUp && <TopUpModal onClose={() => setShowTopUp(false)} />}
    </ClientShell>
  );
}

function generateReference() {
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  const ts = Date.now().toString().slice(-4);
  return `WAL-${ts}-${rand}`;
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          /* ignore */
        }
      }}
      className="inline-flex items-center gap-1 rounded-md border border-border bg-background/40 px-2 py-1 text-[11px] font-medium text-muted-foreground transition hover:bg-accent hover:text-foreground"
      aria-label="Copy"
    >
      {copied ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
      {copied ? "Gekopieerd" : "Kopieer"}
    </button>
  );
}

function TopUpModal({ onClose }: { onClose: () => void }) {
  const [amount, setAmount] = useState(500);
  const [notes, setNotes] = useState("");
  const [proof, setProof] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const reference = useMemo(() => generateReference(), []);
  const iban = "NL14REV0766119691";
  const bic = "REV0NL22";
  const beneficiary = "Adcure Agency";

  const MAX_SIZE = 5 * 1024 * 1024;
  const ALLOWED = ["application/pdf", "image/png", "image/jpeg"];

  function handleFile(file: File | null) {
    if (!file) return;
    if (!ALLOWED.includes(file.type)) {
      setError("Alleen PDF, PNG of JPG toegestaan");
      return;
    }
    if (file.size > MAX_SIZE) {
      setError("Bestand is groter dan 5MB");
      return;
    }
    setError(null);
    setProof(file);
  }

  function onSubmit() {
    if (!proof) return;
    setSubmitted(true);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative w-full max-w-xl rounded-2xl border border-border bg-card p-6 shadow-elegant animate-fade-in max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold">Top-up Wallet</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Voeg saldo toe via bankoverschrijving
            </p>
          </div>
          <button onClick={onClose} className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        {submitted ? (
          <div className="mt-6 flex flex-col items-center text-center">
            <div className="rounded-full bg-success/15 p-3 ring-1 ring-inset ring-success/25">
              <CheckCircle2 className="h-6 w-6 text-success" />
            </div>
            <h3 className="mt-4 text-base font-semibold">Aanvraag verzonden</h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              We verifiëren je betaling en crediteren je wallet binnen 30 minuten.
            </p>
            <button
              onClick={onClose}
              className="mt-5 rounded-lg gradient-primary px-4 py-2 text-sm font-semibold text-white shadow-glow transition hover:brightness-110"
            >
              Sluiten
            </button>
          </div>
        ) : (
          <div className="mt-5 space-y-5">
            {/* Info banner */}
            <div className="flex items-start gap-2.5 rounded-xl border border-primary/30 bg-primary/10 p-3 text-xs text-foreground">
              <div className="mt-0.5 rounded-md bg-primary/20 p-1 text-primary-glow ring-1 ring-inset ring-primary/30">
                <Wallet className="h-3.5 w-3.5" />
              </div>
              <p className="leading-relaxed">
                <span className="font-semibold">Fund your wallet</span> to make
                quick top-ups on ad accounts — geen bankoverschrijving meer per
                account nodig.
              </p>
            </div>

            {/* Amount */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Bedrag (€)</label>
              <input
                type="number"
                value={amount}
                min={10}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full rounded-lg border border-border bg-background/40 px-3 py-2 text-lg font-semibold tabular-nums focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <div className="mt-2 grid grid-cols-4 gap-2">
                {[100, 500, 1000, 5000].map((a) => (
                  <button
                    key={a}
                    onClick={() => setAmount(a)}
                    className={cn(
                      "rounded-lg border py-2 text-xs font-semibold transition",
                      amount === a
                        ? "border-primary/50 bg-primary/10 text-foreground"
                        : "border-border bg-background/40 hover:bg-accent",
                    )}
                  >
                    €{a.toLocaleString("nl-NL")}
                  </button>
                ))}
              </div>
            </div>

            {/* Bank details */}
            <GlassCard className="!p-4">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                Bankoverschrijving — Gegevens
              </p>
              <div className="mt-3 space-y-2.5 text-sm">
                <Row label="Begunstigde" value={beneficiary} />
                <Row label="IBAN" value={iban} mono copy />
                <Row label="BIC" value={bic} mono copy />
                <Row label="Referentie" value={reference} mono copy highlight />
              </div>
              <div className="mt-3 flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/10 p-2.5 text-xs text-warning-foreground">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" />
                <p>
                  <span className="font-semibold text-warning">Gebruik exact deze referentie</span>{" "}
                  voor directe verwerking.
                </p>
              </div>
            </GlassCard>

            {/* Upload */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Betaalbewijs uploaden
              </label>
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  handleFile(e.dataTransfer.files?.[0] ?? null);
                }}
                onClick={() => inputRef.current?.click()}
                className={cn(
                  "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed p-5 text-center transition",
                  isDragging
                    ? "border-primary/60 bg-primary/5"
                    : "border-border bg-background/30 hover:border-primary/40 hover:bg-background/50",
                )}
              >
                {proof ? (
                  <div className="flex w-full items-center gap-3">
                    <div className="rounded-lg bg-primary/15 p-2 ring-1 ring-inset ring-primary/25">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1 text-left">
                      <p className="truncate text-sm font-medium">{proof.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(proof.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setProof(null);
                      }}
                      className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload className="h-5 w-5 text-muted-foreground" />
                    <p className="text-sm font-medium">Sleep een bestand of klik om te uploaden</p>
                    <p className="text-xs text-muted-foreground">PDF, PNG of JPG · max 5MB</p>
                  </>
                )}
                <input
                  ref={inputRef}
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
                  className="hidden"
                  onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
                />
              </div>
              {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
            </div>

            {/* Notes */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Notities (optioneel)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Eventuele extra informatie voor het Adcure team…"
                className="w-full resize-none rounded-lg border border-border bg-background/40 px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={onClose}
                className="flex-1 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium hover:bg-accent"
              >
                Annuleren
              </button>
              <button
                onClick={onSubmit}
                disabled={!proof}
                className={cn(
                  "flex-1 rounded-lg gradient-primary px-3 py-2 text-sm font-semibold text-white shadow-glow transition",
                  proof ? "hover:brightness-110" : "cursor-not-allowed opacity-50",
                )}
              >
                Verstuur Top-up Verzoek
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  mono,
  copy,
  highlight,
}: {
  label: string;
  value: string;
  mono?: boolean;
  copy?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "text-sm",
            mono && "font-mono",
            highlight ? "font-semibold text-primary-glow" : "text-foreground",
          )}
        >
          {value}
        </span>
        {copy && <CopyButton value={value} />}
      </div>
    </div>
  );
}
