import type { ReactNode } from "react";
import { ClientSidebar } from "./ClientSidebar";
import { UserMenu } from "./UserMenu";
import { PreviewModeBanner } from "./PreviewModeBanner";
import { CURRENT_CLIENT } from "@/lib/auth-mock";

export function ClientShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <ClientSidebar />
      <main className="relative flex-1 overflow-x-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-64 gradient-glow opacity-70" />
        <div className="relative mx-auto max-w-[1400px] px-6 py-6 lg:px-10">
          <div className="mb-4 flex items-center justify-end">
            <UserMenu
              variant="client"
              name={CURRENT_CLIENT.name}
              email={CURRENT_CLIENT.email}
              initials={CURRENT_CLIENT.initials}
              subtitle={CURRENT_CLIENT.company}
            />
          </div>
          <PreviewModeBanner />
          {children}
        </div>
      </main>
    </div>
  );
}
