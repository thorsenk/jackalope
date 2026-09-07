"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { WorkshopSession } from "@/lib/types";
import { suggestConcerns } from "@/lib/session";

export function CaptureStage({
  session,
  onChange,
  onContinue,
  onLoadSample,
}: {
  session: WorkshopSession;
  onChange: (patch: Partial<WorkshopSession>) => void;
  onContinue: () => void;
  onLoadSample: () => void;
}) {
  const [titleFocused, setTitleFocused] = useState(false);
  const [selection, setSelection] = useState("");

  useEffect(() => {
    function syncSelection() {
      const text = window.getSelection()?.toString().trim() ?? "";
      // Only treat selection as actionable if it comes from the capture field
      // or is a non-empty string the user just highlighted.
      setSelection(text.slice(0, 140));
    }
    document.addEventListener("selectionchange", syncSelection);
    return () => document.removeEventListener("selectionchange", syncSelection);
  }, []);

  function syncConcerns(raw: string) {
    const suggested = suggestConcerns(raw);
    const merged = Array.from(
      new Set([...session.concerns, ...suggested]),
    ).slice(0, 8);
    onChange({ rawCapture: raw, concerns: merged });
  }

  function removeConcern(c: string) {
    onChange({ concerns: session.concerns.filter((x) => x !== c) });
  }

  function addConcernFromSelection() {
    const text = selection.trim();
    if (!text) return;
    if (session.concerns.includes(text)) return;
    onChange({ concerns: [...session.concerns, text] });
    setSelection("");
    window.getSelection()?.removeAllRanges();
  }

  const canContinue = session.rawCapture.trim().length > 40;
  const hasSelection = selection.trim().length > 0;
  const alreadyKept =
    hasSelection && session.concerns.includes(selection.trim());
  const canKeep = hasSelection && !alreadyKept;

  let keepLabel = "Highlight text in the dump first";
  let keepHint =
    "Select a worry in Raw intake, then keep it as an open concern.";
  if (canKeep) {
    keepLabel = "Keep highlighted text as concern";
    keepHint = `Will add: “${selection.trim().slice(0, 72)}${selection.trim().length > 72 ? "…" : "”}`;`}
  else if (alreadyKept) {
    keepLabel = "Already kept as concern";
    keepHint = "That selection is already in Concerns preserved.";
  } else if (session.concerns.length > 0) {
    keepHint =
      "Highlight more text to add another concern, or remove ones you don’t need.";
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 space-y-5 duration-200">
      <header className="space-y-3">
        <p className="nt-label text-[var(--nt-accent)]">Capture</p>
        <input
          value={session.title}
          onChange={(e) => onChange({ title: e.target.value })}
          onFocus={() => setTitleFocused(true)}
          onBlur={() => setTitleFocused(false)}
          className="w-full bg-transparent text-[20px] font-semibold tracking-tight text-foreground outline-none placeholder:text-muted-foreground/50"
          placeholder="Workshop title"
          aria-label="Workshop title"
        />
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Talk it out. Paste a dump. Dictation is fine. We will structure later —
          right now we preserve intent and worry so the brief doesn’t go soft.
        </p>
      </header>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label
            htmlFor="raw-capture"
            className="font-mono text-[11px] tracking-[0.16em] text-muted-foreground uppercase"
          >
            Raw intake
          </label>
          <Button type="button" variant="ghost" size="sm" onClick={onLoadSample}>
            Load sample workshop
          </Button>
        </div>
        <Textarea
          id="raw-capture"
          value={session.rawCapture}
          onChange={(e) => syncConcerns(e.target.value)}
          onMouseUp={() => {
            const text = window.getSelection()?.toString().trim() ?? "";
            setSelection(text.slice(0, 140));
          }}
          onKeyUp={() => {
            const text = window.getSelection()?.toString().trim() ?? "";
            setSelection(text.slice(0, 140));
          }}
          rows={14}
          className="min-h-[280px] resize-y rounded-[var(--nt-radius-medium)] border-border/70 bg-card/30 px-4 py-4 font-sans text-[15px] leading-7 shadow-none"
          placeholder="Who is this for? What outcome matters? What tastes wrong? What’s off-limits? What words keep drifting?"
        />
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!canKeep}
            onClick={addConcernFromSelection}
          >
            {keepLabel}
          </Button>
          <span className="self-center text-xs text-muted-foreground">
            {keepHint}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-mono text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
          Concerns preserved
          {session.concerns.length > 0
            ? ` · ${session.concerns.length} open`
            : ""}
        </h3>
        {session.concerns.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nothing flagged yet. Soft briefs lose the worry — highlight a line
            above and keep it, or load the sample.
          </p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {session.concerns.map((c) => (
              <li key={c}>
                <button
                  type="button"
                  onClick={() => removeConcern(c)}
                  className="rounded-lg border border-[var(--nt-proposed)]/30 bg-[var(--nt-proposed-soft)] px-3 py-1.5 text-left text-sm text-[var(--nt-proposed)] transition hover:border-[var(--nt-proposed)]/60"
                  title="Remove concern"
                >
                  {c}
                  <span className="ml-2 opacity-50">×</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-border/60 pt-6">
        <Button size="lg" disabled={!canContinue} onClick={onContinue}>
          Continue to Clarify
        </Button>
        {!canContinue && (
          <p className="text-sm text-muted-foreground">
            Capture a bit more so Clarify has something to work with.
          </p>
        )}
        {titleFocused && (
          <p className="text-sm text-muted-foreground">
            Name the workshop plainly.
          </p>
        )}
      </div>
    </div>
  );
}
