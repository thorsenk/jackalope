import type { ClarifyTurn, WorkshopSession } from "@/lib/types";

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

export const SAMPLE_TITLE = "Field Notes — research diary for product teams";

export const SAMPLE_CAPTURE = `We need a research diary that product teams actually finish.

Right now notes die in Slack threads and Notion dumps. People mean to synthesize later and never do. I care more about a coherent weekly readout than a fancy capture UI.

Audience is small product teams (3–8) who already interview customers but lose the thread between sessions. Outcome: every Friday someone can ship a one-pager that names what changed in the understanding of the problem.

Taste: quiet, paper-like, readable. Not another SaaS dashboard. Hard constraints: must work offline-first on a laptop, no auth for the first slice, export to markdown.

Non-goals: social feed, AI auto-summaries that rewrite the researcher's voice, multiplayer editing theater.

Shared language: "signal" means a concrete quote or observation with source; "claim" means an interpretation the team is willing to stand behind.

Authorize without me: layout and typography exploration, empty states, export formatting. Do not invent research methods or change the signal/claim distinction without asking.`;

export const SAMPLE_CONCERNS = [
  "Notes die before synthesis happens",
  "AI rewriting the researcher's voice",
  "Dashboard theater instead of a readable diary",
];

/** Kyle’s exploratory interview spine — one consequential call per turn. */
export function buildSampleClarifyTurns(): ClarifyTurn[] {
  return [
    {
      id: uid("q"),
      prompt:
        "Who is this for, and what outcome counts as done on Friday?",
      facilitation:
        "Pick the framing that feels runnable. Soft briefs start here — name a person and a finish line.",
      options: [
        {
          id: "o1",
          label: "Small product teams; Friday one-pager that names what changed",
          claimKind: "who_outcome",
          claimText:
            "For product teams of 3–8: every Friday, ship a one-pager that names what changed in the team's understanding of the problem.",
        },
        {
          id: "o2",
          label: "Solo PMs journaling interviews; personal archive is enough",
          claimKind: "who_outcome",
          claimText:
            "For solo PMs: a personal interview archive they can skim before the next customer call.",
        },
        {
          id: "o3",
          label: "Research ops tooling the whole org's insight library",
          claimKind: "who_outcome",
          claimText:
            "For research ops: a shared insight library the whole org can search.",
        },
      ],
    },
    {
      id: uid("q"),
      prompt: "What’s the taste bar — what should this feel like when it’s right?",
      facilitation:
        "Recognition over blank worksheets. Accept a bar you can smell in the UI, or reframe it.",
      options: [
        {
          id: "o1",
          label: "Quiet, paper-like, readable — not another SaaS dashboard",
          claimKind: "taste_bar",
          claimText:
            "Quiet, paper-like, readable. Prefer long-form clarity over dashboard chrome.",
        },
        {
          id: "o2",
          label: "Dense ops console — power users, keyboard-first",
          claimKind: "taste_bar",
          claimText:
            "Dense ops console: keyboard-first, information-dense, built for daily power users.",
        },
        {
          id: "o3",
          label: "Playful consumer diary with stickers and moods",
          claimKind: "taste_bar",
          claimText:
            "Playful consumer diary with stickers, moods, and soft illustration.",
        },
      ],
    },
    {
      id: uid("q"),
      prompt: "Which hard constraints are non-negotiable for v1?",
      facilitation:
        "Constraints protect the factory from inventing scope. Reject anything soft.",
      options: [
        {
          id: "o1",
          label: "Offline-first laptop use, no auth in the first slice, markdown export",
          claimKind: "hard_constraint",
          claimText:
            "Must work offline-first on a laptop; no auth for the first slice; export to markdown.",
        },
        {
          id: "o2",
          label: "Must sync live across devices with SSO on day one",
          claimKind: "hard_constraint",
          claimText:
            "Live multi-device sync and SSO required on day one.",
        },
        {
          id: "o3",
          label: "Must ship as a native mobile app first",
          claimKind: "hard_constraint",
          claimText: "Native mobile app is the only acceptable first surface.",
        },
      ],
    },
    {
      id: uid("q"),
      prompt: "What are we explicitly not building?",
      facilitation:
        "Non-goals keep curiosity from becoming an unfinishable brief.",
      options: [
        {
          id: "o1",
          label: "No social feed, no voice-rewriting AI summaries, no multiplayer theater",
          claimKind: "non_goal",
          claimText:
            "Non-goals: social feed; AI auto-summaries that rewrite the researcher's voice; multiplayer editing theater.",
        },
        {
          id: "o2",
          label: "No export — the product is the only source of truth",
          claimKind: "non_goal",
          claimText:
            "Non-goal: any export path; the in-app view is the only source of truth.",
        },
        {
          id: "o3",
          label: "No weekly cadence — pure freeform journaling forever",
          claimKind: "non_goal",
          claimText:
            "Non-goal: weekly cadence or readout rituals; only freeform journaling.",
        },
      ],
    },
    {
      id: uid("q"),
      prompt: "Which shared terms must mean the same thing to everyone?",
      facilitation:
        "Language drift is why soft briefs force re-interpretation. Lock the words.",
      options: [
        {
          id: "o1",
          label: "Signal = sourced observation; claim = interpretation the team stands behind",
          claimKind: "shared_term",
          claimText:
            '"Signal" = concrete quote or observation with source. "Claim" = interpretation the team is willing to stand behind.',
        },
        {
          id: "o2",
          label: "Insight = anything interesting; no further distinction",
          claimKind: "shared_term",
          claimText:
            '"Insight" covers any interesting note; no distinction between observation and interpretation.',
        },
        {
          id: "o3",
          label: "Ticket = unit of research work in the sprint board",
          claimKind: "shared_term",
          claimText:
            '"Ticket" is the unit of research work tracked on the sprint board.',
        },
      ],
    },
    {
      id: uid("q"),
      prompt: "What can agents do without Kyle — and what needs a pause?",
      facilitation:
        "Authorization without Kyle is the last lock gate. Be concrete.",
      options: [
        {
          id: "o1",
          label: "Authorize layout, empty states, export formatting; pause on methods or signal/claim changes",
          claimKind: "authorization",
          claimText:
            "Authorized without Kyle: layout and typography exploration, empty states, export formatting. Not authorized: inventing research methods or changing the signal/claim distinction.",
        },
        {
          id: "o2",
          label: "Authorize anything visual; pause only for pricing copy",
          claimKind: "authorization",
          claimText:
            "Authorized without Kyle: any visual or UX decision. Pause only for pricing copy.",
        },
        {
          id: "o3",
          label: "Authorize nothing — every decision waits for Kyle",
          claimKind: "authorization",
          claimText:
            "Nothing is authorized without Kyle; every product decision waits for review.",
        },
      ],
    },
  ];
}

