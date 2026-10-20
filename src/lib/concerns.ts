import type { WorkshopSession } from "./types";

export type ConcernState = "open" | "resolved" | "deferred" | "removed";
const keys = {
  open: "concerns",
  resolved: "resolvedConcerns",
  deferred: "deferredConcerns",
  removed: "removedConcerns",
} as const;

/** A concern occupies one disposition; source and decision records are never edited. */
export function moveConcern(
  session: WorkshopSession,
  text: string,
  target: ConcernState,
): Partial<WorkshopSession> {
  const patch: Partial<WorkshopSession> = {};
  for (const [state, key] of Object.entries(keys)) {
    const remaining = (session[key] ?? []).filter((value) => value !== text);
    patch[key] = state === target ? [...remaining, text] : remaining;
  }
  return patch;
}
