import { Link, useNavigate } from "@tanstack/react-router";
import {
  Settings as SettingsIcon,
  User as UserIcon,
  LogOut,
  Shield,
  UserCircle,
  Globe,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import {
  ROLE_LABELS,
  switchRole,
  useRole,
  type Role,
  dashboardPathForRole,
} from "@/lib/auth-mock";

type Variant = "agency" | "client";

const ROLE_ICON: Record<Role, React.ComponentType<{ className?: string }>> = {
  agency_admin: Shield,
  client: UserCircle,
  public: Globe,
};

export function UserMenu({
  variant,
  name,
  email,
  initials,
  subtitle,
}: {
  variant: Variant;
  name: string;
  email: string;
  initials: string;
  subtitle?: string;
}) {
  const role = useRole();
  const navigate = useNavigate();
  const settingsPath = variant === "agency" ? "/agency/settings" : "/portal/settings";
  const profilePath = settingsPath;
  const RoleIcon = ROLE_ICON[role];
  const roleLabel =
    role === "agency_admin" ? "Admin" : role === "client" ? "Client" : "Public";
  const roleVariantClass =
    role === "agency_admin"
      ? "bg-primary/15 text-primary-glow ring-primary/25"
      : role === "client"
        ? "bg-violet/15 text-violet ring-violet/25"
        : "bg-muted text-muted-foreground ring-border";

  const onRoleChange = (next: string) => {
    const r = next as Role;
    switchRole(r);
    navigate({ to: dashboardPathForRole(r) });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="group inline-flex items-center gap-2 rounded-full border border-border bg-card/60 py-1 pl-1 pr-3 transition hover:border-border-strong hover:bg-card"
          aria-label="Open user menu"
        >
          <span className="relative flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-primary to-violet text-[10px] font-semibold text-white">
            {initials}
            <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-success ring-2 ring-card" />
          </span>
          <span className="hidden text-left leading-tight sm:block">
            <span className="block text-xs font-medium text-foreground">{name}</span>
            <span className="block text-[10px] text-muted-foreground">{roleLabel}</span>
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <div className="flex items-center gap-3 p-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-violet text-xs font-semibold text-white">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{name}</p>
            <p className="truncate text-xs text-muted-foreground">{email}</p>
            {subtitle && (
              <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        <div className="px-2 pb-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${roleVariantClass}`}
          >
            <RoleIcon className="h-3 w-3" />
            {roleLabel}
          </span>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to={profilePath} className="cursor-pointer">
            <UserIcon className="h-4 w-4" /> Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to={settingsPath} className="cursor-pointer">
            <SettingsIcon className="h-4 w-4" /> Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Preview as
        </DropdownMenuLabel>
        <DropdownMenuRadioGroup value={role} onValueChange={onRoleChange}>
          {(Object.keys(ROLE_LABELS) as Role[]).map((r) => {
            const Icon = ROLE_ICON[r];
            return (
              <DropdownMenuRadioItem key={r} value={r} className="cursor-pointer">
                <Icon className="h-4 w-4" />
                <span>{ROLE_LABELS[r]}</span>
              </DropdownMenuRadioItem>
            );
          })}
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            switchRole("public");
            navigate({ to: "/login" });
          }}
          className="cursor-pointer text-destructive focus:text-destructive"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
