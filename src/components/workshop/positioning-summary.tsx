"use client";
import { Check, X, CircleHelp, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  currentPositioningReview,
  positioningStatus,
  ratingLabels,
  type PositioningSource,
} from "@/lib/positioning";
import type { WorkshopSession } from "@/lib/types";

export function PositioningSummary({
  session,
  source,
  onEdit,
}: {
  session: WorkshopSession;
  source: PositioningSource;
  onEdit?: (index: number) => void;
}) {
  const review = currentPositioningReview(session);
  const status = positioningStatus(source, review);
  const subjects = [
    ...source.candidates,
    ...(review?.draftSentence.trim() &&
    !source.candidates.some((c) => c.sentence === review.draftSentence.trim())
      ? [
          {
            id: "Own",
            label: "Own draft",
            sentence: review.draftSentence.trim(),
          },
        ]
      : []),
  ];
  return (
    <section className="positioning-summary">
      <h3>Rubric comparison</h3>
      <div className="rubric-legend" aria-label="Rating key">
        <span>
          <Check aria-hidden="true" />
          Meets
        </span>
        <span>
          <X aria-hidden="true" />
          Needs work
        </span>
        <span>
          <CircleHelp aria-hidden="true" />
          Not sure
        </span>
        <span>
          <Minus aria-hidden="true" />
          Not reviewed
        </span>
      </div>
      <table className="rubric-matrix">
        <caption className="sr-only">
          Your positioning judgments by candidate and source rubric
        </caption>
        <thead>
          <tr>
            <th scope="col">Check</th>
            {subjects.map((c) => (
              <th scope="col" key={c.id} title={`${c.label}: ${c.sentence}`}>
                {c.id}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {source.criteria.map((criterion, index) => (
            <tr key={criterion.id}>
              <th scope="row" title={criterion.question}>
                {criterion.label}
              </th>
              {subjects.map((candidate) => {
                const rating = review?.assessments.find(
                  (a) => a.sentence === candidate.sentence,
                )?.ratings[criterion.id];
                const label = `${candidate.id} · ${criterion.label}: ${rating ? ratingLabels[rating] : "Not reviewed"}`;
                const Icon =
                  rating === "meets"
                    ? Check
                    : rating === "needs-work"
                      ? X
                      : rating === "unsure"
                        ? CircleHelp
                        : Minus;
                return (
                  <td key={candidate.id} data-rating={rating}>
                    {onEdit ? (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={label}
                        title={label}
                        onClick={() => onEdit(index)}
                      >
                        <Icon aria-hidden="true" />
                      </Button>
                    ) : (
                      <span role="img" aria-label={label} title={label}>
                        <Icon aria-hidden="true" />
                      </span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="positioning-selected">
        <h3>Wording to take forward</h3>
        <p>{review?.selectedSentence || "Undecided"}</p>
        {review?.selectedSentence && (
          <p className="muted-text">{status.message}</p>
        )}
        {onEdit && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(source.criteria.length)}
          >
            Choose or revise wording
          </Button>
        )}
      </div>
      {review?.selectedSentence &&
        source.criteria.some(
          (c) =>
            review.assessments.find(
              (a) => a.sentence === review.selectedSentence,
            )?.notes[c.id],
        ) && (
          <details className="source-reference">
            <summary>Reasons and evidence</summary>
            <div>
              {source.criteria.map((c) => {
                const note = review.assessments.find(
                  (a) => a.sentence === review.selectedSentence,
                )?.notes[c.id];
                return note ? (
                  <section key={c.id}>
                    <h3>{c.label}</h3>
                    <p>{note}</p>
                  </section>
                ) : null;
              })}
            </div>
          </details>
        )}
      {(session.positioningReviews ?? []).filter(
        (r) => r.source !== session.rawCapture,
      ).length > 0 && (
        <p className="muted-text">
          Earlier source reviews are retained in the backup. Changed source
          requires a fresh review.
        </p>
      )}
    </section>
  );
}
