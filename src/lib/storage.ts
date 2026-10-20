import {parseWorkshopBackup} from "./backup";
import type {
  Claim,
  ClaimKind,
  WorkshopSession,
} from "@/lib/types";
import { CLAIM_KIND_LABELS, LOCK_GATE_KINDS } from "@/lib/types";

const STORAGE_KEY = "jackalope.workshop.v1";

export function loadSession(key = STORAGE_KEY): WorkshopSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return parseWorkshopBackup(JSON.parse(raw));
  } catch {
    return null;
  }
}

/** Open concerns block Lock — deferred ones do not. */
export function openConcerns(session: WorkshopSession): string[] {
  return session.concerns;
}

export function concernsResolvedForLock(session: WorkshopSession): boolean {
  return openConcerns(session).length === 0;
}

export function saveSession(session: WorkshopSession, key = STORAGE_KEY): boolean {
  if (typeof window === "undefined") return false;
  try {
    const next = { ...session, updatedAt: new Date().toISOString() };
    localStorage.setItem(key, JSON.stringify(next));
    return true;
  } catch { return false; }
}

export function clearSession(key = STORAGE_KEY): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(key);
}

export function acceptedByKind(
  claims: Claim[],
  kind: ClaimKind,
): Claim | undefined {
  return claims.find((c) => c.kind === kind && c.status === "accepted");
}

export function lockGateStatus(claims: Claim[]): {
  kind: ClaimKind;
  label: string;
  met: boolean;
  claim?: Claim;
}[] {
  return LOCK_GATE_KINDS.map((kind) => {
    const claim = acceptedByKind(claims, kind);
    return {
      kind,
      label: CLAIM_KIND_LABELS[kind],
      met: Boolean(claim),
      claim,
    };
  });
}

export function isLockReady(
  claims: Claim[],
  session?: Pick<WorkshopSession, "concerns">,
): boolean {
  const gateOk = lockGateStatus(claims).every((g) => g.met);
  if (!session) return gateOk;
  return gateOk && session.concerns.length === 0;
}

export function claimsForKind(claims: Claim[], kind: ClaimKind): Claim[] {
  return claims.filter((c) => c.kind === kind);
}
