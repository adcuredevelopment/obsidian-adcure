import { createFileRoute, redirect } from "@tanstack/react-router";
import { getCurrentRole, dashboardPathForRole } from "@/lib/auth-mock";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    const role = getCurrentRole();
    throw redirect({ to: dashboardPathForRole(role) });
  },
  component: () => null,
});
