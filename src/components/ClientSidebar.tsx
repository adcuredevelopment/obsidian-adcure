import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Wallet,
  LifeBuoy,
  Settings,
  Search,
  Sun,
  Moon,
  Megaphone,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CURRENT_CLIENT } from "@/lib/auth-mock";
import { useTheme, toggleTheme } from "@/lib/theme";

type NavItem = {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeTone?: "danger" | "warning" | "primary";
};

const CLIENT_WALLET_BALANCE = 18240;

const nav: NavItem[] = [
  { to: "/portal/dashboard", label: "Dashboard", icon: LayoutDashboard },
  {
    to: "/portal/wallet",
    label: "My Wallet",
    icon: Wallet,
    badge: CLIENT_WALLET_BALANCE < 100 ? "Low" : undefined,
    badgeTone: "warning",
  },
  {
    to: "/portal/ad-accounts",
    label: "My Ad Accounts",
    icon: Megaphone,
    badge: "1",
    badgeTone: "primary",
  },
  {
    to: "/portal/invoices",
    label: "My Receipts",
    icon: FileText,
  },
  { to: "/portal/support", label: "Support", icon: LifeBuoy },
];

export function ClientSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const theme = useTheme();

  return (
    <aside className="hidden w-[260px] shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
      <div className="flex h-16 items-center gap-2.5 px-5">
        <div className="relative flex h-8 w-8 items-center justify-center rounded-lg gradient-primary shadow-glow">
          <svg viewBox="0 0 24 24" className="h-4 w-4 text-white" fill="currentColor">
            <path d="M12 3 L21 20 L3 20 Z" />
          </svg>
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-semibold text-sidebar-foreground">Adcure</span>
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Client Portal
          </span>
        </div>
      </div>

      <div className="px-4 pb-3">
        <button className="group flex w-full items-center gap-2 rounded-lg border border-sidebar-border bg-background/40 px-3 py-2 text-left text-sm text-muted-foreground transition hover:border-border-strong hover:bg-background/60">
          <Search className="h-4 w-4" />
          <span className="flex-1">Search…</span>
          <kbd className="rounded border border-sidebar-border bg-background/60 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
            ⌘K
          </kbd>
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-4">
        <ul className="space-y-1">
          {nav.map((item) => (
            <NavLinkItem key={item.to} item={item} active={isActive(pathname, item.to)} />
          ))}
        </ul>

        {/* Wallet preview */}
        <div className="mt-6 rounded-xl border border-sidebar-border bg-background/40 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Wallet Balance
          </p>
          <p className="mt-1 text-lg font-semibold tabular-nums text-sidebar-foreground">
            €{CLIENT_WALLET_BALANCE.toLocaleString("nl-NL", { minimumFractionDigits: 2 })}
          </p>
          <Link
            to="/portal/wallet"
            className="mt-2 inline-flex w-full items-center justify-center rounded-lg gradient-primary px-2.5 py-1.5 text-xs font-semibold text-white shadow-glow transition hover:brightness-110"
          >
            Top up
          </Link>
        </div>
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-3 rounded-lg p-2 hover:bg-sidebar-accent">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-violet text-xs font-semibold text-white">
            {CURRENT_CLIENT.initials}
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-success ring-2 ring-sidebar" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-sidebar-foreground">
              {CURRENT_CLIENT.name}
            </p>
            <p className="truncate text-xs text-muted-foreground">{CURRENT_CLIENT.company}</p>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={toggleTheme}
              className="rounded-md p-1.5 text-muted-foreground hover:bg-background/60 hover:text-foreground"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <Link
              to="/portal/settings"
              className="rounded-md p-1.5 text-muted-foreground hover:bg-background/60 hover:text-foreground"
              aria-label="Settings"
            >
              <Settings className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}

function isActive(pathname: string, to: string) {
  return pathname === to || pathname.startsWith(to + "/");
}

function NavLinkItem({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;
  const tone = item.badgeTone ?? "danger";
  const badgeClass =
    tone === "danger"
      ? "bg-destructive/20 text-destructive ring-destructive/30"
      : tone === "warning"
        ? "bg-warning/20 text-warning ring-warning/30"
        : "bg-primary/20 text-primary-glow ring-primary/30";
  return (
    <li>
      <Link
        to={item.to}
        className={cn(
          "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
          active
            ? "bg-sidebar-accent text-sidebar-accent-foreground"
            : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
        )}
      >
        {active && (
          <span className="absolute inset-y-1 left-0 w-0.5 rounded-full gradient-primary" />
        )}
        <Icon className="h-4 w-4" />
        <span className="flex-1">{item.label}</span>
        {item.badge && (
          <span
            className={cn(
              "rounded-full px-1.5 py-0.5 text-[10px] font-semibold ring-1 ring-inset",
              badgeClass,
            )}
          >
            {item.badge}
          </span>
        )}
      </Link>
    </li>
  );
}
