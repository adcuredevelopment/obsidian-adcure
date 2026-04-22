import { requireRole } from "@/lib/auth-mock";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { ClientShell } from "@/components/ClientShell";
import { GlassCard } from "@/components/GlassCard";
import { StatusPill, statusToVariant } from "@/components/StatusPill";
import { adAccounts, type AdAccount } from "@/lib/mock-data";
import {
  CreditCard,
  Plus,
  Megaphone,
  Clock,
  X,
  Wallet,
  Building2,
  Copy,
  Check,
  Upload,
  FileText,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/portal/ad-accounts")({
  beforeLoad: () => requireRole("client"),
  head: () => ({
    meta: [
      { title: "Mijn Ad Accounts — Adcure" },
      { name: "description", content: "Beheer je eigen ad accounts en vraag top-ups aan." },
    ],
  }),
  component: ClientAdAccountsPage,
});

// Mock current client wallet balance
const WALLET_BALANCE = 1030;
const FEE_PCT = 0.05;
const VAT_PCT = 0.21;
const MIN_AMOUNT = 10;
// Indicative FX — for display only on the calculator
const FX_USD_PER_EUR = 1.08;

type EnrichedAccount = AdAccount & { lastTopUp: { amount: number; when: string } | null };

const myActiveAccounts: EnrichedAccount[] = adAccounts
  .slice(0, 4)
  .filter((a) => a.status === "Active")
  .map((a, i) => ({
    ...a,
    lastTopUp:
      i === 0
        ? { amount: 1200, when: "5u geleden" }
        : i === 1
          ? { amount: 450, when: "2d geleden" }
          : i === 2
            ? { amount: 2500, when: "1w geleden" }
            : null,
  }));

type AccountRequest = {
  id: string;
  name: string;
  platform: "Meta" | "Google" | "TikTok";
  requestedAt: string;
  status: "Pending" | "Rejected";
  note: string;
};

const myRequests: AccountRequest[] = [
  {
    id: "req1",
    name: "Lumen Skincare Expansion",
    platform: "Meta",
    requestedAt: "1d geleden",
    status: "Pending",
    note: "In review door Adcure team",
  },
  {
    id: "req2",
    name: "Tideline Apparel — US",
    platform: "TikTok",
    requestedAt: "5d geleden",
    status: "Rejected",
    note: "Domein kon niet geverifieerd worden. Neem contact op met support.",
  },
];

function ClientAdAccountsPage() {
  const [tab, setTab] = useState<"active" | "requests">("active");
  const [topUpFor, setTopUpFor] = useState<EnrichedAccount | null>(null);
  const [showRequest, setShowRequest] = useState(false);

  return (
    <ClientShell>
      <div className="animate-fade-in space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Mijn Ad Accounts</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Beheer je actieve ad accounts en vraag nieuwe accounts aan.
            </p>
          </div>
          <button
            onClick={() => setShowRequest(true)}
            className="inline-flex items-center gap-2 self-start rounded-lg gradient-primary px-3.5 py-2 text-sm font-semibold text-white shadow-glow transition hover:brightness-110"
          >
            <Plus className="h-4 w-4" /> Request New Account
          </button>
        </header>

        <div className="flex items-center gap-1 rounded-xl border border-border bg-card/60 p-1 w-fit">
          {[
            { id: "active", label: "Active Accounts", count: myActiveAccounts.length },
            { id: "requests", label: "Requests", count: myRequests.length },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as typeof tab)}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-sm font-medium transition",
                tab === t.id ? "bg-background text-foreground shadow-card" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t.label}
              <span
                className={cn(
                  "rounded-md px-1.5 text-[10px] font-semibold",
                  tab === t.id ? "bg-primary/20 text-primary-glow" : "bg-muted text-muted-foreground",
                )}
              >
                {t.count}
              </span>
            </button>
          ))}
        </div>

        {tab === "active" ? (
          <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {myActiveAccounts.map((a) => (
              <AccountCard key={a.id} account={a} onTopUp={() => setTopUpFor(a)} />
            ))}
          </section>
        ) : (
          <section className="space-y-3">
            {myRequests.length === 0 ? (
              <GlassCard className="flex flex-col items-center justify-center py-16 text-center">
                <Megaphone className="h-6 w-6 text-muted-foreground" />
                <p className="mt-3 text-sm font-semibold">Geen aanvragen</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Vraag een nieuw ad account aan met de knop rechtsboven.
                </p>
              </GlassCard>
            ) : (
              myRequests.map((r) => (
                <GlassCard key={r.id}>
                  <div className="flex items-start gap-4">
                    <div
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-lg ring-1 ring-inset",
                        r.status === "Pending"
                          ? "bg-warning/15 text-warning ring-warning/25"
                          : "bg-destructive/15 text-destructive ring-destructive/25",
                      )}
                    >
                      {r.status === "Pending" ? <Clock className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{r.name}</p>
                        <StatusPill variant={r.status === "Pending" ? "pending" : "danger"}>{r.status}</StatusPill>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {r.platform} · Aangevraagd {r.requestedAt}
                      </p>
                      <p className="mt-2 text-xs text-foreground">{r.note}</p>
                    </div>
                  </div>
                </GlassCard>
              ))
            )}
          </section>
        )}
      </div>

      {topUpFor && <TopUpModal account={topUpFor} onClose={() => setTopUpFor(null)} />}
      {showRequest && <RequestAccountModal onClose={() => setShowRequest(false)} />}
    </ClientShell>
  );
}

