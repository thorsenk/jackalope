"use client";

import { useEffect, useState } from "react";
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

export function WorkshopApp({variant="standard"}:{variant?:"standard"|"cornell"}) {
  const storageKey = variant === "cornell" ? "jackalope.workshop.cornell.v1" : undefined;
  const [session, setSession] = useState<WorkshopSession>(() => createEmptySession());
  const [ready, setReady] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let active = true;
    // Read browser-only storage after hydration, before rendering the editable document.
    queueMicrotask(() => {
      if (!active) return;
      const existing = loadSession(storageKey) ?? (variant === "cornell" ? loadSession() : null);
      if (existing) setSession(existing);
      setReady(true);
    });
    return () => { active = false; };
  }, [storageKey, variant]);

  useEffect(() => {
    if (!ready) return;
    const success = saveSession(session, storageKey);
    queueMicrotask(() => setSaved(success));
  }, [session, ready, storageKey]);

  function patch(partial: Partial<WorkshopSession>) {
    setSaved(false);
    setSession((prev) => ({ ...prev, ...partial, ...((partial.rawCapture !== undefined || partial.claims !== undefined || partial.title !== undefined || partial.concerns !== undefined || partial.cornellSummary !== undefined || partial.cornellCues !== undefined || partial.cornellSectionCues !== undefined || partial.deferredConcerns !== undefined || partial.resolvedConcerns !== undefined) && prev.lockedAt ? {lockedAt:undefined,handoffStatus:"draft" as const}: {}) }));
  }

  function go(stage: Stage) {
    patch({ stage });
  }

  function startClarify() {
    const hasResponses = session.clarifyTurns.some((t) => t.response) || session.claims.length > 0 || Boolean(session.clarifyDrafts);
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
  const allowUpTo = STAGE_ORDER[currentIdx];

  if (!ready) return <p className="nt-label" role="status">Loading your saved workshop…</p>;

  return (
    <div className="workshop-app">
      {variant === "cornell" && <div className="candidate-banner"><strong>Cornell format · Separate candidate</strong><span>Compare cues, notes, and synthesis. This draft starts from your guided document and saves separately.</span></div>}
      {!ready && (
        <p className="font-mono text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
          Syncing local session…
        </p>
      )}

      <StageRail
        stage={session.stage}
        allowUpTo={allowUpTo}
        onSelect={(s) => {
          if (STAGE_ORDER.indexOf(s) <= currentIdx) go(s);
        }}
      />

      {session.stage === "capture" && (
        <CaptureStage
          saved={saved}
          variant={variant}
          session={session}
          onChange={patch}
          onContinue={startClarify}
          onLoadSample={loadSample}
          onRestore={(restored)=>{setSaved(false);setSession(restored);}}
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
