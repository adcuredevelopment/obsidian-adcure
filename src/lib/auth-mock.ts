/**
 * Authentication & role state.
 *
 * Previously mock-based, now backed by real Supabase auth.
 * The filename is kept as "auth-mock" for backwards compatibility
 * with all the existing imports across the codebase.
 *
 * The API surface (getCurrentRole, useRole, requireRole, etc.) is preserved
 * so no other files need to change.
 */
import { useSyncExternalStore } from "react";
import { redirect } from "@tanstack/react-router";
import { supabase } from "./supabase";
import type { Database } from "./database.types";

export type Role = "agency_admin" | "client" | "public";

type UserRow = Database["public"]["Tables"]["users"]["Row"];
type OrganizationRow = Database["public"]["Tables"]["organizations"]["Row"];

export type AuthState = {
  role: Role;
  userId: string | null;
  email: string | null;
  fullName: string | null;
  initials: string | null;
  organizationId: string | null;
  organizationName: string | null;
  isLoading: boolean;
};

const DEFAULT_STATE: AuthState = {
  role: "public",
  userId: null,
  email: null,
  fullName: null,
  initials: null,
  organizationId: null,
  organizationName: null,
  isLoading: true,
};

// ============================================
// EXTERNAL STORE (for useSyncExternalStore)
// ============================================

const listeners = new Set<() => void>();
let currentState: AuthState = DEFAULT_STATE;
let initialized = false;

function notify() {
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  // Initialize on first subscribe
  if (!initialized) {
    initialized = true;
    void loadAuthState();
  }
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): AuthState {
  return currentState;
}

function getServerSnapshot(): AuthState {
  return DEFAULT_STATE;
}

// ============================================
// LOAD & UPDATE AUTH STATE
// ============================================

function computeInitials(fullName: string | null, email: string | null): string {
  if (fullName) {
    const parts = fullName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return fullName.slice(0, 2).toUpperCase();
  }
  if (email) {
    return email.slice(0, 2).toUpperCase();
  }
  return "??";
}

async function loadAuthState(): Promise<void> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      currentState = { ...DEFAULT_STATE, isLoading: false };
      notify();
      return;
    }

    // Fetch profile with organization
    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("*, organization:organizations(*)")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      console.error("Error loading user profile:", profileError);
      currentState = { ...DEFAULT_STATE, isLoading: false };
      notify();
      return;
    }

    const typedProfile = profile as UserRow & { organization: OrganizationRow | null };

    currentState = {
      role: typedProfile.role as Role,
      userId: typedProfile.id,
      email: typedProfile.email,
      fullName: typedProfile.full_name,
      initials: computeInitials(typedProfile.full_name, typedProfile.email),
      organizationId: typedProfile.organization_id,
      organizationName: typedProfile.organization?.name ?? null,
      isLoading: false,
    };
    notify();
  } catch (error) {
    console.error("Auth state load error:", error);
    currentState = { ...DEFAULT_STATE, isLoading: false };
    notify();
  }
}

// Listen for Supabase auth changes (sign in, sign out, token refresh)
supabase.auth.onAuthStateChange((_event, _session) => {
  void loadAuthState();
});

// ============================================
// PUBLIC API (preserved from old auth-mock)
// ============================================

export function getCurrentRole(): Role {
  return currentState.role;
}

export function getCurrentAuthState(): AuthState {
  return currentState;
}

export function useRole(): Role {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return state.role;
}

export function useAuthState(): AuthState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function dashboardPathForRole(role: Role): string {
  if (role === "agency_admin") return "/agency/dashboard";
  if (role === "client") return "/portal/dashboard";
  return "/login";
}

/**
 * Throwable guard for TanStack Router `beforeLoad`.
 * Redirects to /login if the current role does not match `required`.
 *
 * IMPORTANT: Because loadAuthState is async, beforeLoad guards need to await it
 * on first load. We handle this by making requireRole async.
 */
export async function requireRole(required: Role): Promise<void> {
  // Wait for initial auth state to load
  if (currentState.isLoading) {
    await loadAuthState();
  }

  const role = getCurrentRole();
  if (role !== required) {
    throw redirect({ to: "/login" });
  }
}

// ============================================
// DEPRECATED (kept for backwards compat)
// ============================================

/**
 * @deprecated Role switching is no longer supported.
 * Users must sign in with real credentials.
 * This function is a no-op kept for backwards compatibility.
 */
export function switchRole(_role: Role): void {
  console.warn(
    "switchRole() is deprecated. Users must now sign in with real credentials."
  );
}

export const ROLE_LABELS: Record<Role, string> = {
  agency_admin: "Admin",
  client: "Client",
  public: "Public",
};

// ============================================
// CURRENT USER HELPERS (replace hardcoded mocks)
// ============================================

/**
 * Get current logged-in client info (derived from auth state).
 * Returns null if not logged in as client.
 */
export function useCurrentClient() {
  const state = useAuthState();
  if (state.role !== "client") return null;

  return {
    id: state.userId ?? "",
    name: state.fullName ?? "",
    firstName: state.fullName?.split(" ")[0] ?? "",
    email: state.email ?? "",
    initials: state.initials ?? "??",
    company: state.organizationName ?? "",
  };
}

/**
 * Get current logged-in admin info.
 * Returns null if not logged in as admin.
 */
export function useCurrentAdmin() {
  const state = useAuthState();
  if (state.role !== "agency_admin") return null;

  return {
    name: state.fullName ?? "",
    firstName: state.fullName?.split(" ")[0] ?? "",
    email: state.email ?? "",
    initials: state.initials ?? "??",
  };
}

/**
 * @deprecated Use useCurrentClient() hook instead.
 * Kept as fallback for files that import this constant.
 */
export const CURRENT_CLIENT_ID = "";

/**
 * @deprecated Use useCurrentClient() hook instead.
 * Kept as fallback - returns empty/null values when not authenticated.
 */
export const CURRENT_CLIENT = {
  id: "",
  name: "",
  firstName: "",
  email: "",
  initials: "??",
  company: "",
};

/**
 * @deprecated Use useCurrentAdmin() hook instead.
 * Kept as fallback - returns empty values when not authenticated.
 */
export const CURRENT_ADMIN = {
  name: "",
  firstName: "",
  email: "",
  initials: "??",
};