"use client";
import { ArrowLeft, FileText, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { WorkshopSession } from "@/lib/types";
import {
  currentPositioningReview,
  positioningStatus,
  type PositioningSource,
} from "@/lib/positioning";
import { PositioningSummary } from "./positioning-summary";
import { ConcernsPanel } from "./concerns-panel";
import { HelpTip, StageFooter } from "./workshop-controls";
export function PositioningLockStage({
  session,
  source,
  onChange,
  onBack,
  onEditDecision,
  onPreview,
  onLock,
}: {
  session: WorkshopSession;
  source: PositioningSource;
  onChange: (patch: Partial<WorkshopSession>) => void;
  onBack: () => void;
  onEditDecision: (index: number) => void;
  onPreview: () => void;
  onLock: () => void;
}) {
  const status = positioningStatus(source, currentPositioningReview(session));
  return (
    <div className="review-workspace">
      <header className="section-heading">
        <div>
          <p className="eyebrow">Positioning review</p>
          <h2>Check your judgments.</h2>
        </div>
        <HelpTip label="About review confirmation">
          Confirming saves your local review brief. It does not finalize company
          positioning, create an official decision record, or publish anything.
          Source changes and new judgments require review again.
        </HelpTip>
      </header>
      <div className="review-grid">
        <PositioningSummary
          session={session}
          source={source}
          onEdit={onEditDecision}
        />
        <ConcernsPanel session={session} onChange={onChange} review />
      </div>
      <div className="review-preview">
        <Button variant="outline" onClick={onPreview}>
          <FileText data-icon="inline-start" />
          Preview draft
        </Button>
        <span className="muted-text">
          No automatic winner or final positioning decision.
        </span>
      </div>
      <StageFooter
        onContinue={onLock}
        disabled={!status.ready || session.concerns.length > 0}
        label="Confirm review brief"
        icon={ShieldCheck}
      >
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft data-icon="inline-start" />
          Questions
        </Button>
        <span>
          {session.concerns.length
            ? `${status.message} · ${session.concerns.length} open concerns`
            : status.message}
        </span>
      </StageFooter>
    </div>
  );
}