function PlatformBadge({ platform }: { platform: AdAccount["platform"] }) {
  const map: Record<AdAccount["platform"], { label: string; cls: string }> = {
    Meta: { label: "M", cls: "from-blue-500/30 to-violet-500/30" },
    Google: { label: "G", cls: "from-yellow-500/30 to-red-500/30" },
    TikTok: { label: "T", cls: "from-pink-500/30 to-cyan-500/30" },
    LinkedIn: { label: "Li", cls: "from-blue-600/30 to-blue-400/30" },
  };
  const m = map[platform];
  return (
    <div
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br text-xs font-semibold ring-1 ring-inset ring-border",
        m.cls,
      )}
      title={platform}
    >
      {m.label}
    </div>
  );
}

function AccountCard({ account, onTopUp }: { account: EnrichedAccount; onTopUp: () => void }) {
  return (
    <GlassCard>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <PlatformBadge platform={account.platform} />
          <div>
            <p className="font-semibold">{account.name}</p>
            <p className="font-mono text-xs text-muted-foreground">{account.accountId}</p>
          </div>
        </div>
        <StatusPill variant={statusToVariant(account.status)}>{account.status}</StatusPill>
      </div>

      <div className="mt-5 rounded-xl border border-border bg-background/40 p-4">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Current Balance</p>
        <p className="mt-1 text-2xl font-semibold tabular-nums">
          €{account.balance.toLocaleString("nl-NL", { minimumFractionDigits: 2 })}
        </p>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
        <div className="rounded-lg border border-border bg-background/30 p-2.5">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Last Top-up</p>
          <p className="mt-0.5 font-medium tabular-nums">
            {account.lastTopUp
              ? `€${account.lastTopUp.amount.toLocaleString("nl-NL")}`
              : "—"}
          </p>
          <p className="text-[10px] text-muted-foreground">
            {account.lastTopUp?.when ?? "Geen top-ups"}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-background/30 p-2.5">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Top-up Fee</p>
          <p className="mt-0.5 font-medium">{Math.round(FEE_PCT * 100)}%</p>
          <p className="text-[10px] text-muted-foreground">+ {Math.round(VAT_PCT * 100)}% BTW op fee</p>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <button
          onClick={onTopUp}
          className="inline-flex items-center gap-2 rounded-lg gradient-primary px-3 py-2 text-xs font-semibold text-white shadow-glow transition hover:brightness-110"
        >
          <CreditCard className="h-3.5 w-3.5" /> Top-up
        </button>
        <button className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium hover:bg-accent">
          View Details
        </button>
      </div>
    </GlassCard>
  );
}

/* ---------------- Top-up Modal ---------------- */

function generateReference(prefix: string) {
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  const ts = Date.now().toString().slice(-4);
  return `${prefix}-${ts}-${rand}`;
}

