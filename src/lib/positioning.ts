import { fromMarkdown } from "mdast-util-from-markdown";
import { documentSections } from "./document-sections";
import type {
  PositioningAssessment,
  PositioningReview,
  WorkshopSession,
} from "./types";

type MarkdownNode = {
  type: string;
  value?: string;
  children?: readonly MarkdownNode[];
};
function textOf(node: MarkdownNode): string {
  return node.value ?? node.children?.map(textOf).join("") ?? "";
}
export interface PositioningSource {
  candidates: { id: string; label: string; sentence: string }[];
  criteria: { id: string; label: string; question: string }[];
  rubric: string;
}
const rubricNames = [
  "clarity",
  "distinctness",
  "voice fit",
  "compression",
  "promise honesty",
  "cold-read test",
];

/** Recognize structured source evidence, never the workshop title or keyword fragments. */
export function positioningSource(raw: string): PositioningSource | null {
  const sections = documentSections(raw);
  const candidates = sections
    .filter((section) => /^C\d+\b/.test(section.title))
    .flatMap((section) => {
      const quote = fromMarkdown(section.body).children.find(
        (node) => node.type === "blockquote",
      );
      const start = quote?.position?.start.offset,
        end = quote?.position?.end.offset;
      return start !== undefined && end !== undefined
        ? [
            {
              id: section.title.match(/^C\d+/)![0],
              label: section.title,
              sentence: section.body
                .slice(start, end)
                .replace(/^[ \t]*>[ \t]?/gm, "")
                .trim(),
            },
          ]
        : [];
    });
  const rubric = sections.find((section) =>
    /^Evaluation rubric\b/i.test(section.title),
  );
  if (
    !rubric ||
    candidates.length !== 4 ||
    new Set(candidates.map((candidate) => candidate.id)).size !== 4
  )
    return null;
  const list = fromMarkdown(rubric.body).children.find(
    (node) => node.type === "list" && node.ordered,
  );
  if (!list || list.type !== "list") return null;
  const criteria = list.children.flatMap((item) => {
    const paragraph = item.children[0];
    if (paragraph?.type !== "paragraph") return [];
    const title = paragraph.children.find((node) => node.type === "strong");
    if (!title) return [];
    const label = textOf(title).trim();
    return [
      {
        id: label.toLowerCase(),
        label,
        question: textOf(paragraph)
          .slice(label.length)
          .replace(/^\s*[—–:-]\s*/, "")
          .trim(),
      },
    ];
  });
  if (
    criteria.length !== 6 ||
    new Set(criteria.map((c) => c.id)).size !== 6 ||
    !rubricNames.every((name) => criteria.some((c) => c.id === name))
  )
    return null;
  return { candidates, criteria, rubric: rubric.body };
}
export function currentPositioningReview(
  session: Pick<WorkshopSession, "rawCapture" | "positioningReviews">,
): PositioningReview | undefined {
  return session.positioningReviews?.findLast(
    (review) => review.source === session.rawCapture,
  );
}
export function updatePositioningReview(
  session: WorkshopSession,
  change: (review: PositioningReview) => PositioningReview,
): Partial<WorkshopSession> {
  const reviews = [...(session.positioningReviews ?? [])];
  const index = reviews.findLastIndex(
    (review) => review.source === session.rawCapture,
  );
  const base =
    index < 0
      ? { source: session.rawCapture, assessments: [], draftSentence: "" }
      : reviews[index];
  const next = change(base);
  if (index < 0) reviews.push(next);
  else reviews[index] = next;
  return { positioningReviews: reviews };
}
export function updateAssessment(
  review: PositioningReview,
  sentence: string,
  patch: Partial<Pick<PositioningAssessment, "ratings" | "notes">>,
): PositioningReview {
  const previous = review.assessments.find(
    (item) => item.sentence === sentence,
  ) ?? { sentence, ratings: {}, notes: {} };
  const next = {
    ...previous,
    ratings: { ...previous.ratings, ...patch.ratings },
    notes: { ...previous.notes, ...patch.notes },
  };
  return {
    ...review,
    assessments: [
      ...review.assessments.filter((item) => item.sentence !== sentence),
      next,
    ],
  };
}
export const ratingLabels = {
  meets: "Meets",
  "needs-work": "Needs work",
  unsure: "Not sure",
} as const;

/** Source rubric: two failures require iteration; unknowns never count as passes. */
export function positioningStatus(
  source: PositioningSource,
  review?: PositioningReview,
) {
  const sentence = review?.selectedSentence?.trim();
  const assessment = review?.assessments.find(
    (item) => item.sentence === sentence,
  );
  const missing = source.criteria.filter(
    (c) => !assessment?.ratings[c.id] || assessment.ratings[c.id] === "unsure",
  );
  const failures = source.criteria.filter(
    (c) => assessment?.ratings[c.id] === "needs-work",
  );
  const selectable =
    sentence &&
    (source.candidates.some((candidate) => candidate.sentence === sentence) ||
      review?.draftSentence.trim() === sentence);
  return {
    ready: Boolean(selectable && !missing.length && failures.length < 2),
    missing: missing.length,
    failures: failures.length,
    message: !sentence
      ? "No wording chosen"
      : !selectable
        ? "Chosen wording needs review"
        : missing.length
          ? `${missing.length} rubric checks unresolved`
          : failures.length >= 2
            ? "Return to iteration · two or more checks need work"
            : "Ready for your review · not official positioning",
  };
}
export function positioningMarkdown(
  source: PositioningSource,
  review?: PositioningReview,
): string {
  const earlierWording =
    review?.assessments
      .filter(
        (item) =>
          !source.candidates.some(
            (candidate) => candidate.sentence === item.sentence,
          ) && item.sentence !== review.draftSentence.trim(),
      )
      .map(
        (item) =>
          `\n\n### Earlier revised wording — not selected\n\n${item.sentence}\n\n${assessmentMarkdown(source, review, item.sentence)}`,
      )
      .join("") ?? "";
  return `## Positioning review\n\nFinal wording: ${review?.selectedSentence || "Undecided"}\n\n${positioningStatus(source, review).message}\n\n## Candidate comparison\n\n${source.candidates.map((candidate) => `### ${candidate.label}\n\n${candidate.sentence}\n\n${assessmentMarkdown(source, review, candidate.sentence)}`).join("\n\n")}${review?.draftSentence ? `\n\n### Own draft\n\n${review.draftSentence}\n\n${assessmentMarkdown(source, review, review.draftSentence)}` : ""}${earlierWording}\n\n## Source rubric\n\n${source.rubric}`;
}
function assessmentMarkdown(
  source: PositioningSource,
  review: PositioningReview | undefined,
  sentence: string,
) {
  const assessment = review?.assessments.find(
    (item) => item.sentence === sentence,
  );
  return source.criteria
    .map(
      (criterion) =>
        `- ${criterion.label}: ${assessment?.ratings[criterion.id] ? ratingLabels[assessment.ratings[criterion.id]] : "Not reviewed"}${assessment?.notes[criterion.id] ? `\n  Evidence: ${assessment.notes[criterion.id].replaceAll("\n", "\n  ")}` : ""}`,
    )
    .join("\n");
}
