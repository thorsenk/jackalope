import {
  CLAIM_KIND_LABELS,
  LOCK_GATE_KINDS,
  type WorkshopSession,
} from "./types";
import { isBriefApproved } from "./storage";
export function briefFilename(session: WorkshopSession) {
  return `${
    session.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "workshop"
  }${isBriefApproved(session) ? "-brief" : "-draft"}.md`;
}
export function briefToMarkdown(session: WorkshopSession) {
  const status = isBriefApproved(session) ? "Approved" : "Draft — not approved";
  const pending = LOCK_GATE_KINDS.filter(
    (kind) =>
      !session.claims.some(
        (claim) => claim.kind === kind && claim.status === "accepted",
      ),
  );
  const drafts = Object.entries(session.clarifyDrafts ?? {})
    .filter(([, text]) => text?.trim())
    .map(
      ([kind, text]) =>
        `## ${CLAIM_KIND_LABELS[kind as keyof typeof CLAIM_KIND_LABELS]} · draft wording\n\n${text}`,
    )
    .join("\n\n");
  return `# ${session.title}\n\nStatus: ${status}\n\n## Undecided\n\n${pending.map((kind) => `- ${CLAIM_KIND_LABELS[kind]}`).join("\n") || "None"}${drafts ? `\n\n${drafts}` : ""}\n\n${session.claims.map((c) => `## ${CLAIM_KIND_LABELS[c.kind]} · ${c.status}\n\n${c.text}`).join("\n\n")}\n\n## Open concerns\n\n${session.concerns.map((c) => `- ${c}`).join("\n") || "None"}\n\n## Carried into handoff\n\n${session.deferredConcerns.map((c) => `- ${c}`).join("\n") || "None"}\n\n## Resolved concerns\n\n${session.resolvedConcerns?.map((c) => `- ${c}`).join("\n") || "None"}${session.cornellCues ? `\n\n## Cornell cues\n\n${session.cornellCues}` : ""}${
    Object.keys(session.cornellSectionCues ?? {}).length
      ? `\n\n## Cornell section questions\n\n${Object.entries(
          session.cornellSectionCues ?? {},
        )
          .map(([id, cue]) => `- ${id}: ${cue}`)
          .join("\n")}`
      : ""
  }${session.cornellSummary ? `\n\n## Synthesis\n\n${session.cornellSummary}` : ""}\n\n## Original capture\n\n${session.rawCapture}\n`;
}
export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
export function downloadMarkdown(filename: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: "text/markdown" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadBackup(session: WorkshopSession) {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(session, null, 2)], { type: "application/json" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = "workshop-backup.json";
  link.click();
  URL.revokeObjectURL(url);
}
