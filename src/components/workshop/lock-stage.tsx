"use client";

import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Circle,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { lockGateStatus, isLockReady } from "@/lib/storage";
import type { WorkshopSession } from "@/lib/types";
import { ConcernsPanel } from "./concerns-panel";
import { decisionTextForDisplay } from "@/lib/decisions";
import { HelpTip, StageFooter } from "./workshop-controls";

export function LockStage({
  session,
  onChange,
  onBack,
  onLock,
}: {
  session: WorkshopSession;
  onChange: (patch: Partial<WorkshopSession>) => void;
  onBack: () => void;
  onLock: () => void;
}) {
  const gates = lockGateStatus(session.claims);
  const ready = isLockReady(session.claims, session);
  const accepted = gates.filter((gate) => gate.met).length;
  return (
    <div className="review-workspace">
      <header className="section-heading">
        <div>
          <p className="eyebrow">Review</p>
          <h2>Check the brief.</h2>
        </div>
        <HelpTip label="About approval">
          Approval records this brief, not company policy. It does not send or
          publish anything. Changes require another review.
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
          {gates.map((gate) => (
            <article className="review-decision" key={gate.kind}>
              <div className={gate.met ? "gate-icon accepted" : "gate-icon"}>
                {gate.met ? (
                  <Check aria-label="Accepted" />
                ) : (
                  <Circle aria-label="Missing decision" />
                )}
              </div>
              <div>
                <h3>{gate.label}</h3>
                <p>
                  {gate.claim
                    ? decisionTextForDisplay(gate.claim.text, gate.kind)
                    : "Needs a decision."}
                </p>
              </div>
            </article>
          ))}
        </section>
        <ConcernsPanel session={session} onChange={onChange} review />
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
