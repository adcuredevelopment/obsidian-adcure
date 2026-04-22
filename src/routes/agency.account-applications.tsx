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
} from "lucide-react";

export const Route = createFileRoute("/agency/account-applications")({
  beforeLoad: () => requireRole("agency_admin"),
  head: () => ({ meta: [{ title: "Account Applications — Adcure Agency" }] }),
  component: AccountApplicationsPage,
});

type AppStatus = "Pending" | "Approved" | "Rejected";

type Application = {
  id: string;
  company: string;
  contact: string;
  email: string;
  phone: string;
  kvk: string;
  vat: string;
  iban: string;
  address: string;
  city: string;
  country: string;
  website: string;
  appliedAt: string;
  status: AppStatus;
  rejectionReason?: string;
};

const initialApps: Application[] = [
  {
    id: "1",
    company: "Helix Labs B.V.",
    contact: "Daniel Kim",
    email: "dan@helixlabs.com",
    phone: "+31 6 1234 5678",
    kvk: "12345678",
    vat: "NL001234567B89",
    iban: "NL91ABNA0417164300",
    address: "Keizersgracht 123",
    city: "Amsterdam",
    country: "Netherlands",
    website: "helixlabs.com",
    appliedAt: "2 hours ago",
    status: "Pending",
  },
  {
    id: "2",
    company: "Ember Coffee Co.",
    contact: "Riley Chen",
    email: "riley@embercoffee.co",
    phone: "+31 6 8765 4321",
    kvk: "23456789",
    vat: "NL002345678B90",
    iban: "NL44RABO0123456789",
    address: "Witte de Withstraat 22",
    city: "Rotterdam",
    country: "Netherlands",
    website: "embercoffee.co",
    appliedAt: "5 hours ago",
    status: "Pending",
  },
  {
    id: "3",
    company: "Tideline Apparel",
    contact: "Emma Hughes",
    email: "emma@tideline.com",
    phone: "+31 6 1122 3344",
    kvk: "34567890",
    vat: "NL003456789B01",
    iban: "NL18INGB0002345678",
    address: "Strandweg 8",
    city: "The Hague",
    country: "Netherlands",
    website: "tideline.com",
    appliedAt: "1 day ago",
    status: "Pending",
  },
  {
    id: "4",
    company: "Lumen Skincare",
    contact: "Priya Nair",
    email: "priya@lumen.co",
    phone: "+31 6 5566 7788",
    kvk: "45678901",
    vat: "NL004567890B12",
    iban: "NL62TRIO0379658123",
    address: "Oudegracht 200",
    city: "Utrecht",
    country: "Netherlands",
    website: "lumen.co",
    appliedAt: "2 days ago",
    status: "Pending",
  },
  {
    id: "5",
    company: "Northwind Performance",
    contact: "Sofia Martinez",
    email: "sofia@northwind.io",
    phone: "+31 6 9988 7766",
    kvk: "56789012",
    vat: "NL005678901B23",
    iban: "NL14REV0766119691",
    address: "Herengracht 45",
    city: "Amsterdam",
    country: "Netherlands",
    website: "northwind.io",
    appliedAt: "3 days ago",
    status: "Approved",
  },
  {
    id: "6",
    company: "Bramble & Co.",
    contact: "Owen Walker",
    email: "owen@bramble.co",
    phone: "+31 6 4433 2211",
    kvk: "67890123",
    vat: "NL006789012B34",
    iban: "NL20INGB0009876543",
    address: "Lange Voorhout 12",
    city: "The Hague",
    country: "Netherlands",
    website: "bramble.co",
    appliedAt: "4 days ago",
    status: "Rejected",
    rejectionReason: "KVK number could not be verified.",
  },
];

type FilterTab = "Pending" | "Approved" | "Rejected" | "All";

