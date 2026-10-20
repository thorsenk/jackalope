"use client";

import { useMemo, useRef, useState } from "react";
import {
  AlignLeft,
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  List,
  MoreHorizontal,
  Pencil,
  Plus,
  Upload,
  FlaskConical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldLabel } from "@/components/ui/field";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { WorkshopSession } from "@/lib/types";
import { downloadBackup } from "@/lib/export";
import { parseWorkshopBackup } from "@/lib/backup";
import { moveConcern } from "@/lib/concerns";
import { captureWordCount, documentSections } from "@/lib/document-sections";
import { cn } from "@/lib/utils";
import { ConcernsPanel } from "./concerns-panel";
import { HelpTip, IconAction, StageFooter } from "./workshop-controls";

export function CaptureStage({
  session,
  onChange,
  onContinue,
  onLoadSample,
  onRestore,
  variant = "standard",
}: {
  session: WorkshopSession;
  onChange: (patch: Partial<WorkshopSession>) => void;
  onContinue: () => void;
  onLoadSample: () => void;
  onRestore: (session: WorkshopSession) => void;
  variant?: "standard" | "cornell";
}) {
  const [activeSection, setActiveSection] = useState(0);
  const [readAll, setReadAll] = useState(false);
  const [editing, setEditing] = useState(!session.rawCapture.trim());
  const [selection, setSelection] = useState("");
  const [notice, setNotice] = useState("");
  const textarea = useRef<HTMLTextAreaElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const sections = useMemo(
    () => documentSections(session.rawCapture),
    [session.rawCapture],
  );
  const words = captureWordCount(session.rawCapture);
  const cornell = variant === "cornell";
  const sectionIndex = Math.min(
    activeSection,
    Math.max(0, sections.length - 1),
  );
  const current = sections[sectionIndex];
  const reviewed = session.reviewedSections ?? [];
  const unlinkedCues = Object.entries(session.cornellSectionCues ?? {}).filter(
    ([id]) => !sections.some((section) => section.id === id),
  );

  function chooseSection(index: number) {
    setActiveSection(index);
    setReadAll(false);
  }
  function markReviewed() {
    if (!current) return;
    onChange({
      reviewedSections: Array.from(new Set([...reviewed, current.id])),
    });
    if (sectionIndex < sections.length - 1) setActiveSection(sectionIndex + 1);
  }
  async function importCapture(file?: File) {
    if (!file) return;
    try {
      const imported = parseWorkshopBackup(JSON.parse(await file.text()));
      if (!imported) throw new Error("Invalid backup");
      if (
        session.rawCapture.trim() &&
        !window.confirm(
          "Replace this workshop? Download a backup first to keep both.",
        )
      )
        return;
      onRestore(imported);
      setEditing(false);
      setActiveSection(0);
      setNotice("Workshop restored.");
    } catch {
      setNotice("Import failed. Choose a workshop JSON backup.");
    } finally {
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  return (
    <div className="capture-workspace">
      <div className="document-toolbar">
        <ToggleGroup
          aria-label="Document view"
          value={[editing ? "edit" : "read"]}
          onValueChange={(values) => {
            if (values.length) setEditing(values[0] === "edit");
          }}
        >
          <ToggleGroupItem value="read">
            <BookOpen aria-hidden="true" />
            Read
          </ToggleGroupItem>
          <ToggleGroupItem value="edit">
            <Pencil aria-hidden="true" />
            Edit
          </ToggleGroupItem>
        </ToggleGroup>
        <div className="inline-actions">
          <span className="word-count">{words.toLocaleString()} words</span>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Document actions"
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
                <DropdownMenuItem onClick={() => fileInput.current?.click()}>
                  <Upload />
                  Import backup
                </DropdownMenuItem>
                {!session.rawCapture.trim() && (
                  <DropdownMenuItem onClick={onLoadSample}>
                    <FlaskConical />
                    Try sample
                  </DropdownMenuItem>
                )}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <HelpTip label="About source notes">
            Your original wording stays here. Reading a section does not approve
            it. Work saves in this browser; download a backup to move it.
          </HelpTip>
        </div>
        <input
          ref={fileInput}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={(event) => void importCapture(event.target.files?.[0])}
        />
      </div>
      {notice && (
        <Alert>
          <AlertDescription>{notice}</AlertDescription>
        </Alert>
      )}
      <div
        className={cn(
          "capture-grid",
          sections.length === 0 && "without-outline",
          cornell && "cornell-grid",
        )}
      >
        {(sections.length > 0 || cornell) && (
          <aside className="document-outline" aria-label="Document outline">
            <h2 className="eyebrow">
              <List aria-hidden="true" />
              Outline
            </h2>
            <nav>
              {sections.map((section, index) => (
                <Button
                  variant="ghost"
                  key={section.id}
                  aria-current={
                    index === sectionIndex && !readAll ? "location" : undefined
                  }
                  onClick={() => chooseSection(index)}
                >
                  <span className="outline-marker">
                    {reviewed.includes(section.id) ? (
                      <Check aria-label="Reviewed" />
                    ) : (
                      String(index + 1).padStart(2, "0")
                    )}
                  </span>
                  <span>{section.title}</span>
                </Button>
              ))}
            </nav>
            {cornell && (
              <Field className="cornell-cue">
                <FieldLabel htmlFor="section-cue">Section question</FieldLabel>
                <Textarea
                  id="section-cue"
                  value={
                    session.cornellSectionCues?.[current?.id ?? "context"] ?? ""
                  }
                  onChange={(event) =>
                    onChange({
                      cornellSectionCues: {
                        ...session.cornellSectionCues,
                        [current?.id ?? "context"]: event.target.value,
                      },
                    })
                  }
                  placeholder="What needs a decision?"
                  rows={4}
                />
              </Field>
            )}
            {cornell && unlinkedCues.length > 0 && (
              <details className="concern-history">
                <summary>Unlinked questions ({unlinkedCues.length})</summary>
                {unlinkedCues.map(([id, text]) => (
                  <div key={id}>
                    <p>{text}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={!current}
                      onClick={() => {
                        if (!current) return;
                        const next = { ...session.cornellSectionCues };
                        delete next[id];
                        next[current.id] = [next[current.id], text]
                          .filter(Boolean)
                          .join("\n\n");
                        onChange({ cornellSectionCues: next });
                      }}
                    >
                      Attach here
                    </Button>
                  </div>
                ))}
              </details>
            )}
          </aside>
        )}
        <section
          className="document-panel"
          aria-label={editing ? "Source editor" : "Capture document"}
        >
          <div className="panel-toolbar">
            <h2>
              <FileText aria-hidden="true" />
              {editing
                ? "Source notes"
                : readAll
                  ? "All notes"
                  : (current?.title ?? "Notes")}
            </h2>
            <div className="inline-actions">
              {!editing && current && (
                <>
                  <IconAction
                    label={readAll ? "Read one section" : "Read all sections"}
                    icon={AlignLeft}
                    aria-pressed={readAll}
                    onClick={() => setReadAll(!readAll)}
                  />
                  <HelpTip label="About section review">
                    Checkmarks track what you have read. They do not approve the
                    content.
                  </HelpTip>
                </>
              )}
            </div>
          </div>
          {editing ? (
            <div className="editor-body">
              <Field>
                <FieldLabel className="sr-only" htmlFor="raw-capture">
                  Source notes
                </FieldLabel>
                <Textarea
                  ref={textarea}
                  id="raw-capture"
                  value={session.rawCapture}
                  onChange={(event) =>
                    onChange({
                      rawCapture: event.target.value,
                      reviewedSections: [],
                    })
                  }
                  onSelect={() => {
                    const field = textarea.current;
                    if (field)
                      setSelection(
                        field.value
                          .slice(field.selectionStart, field.selectionEnd)
                          .trim(),
                      );
                  }}
                  placeholder={
                    "What's the idea?\n\nPaste your notes, describe the outcome, and keep what worries you."
                  }
                />
              </Field>
              <div className="selection-actions">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={!selection}
                  onClick={() => {
                    onChange(moveConcern(session, selection, "open"));
                    setSelection("");
                  }}
                >
                  <Plus data-icon="inline-start" />
                  Add selection as concern
                </Button>
              </div>
            </div>
          ) : current ? (
            <>
              <div className="document-reading">
                {(readAll ? sections : [current]).map((section) => (
                  <article id={section.id} key={section.id}>
                    {readAll && <h3>{section.title}</h3>}
                    {section.body.split(/\n\s*\n/).map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))}
                  </article>
                ))}
              </div>
              {!readAll && (
                <div className="section-pagination">
                  <span>
                    {sectionIndex + 1} / {sections.length}
                  </span>
                  <div className="inline-actions">
                    <IconAction
                      label="Previous section"
                      icon={ChevronLeft}
                      disabled={sectionIndex === 0}
                      onClick={() => chooseSection(sectionIndex - 1)}
                    />
                    <IconAction
                      label={
                        reviewed.includes(current.id)
                          ? "Reviewed; next section"
                          : "Mark section reviewed"
                      }
                      icon={Check}
                      aria-pressed={reviewed.includes(current.id)}
                      onClick={markReviewed}
                    />
                    <IconAction
                      label="Next section"
                      icon={ChevronRight}
                      disabled={sectionIndex >= sections.length - 1}
                      onClick={() => chooseSection(sectionIndex + 1)}
                    />
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="quiet-empty">
              <FileText aria-hidden="true" />
              <p>Start with your notes.</p>
              <Button variant="outline" onClick={() => setEditing(true)}>
                Add notes
              </Button>
            </div>
          )}
          {cornell && (
            <Field className="cornell-summary">
              <FieldLabel htmlFor="cornell-summary">Synthesis</FieldLabel>
              <Textarea
                id="cornell-summary"
                rows={4}
                value={session.cornellSummary ?? ""}
                onChange={(event) =>
                  onChange({ cornellSummary: event.target.value })
                }
                placeholder="What do these notes mean?"
              />
            </Field>
          )}
        </section>
        <ConcernsPanel session={session} onChange={onChange} />
      </div>
      <StageFooter
        disabled={session.rawCapture.trim().length === 0}
        onContinue={onContinue}
        label="Continue"
      >
        <span>
          {session.rawCapture.trim().length === 0
            ? "Add notes to begin."
            : `${sections.length} section${sections.length === 1 ? "" : "s"} · ${session.concerns.length} open concern${session.concerns.length === 1 ? "" : "s"}`}
        </span>
      </StageFooter>
    </div>
  );
}
