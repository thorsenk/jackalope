"use client";

import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Circle,
  ChevronRight,
  FileText,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { lockGateStatus, isLockReady } from "@/lib/storage";
import type { WorkshopSession } from "@/lib/types";
import { ConcernsPanel } from "./concerns-panel";
import { decisionTextForDisplay } from "@/lib/decisions";
import { HelpTip, IconAction, StageFooter } from "./workshop-controls";

export function LockStage({
  session,
  onChange,
  onBack,
  onLock,
  onEditDecision,
  onPreview,
}: {
  session: WorkshopSession;
  onChange: (patch: Partial<WorkshopSession>) => void;
  onBack: () => void;
  onLock: () => void;
  onEditDecision: (index: number) => void;
  onPreview: () => void;
}) {
  const gates = lockGateStatus(session.claims);
  const ready = isLockReady(session.claims, session);
  const drafts = Object.values(session.clarifyDrafts ?? {}).filter((text) =>
    text?.trim(),
  ).length;
  const accepted = gates.filter((gate) => gate.met).length;
  return (
    <div className="review-workspace">
      <header className="section-heading">
        <div>
          <p className="eyebrow">Review</p>
          <h2>Check the brief.</h2>
        </div>
        <HelpTip label="About approval">
          Approval records your explicit decisions in this brief. It does not
          send or publish anything. Changes require another review.
        </HelpTip>
      </header>
      <div className="review-grid">
        <section className="decision-checklist" aria-label="Brief decisions">
          <div className="panel-toolbar">
            <h2>
              <CheckCircle2 aria-hidden="true" />
              Decisions
            </h2>
            <span>
              {accepted} / {gates.length}
            </span>
          </div>
          {gates.map((gate, index) => (
            <article className="review-decision" key={gate.kind}>
              <div className={gate.met ? "gate-icon accepted" : "gate-icon"}>
                {gate.met ? (
                  <Check aria-label="Accepted" />
                ) : (
                  <Circle aria-label="Missing decision" />
                )}
              </div>
              <div className="review-decision-content">
                <h3>{gate.label}</h3>
                {gate.claim ? (
                  <>
                    <p>{decisionTextForDisplay(gate.claim.text, gate.kind)}</p>
                    {session.clarifyDrafts?.[gate.kind]?.trim() && (
                      <span className="muted-text">
                        Draft revision awaiting acceptance
                      </span>
                    )}
                  </>
                ) : (
                  <span className="muted-text">
                    {session.clarifyDrafts?.[gate.kind]?.trim()
                      ? "Draft saved · not accepted"
                      : "Undecided"}
                  </span>
                )}
              </div>
              <IconAction
                label={`Edit ${gate.label}`}
                icon={ChevronRight}
                onClick={() => onEditDecision(index)}
              />
            </article>
          ))}
        </section>
        <ConcernsPanel session={session} onChange={onChange} review />
      </div>
      <div className="review-preview">
        <Button variant="outline" onClick={onPreview}>
          <FileText data-icon="inline-start" />
          Preview draft
        </Button>
        <span className="muted-text">
          Previewing or downloading a draft does not approve it.
        </span>
      </div>
      <StageFooter
        onContinue={onLock}
        disabled={!ready}
        label="Approve brief"
        icon={ShieldCheck}
      >
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft data-icon="inline-start" />
          Decisions
        </Button>
        <span>
          {ready
            ? "Ready for your approval"
            : [
                accepted < gates.length
                  ? `${gates.length - accepted} decisions needed`
                  : "",
                drafts && accepted === gates.length
                  ? `${drafts} draft revision${drafts === 1 ? "" : "s"} to review`
                  : "",
                session.concerns.length
                  ? `${session.concerns.length} open concern${session.concerns.length === 1 ? "" : "s"}`
                  : "",
              ]
                .filter(Boolean)
                .join(" · ")}
        </span>
      </StageFooter>
    </div>
  );
}
