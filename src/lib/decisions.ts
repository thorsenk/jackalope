import type { Claim } from "./types";

export type DecisionClaim = Omit<Claim, "status"> & {
  status: "accepted" | "rejected";
};

/** Replace the active answer while retaining previous wording in history. */
export function recordDecision(claims: Claim[], next: DecisionClaim): Claim[] {
  return [
    ...claims.map((claim): Claim =>
      claim.kind === next.kind && claim.status === "accepted"
        ? {
            ...claim,
            status: next.status === "rejected" ? "rejected" : "reframed",
          }
        : claim,
    ),
    next,
  ];
}
