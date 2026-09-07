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

export function WorkshopApp() {
  const [session, setSession] = useState<WorkshopSession>(() => createEmptySession());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const existing = loadSession();
    if (existing) setSession(existing);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    saveSession(session);
  }, [session, ready]);

  function patch(partial: Partial<WorkshopSession>) {
    setSession((prev) => ({ ...prev, ...partial }));
  }

  function go(stage: Stage) {
    patch({ stage });
  }

  function startClarify() {
    const hasResponses = session.clarifyTurns.some((t) => t.response);
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
    clearSession();
    setSession(createEmptySession());
  }

  const currentIdx = STAGE_ORDER.indexOf(session.stage);
  const allowUpTo = STAGE_ORDER[currentIdx];

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
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
          session={session}
          onChange={patch}
          onContinue={startClarify}
          onLoadSample={loadSample}
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
