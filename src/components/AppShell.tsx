import type { ReactNode } from "react";
import { AgencySidebar } from "./AgencySidebar";
import { UserMenu } from "./UserMenu";
import { useAuthState } from "@/lib/auth-mock";

export function AppShell({ children }: { children: ReactNode }) {
  const auth = useAuthState();

  return (
    <div className="flex min-h-screen bg-background">
      <AgencySidebar />
      <main className="relative flex-1 overflow-x-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-64 gradient-glow opacity-70" />
        <div className="relative mx-auto max-w-[1400px] px-6 py-6 lg:px-10">
          <div className="mb-4 flex items-center justify-end">
            <UserMenu
              variant="agency"
              name={auth.fullName ?? "Admin"}
              email={auth.email ?? ""}
              initials={auth.initials ?? "??"}
            />
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
