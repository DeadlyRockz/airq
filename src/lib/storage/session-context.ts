import { z } from "zod";
import { UserContextSchema } from "@/lib/aqi/types";

export const SessionStateSchema = z.object({
  context: UserContextSchema,
});

export type SessionState = z.infer<typeof SessionStateSchema>;

const SESSION_STORAGE_KEY = "airq:session-state:v2";

/**
 * Saves the user's active context into browser sessionStorage.
 * Silently no-ops during SSR or when storage is unavailable.
 *
 * @param state - Validated SessionState to persist for the current tab session.
 * @example
 * saveSessionState({ context });
 */
export function saveSessionState(state: SessionState): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    const validated = SessionStateSchema.parse(state);
    window.sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(validated));
  } catch {
    // Ignore quota or private-browsing storage errors.
  }
}

/**
 * Loads and Zod-validates the user's session state from browser sessionStorage.
 * Returns null if missing, malformed, or running outside a browser.
 *
 * @returns Validated SessionState or null.
 * @example
 * const saved = loadSessionState();
 */
export function loadSessionState(): SessionState | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const raw = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = SessionStateSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

/**
 * Clears the stored AirQ session state from browser sessionStorage.
 *
 * @example
 * clearSessionState();
 */
export function clearSessionState(): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
  } catch {
    // Ignore storage errors.
  }
}
