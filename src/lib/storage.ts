import type {
  Claim,
  ClaimKind,
  WorkshopSession,
} from "@/lib/types";
import { CLAIM_KIND_LABELS, LOCK_GATE_KINDS } from "@/lib/types";

const STORAGE_KEY = "jackalope.workshop.v1";

export function loadSession(): WorkshopSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as WorkshopSession;
    return {
      ...parsed,
      deferredConcerns: parsed.deferredConcerns ?? [],
      concerns: parsed.concerns ?? [],
    };
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

export function saveSession(session: WorkshopSession): void {
  if (typeof window === "undefined") return;
  const next = { ...session, updatedAt: new Date().toISOString() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
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