function AccountApplicationsPage() {
  const [apps, setApps] = useState(initialApps);
  const [tab, setTab] = useState<FilterTab>("Pending");
  const [approveTarget, setApproveTarget] = useState<Application | null>(null);
  const [rejectTarget, setRejectTarget] = useState<Application | null>(null);
  const [detailTarget, setDetailTarget] = useState<Application | null>(null);

  const counts = useMemo(
    () => ({
      Pending: apps.filter((a) => a.status === "Pending").length,
      Approved: apps.filter((a) => a.status === "Approved").length,
      Rejected: apps.filter((a) => a.status === "Rejected").length,
      All: apps.length,
    }),
    [apps],
  );

  const filtered = useMemo(
    () => (tab === "All" ? apps : apps.filter((a) => a.status === tab)),
    [apps, tab],
  );

  const approve = (id: string) =>
    setApps((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "Approved", rejectionReason: undefined } : a)),
    );

  const reject = (id: string, reason: string) =>
    setApps((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "Rejected", rejectionReason: reason } : a)),
    );

  return (
    <AppShell>
      <div className="animate-fade-in space-y-6">
        <header>
          <h1 className="text-2xl font-semibold tracking-tight">Account Applications</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Review and approve new client applications.
          </p>
        </header>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            label="Pending"
            value={counts.Pending.toString()}
            icon={Clock}
            accent="warning"
            hint="Awaiting review"
          />
          <KpiCard
            label="Approved"
            value={counts.Approved.toString()}
            icon={CheckCircle2}
            accent="success"
            hint="This month"
          />
          <KpiCard
            label="Rejected"
            value={counts.Rejected.toString()}
            icon={XCircle}
            accent="primary"
            hint="This month"
          />
          <KpiCard
            label="Avg. review time"
            value="4.2h"
            icon={Timer}
            accent="violet"
            hint="From submission"
          />
        </section>

        <div className="flex flex-wrap items-center gap-2">
          {(["Pending", "Approved", "Rejected", "All"] as FilterTab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition",
                tab === t
                  ? "border-primary/40 bg-primary/15 text-primary-glow"
                  : "border-border bg-card/60 text-muted-foreground hover:bg-card hover:text-foreground",
              )}
            >
              {t}
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[10px] font-semibold ring-1 ring-inset tabular-nums",
                  tab === t
                    ? "bg-primary/20 text-primary-glow ring-primary/30"
                    : "bg-background/40 text-muted-foreground ring-border",
                )}
              >
                {counts[t]}
              </span>
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {filtered.length === 0 ? (
            <GlassCard className="py-12 text-center">
              <p className="text-sm text-muted-foreground">No applications in this view.</p>
            </GlassCard>
          ) : (
            filtered.map((a) => (
              <ApplicationRow
                key={a.id}
                app={a}
                onApprove={() => setApproveTarget(a)}
                onReject={() => setRejectTarget(a)}
                onView={() => setDetailTarget(a)}
              />
            ))
          )}
        </div>
      </div>

      <ApproveDialog
        app={approveTarget}
        onClose={() => setApproveTarget(null)}
        onConfirm={(id) => {
          approve(id);
          setApproveTarget(null);
        }}
      />
      <RejectDialog
        app={rejectTarget}
        onClose={() => setRejectTarget(null)}
        onConfirm={(id, reason) => {
          reject(id, reason);
          setRejectTarget(null);
        }}
      />
      <DetailDialog
        app={detailTarget}
        onClose={() => setDetailTarget(null)}
        onApprove={(app) => {
          setDetailTarget(null);
          setApproveTarget(app);
        }}
        onReject={(app) => {
          setDetailTarget(null);
          setRejectTarget(app);
        }}
      />
    </AppShell>
  );
}

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function ApplicationRow({
  app,
  onApprove,
  onReject,
  onView,
}: {
  app: Application;
  onApprove: () => void;
  onReject: () => void;
  onView: () => void;
}) {
  const variant =
    app.status === "Pending" ? "pending" : app.status === "Approved" ? "success" : "danger";

  return (
    <GlassCard>
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/30 to-violet/30 ring-1 ring-inset ring-border">
            <Building2 className="h-5 w-5 text-primary-glow" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-semibold tracking-tight">{app.company}</h3>
              <StatusPill variant={variant}>{app.status}</StatusPill>
            </div>

            <div className="mt-2 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-primary to-violet text-[10px] font-semibold text-white">
                {initials(app.contact)}
              </span>
              <span className="text-sm text-foreground">{app.contact}</span>
              <span className="text-xs text-muted-foreground">· applied {app.appliedAt}</span>
            </div>

            <div className="mt-3 grid gap-x-6 gap-y-1.5 text-xs text-muted-foreground sm:grid-cols-2">
              <span className="inline-flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" /> {app.email}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" /> {app.phone}
              </span>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Hash className="h-3 w-3" /> KVK {app.kvk}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <FileBadge className="h-3 w-3" /> {app.vat}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Landmark className="h-3 w-3" /> {app.iban}
              </span>
            </div>

            {app.status === "Rejected" && app.rejectionReason && (
              <p className="mt-3 rounded-md border border-destructive/20 bg-destructive/10 px-2.5 py-1.5 text-xs text-destructive">
                Reason: {app.rejectionReason}
              </p>
            )}
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2 lg:flex-col lg:items-end">
          {app.status === "Pending" ? (
            <>
              <button
                onClick={onApprove}
                className="inline-flex items-center gap-1.5 rounded-lg bg-success px-3 py-2 text-xs font-semibold text-success-foreground shadow-elegant transition hover:brightness-110"
              >
                <CheckCircle2 className="h-3.5 w-3.5" /> Approve
              </button>
              <button
                onClick={onReject}
                className="inline-flex items-center gap-1.5 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs font-semibold text-destructive transition hover:bg-destructive/20"
              >
                <X className="h-3.5 w-3.5" /> Reject
              </button>
            </>
          ) : null}
          <button
            onClick={onView}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card/60 px-3 py-2 text-xs font-semibold text-foreground transition hover:bg-card"
          >
            <Eye className="h-3.5 w-3.5" /> View Details
          </button>
        </div>
      </div>
    </GlassCard>
  );
}

