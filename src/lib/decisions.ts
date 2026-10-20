import type { Claim, ClaimKind, WorkshopSession } from "./types";

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

const categoryHeadings: Record<ClaimKind, string[]> = {
  who_outcome: ["audience", "outcome", "audience and outcome", "who / outcome"],
  taste_bar: ["look and feel", "taste bar"],
  hard_constraint: ["constraints", "hard constraint", "hard constraints"],
  non_goal: ["non-goal", "non-goals", "out of scope", "boundaries"],
  shared_term: ["language", "shared term", "shared terms", "terminology"],
  authorization: ["permissions", "authorization", "authorisation"],
};

/** Hide a repeated category label in the UI, while preserving meaningful source headings. */
export function decisionTextForDisplay(text: string, kind: ClaimKind): string {
  const heading = text.match(/^#{1,6}[ \t]+([^\n]+)\n+/);
  const title = heading?.[1]
    .trim()
    .toLowerCase()
    .replaceAll("&", "and")
    .replace(/\s+/g, " ");
  const body =
    heading && title && categoryHeadings[kind].includes(title)
      ? text.slice(heading[0].length)
      : text;
  return (body.trim() ? body : text).replace(/^#{1,6}[ \t]+/gm, "");
}

/** Settle the current draft and preserve alternate wording in decision history. */
export function recordWorkshopDecision(
  session: Pick<WorkshopSession, "claims" | "clarifyDrafts">,
  next: DecisionClaim,
): Pick<WorkshopSession, "claims" | "clarifyDrafts"> {
  const drafts = { ...session.clarifyDrafts };
  let claims = session.claims;
  const draft = drafts[next.kind];
  if (next.status === "accepted") {
    if (draft?.trim() && draft.trim() !== next.text.trim()) {
      claims = [
        ...claims,
        {
          id: `${next.id}-draft`,
          kind: next.kind,
          text: draft,
          status: "reframed",
        },
      ];
    }
    delete drafts[next.kind];
  }
  return { claims: recordDecision(claims, next), clarifyDrafts: drafts };
}