function CopyChip({ value }: { value: string }) {
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
    >
      {copied ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
      {copied ? "Gekopieerd" : "Kopieer"}
    </button>
  );
}

function TopUpModal({ account, onClose }: { account: EnrichedAccount; onClose: () => void }) {
  const [amount, setAmount] = useState(100);
  const [method, setMethod] = useState<"wallet" | "bank">("wallet");
  const [proof, setProof] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const reference = useMemo(() => generateReference("ACC"), []);

  const fee = +(amount * FEE_PCT).toFixed(2);
  const vat = +(fee * VAT_PCT).toFixed(2);
  const total = +(amount + fee + vat).toFixed(2);
  const insufficient = method === "wallet" && total > WALLET_BALANCE;
  const canSubmit = method === "wallet" ? !insufficient && amount > 0 : !!proof && amount > 0;

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative w-full max-w-xl rounded-2xl border border-border bg-card p-6 shadow-elegant animate-fade-in max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold">Top-up Ad Account</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {account.name} · <span className="font-mono">{account.accountId}</span>
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
            <h3 className="mt-4 text-base font-semibold">Top-up verzoek verzonden</h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              {method === "wallet"
                ? `€${total.toLocaleString("nl-NL", { minimumFractionDigits: 2 })} wordt binnen enkele minuten doorgezet naar het ad account.`
                : "We verifiëren de overschrijving en zetten het saldo binnen 30 minuten door."}
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
            {/* Amount */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Ad Bedrag (€)</label>
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

            {/* Fee calculator */}
            <GlassCard className="!p-4">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Kostenberekening</p>
              <div className="mt-3 space-y-2 text-sm">
                <CalcRow label="Ad Amount" value={amount} />
                <CalcRow label={`Fee (${Math.round(FEE_PCT * 100)}%)`} value={fee} />
                <CalcRow label={`BTW (${Math.round(VAT_PCT * 100)}% over fee)`} value={vat} />
                <div className="mt-2 flex items-center justify-between border-t border-border pt-2 text-base font-semibold">
                  <span>Totaal te betalen</span>
                  <span className="tabular-nums">€{total.toLocaleString("nl-NL", { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </GlassCard>

            {/* Payment method */}
            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">Betaalmethode</p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <MethodOption
                  icon={<Wallet className="h-4 w-4" />}
                  label="Pay from Wallet"
                  meta={`€${WALLET_BALANCE.toLocaleString("nl-NL", { minimumFractionDigits: 2 })} beschikbaar`}
                  selected={method === "wallet"}
                  warning={insufficient ? "Onvoldoende saldo" : undefined}
                  onClick={() => setMethod("wallet")}
                />
                <MethodOption
                  icon={<Building2 className="h-4 w-4" />}
                  label="Bank Transfer"
                  meta="Verwerking < 30 min"
                  selected={method === "bank"}
                  onClick={() => setMethod("bank")}
                />
              </div>
            </div>

            {/* Bank transfer details */}
            {method === "bank" && (
              <>
                <GlassCard className="!p-4">
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    Bankoverschrijving — Gegevens
                  </p>
                  <div className="mt-3 space-y-2.5 text-sm">
                    <Row label="Begunstigde" value="Adcure Agency" />
                    <Row label="IBAN" value="NL14REV0766119691" mono copy />
                    <Row label="BIC" value="REV0NL22" mono copy />
                    <Row label="Referentie" value={reference} mono copy highlight />
                  </div>
                  <div className="mt-3 flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/10 p-2.5 text-xs">
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" />
                    <p>
                      <span className="font-semibold text-warning">Gebruik exact deze referentie</span>{" "}
                      voor directe verwerking.
                    </p>
                  </div>
                </GlassCard>

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
                          <p className="text-xs text-muted-foreground">{(proof.size / 1024).toFixed(1)} KB</p>
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
              </>
            )}

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={onClose}
                className="flex-1 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium hover:bg-accent"
              >
                Annuleren
              </button>
              <button
                onClick={() => canSubmit && setSubmitted(true)}
                disabled={!canSubmit}
                className={cn(
                  "flex-1 rounded-lg gradient-primary px-3 py-2 text-sm font-semibold text-white shadow-glow transition",
                  canSubmit ? "hover:brightness-110" : "cursor-not-allowed opacity-50",
                )}
              >
                Request Top-up
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CalcRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="tabular-nums">€{value.toLocaleString("nl-NL", { minimumFractionDigits: 2 })}</span>
    </div>
  );
}

function MethodOption({
  icon,
  label,
  meta,
  selected,
  warning,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  meta: string;
  selected: boolean;
  warning?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-xl border p-3 text-left transition",
        selected
          ? "border-primary/60 bg-primary/10"
          : "border-border bg-background/40 hover:bg-accent",
      )}
    >
      <div
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-lg ring-1 ring-inset",
          selected ? "bg-primary/20 text-primary-glow ring-primary/30" : "bg-background/60 text-muted-foreground ring-border",
        )}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{label}</p>
        <p className="text-[11px] text-muted-foreground">{meta}</p>
        {warning && <p className="text-[11px] font-medium text-destructive">{warning}</p>}
      </div>
      <div
        className={cn(
          "h-4 w-4 rounded-full border-2",
          selected ? "border-primary bg-primary" : "border-border",
        )}
      />
    </button>
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
        {copy && <CopyChip value={value} />}
      </div>
    </div>
  );
}

