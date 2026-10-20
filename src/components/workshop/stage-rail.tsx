"use client";

import { FileText, GitBranch, ClipboardCheck, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { STAGE_LABELS, STAGE_ORDER, type Stage } from "@/lib/types";
const icons = {
  capture: FileText,
  clarify: GitBranch,
  lock: ClipboardCheck,
  handoff: Send,
};

export function StageRail({
  stage,
  onSelect,
  allowUpTo,
}: {
  stage: Stage;
  onSelect?: (stage: Stage) => void;
  allowUpTo?: Stage;
}) {
  const max = STAGE_ORDER.indexOf(allowUpTo ?? stage);
  return (
    <nav className="workflow-rail" aria-label="Workshop steps">
      <ol>
        {STAGE_ORDER.map((step, index) => {
          const Icon = icons[step];
          return (
            <li key={step}>
              <Button
                variant="ghost"
                aria-label={STAGE_LABELS[step]}
                title={STAGE_LABELS[step]}
                disabled={index > max || !onSelect}
                aria-current={step === stage ? "step" : undefined}
                onClick={() => onSelect?.(step)}
              >
                <span className="step-icon">
                  <Icon aria-hidden="true" />
                </span>
                <span>{STAGE_LABELS[step]}</span>
              </Button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
