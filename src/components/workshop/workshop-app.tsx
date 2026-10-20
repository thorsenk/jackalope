"use client";

import { useEffect, useState } from "react";
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
import { StageRail } from "@/components/workshop/stage-rail";
import {
  buildClarifyFromCapture,
  createEmptySession,
  createSampleSession,
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
  const [ready, setReady] = useState(false);
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
    const success = saveSession(session, storageKey);
    queueMicrotask(() => {
      setSaved(success);
      setSaveFailed(!success);
    });
  }, [session, ready, storageKey]);

  function patch(partial: Partial<WorkshopSession>) {
    setSaved(false);
    setSession((prev) => ({
      ...prev,
      ...partial,
      ...((partial.rawCapture !== undefined ||
        partial.claims !== undefined ||
        partial.title !== undefined ||
        partial.concerns !== undefined ||
        partial.cornellSummary !== undefined ||
        partial.cornellCues !== undefined ||
        partial.cornellSectionCues !== undefined ||
        partial.deferredConcerns !== undefined ||
        partial.resolvedConcerns !== undefined) &&
      prev.lockedAt
        ? { lockedAt: undefined, handoffStatus: "draft" as const }
        : {}),
    }));
  }

  function go(stage: Stage) {
    patch({ stage });
  }

  function startClarify() {
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
      clarifyIndex: hasResponses ? session.clarifyIndex : 0,
      claims: hasResponses ? session.claims : [],
    });
  }

  function loadSample() {
    setSession(createSampleSession());
  }

  function reset() {
    clearSession(storageKey);
    setSession(createEmptySession());
  }

  const currentIdx = STAGE_ORDER.indexOf(session.stage);
  const availableIdx = session.lockedAt
    ? 3
    : session.claims.length
      ? 2
      : session.clarifyTurns.length
        ? 1
        : 0;
  const maxStageIdx = Math.max(currentIdx, availableIdx);
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
          <FieldLabel className="sr-only" htmlFor="workshop-title">
            Workshop title
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
          if (STAGE_ORDER.indexOf(s) <= maxStageIdx) go(s);
        }}
      />

      {session.stage === "capture" && (
        <CaptureStage
          variant={variant}
          session={session}
          onChange={patch}
          onContinue={startClarify}
          onLoadSample={loadSample}
          onRestore={(restored) => {
            setSaved(false);
            setSession(restored);
          }}
        />
      )}

      {session.stage === "clarify" && (
        <ClarifyStage
          session={session}
          onChange={patch}
          onBack={() => go("capture")}
          onFinish={() => go("lock")}
        />
      )}

      {session.stage === "lock" && (
        <LockStage
          session={session}
          onChange={patch}
          onBack={() => go("clarify")}
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
