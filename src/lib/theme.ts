/**
 * Theme store — persisted to localStorage and shared across all components.
 * Uses the same external-store pattern as auth-mock so a toggle in one
 * sidebar instantly updates every mounted consumer and survives navigation.
 */
import { useSyncExternalStore } from "react";

export type Theme = "dark" | "light";

const STORAGE_KEY = "adcure.theme";
const listeners = new Set<() => void>();
let cached: Theme | null = null;

function read(): Theme {
  if (typeof window === "undefined") return "dark";
  const raw = window.localStorage.getItem(STORAGE_KEY);
  return raw === "light" ? "light" : "dark";
}

function apply(theme: Theme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.toggle("light", theme === "light");
  root.classList.toggle("dark", theme === "dark");
}

function getSnapshot(): Theme {
  if (cached === null) {
    cached = read();
    apply(cached);
  }
  return cached;
}

function getServerSnapshot(): Theme {
  return "dark";
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function setTheme(theme: Theme): void {
  cached = theme;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, theme);
  }
  apply(theme);
  listeners.forEach((l) => l());
}

export function toggleTheme(): void {
  setTheme(getSnapshot() === "dark" ? "light" : "dark");
}

export function useTheme(): Theme {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