function ApproveDialog({
  app,
  onClose,
  onConfirm,
}: {
  app: Application | null;
  onClose: () => void;
  onConfirm: (id: string) => void;
}) {
  return (
    <Dialog open={!!app} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="border-border bg-card/95 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle>Approve application</DialogTitle>
          <DialogDescription>
            Are you sure you want to approve <span className="font-medium text-foreground">{app?.company}</span>?
          </DialogDescription>
        </DialogHeader>
        <div className="rounded-lg border border-primary/20 bg-primary/10 p-3 text-xs text-muted-foreground">
          This will create a user account for <span className="text-foreground">{app?.contact}</span>{" "}
          ({app?.email}) and send a welcome email with login instructions.
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => app && onConfirm(app.id)}
            className="bg-success text-success-foreground hover:brightness-110"
          >
            <CheckCircle2 className="h-4 w-4" /> Confirm Approve
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const REJECT_REASONS = ["KVK invalid", "Duplicate", "Other"] as const;
type RejectReason = (typeof REJECT_REASONS)[number];

function RejectDialog({
  app,
  onClose,
  onConfirm,
}: {
  app: Application | null;
  onClose: () => void;
  onConfirm: (id: string, reason: string) => void;
}) {
  const [reason, setReason] = useState<RejectReason>("KVK invalid");
  const [custom, setCustom] = useState("");

  const final = reason === "Other" ? custom.trim() || "Other" : reason + (custom.trim() ? ` — ${custom.trim()}` : "");

  return (
    <Dialog
      open={!!app}
      onOpenChange={(o) => {
        if (!o) {
          onClose();
          setReason("KVK invalid");
          setCustom("");
        }
      }}
    >
      <DialogContent className="border-border bg-card/95 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle>Reject application</DialogTitle>
          <DialogDescription>
            Reject <span className="font-medium text-foreground">{app?.company}</span>. The applicant will be notified by email.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Reason
            </label>
            <div className="mt-2 flex flex-wrap gap-2">
              {REJECT_REASONS.map((r) => (
                <button
                  key={r}
                  onClick={() => setReason(r)}
                  className={cn(
                    "rounded-lg border px-3 py-1.5 text-xs font-medium transition",
                    reason === r
                      ? "border-destructive/40 bg-destructive/15 text-destructive"
                      : "border-border bg-card/60 text-muted-foreground hover:bg-card hover:text-foreground",
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {reason === "Other" ? "Custom reason" : "Additional notes (optional)"}
            </label>
            <Textarea
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              placeholder={
                reason === "Other"
                  ? "Explain why this application is being rejected…"
                  : "Add any extra context for the applicant…"
              }
              className="mt-2"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => app && onConfirm(app.id, final)}
            disabled={reason === "Other" && custom.trim().length === 0}
          >
            <X className="h-4 w-4" /> Confirm Reject
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DetailDialog({
  app,
  onClose,
  onApprove,
  onReject,
}: {
  app: Application | null;
  onClose: () => void;
  onApprove: (app: Application) => void;
  onReject: (app: Application) => void;
}) {
  if (!app) return null;
  const variant =
    app.status === "Pending" ? "pending" : app.status === "Approved" ? "success" : "danger";

  return (
    <Dialog open={!!app} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl border-border bg-card/95 backdrop-blur-xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/30 to-violet/30 ring-1 ring-inset ring-border">
              <Building2 className="h-5 w-5 text-primary-glow" />
            </div>
            <div>
              <DialogTitle className="flex items-center gap-2">
                {app.company}
                <StatusPill variant={variant}>{app.status}</StatusPill>
              </DialogTitle>
              <DialogDescription>Applied {app.appliedAt}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="grid gap-5 sm:grid-cols-2">
          <Section title="Company">
            <DetailRow icon={Building2} label="Name" value={app.company} />
            <DetailRow icon={Hash} label="KVK" value={app.kvk} />
            <DetailRow icon={FileBadge} label="BTW" value={app.vat} />
            <DetailRow icon={Landmark} label="IBAN" value={app.iban} />
            <DetailRow
              icon={Calendar}
              label="Address"
              value={`${app.address}, ${app.city}, ${app.country}`}
            />
            <DetailRow icon={Eye} label="Website" value={app.website} />
          </Section>
          <Section title="Contact">
            <DetailRow icon={User} label="Name" value={app.contact} />
            <DetailRow icon={Mail} label="Email" value={app.email} />
            <DetailRow icon={Phone} label="Phone" value={app.phone} />
          </Section>
        </div>

        {app.status === "Rejected" && app.rejectionReason && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
            <span className="font-semibold">Rejection reason:</span> {app.rejectionReason}
          </div>
        )}

        <DialogFooter>
          {app.status === "Pending" ? (
            <>
              <Button
                variant="outline"
                onClick={() => onReject(app)}
                className="border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/20"
              >
                <X className="h-4 w-4" /> Reject
              </Button>
              <Button
                onClick={() => onApprove(app)}
                className="bg-success text-success-foreground hover:brightness-110"
              >
                <CheckCircle2 className="h-4 w-4" /> Approve
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </p>
      <div className="space-y-2 rounded-lg border border-border bg-background/40 p-3">
        {children}
      </div>
    </div>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2 text-xs">
      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      <div className="min-w-0 flex-1">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="truncate text-foreground">{value}</p>
      </div>
    </div>
  );
}
