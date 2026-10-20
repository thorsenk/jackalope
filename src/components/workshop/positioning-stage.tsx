"use client";
import { useState } from "react";
import { ArrowLeft, Check, ChevronRight, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  currentPositioningReview,
  updatePositioningReview,
  updateAssessment,
  ratingLabels,
  type PositioningSource,
} from "@/lib/positioning";
import type { PositioningRating, WorkshopSession } from "@/lib/types";
import { OutlineMenu } from "./outline-menu";
import { HelpTip, IconAction } from "./workshop-controls";
import { SourceReference } from "./source-reference";

export function PositioningStage({
  session,
  source,
  onChange,
  onBack,
  onFinish,
}: {
  session: WorkshopSession;
  source: PositioningSource;
  onChange: (patch: Partial<WorkshopSession>) => void;
  onBack: () => void;
  onFinish: () => void;
}) {
  const review = currentPositioningReview(session);
  const index = Math.min(session.clarifyIndex, source.criteria.length);
  const criterion = source.criteria[index];
  const [noteOpen, setNoteOpen] = useState("");
  const [ownOpen, setOwnOpen] = useState(Boolean(review?.draftSentence));
  const subjects = [
    ...source.candidates,
    ...(review?.draftSentence.trim() &&
    !source.candidates.some((c) => c.sentence === review.draftSentence.trim())
      ? [
          {
            id: "own",
            label: "Own draft",
            sentence: review.draftSentence.trim(),
          },
        ]
      : []),
  ];
  const items = [
    ...source.criteria.map((c) => ({ id: c.id, title: c.label })),
    { id: "wording", title: "Next wording" },
  ];
  const selected =
    source.candidates.find((c) => c.sentence === review?.selectedSentence)
      ?.id ??
    (review?.selectedSentence &&
    review.selectedSentence === review.draftSentence.trim()
      ? "own"
      : "");
  function move(next: number) {
    onChange({ clarifyIndex: next });
    setNoteOpen("");
  }
  return (
    <div className="decision-workspace positioning-workspace">
      <OutlineMenu
        label="Choose positioning question"
        items={items}
        index={index}
        onSelect={move}
      />
      <aside className="decision-outline" aria-label="Positioning questions">
        <h2 className="eyebrow">Positioning review</h2>
        {items.map((item, i) => (
          <Button
            key={item.id}
            variant="ghost"
            aria-current={i === index ? "step" : undefined}
            onClick={() => move(i)}
          >
            <span className="outline-marker">{i + 1}</span>
            {item.title}
          </Button>
        ))}
      </aside>
      <section className="decision-focus">
        <header className="decision-heading">
          <div>
            <p className="eyebrow">
              {index + 1} / {items.length} · Positioning
            </p>
            <h2>{criterion?.label ?? "Which wording should move forward?"}</h2>
          </div>
          <HelpTip label="About positioning review">
            Your judgments only. Nothing is scored or chosen automatically. The
            chosen sentence needs all six checks; two failures return it to
            iteration. Passing the rubric does not make it official positioning.
          </HelpTip>
        </header>
        {criterion ? (
          <>
            <p className="positioning-question">{criterion.question}</p>
            <div className="positioning-candidates">
              {subjects.map((candidate) => {
                const assessment = review?.assessments.find(
                  (item) => item.sentence === candidate.sentence,
                );
                const rating = assessment?.ratings[criterion.id];
                const note = assessment?.notes[criterion.id] ?? "";
                return (
                  <article className="positioning-candidate" key={candidate.id}>
                    <div className="positioning-candidate-heading">
                      <h3 title={candidate.label}>
                        {candidate.id === "own"
                          ? "Own draft"
                          : candidate.label.split(" (")[0]}
                      </h3>
                      <span>
                        {Array.from(candidate.sentence).length} characters
                      </span>
                      <IconAction
                        icon={Pencil}
                        label={`Evidence for ${candidate.id} · ${criterion.label}`}
                        aria-expanded={noteOpen === candidate.id}
                        onClick={() =>
                          setNoteOpen(
                            noteOpen === candidate.id ? "" : candidate.id,
                          )
                        }
                      />
                    </div>
                    <p>{candidate.sentence}</p>
                    <ToggleGroup
                      aria-label={`${candidate.id} · ${criterion.label}`}
                      value={rating ? [rating] : []}
                      onValueChange={(values) =>
                        values.length > 0 &&
                        onChange(
                          updatePositioningReview(session, (current) =>
                            updateAssessment(current, candidate.sentence, {
                              ratings: {
                                [criterion.id]: values[0] as PositioningRating,
                              },
                            }),
                          ),
                        )
                      }
                    >
                      {Object.entries(ratingLabels).map(([value, label]) => (
                        <ToggleGroupItem key={value} value={value}>
                          {label}
                        </ToggleGroupItem>
                      ))}
                    </ToggleGroup>
                    {noteOpen === candidate.id ? (
                      <Field className="positioning-evidence">
                        <FieldLabel htmlFor={`note-${candidate.id}`}>
                          Reason or evidence
                        </FieldLabel>
                        <Textarea
                          id={`note-${candidate.id}`}
                          autoFocus
                          rows={2}
                          value={note}
                          placeholder={
                            criterion.id === "cold-read test"
                              ? "Who read it, what did they understand, and what did they say?"
                              : "What supports your judgment? What needs checking?"
                          }
                          onChange={(event) =>
                            onChange(
                              updatePositioningReview(session, (current) =>
                                updateAssessment(current, candidate.sentence, {
                                  notes: { [criterion.id]: event.target.value },
                                }),
                              ),
                            )
                          }
                        />
                      </Field>
                    ) : (
                      note && (
                        <p className="positioning-evidence-text">{note}</p>
                      )
                    )}
                  </article>
                );
              })}
            </div>
          </>
        ) : (
          <>
            <p className="decision-hint">
              Choose a source candidate, write a revision, or leave this
              undecided. Choosing wording does not approve it.
            </p>
            <ToggleGroup
              className="proposal-list"
              orientation="vertical"
              aria-label="Next positioning wording"
              value={selected ? [selected] : []}
              onValueChange={(values) => {
                const choice =
                  values[0] === "own"
                    ? review?.draftSentence.trim()
                    : source.candidates.find((c) => c.id === values[0])
                        ?.sentence;
                onChange(
                  updatePositioningReview(session, (current) => ({
                    ...current,
                    selectedSentence: choice,
                  })),
                );
              }}
            >
              {[
                ...source.candidates,
                ...(review?.draftSentence.trim()
                  ? [
                      {
                        id: "own",
                        label: "Own draft",
                        sentence: review.draftSentence.trim(),
                      },
                    ]
                  : []),
              ].map((candidate) => (
                <ToggleGroupItem
                  className="proposal-option"
                  value={candidate.id}
                  key={candidate.id}
                >
                  <span className="proposal-label" title={candidate.label}>
                    {candidate.label.split(" (")[0]}
                  </span>
                  <span className="proposal-text">{candidate.sentence}</span>
                  {selected === candidate.id && <Check aria-hidden="true" />}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            {ownOpen ? (
              <Field className="positioning-own">
                <FieldLabel htmlFor="positioning-draft">
                  Your revised sentence
                </FieldLabel>
                <Textarea
                  id="positioning-draft"
                  autoFocus
                  rows={3}
                  value={review?.draftSentence ?? ""}
                  onChange={(event) =>
                    onChange(
                      updatePositioningReview(session, (current) => ({
                        ...current,
                        draftSentence: event.target.value,
                        selectedSentence:
                          current.selectedSentence ===
                          current.draftSentence.trim()
                            ? undefined
                            : current.selectedSentence,
                      })),
                    )
                  }
                />
                <p className="muted-text">
                  Revised wording gets its own rubric checks. Earlier
                  assessments stay attached to the exact sentence reviewed.
                </p>
              </Field>
            ) : (
              <Button
                variant="outline"
                className="positioning-own"
                onClick={() => setOwnOpen(true)}
              >
                <Pencil data-icon="inline-start" />
                Write a revision
              </Button>
            )}
          </>
        )}
        <SourceReference source={session.rawCapture} />
        <div className="decision-navigation">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft data-icon="inline-start" />
            Notes
          </Button>
          <span>
            {criterion ? "Unrated checks stay open" : "No automatic selection"}
          </span>
          <Button onClick={() => (criterion ? move(index + 1) : onFinish())}>
            {criterion
              ? index === source.criteria.length - 1
                ? "Next wording"
                : "Next check"
              : "Review"}
            <ChevronRight data-icon="inline-end" />
          </Button>
        </div>
      </section>
    </div>
  );
}
