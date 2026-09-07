"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { ClaimRow } from "@/components/workshop/claim-row";
import {
  briefFilename,
  briefToMarkdown,
  copyText,
  downloadMarkdown,
} from "@/lib/export";
import type { WorkshopSession } from "@/lib/types";

export function HandoffStage({
  session,
  onChange,
  onBack,
  onReset,
}: {
  session: WorkshopSession;
  onChange: (patch: Partial<WorkshopSession>) => void;
  onBack: () => void;
  onReset: () => void;
}) {
  const markdown = useMemo(() => briefToMarkdown(session), [session]);
  const [copyState, setCopyState] = useState<"idle" | "ok" | "fail">("idle");

  const accepted = session.claims.filter((c) => c.status === "accepted");
  const proposed = session.claims.filter((c) => c.status === "proposed");

  async function handleCopy() {
    const ok = await copyText(markdown);
    setCopyState(ok ? "ok" : "fail");
    if (ok) {
      onChange({ handoffStatus: "exported" });
      window.setTimeout(() => setCopyState("idle"), 2000);
    }
  }

  function handleDownload() {
    downloadMarkdown(briefFilename(session), markdown);
    onChange({ handoffStatus: "exported" });
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 space-y-5 duration-200">
      <header className="space-y-3">
        <p className="nt-label text-[var(--nt-accent)]">
          Hand off
        </p>
        <h2 className=" text-[20px] font-semibold tracking-tight font-semibold">
          {session.title}
        </h2>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className="rounded-md border border-[var(--nt-accepted)]/35 bg-[var(--nt-accepted-soft)] px-2.5 py-1 font-mono text-[11px] tracking-wider text-[var(--nt-accepted)] uppercase">
            Status · {session.handoffStatus}
          </span>
          {session.lockedAt && (
            <span className="text-muted-foreground">
              Locked {new Date(session.lockedAt).toLocaleString()}
            </span>
          )}
        </div>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          A coherent, finishable brief — not an agent-shaped dump. Proposed vs
          accepted stays explicit so the factory doesn’t re-interpret soft language.
        </p>
        <p className="rounded-[var(--nt-radius-control)] border border-[var(--nt-border)] bg-[var(--nt-surface-field)] px-3 py-2 text-[13px] text-[var(--nt-fg-body)]">
          Local export — no recipient in v1. Copy or download the markdown; you
          deliver it yourself.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
        <div className="space-y-6">
          <section className="space-y-3">
            <h3 className="font-mono text-[11px] tracking-[0.16em] text-[var(--nt-accepted)] uppercase">
              Accepted
            </h3>
            <div className="space-y-2">
              {accepted.map((c) => (
                <ClaimRow key={c.id} claim={c} compact />
              ))}
            </div>
          </section>
          {proposed.length > 0 && (
            <section className="space-y-3">
              <h3 className="font-mono text-[11px] tracking-[0.16em] text-[var(--nt-proposed)] uppercase">
                Still proposed
              </h3>
              <div className="space-y-2">
                {proposed.map((c) => (
                  <ClaimRow key={c.id} claim={c} compact />
                ))}
              </div>
            </section>
          )}
        </div>

        <section className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-mono text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
              Markdown brief
            </h3>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={handleCopy}>
                {copyState === "ok"
                  ? "Copied"
                  : copyState === "fail"
                    ? "Copy failed"
                    : "Copy"}
              </Button>
              <Button size="sm" variant="outline" onClick={handleDownload}>
                Download .md
              </Button>
            </div>
          </div>
          <pre className="max-h-[520px] overflow-auto rounded-[var(--nt-radius-medium)] border border-border/70 bg-card/40 p-4 font-mono text-[12px] leading-relaxed whitespace-pre-wrap text-muted-foreground">
            {markdown}
          </pre>
        </section>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-border/60 pt-6">
        <Button variant="outline" onClick={onBack}>
          Back to Lock
        </Button>
        <Button variant="secondary" onClick={onReset}>
          Start new workshop
        </Button>
      </div>
    </div>
  );
}
