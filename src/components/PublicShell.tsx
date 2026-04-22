import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

type Width = "narrow" | "wide";

export function PublicShell({
  children,
  width = "narrow",
  showLogo = true,
}: {
  children: ReactNode;
  width?: Width;
  showLogo?: boolean;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background px-4 py-12">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[480px] gradient-glow opacity-80" />
      <div
        className={cn(
          "relative mx-auto w-full animate-fade-in",
          width === "narrow" ? "max-w-md" : "max-w-3xl",
        )}
      >
        {showLogo && (
          <div className="mb-7 flex flex-col items-center gap-3">
            <Link
              to="/"
              aria-label="Adcure home"
              className="relative flex h-12 w-12 items-center justify-center rounded-xl gradient-primary shadow-glow"
            >
              <svg viewBox="0 0 24 24" className="h-6 w-6 text-white" fill="currentColor">
                <path d="M12 3 L21 20 L3 20 Z" />
              </svg>
            </Link>
            <div className="text-center">
              <div className="text-sm font-semibold tracking-tight text-foreground">
                Adcure
              </div>
              <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Agency
              </div>
            </div>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
