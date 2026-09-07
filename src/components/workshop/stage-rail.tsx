"use client";

import { STAGE_BLURBS, STAGE_LABELS, STAGE_ORDER, type Stage } from "@/lib/types";
import { cn } from "@/lib/utils";

export function StageRail({
  stage,
  onSelect,
  allowUpTo,
}: {
  stage: Stage;
  onSelect?: (s: Stage) => void;
  allowUpTo?: Stage;
}) {
  const currentIdx = STAGE_ORDER.indexOf(stage);
  const maxIdx = STAGE_ORDER.indexOf(allowUpTo ?? stage);

  return (
    <nav aria-label="Intake stages" className="w-full">
      <ol className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
        {STAGE_ORDER.map((s, idx) => {
          const active = s === stage;
          const done = idx < currentIdx;
          const reachable = idx <= maxIdx;
          return (
            <li key={s}>
              <button
                type="button"
                disabled={!reachable || !onSelect}
                onClick={() => onSelect?.(s)}
                className={cn(
                  "group flex h-auto min-h-[var(--nt-control-comfortable)] w-full flex-col justify-center gap-0.5 rounded-[var(--nt-radius-control)] border px-2.5 py-2 text-left transition-colors duration-150",
                  active &&
                    "border-[var(--nt-accent)] bg-[var(--nt-accent-soft)] ring-1 ring-[var(--nt-accent)]",
                  !active && done && "border-[var(--nt-border)] bg-[var(--nt-surface-field)]",
                  !active &&
                    !done &&
                    "border-[var(--nt-border-subtle)] bg-transparent opacity-70",
                  reachable && onSelect && "hover:bg-[var(--nt-surface-hover)] hover:opacity-100",
                )}
              >
                <span className="font-mono text-[10px] tracking-[0.14em] text-[var(--nt-fg-muted)] uppercase">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <span
                  className={cn(
                    "text-[13px] font-medium leading-none tracking-tight",
                    active
                      ? "text-[var(--nt-fg-highest)]"
                      : "text-[var(--nt-fg-muted)]",
                  )}
                >
                  {STAGE_LABELS[s]}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
      <p className="mt-3 max-w-2xl text-[13px] leading-relaxed text-[var(--nt-fg-body)]">
        {STAGE_BLURBS[stage]}
      </p>
    </nav>
  );
}