/* ---------------- Request Account Modal ---------------- */

function RequestAccountModal({ onClose }: { onClose: () => void }) {
  const [platform, setPlatform] = useState<"Meta" | "Google" | "TikTok">("Meta");
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [bmId, setBmId] = useState("");
  const [currency, setCurrency] = useState<"EUR" | "USD">("EUR");
  const [timezone, setTimezone] = useState("Europe/Amsterdam");
  const [submitted, setSubmitted] = useState(false);

  const canSubmit = name.trim() && domain.trim() && bmId.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-elegant animate-fade-in max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold">Request New Ad Account</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Het Adcure team beoordeelt je aanvraag binnen 1 werkdag.
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
              Je vindt de status terug onder de tab "Requests".
            </p>
            <button
              onClick={onClose}
              className="mt-5 rounded-lg gradient-primary px-4 py-2 text-sm font-semibold text-white shadow-glow transition hover:brightness-110"
            >
              Sluiten
            </button>
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Platform</label>
              <div className="grid grid-cols-3 gap-2">
                {(["Meta", "Google", "TikTok"] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPlatform(p)}
                    className={cn(
                      "rounded-lg border py-2 text-sm font-semibold transition",
                      platform === p
                        ? "border-primary/50 bg-primary/10 text-foreground"
                        : "border-border bg-background/40 hover:bg-accent",
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <FieldText label="Account naam" value={name} onChange={setName} placeholder="Bijv. Lumen Skincare EU" />
            <FieldText label="Domein" value={domain} onChange={setDomain} placeholder="lumen.co" />
            <FieldText label="Business Manager ID" value={bmId} onChange={setBmId} placeholder="123456789" mono />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Valuta</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as "EUR" | "USD")}
                  className="w-full rounded-lg border border-border bg-background/40 px-3 py-2 text-sm focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="EUR">EUR — Euro</option>
                  <option value="USD">USD — US Dollar</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Tijdzone</label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background/40 px-3 py-2 text-sm focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="Europe/Amsterdam">Europe/Amsterdam</option>
                  <option value="Europe/London">Europe/London</option>
                  <option value="America/New_York">America/New_York</option>
                  <option value="America/Los_Angeles">America/Los_Angeles</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={onClose}
                className="flex-1 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium hover:bg-accent"
              >
                Annuleren
              </button>
              <button
                onClick={() => canSubmit && setSubmitted(true)}
                disabled={!canSubmit}
                className={cn(
                  "flex-1 rounded-lg gradient-primary px-3 py-2 text-sm font-semibold text-white shadow-glow transition",
                  canSubmit ? "hover:brightness-110" : "cursor-not-allowed opacity-50",
                )}
              >
                Submit Request
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function FieldText({
  label,
  value,
  onChange,
  placeholder,
  mono,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  mono?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "w-full rounded-lg border border-border bg-background/40 px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20",
          mono && "font-mono",
        )}
      />
    </div>
  );
}
