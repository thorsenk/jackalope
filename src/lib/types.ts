export type Stage = "capture" | "clarify" | "lock" | "handoff";

export type ClaimStatus = "proposed" | "accepted" | "rejected" | "reframed";

export type ClaimKind =
  | "who_outcome"
  | "taste_bar"
  | "hard_constraint"
  | "non_goal"
  | "shared_term"
  | "authorization";

export type HandoffStatus = "draft" | "ready" | "exported";

export interface Claim {
  id: string;
  kind: ClaimKind;
  text: string;
  status: ClaimStatus;
  /** Original wording kept when status is reframed or concern was repaired. */
  originalText?: string;
  /** Preserved worry / objection that drove a reframe. */
  concern?: string;
}

export interface ClarifyOption {
  id: string;
  label: string;
  claimKind: ClaimKind;
  claimText: string;
}

export interface ClarifyResponse {
  type: "accept" | "reject" | "reframe";
  optionId?: string;
  reframedText?: string;
  concern?: string;
}

export interface ClarifyTurn {
  id: string;
  prompt: string;
  facilitation: string;
  options: ClarifyOption[];
  response?: ClarifyResponse;
}

export interface WorkshopSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  stage: Stage;
  rawCapture: string;
  /** Open concerns still on the table — must resolve or defer before Lock is ready. */
  concerns: string[];
  /** Explicitly deferred concerns (acknowledged, not blocking Lock). */
  deferredConcerns: string[];
  clarifyIndex: number;
  clarifyTurns: ClarifyTurn[];
  claims: Claim[];
  lockedAt?: string;
  handoffStatus: HandoffStatus;
}

export const STAGE_ORDER: Stage[] = ["capture", "clarify", "lock", "handoff"];

export const STAGE_LABELS: Record<Stage, string> = {
  capture: "Capture",
  clarify: "Clarify",
  lock: "Lock",
  handoff: "Hand off",
};

export const STAGE_BLURBS: Record<Stage, string> = {
  capture: "Dump the messy intent. Keep the worry. Don’t force structure yet.",
  clarify: "One consequential call at a time — accept, reject, or reframe.",
  lock: "Good enough to run when the gate is accepted and open concerns are resolved or deferred.",
  handoff: "Local export only — copy or download the markdown brief.",
};

export const CLAIM_KIND_LABELS: Record<ClaimKind, string> = {
  who_outcome: "Who / outcome",
  taste_bar: "Taste bar",
  hard_constraint: "Hard constraint",
  non_goal: "Non-goal",
  shared_term: "Shared term",
  authorization: "Authorized without Kyle",
};

export const LOCK_GATE_KINDS: ClaimKind[] = [
  "who_outcome",
  "taste_bar",
  "hard_constraint",
  "non_goal",
  "shared_term",
  "authorization",
];