export function createEmptySession(): WorkshopSession {
  const now = new Date().toISOString();
  return {
    id: uid("ws"),
    title: "Untitled workshop",
    createdAt: now,
    updatedAt: now,
    stage: "capture",
    rawCapture: "",
    concerns: [],
    deferredConcerns: [],
    clarifyIndex: 0,
    clarifyTurns: [],
    claims: [],
    handoffStatus: "draft",
  };
}

export function createSampleSession(): WorkshopSession {
  const now = new Date().toISOString();
  return {
    id: uid("ws"),
    title: SAMPLE_TITLE,
    createdAt: now,
    updatedAt: now,
    stage: "capture",
    rawCapture: SAMPLE_CAPTURE,
    concerns: [...SAMPLE_CONCERNS],
    deferredConcerns: [],
    clarifyIndex: 0,
    clarifyTurns: buildSampleClarifyTurns(),
    claims: [],
    handoffStatus: "draft",
  };
}

/** Lightweight concern extraction from free capture (recognition helpers). */
export function suggestConcerns(raw: string): string[] {
  const lines = raw
    .split(/\n+/)
    .map((l) => l.trim())
    .filter(Boolean);

  const worryish = lines.filter((l) =>
    /care|worry|afraid|don't|do not|never|lose|die|force|soft|drift|rewrite|theater/i.test(
      l,
    ),
  );

  return worryish.slice(0, 5).map((l) => l.replace(/^[-•*]\s*/, "").slice(0, 120));
}

export function buildClarifyFromCapture(raw: string, title: string): ClarifyTurn[] {
  // For custom captures, reuse the sample spine but retarget prompts lightly.
  const turns = buildSampleClarifyTurns();
  if (!raw.trim()) return turns;

  turns[0] = {
    ...turns[0],
    facilitation: `Working title: “${title}”. Choose the who/outcome that matches what you captured — or reframe it.`,
  };
  return turns;
}
