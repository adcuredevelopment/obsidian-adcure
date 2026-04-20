import { cn } from "@/lib/utils";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { GlassCard } from "./GlassCard";

export function KpiCard({
  label,
  value,
  delta,
  icon: Icon,
  accent = "primary",
  hint,
}: {
  label: string;
  value: string;
  delta?: { value: string; positive?: boolean };
  icon: LucideIcon;
  accent?: "primary" | "success" | "violet" | "warning";
  hint?: string;
}) {
  const accentBg: Record<string, string> = {
    primary: "from-primary/25 to-primary/0",
    success: "from-success/25 to-success/0",
    violet: "from-violet/25 to-violet/0",
    warning: "from-warning/25 to-warning/0",
  };
  const accentRing: Record<string, string> = {
    primary: "ring-primary/30 text-primary-glow",
    success: "ring-success/30 text-success",
    violet: "ring-violet/30 text-violet",
    warning: "ring-warning/30 text-warning",
  };

  return (
    <GlassCard className="overflow-hidden">
      <div
        className={cn(
          "pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-gradient-radial opacity-60 blur-2xl",
          "bg-gradient-to-br",
          accentBg[accent],
        )}
      />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
            {value}
          </p>
          {hint && (
            <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
          )}
        </div>
        <div
          className={cn(
            "rounded-xl bg-background/50 p-2 ring-1 ring-inset",
            accentRing[accent],
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>
      {delta && (
        <div className="mt-4 flex items-center gap-1.5">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium",
              delta.positive
                ? "bg-success/15 text-success"
                : "bg-destructive/15 text-destructive",
            )}
          >
            {delta.positive ? (
              <ArrowUpRight className="h-3 w-3" />
            ) : (
              <ArrowDownRight className="h-3 w-3" />
            )}
            {delta.value}
          </span>
          <span className="text-xs text-muted-foreground">vs last week</span>
        </div>
      )}
    </GlassCard>
  );
}
