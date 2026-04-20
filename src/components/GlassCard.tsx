import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function GlassCard({
  children,
  className,
  glow = false,
}: {
  children: ReactNode;
  className?: string;
  glow?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative rounded-2xl border border-border bg-card/80 p-5 shadow-card backdrop-blur-xl",
        "before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl before:bg-[var(--gradient-surface)]",
        glow &&
          "after:pointer-events-none after:absolute after:-inset-px after:rounded-2xl after:bg-[var(--gradient-glow)] after:opacity-60",
        className,
      )}
    >
      <div className="relative">{children}</div>
    </div>
  );
}
