"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Check,
  Copy,
  Download,
  FileDown,
  FileText,
  MoreHorizontal,
  Plus,
  ShieldCheck,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CLAIM_KIND_LABELS, type WorkshopSession } from "@/lib/types";
import {
  briefFilename,
  briefToMarkdown,
  copyText,
  downloadMarkdown,
  downloadBackup,
} from "@/lib/export";
import { isLockReady } from "@/lib/storage";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { decisionTextForDisplay } from "@/lib/decisions";
import { HelpTip } from "./workshop-controls";

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
  const [copyState, setCopyState] = useState<"idle" | "ok" | "fail">("idle");
  const markdown = briefToMarkdown(session);
  const history = session.claims.filter(
    (claim) => claim.status === "rejected" || claim.status === "reframed",
  );
  const approved =
    Boolean(session.lockedAt) && isLockReady(session.claims, session);
  async function copy() {
    if (!approved) return;
    const success = await copyText(markdown);
    setCopyState(success ? "ok" : "fail");
    if (success) onChange({ handoffStatus: "exported" });
  }
  return (
    <div className="export-workspace">
      <header className="section-heading">
        <div>
          <p className="eyebrow">Export</p>
          <h2>{approved ? "Your brief is ready." : "Review your changes."}</h2>
          <p className="muted-text">
            Download a copy, or copy it into your next conversation.
          </p>
        </div>
        <Badge variant="secondary">
          {approved ? (
            <ShieldCheck data-icon="inline-start" />
          ) : (
            <Pencil data-icon="inline-start" />
          )}
          {approved ? "Approved" : "Draft"}
        </Badge>
      </header>
      {!approved && (
        <Alert>
          <AlertDescription>
            This brief has changed. Return to Review and approve it again.
          </AlertDescription>
        </Alert>
      )}
      <div className="export-toolbar">
        <div className="inline-actions">
          <Button
            disabled={!approved}
            onClick={() => {
              if (!approved) return;
              downloadMarkdown(briefFilename(session), markdown);
              onChange({ handoffStatus: "exported" });
            }}
          >
            <FileDown data-icon="inline-start" />
            Download brief
          </Button>
          <Button
            variant="outline"
            disabled={!approved}
            onClick={() => void copy()}
          >
            {copyState === "ok" ? (
              <Check data-icon="inline-start" />
            ) : (
              <Copy data-icon="inline-start" />
            )}
            {copyState === "ok" ? "Copied" : "Copy"}
          </Button>
          <span className="sr-only" role="status">
            {copyState === "ok"
              ? "Brief copied."
              : copyState === "fail"
                ? "Copy failed. Download the brief instead."
                : ""}
          </span>
        </div>
        <div className="inline-actions">
          <HelpTip label="About export">
            Files download to your device. Nothing is sent to another person. A
            backup includes all source and decision history.
          </HelpTip>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Export actions"
                />
              }
            >
              <MoreHorizontal aria-hidden="true" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => downloadBackup(session)}>
                  <Download />
                  Download backup
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    if (
                      window.confirm(
                        "Start a new workshop? Download a backup first to keep this one.",
                      )
                    )
                      onReset();
                  }}
                >
                  <Plus />
                  New workshop
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      {copyState === "fail" && (
        <p role="alert">Copy failed. Use Download brief instead.</p>
      )}
      <article className="brief-document">
        <div className="brief-heading">
          <FileText aria-hidden="true" />
          <h2>{session.title}</h2>
          {session.lockedAt && (
            <time dateTime={session.lockedAt}>
              {new Date(session.lockedAt).toLocaleString()}
            </time>
          )}
        </div>
        {session.claims
          .filter(
            (claim) =>
              claim.status === "accepted" || claim.status === "proposed",
          )
          .map((claim) => (
            <section key={claim.id}>
              <div className="brief-section-heading">
                <h3>{CLAIM_KIND_LABELS[claim.kind]}</h3>
                {claim.status === "accepted" ? (
                  <Check aria-label="Accepted" />
                ) : (
                  <Badge variant="outline">Proposed</Badge>
                )}
              </div>
              <p>{decisionTextForDisplay(claim.text, claim.kind)}</p>
            </section>
          ))}
        {[
          { title: "Open concerns", values: session.concerns },
          { title: "Carried forward", values: session.deferredConcerns },
          { title: "Resolved", values: session.resolvedConcerns ?? [] },
        ]
          .filter((group) => group.values.length)
          .map((group) => (
            <section key={group.title}>
              <h3>{group.title}</h3>
              <ul>
                {group.values.map((text) => (
                  <li key={text}>{text}</li>
                ))}
              </ul>
            </section>
          ))}
        {history.length > 0 && (
          <details className="source-reference">
            <summary>Decision history ({history.length})</summary>
            <div>
              {history.map((claim) => (
                <section key={claim.id}>
                  <h3>
                    {CLAIM_KIND_LABELS[claim.kind]} · {claim.status}
                  </h3>
                  <p>{claim.text}</p>
                </section>
              ))}
            </div>
          </details>
        )}
        <details className="source-reference">
          <summary>
            <FileText aria-hidden="true" />
            Original notes
          </summary>
          <div>{session.rawCapture}</div>
        </details>
        {(session.cornellSummary ||
          session.cornellCues ||
          Object.keys(session.cornellSectionCues ?? {}).length > 0) && (
          <details className="source-reference">
            <summary>Cornell notes</summary>
            <div>
              {session.cornellSummary}
              {session.cornellCues && `\n\n${session.cornellCues}`}
              {Object.values(session.cornellSectionCues ?? {}).map(
                (cue) => `\n\n${cue}`,
              )}
            </div>
          </details>
        )}
      </article>
      <div className="export-bottom">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft data-icon="inline-start" />
          Review
        </Button>
        <span className="muted-text">Local export · No automatic delivery</span>
      </div>
    </div>
  );
}
