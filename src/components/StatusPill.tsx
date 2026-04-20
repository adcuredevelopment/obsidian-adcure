import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type StatusVariant =
  | "success"
  | "pending"
  | "neutral"
  | "danger"
  | "info"
  | "violet";

const variants: Record<StatusVariant, string> = {
  success:
    "bg-success/15 text-success ring-1 ring-inset ring-success/25",
  pending:
    "bg-warning/15 text-warning ring-1 ring-inset ring-warning/25",
  neutral:
    "bg-muted text-muted-foreground ring-1 ring-inset ring-border",
  danger:
    "bg-destructive/15 text-destructive ring-1 ring-inset ring-destructive/25",
  info: "bg-primary/15 text-primary-glow ring-1 ring-inset ring-primary/25",
  violet:
    "bg-violet/15 text-violet ring-1 ring-inset ring-violet/25",
};

export function StatusPill({
  variant = "neutral",
  children,
  dot = true,
  className,
}: {
  variant?: StatusVariant;
  children: ReactNode;
  dot?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        variants[variant],
        className,
      )}
    >
      {dot && (
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            variant === "success" && "bg-success",
            variant === "pending" && "bg-warning animate-pulse-dot",
            variant === "neutral" && "bg-muted-foreground",
            variant === "danger" && "bg-destructive",
            variant === "info" && "bg-primary",
            variant === "violet" && "bg-violet",
          )}
        />
      )}
      {children}
    </span>
  );
}

export function statusToVariant(status: string): StatusVariant {
  switch (status) {
    case "Active":
      return "success";
    case "Pending":
    case "Invited":
      return "pending";
    case "Paused":
      return "neutral";
    case "Rejected":
    case "Suspended":
      return "danger";
    default:
      return "neutral";
  }
}
