import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="relative flex-1 overflow-x-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-64 gradient-glow opacity-70" />
        <div className="relative mx-auto max-w-[1400px] px-6 py-8 lg:px-10">
          {children}
        </div>
      </main>
    </div>
  );
}
