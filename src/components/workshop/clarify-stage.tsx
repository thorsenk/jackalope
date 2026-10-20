"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Check,
  Pencil,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldLabel } from "@/components/ui/field";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  CLAIM_KIND_LABELS,
  LOCK_GATE_KINDS,
  type WorkshopSession,
  type ClarifyResponse,
} from "@/lib/types";
import {
  recordDecision,
  decisionTextForDisplay,
  type DecisionClaim,
} from "@/lib/decisions";
import { OutlineMenu } from "./outline-menu";
import { SourceReference } from "./source-reference";
import { HelpTip, IconAction } from "./workshop-controls";

export function ClarifyStage({
  session,
  onChange,
  onBack,
  onFinish,
}: {
  session: WorkshopSession;
  onChange: (patch: Partial<WorkshopSession>) => void;
  onBack: () => void;
  onFinish: () => void;
}) {
  const index = Math.min(
    session.clarifyIndex,
    Math.max(0, session.clarifyTurns.length - 1),
  );
  const turn = session.clarifyTurns[index];
  const kind = LOCK_GATE_KINDS[index] ?? "who_outcome";
  const [selected, setSelected] = useState<string | null>(null);
  const [reframing, setReframing] = useState(() =>
    Boolean(
      session.clarifyDrafts?.[kind] || turn?.response?.type === "reframe",
    ),
  );
  const draft =
    session.clarifyDrafts?.[kind] ??
    session.claims.find(
      (claim) => claim.kind === kind && claim.status === "accepted",
    )?.text ??
    "";
  const selectedId =
    selected ??
    (turn?.response?.type === "accept" ? (turn.response.optionId ?? "") : "");
  const option = turn?.options.find((item) => item.id === selectedId);
  const writing = reframing || !turn?.options.length;
  const text = writing ? draft.trim() : option?.claimText;
  if (!turn)
    return (
      <div className="quiet-empty">
        <p>Add your notes to start.</p>
        <Button onClick={onBack}>Back to notes</Button>
      </div>
    );

  function move(next: number) {
    onChange({ clarifyIndex: next });
    setSelected(null);
    setReframing(false);
  }
  function respond(type: ClarifyResponse["type"]) {
    if (!text) return;
    const response: ClarifyResponse = {
      type,
      optionId: option?.id,
      reframedText: writing ? text : undefined,
    };
    const claim: DecisionClaim = {
      id: `decision-${kind}-${Date.now()}`,
      kind: option?.claimKind ?? kind,
      text,
      status: type === "reject" ? "rejected" : "accepted",
      originalText: writing ? option?.claimText : undefined,
    };
    onChange({
      clarifyTurns: session.clarifyTurns.map((item, itemIndex) =>
        itemIndex === index ? { ...item, response } : item,
      ),
      claims: recordDecision(session.claims, claim),
      clarifyIndex:
        type === "reject"
          ? index
          : Math.min(index + 1, session.clarifyTurns.length - 1),
    });
    if (type !== "reject") {
      if (index === session.clarifyTurns.length - 1) onFinish();
      setSelected(null);
      setReframing(false);
    }
  }

  return (
    <div className="decision-workspace">
      <OutlineMenu
        label="Choose decision"
        completeLabel="Accepted"
        items={LOCK_GATE_KINDS.map((item) => ({
          id: item,
          title: CLAIM_KIND_LABELS[item],
          complete: session.claims.some(
            (claim) => claim.kind === item && claim.status === "accepted",
          ),
        }))}
        index={index}
        onSelect={move}
      />
      <aside className="decision-outline" aria-label="Decisions">
        <h2 className="eyebrow">Decisions</h2>
        {LOCK_GATE_KINDS.map((item, itemIndex) => {
          const accepted = session.claims.some(
            (claim) => claim.kind === item && claim.status === "accepted",
          );
          return (
            <Button
              variant="ghost"
              key={item}
              aria-current={index === itemIndex ? "step" : undefined}
              onClick={() => move(itemIndex)}
            >
              <span className="outline-marker">
                {accepted ? (
                  <Check aria-label="Accepted" />
                ) : (
                  String(itemIndex + 1).padStart(2, "0")
                )}
              </span>
              {CLAIM_KIND_LABELS[item]}
            </Button>
          );
        })}
      </aside>
      <section className="decision-focus">
        <header className="decision-heading">
          <div>
            <p className="eyebrow">
              {index + 1} of {session.clarifyTurns.length} ·{" "}
              {CLAIM_KIND_LABELS[kind]}
            </p>
            <h2>{turn.prompt}</h2>
          </div>
          <HelpTip label="About decision proposals">
            Only explicitly labeled source is offered as a proposal. Read the
            source for context, write a draft, or leave a question undecided.
            Selecting a proposal does not accept it.
          </HelpTip>
        </header>
        {!turn.options.length && (
          <p className="decision-hint">
            No proposal for this question. Use the source notes or leave it
            undecided.
          </p>
        )}
        {writing ? (
          <Field>
            <FieldLabel htmlFor="decision">Your draft</FieldLabel>
            <Textarea
              id="decision"
              value={draft}
              onChange={(event) =>
                onChange({
                  clarifyDrafts: {
                    ...session.clarifyDrafts,
                    [kind]: event.target.value,
                  },
                })
              }
              placeholder="What should the brief say?"
              rows={4}
            />
          </Field>
        ) : (
          <ToggleGroup
            orientation="vertical"
            className="proposal-list"
            aria-label="Decision proposals"
            value={selectedId ? [selectedId] : []}
            onValueChange={(values) => setSelected(String(values[0] ?? ""))}
          >
            {turn.options.map((item) => (
              <ToggleGroupItem
                className="proposal-option"
                key={item.id}
                value={item.id}
              >
                <span className="proposal-label" title={item.label}>
                  {item.label}
                </span>
                <span className="proposal-text">
                  {decisionTextForDisplay(item.claimText, item.claimKind)}
                </span>
                {selectedId === item.id && <Check aria-hidden="true" />}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        )}
        <div className="decision-actions">
          <Button
            disabled={!text}
            onClick={() => respond(writing ? "reframe" : "accept")}
          >
            <Check data-icon="inline-start" />
            {writing ? "Accept wording" : "Accept"}
            <ChevronRight data-icon="inline-end" />
          </Button>
          {!writing && (
            <Button
              variant="outline"
              onClick={() => {
                setReframing(true);
                if (!draft && option)
                  onChange({
                    clarifyDrafts: {
                      ...session.clarifyDrafts,
                      [kind]: option.claimText,
                    },
                  });
              }}
            >
              <Pencil data-icon="inline-start" />
              {option ? "Edit" : "Write own"}
            </Button>
          )}
          {reframing && turn.options.length > 0 && (
            <Button variant="ghost" onClick={() => setReframing(false)}>
              Cancel
            </Button>
          )}
          {!writing && option && (
            <Button variant="ghost" onClick={() => respond("reject")}>
              <X data-icon="inline-start" />
              Reject
            </Button>
          )}
          <Button
            variant="ghost"
            onClick={() =>
              index < session.clarifyTurns.length - 1
                ? move(index + 1)
                : onFinish()
            }
          >
            {session.claims.some(
              (claim) => claim.kind === kind && claim.status === "accepted",
            )
              ? "Next"
              : "Leave undecided"}
            <ChevronRight data-icon="inline-end" />
          </Button>
        </div>
        {writing && draft.trim() && (
          <p role="status" className="inline-feedback">
            Draft saved. It remains unaccepted until you choose Accept wording.
          </p>
        )}
        {turn.response?.type === "reject" && (
          <p role="status" className="inline-feedback">
            Rejected. Edit the wording or choose another proposal.
          </p>
        )}
        <SourceReference source={session.rawCapture} />
        <div className="decision-navigation">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft data-icon="inline-start" />
            Notes
          </Button>
          <span>
            {
              session.claims.filter((claim) => claim.status === "accepted")
                .length
            }{" "}
            / 6 accepted
          </span>
          <div className="inline-actions">
            <IconAction
              label="Previous decision"
              icon={ChevronLeft}
              disabled={index === 0}
              onClick={() => move(index - 1)}
            />
            <IconAction
              label="Next decision"
              icon={ChevronRight}
              disabled={index === session.clarifyTurns.length - 1}
              onClick={() => move(index + 1)}
            />
            <Button variant="ghost" onClick={onFinish}>
              Review
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
