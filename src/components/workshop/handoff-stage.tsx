"use client";

import { useState } from "react";
import Markdown from "react-markdown";
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
import {
  CLAIM_KIND_LABELS,
  LOCK_GATE_KINDS,
  type WorkshopSession,
} from "@/lib/types";
import {
  briefFilename,
  briefToMarkdown,
  copyText,
  downloadMarkdown,
  downloadBackup,
} from "@/lib/export";
import { isBriefApproved } from "@/lib/storage";
import { decisionTextForDisplay } from "@/lib/decisions";
import { SourceReference } from "./source-reference";

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
  const [copiedMarkdown, setCopiedMarkdown] = useState("");
  const copied = copyState === "ok" && copiedMarkdown === markdown;
  const history = session.claims.filter(
    (claim) => claim.status === "rejected" || claim.status === "reframed",
  );
  const approved = isBriefApproved(session);
  const pending = LOCK_GATE_KINDS.filter(
    (kind) =>
      !session.claims.some(
        (claim) => claim.kind === kind && claim.status === "accepted",
      ),
  );
  async function copy() {
    const success = await copyText(markdown);
    setCopyState(success ? "ok" : "fail");
    if (success) {
      setCopiedMarkdown(markdown);
      if (approved) onChange({ handoffStatus: "exported" });
    }
  }
  return (
    <div className="export-workspace">
      <header className="section-heading">
        <div>
          <p className="eyebrow">Export</p>
          <h2>{approved ? "Your brief is ready." : "Draft preview"}</h2>
          <p className="muted-text">
            {approved
              ? "Download or copy your approved brief."
              : "Not approved. Includes open questions and draft wording."}
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
      <div className="export-toolbar">
        <div className="inline-actions">
          <Button
            onClick={() => {
              downloadMarkdown(briefFilename(session), markdown);
              if (approved) onChange({ handoffStatus: "exported" });
            }}
          >
            <FileDown data-icon="inline-start" />
            {approved ? "Download brief" : "Download draft"}
          </Button>
          <Button variant="outline" onClick={() => void copy()}>
            {copied ? (
              <Check data-icon="inline-start" />
            ) : (
              <Copy data-icon="inline-start" />
            )}
            {copied ? "Copied" : approved ? "Copy" : "Copy draft"}
          </Button>
          <span className="sr-only" role="status">
            {copied
              ? approved
                ? "Brief copied."
                : "Draft copied."
              : copyState === "fail"
                ? "Copy failed. Download the brief instead."
                : ""}
          </span>
        </div>
        <div className="inline-actions">
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
        <p role="alert">Copy failed. Download a copy instead.</p>
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
        {pending.length > 0 && (
          <section className="pending-decisions">
            <h3>Undecided · {pending.length}</h3>
            <p>{pending.map((kind) => CLAIM_KIND_LABELS[kind]).join(" · ")}</p>
          </section>
        )}
        {LOCK_GATE_KINDS.filter((kind) =>
          session.clarifyDrafts?.[kind]?.trim(),
        ).map((kind) => (
          <section key={`draft-${kind}`}>
            <div className="brief-section-heading">
              <h3>{CLAIM_KIND_LABELS[kind]}</h3>
              <Badge variant="outline">Draft wording</Badge>
            </div>
            <div className="markdown-content">
              <Markdown>{session.clarifyDrafts?.[kind]}</Markdown>
            </div>
          </section>
        ))}
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
              <div className="markdown-content">
                <Markdown>
                  {decisionTextForDisplay(claim.text, claim.kind)}
                </Markdown>
              </div>
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
        <SourceReference source={session.rawCapture} label="Original notes" />
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
