"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CaptureStage } from "@/components/workshop/capture-stage";
import { ClarifyStage } from "@/components/workshop/clarify-stage";
import { HandoffStage } from "@/components/workshop/handoff-stage";
import { LockStage } from "@/components/workshop/lock-stage";
import { PositioningStage } from "./positioning-stage";
import { positioningSource } from "@/lib/positioning";
import { StageRail } from "@/components/workshop/stage-rail";
import {
  buildClarifyFromCapture,
  createEmptySession,
  createSampleSession,
  patchWorkshopSession,
} from "@/lib/session";
import { clearSession, loadSession, saveSession } from "@/lib/storage";
import type { Stage, WorkshopSession } from "@/lib/types";
import { STAGE_ORDER } from "@/lib/types";

export function WorkshopApp({
  variant = "standard",
}: {
  variant?: "standard" | "cornell";
}) {
  const storageKey =
    variant === "cornell" ? "jackalope.workshop.cornell.v1" : undefined;
  const [session, setSession] = useState<WorkshopSession>(() =>
    createEmptySession(),
  );
  const positioning = useMemo(
    () => positioningSource(session.rawCapture),
    [session.rawCapture],
  );
  const [ready, setReady] = useState(false);
  const [readingSection, setReadingSection] = useState("");
  const [saved, setSaved] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);

  useEffect(() => {
    let active = true;
    // Read browser-only storage after hydration, before rendering the editable document.
    queueMicrotask(() => {
      if (!active) return;
      const existing =
        loadSession(storageKey) ??
        (variant === "cornell" ? loadSession() : null);
      if (existing) setSession(existing);
      setReady(true);
    });
    return () => {
      active = false;
    };
  }, [storageKey, variant]);

  useEffect(() => {
    if (!ready) return;
    document.getElementById("workshop-main")?.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }, [ready, session.stage, session.clarifyIndex]);

  useEffect(() => {
    if (!ready) return;
    const success = saveSession(session, storageKey);
    queueMicrotask(() => {
      setSaved(success);
      setSaveFailed(!success);
    });
  }, [session, ready, storageKey]);

  function patch(partial: Partial<WorkshopSession>) {
    setSaved(false);
    setSession((prev) => patchWorkshopSession(prev, partial));
  }

  function go(stage: Stage) {
    patch({ stage });
  }

  function startClarify(index = session.clarifyIndex) {
    if (positioning) {
      patch({
        stage: "clarify",
        clarifyIndex: Math.min(index, positioning.criteria.length),
      });
      return;
    }

    const hasResponses =
      session.clarifyTurns.some((t) => t.response) ||
      session.claims.length > 0 ||
      Boolean(session.clarifyDrafts);
    const turns = hasResponses
      ? session.clarifyTurns
      : buildClarifyFromCapture(session.rawCapture, session.title);
    patch({
      stage: "clarify",
      clarifyTurns: turns,
      clarifyIndex: Math.min(index, Math.max(0, turns.length - 1)),
    });
  }

  function loadSample() {
    setSession(createSampleSession());
  }

  function reset() {
    clearSession(storageKey);
    setSession(createEmptySession());
  }

  // Draft review and export are useful before any decisions are accepted.
  const maxStageIdx =
    session.rawCapture.trim() || session.claims.length ? 3 : 0;
  const allowUpTo = STAGE_ORDER[maxStageIdx];

  if (!ready)
    return (
      <p className="loading-state" role="status">
        Opening workshop…
      </p>
    );

  return (
    <div className="workshop-app">
      <div className="workshop-heading">
        <Field>
          <FieldLabel className="project-label" htmlFor="workshop-title">
            Project
          </FieldLabel>
          <Input
            id="workshop-title"
            value={session.title}
            onChange={(event) => patch({ title: event.target.value })}
            placeholder="Name your workshop"
          />
        </Field>
        <Tooltip>
          <TooltipTrigger
            className="save-indicator"
            aria-label={
              saveFailed
                ? "Could not save"
                : saved
                  ? "Saved in this browser"
                  : "Saving"
            }
          >
            {saveFailed ? (
              <AlertCircle aria-hidden="true" />
            ) : (
              <CheckCircle2 aria-hidden="true" />
            )}
            <span>
              {saveFailed ? "Not saved" : saved ? "Saved" : "Saving…"}
            </span>
          </TooltipTrigger>
          <TooltipContent>
            Saved in this browser. Use Download backup to keep a separate copy.
          </TooltipContent>
        </Tooltip>
      </div>
      {variant === "cornell" && (
        <p className="candidate-notice">
          Cornell format · Saves separately from your document.
        </p>
      )}
      {saveFailed && (
        <Alert variant="destructive">
          <AlertDescription>
            Changes are not saved. Download a backup from Document actions
            before leaving.
          </AlertDescription>
        </Alert>
      )}

      <StageRail
        stage={session.stage}
        allowUpTo={allowUpTo}
        onSelect={(s) => {
          if (s === session.stage || STAGE_ORDER.indexOf(s) > maxStageIdx)
            return;
          if (s === "clarify") startClarify();
          else go(s);
        }}
      />

      {session.stage === "capture" && (
        <CaptureStage
          variant={variant}
          session={session}
          onChange={patch}
          onContinue={() => startClarify()}
          activeSectionId={readingSection}
          onSectionChange={setReadingSection}
          onLoadSample={loadSample}
          onRestore={(restored) => {
            setSaved(false);
            setSession(restored);
          }}
        />
      )}

      {session.stage === "clarify" &&
        (positioning ? (
          <PositioningStage
            key={session.clarifyIndex}
            session={session}
            source={positioning}
            onChange={patch}
            onBack={() => go("capture")}
            onFinish={() => go("lock")}
          />
        ) : (
          <ClarifyStage
            key={session.clarifyIndex}
            session={session}
            onChange={patch}
            onBack={() => go("capture")}
            onFinish={() => go("lock")}
          />
        ))}

      {session.stage === "lock" && (
        <LockStage
          session={session}
          onChange={patch}
          onBack={() => startClarify()}
          onEditDecision={(index) => startClarify(index)}
          onPreview={() => go("handoff")}
          onLock={() =>
            patch({
              stage: "handoff",
              lockedAt: new Date().toISOString(),
              handoffStatus: "ready",
            })
          }
        />
      )}

      {session.stage === "handoff" && (
        <HandoffStage
          session={session}
          onChange={patch}
          onBack={() => go("lock")}
          onReset={reset}
        />
      )}
    </div>
  );
}
