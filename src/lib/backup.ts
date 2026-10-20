import { createEmptySession } from "./session";
import { documentSections } from "./document-sections";
import {
  LOCK_GATE_KINDS,
  STAGE_ORDER,
  type WorkshopSession,
  type PositioningReview,
} from "./types";

const record = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);
const optionalText = (value: unknown) =>
  value === undefined || typeof value === "string";
const claimKind = (value: unknown) =>
  LOCK_GATE_KINDS.includes(value as (typeof LOCK_GATE_KINDS)[number]);
const strings = (value: unknown): string[] | null =>
  value === undefined
    ? []
    : Array.isArray(value) && value.every((x) => typeof x === "string")
      ? value
      : null;
const stringRecord = (value: unknown): Record<string, string> | undefined =>
  record(value) && Object.values(value).every((x) => typeof x === "string")
    ? (value as Record<string, string>)
    : undefined;

/** Validate the complete retained object before it can enter editable/rendered state. */
export function parseWorkshopBackup(value: unknown): WorkshopSession | null {
  if (!record(value)) return null;
  const data = value;
  const raw = data.rawCapture ?? data.raw;
  if (typeof raw !== "string" || !optionalText(data.title)) return null;
  const defaults = createEmptySession();
  const concerns = strings(data.concerns),
    resolved = strings(data.resolvedConcerns),
    deferred = strings(data.deferredConcerns),
    removed = strings(data.removedConcerns),
    reviewed = strings(data.reviewedSections);
  if (!concerns || !resolved || !deferred || !removed || !reviewed) return null;
  const claims = data.claims ?? [];
  if (
    !Array.isArray(claims) ||
    !claims.every(
      (c) =>
        record(c) &&
        typeof c.id === "string" &&
        typeof c.text === "string" &&
        claimKind(c.kind) &&
        ["proposed", "accepted", "rejected", "reframed"].includes(
          c.status as string,
        ) &&
        optionalText(c.originalText) &&
        optionalText(c.concern),
    )
  )
    return null;
  const turns = data.clarifyTurns ?? [];
  if (
    !Array.isArray(turns) ||
    !turns.every((t) => {
      if (
        !record(t) ||
        typeof t.id !== "string" ||
        typeof t.prompt !== "string" ||
        typeof t.facilitation !== "string" ||
        !Array.isArray(t.options)
      )
        return false;
      if (
        !t.options.every(
          (o) =>
            record(o) &&
            typeof o.id === "string" &&
            typeof o.label === "string" &&
            typeof o.claimText === "string" &&
            claimKind(o.claimKind),
        )
      )
        return false;
      if (t.response === undefined) return true;
      return (
        record(t.response) &&
        ["accept", "reject", "reframe"].includes(t.response.type as string) &&
        optionalText(t.response.optionId) &&
        optionalText(t.response.reframedText) &&
        optionalText(t.response.concern)
      );
    })
  )
    return null;
  for (const key of [
    "cornellCues",
    "cornellSummary",
    "lockedAt",
    "createdAt",
    "updatedAt",
    "id",
  ])
    if (!optionalText(data[key])) return null;
  for (const key of ["cornellSectionCues", "clarifyDrafts"])
    if (data[key] !== undefined && !stringRecord(data[key])) return null;
  const positioning = data.positioningReviews;
  if (
    positioning !== undefined &&
    (!Array.isArray(positioning) ||
      !positioning.every(
        (review) =>
          record(review) &&
          typeof review.source === "string" &&
          typeof review.draftSentence === "string" &&
          optionalText(review.selectedSentence) &&
          Array.isArray(review.assessments) &&
          review.assessments.every(
            (assessment) =>
              record(assessment) &&
              typeof assessment.sentence === "string" &&
              record(assessment.ratings) &&
              Object.values(assessment.ratings).every((rating) =>
                ["meets", "needs-work", "unsure"].includes(rating as string),
              ) &&
              Boolean(stringRecord(assessment.notes)),
          ),
      ))
  )
    return null;
  const sections = documentSections(raw);
  const stableId = (id: string) =>
    /^section-\d+$/.test(id)
      ? (sections[Number(id.slice(8)) - 1]?.id ?? id)
      : id;
  const cues = Object.fromEntries(
    Object.entries(stringRecord(data.cornellSectionCues) ?? {}).map(
      ([id, text]) => [stableId(id), text],
    ),
  );
  return {
    ...defaults,
    id: (data.id as string) ?? defaults.id,
    title: (data.title as string) ?? defaults.title,
    createdAt: (data.createdAt as string) ?? defaults.createdAt,
    updatedAt: (data.updatedAt as string) ?? defaults.updatedAt,
    rawCapture: raw,
    concerns,
    resolvedConcerns: resolved,
    deferredConcerns: deferred,
    removedConcerns: removed,
    reviewedSections: reviewed.map(stableId),
    claims,
    clarifyTurns: turns,
    positioningReviews: positioning as PositioningReview[] | undefined,
    clarifyIndex:
      typeof data.clarifyIndex === "number" &&
      Number.isFinite(data.clarifyIndex)
        ? Math.max(0, Math.floor(data.clarifyIndex))
        : 0,
    stage: STAGE_ORDER.includes(data.stage as WorkshopSession["stage"])
      ? (data.stage as WorkshopSession["stage"])
      : "capture",
    handoffStatus: ["draft", "ready", "exported"].includes(
      data.handoffStatus as string,
    )
      ? (data.handoffStatus as WorkshopSession["handoffStatus"])
      : "draft",
    lockedAt: data.lockedAt as string | undefined,
    cornellCues: data.cornellCues as string | undefined,
    cornellSummary: data.cornellSummary as string | undefined,
    cornellSectionCues: Object.keys(cues).length ? cues : undefined,
    clarifyDrafts: stringRecord(data.clarifyDrafts),
  };
}
