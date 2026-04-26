import { requireRole } from "@/lib/auth-mock";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { GlassCard } from "@/components/GlassCard";
import { StatusPill } from "@/components/StatusPill";
import { KpiCard } from "@/components/KpiCard";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  X,
  Building2,
  Mail,
  Phone,
  FileBadge,
  Hash,
  Landmark,
  Eye,
  Clock,
  XCircle,
  Timer,
  Calendar,
  User,
  Loader2,
  Copy,
  AlertCircle,
} from "lucide-react";
import {
  useApplications,
  approveApplication,
  rejectApplication,
  calculateAvgReviewTime,
  formatRelativeTime,
  type Application,
} from "@/lib/applications";
import { toast } from "sonner";

export const Route = createFileRoute("/agency/account-applications")({
  beforeLoad: () => requireRole("agency_admin"),
  head: () => ({ meta: [{ title: "Account Applications — Adcure Agency" }] }),
  component: AccountApplicationsPage,
});

type FilterTab = "pending" | "approved" | "rejected" | "all";

function AccountApplicationsPage() {
  const { applications, loading, error, pending, approved, rejected, refetch } = useApplications();
  const [tab, setTab] = useState<FilterTab>("pending");
  const [approveTarget, setApproveTarget] = useState<Application | null>(null);
  const [rejectTarget, setRejectTarget] = useState<Application | null>(null);
  const [detailTarget, setDetailTarget] = useState<Application | null>(null);

  const counts = useMemo(
    () => ({
      pending: pending.length,
      approved: approved.length,
      rejected: rejected.length,
      all: applications.length,
    }),
    [applications, pending, approved, rejected]
  );

  const filtered = useMemo(() => {
    if (tab === "all") return applications;
    return applications.filter((a) => a.status === tab);
  }, [applications, tab]);

  const avgReviewTime = useMemo(
    () => calculateAvgReviewTime(applications),
    [applications]
  );

  return (
    <AppShell>
      <div className="animate-fade-in space-y-6">
        <header>
          <h1 className="text-2xl font-semibold tracking-tight">Account Applications</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Review en beoordeel inkomende aanvragen van nieuwe klanten.
          </p>
        </header>

        {/* Stats Row */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard label="Pending" value={counts.pending.toString()} icon={Clock} accent="warning" />
          <KpiCard label="Approved" value={counts.approved.toString()} icon={CheckCircle2} accent="success" />
          <KpiCard label="Rejected" value={counts.rejected.toString()} icon={XCircle} accent="primary" />
          <KpiCard label="Avg Review Time" value={avgReviewTime} icon={Timer} accent="violet" />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 rounded-xl border border-border bg-card/60 p-1 w-fit">
          {(
            [
              { id: "pending", label: "Pending", count: counts.pending },
              { id: "approved", label: "Approved", count: counts.approved },
              { id: "rejected", label: "Rejected", count: counts.rejected },
              { id: "all", label: "All", count: counts.all },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition",
                tab === t.id
                  ? "bg-primary/15 text-primary-glow ring-1 ring-inset ring-primary/30"
                  : "text-muted-foreground hover:bg-background/60 hover:text-foreground"
              )}
            >
              {t.label}
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                  tab === t.id
                    ? "bg-primary/20 text-primary-glow"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {t.count}
              </span>
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <GlassCard className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary-glow" />
            <p className="mt-3 text-sm text-muted-foreground">Applications laden…</p>
          </GlassCard>
        )}

        {/* Error */}
        {error && !loading && (
          <GlassCard className="border-destructive/30 bg-destructive/5">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 text-destructive" />
              <div>
                <p className="text-sm font-semibold text-destructive">Er ging iets mis</p>
                <p className="mt-1 text-xs text-muted-foreground">{error}</p>
              </div>
            </div>
          </GlassCard>
        )}

        {/* Empty */}
        {!loading && !error && filtered.length === 0 && (
          <GlassCard className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-2xl bg-muted/20 p-4 ring-1 ring-inset ring-border">
              <Clock className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="mt-4 text-base font-semibold">Geen applications</p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              {tab === "pending"
                ? "Er zijn geen pending applications op dit moment."
                : `Geen ${tab} applications gevonden.`}
            </p>
          </GlassCard>
        )}

        {/* Application Cards */}
        {!loading && !error && filtered.length > 0 && (
          <div className="space-y-3">
            {filtered.map((app) => (
              <ApplicationCard
                key={app.id}
                app={app}
                onApprove={() => setApproveTarget(app)}
                onReject={() => setRejectTarget(app)}
                onViewDetails={() => setDetailTarget(app)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <ApproveModal
        app={approveTarget}
        onClose={() => setApproveTarget(null)}
        onSuccess={() => {
          void refetch(); // Refresh list after approve
        }}
      />

      <RejectModal
        app={rejectTarget}
        onClose={() => setRejectTarget(null)}
        onSuccess={() => {
          void refetch(); // Refresh list after reject
        }}
      />

      <DetailModal
        app={detailTarget}
        onClose={() => setDetailTarget(null)}
        onApprove={() => {
          setApproveTarget(detailTarget);
          setDetailTarget(null);
        }}
        onReject={() => {
          setRejectTarget(detailTarget);
          setDetailTarget(null);
        }}
      />
    </AppShell>
  );
}

// ============================================
// APPLICATION CARD
// ============================================

function ApplicationCard({
  app,
  onApprove,
  onReject,
  onViewDetails,
}: {
  app: Application;
  onApprove: () => void;
  onReject: () => void;
  onViewDetails: () => void;
}) {
  const statusVariant =
    app.status === "pending"
      ? "warning"
      : app.status === "approved"
        ? "success"
        : "destructive";

  const initials = app.contact_name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <GlassCard className="transition hover:border-border-strong">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-violet text-sm font-semibold text-white">
            {initials}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-semibold tracking-tight">
                {app.company_name}
              </h3>
              <StatusPill variant={statusVariant}>
                {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
              </StatusPill>
            </div>
            <p className="mt-0.5 text-sm text-muted-foreground">{app.contact_name}</p>

            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Mail className="h-3 w-3" />
                {app.contact_email}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Phone className="h-3 w-3" />
                {app.contact_phone}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Hash className="h-3 w-3" />
                KVK: {app.kvk_number}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <FileBadge className="h-3 w-3" />
                BTW: {app.vat_number}
              </span>
            </div>

            {app.status === "rejected" && app.rejection_reason && (
              <div className="mt-3 rounded-md border border-destructive/30 bg-destructive/5 p-2">
                <p className="text-xs text-destructive">
                  <span className="font-semibold">Afgewezen:</span> {app.rejection_reason}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-shrink-0 flex-col items-end gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {formatRelativeTime(app.created_at!)}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onViewDetails}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium transition hover:border-border-strong hover:bg-accent"
            >
              <Eye className="h-3.5 w-3.5" />
              Details
            </button>

            {app.status === "pending" && (
              <>
                <button
                  onClick={onReject}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-1.5 text-xs font-medium text-destructive transition hover:bg-destructive/20"
                >
                  <X className="h-3.5 w-3.5" />
                  Reject
                </button>
                <button
                  onClick={onApprove}
                  className="inline-flex items-center gap-1.5 rounded-lg gradient-primary px-3 py-1.5 text-xs font-semibold text-white shadow-glow transition hover:brightness-110"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Approve
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

// ============================================
// APPROVE MODAL
// ============================================

function ApproveModal({
  app,
  onClose,
  onSuccess,
}: {
  app: Application | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [tempPassword, setTempPassword] = useState<string | null>(null);

  const handleApprove = async () => {
    if (!app) return;

    setSubmitting(true);
    const result = await approveApplication(app.id);
    setSubmitting(false);

    if (result.success) {
      setTempPassword(result.tempPassword);
      toast.success(`${app.company_name} is goedgekeurd!`);
      onSuccess(); // Trigger refetch in parent
    } else {
      toast.error(`Kon niet goedkeuren: ${result.error}`);
    }
  };

  const handleCopyPassword = () => {
    if (!tempPassword) return;
    navigator.clipboard.writeText(tempPassword);
    toast.success("Password gekopieerd!");
  };

  const handleClose = () => {
    setTempPassword(null);
    onClose();
  };

  if (!app) return null;

  return (
    <Dialog open={!!app} onOpenChange={handleClose}>
      <DialogContent>
        {tempPassword ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-success" />
                Account Aangemaakt
              </DialogTitle>
              <DialogDescription>
                {app.company_name} is goedgekeurd. Deel onderstaande gegevens met de klant.
              </DialogDescription>
            </DialogHeader>

            <div className="my-4 space-y-3">
              <div className="rounded-lg border border-border bg-background/40 p-3">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Email</p>
                <p className="mt-1 font-mono text-sm">{app.contact_email}</p>
              </div>

              <div className="rounded-lg border border-warning/30 bg-warning/5 p-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-wider text-warning">Tijdelijk Wachtwoord</p>
                  <button
                    onClick={handleCopyPassword}
                    className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-warning hover:bg-warning/10"
                  >
                    <Copy className="h-3 w-3" />
                    Copy
                  </button>
                </div>
                <p className="mt-1 font-mono text-sm">{tempPassword}</p>
              </div>

              <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
                <p className="text-xs text-muted-foreground">
                  💡 <span className="font-semibold">Volgende stap:</span> Stuur deze gegevens handmatig naar de klant. In Phase 2.2 wordt dit automatisch via welcome email.
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button onClick={handleClose} className="w-full">Sluiten</Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Applicatie Goedkeuren</DialogTitle>
              <DialogDescription>
                Je staat op het punt <strong>{app.company_name}</strong> goed te keuren.
              </DialogDescription>
            </DialogHeader>

            <div className="my-4 space-y-3">
              <div className="rounded-lg border border-border bg-background/40 p-3">
                <p className="text-sm"><strong>Wat gebeurt er:</strong></p>
                <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                  <li>✓ Organization wordt aangemaakt</li>
                  <li>✓ User account wordt aangemaakt</li>
                  <li>✓ Tijdelijk wachtwoord wordt gegenereerd</li>
                  <li>✓ Applicatie status wordt geüpdatet</li>
                </ul>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose} disabled={submitting}>
                Annuleren
              </Button>
              <Button
                onClick={handleApprove}
                disabled={submitting}
                className="gradient-primary text-white shadow-glow"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Goedkeuren…
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Goedkeuren
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// REJECT MODAL
// ============================================

function RejectModal({
  app,
  onClose,
  onSuccess,
}: {
  app: Application | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleReject = async () => {
    if (!app || !reason.trim()) return;

    setSubmitting(true);
    const result = await rejectApplication(app.id, reason);
    setSubmitting(false);

    if (result.success) {
      toast.success(`${app.company_name} afgewezen`);
      setReason("");
      onSuccess(); // Trigger refetch
      onClose();
    } else {
      toast.error(`Kon niet afwijzen: ${result.error}`);
    }
  };

  const handleClose = () => {
    if (submitting) return;
    setReason("");
    onClose();
  };

  if (!app) return null;

  return (
    <Dialog open={!!app} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Applicatie Afwijzen</DialogTitle>
          <DialogDescription>
            Je wijst de aanvraag van <strong>{app.company_name}</strong> af. Geef een reden op.
          </DialogDescription>
        </DialogHeader>

        <div className="my-4 space-y-2">
          <label
            htmlFor="reason"
            className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
          >
            Reden voor afwijzing *
          </label>
          <Textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Bijv. KVK nummer kon niet geverifieerd worden..."
            disabled={submitting}
            rows={4}
            className="resize-none"
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={submitting}>
            Annuleren
          </Button>
          <Button
            onClick={handleReject}
            disabled={submitting || !reason.trim()}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Afwijzen…
              </>
            ) : (
              <>
                <X className="h-4 w-4" />
                Afwijzen
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// DETAIL MODAL
// ============================================

function DetailModal({
  app,
  onClose,
  onApprove,
  onReject,
}: {
  app: Application | null;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
}) {
  if (!app) return null;

  const statusVariant =
    app.status === "pending"
      ? "pending"
      : app.status === "approved"
        ? "success"
        : "danger";

  return (
    <Dialog open={!!app} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <DialogTitle>{app.company_name}</DialogTitle>
            <StatusPill variant={statusVariant}>
              {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
            </StatusPill>
          </div>
          <DialogDescription>
            Aangevraagd {formatRelativeTime(app.created_at!)}
          </DialogDescription>
        </DialogHeader>

        <div className="my-4 grid gap-4 sm:grid-cols-2">
          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Bedrijfsgegevens
            </h3>
            <div className="space-y-2.5">
              <DetailField icon={Building2} label="Bedrijfsnaam" value={app.company_name} />
              <DetailField icon={Hash} label="KVK Nummer" value={app.kvk_number} />
              <DetailField icon={FileBadge} label="BTW Nummer" value={app.vat_number} />
              {app.iban && <DetailField icon={Landmark} label="IBAN" value={app.iban} />}
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Contactgegevens
            </h3>
            <div className="space-y-2.5">
              <DetailField icon={User} label="Naam" value={app.contact_name} />
              <DetailField icon={Mail} label="Email" value={app.contact_email} />
              <DetailField icon={Phone} label="Telefoon" value={app.contact_phone} />
            </div>
          </div>
        </div>

        {app.status === "rejected" && app.rejection_reason && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-destructive">
              Reden voor afwijzing
            </p>
            <p className="mt-1 text-sm text-foreground">{app.rejection_reason}</p>
          </div>
        )}

        {app.reviewed_at && (
          <div className="rounded-lg border border-border bg-background/40 p-3">
            <p className="text-xs text-muted-foreground">
              Beoordeeld op{" "}
              <span className="font-medium text-foreground">
                {new Date(app.reviewed_at).toLocaleString("nl-NL")}
              </span>
            </p>
          </div>
        )}

        <DialogFooter>
          {app.status === "pending" ? (
            <>
              <Button variant="outline" onClick={onClose}>Sluiten</Button>
              <Button
                variant="outline"
                onClick={onReject}
                className="border-destructive/30 text-destructive hover:bg-destructive/10"
              >
                <X className="h-4 w-4" />
                Reject
              </Button>
              <Button onClick={onApprove} className="gradient-primary text-white shadow-glow">
                <CheckCircle2 className="h-4 w-4" />
                Approve
              </Button>
            </>
          ) : (
            <Button onClick={onClose}>Sluiten</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DetailField({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
      <div className="min-w-0 flex-1">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="break-words text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}
