/**
 * Mock authentication & role state.
 *
 * Uses a tiny external store (subscribe / getSnapshot) backed by localStorage
 * so the role survives reloads and stays in sync across components and routes.
 * Replace with real Lovable Cloud auth later — the API surface (getCurrentRole,
 * switchRole, useRole) can stay the same.
 */
import { useSyncExternalStore } from "react";

export type Role = "agency_admin" | "client" | "public";

const STORAGE_KEY = "adcure.mockRole";
const VALID_ROLES: Role[] = ["agency_admin", "client", "public"];

const listeners = new Set<() => void>();
let cachedRole: Role | null = null;

function readFromStorage(): Role {
  if (typeof window === "undefined") return "agency_admin";
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw && (VALID_ROLES as string[]).includes(raw)) return raw as Role;
  return "agency_admin";
}

function getSnapshot(): Role {
  if (cachedRole === null) cachedRole = readFromStorage();
  return cachedRole;
}

function getServerSnapshot(): Role {
  return "agency_admin";
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getCurrentRole(): Role {
  return getSnapshot();
}

export function switchRole(role: Role): void {
  cachedRole = role;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, role);
  }
  listeners.forEach((l) => l());
}

export function useRole(): Role {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function dashboardPathForRole(role: Role): string {
  if (role === "agency_admin") return "/agency/dashboard";
  if (role === "client") return "/portal/dashboard";
  return "/login";
}

export const ROLE_LABELS: Record<Role, string> = {
  agency_admin: "Admin",
  client: "Client",
  public: "Public",
};

/**
 * Mock identity for the current "logged-in" client.
 * Hardcoded to one of the seeded clients so portal pages can filter by id.
 */
export const CURRENT_CLIENT_ID = "u1";
export const CURRENT_CLIENT = {
  id: "u1",
  name: "Sofia Martinez",
  firstName: "Sofia",
  email: "sofia@northwind.io",
  initials: "SM",
  company: "Northwind Performance",
};

/**
 * Mock identity for the current "logged-in" admin.
 */
export const CURRENT_ADMIN = {
  name: "David Otero",
  firstName: "David",
  email: "david@adcure.agency",
  initials: "DO",
};
