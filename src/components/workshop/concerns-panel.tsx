"use client";

import { useState } from "react";
import {
  Check,
  CircleCheck,
  CircleHelp,
  CornerUpLeft,
  Pencil,
  Plus,
  RotateCcw,
  Trash2,
  X,
  Clock3,
  ChevronDown,
  MoreHorizontal,
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
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldLabel } from "@/components/ui/field";
import { recoverConcernText } from "@/lib/document-sections";
import { suggestConcerns } from "@/lib/session";
import { moveConcern, type ConcernState } from "@/lib/concerns";
import type { WorkshopSession } from "@/lib/types";
import { HelpTip, IconAction } from "./workshop-controls";

export function ConcernsPanel({
  session,
  onChange,
  review = false,
}: {
  session: WorkshopSession;
  onChange: (patch: Partial<WorkshopSession>) => void;
  review?: boolean;
}) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const [removed, setRemoved] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const suggestions = suggestConcerns(session.rawCapture).filter(
    (text) =>
      ![
        ...session.concerns,
        ...session.deferredConcerns,
        ...(session.resolvedConcerns ?? []),
        ...(session.removedConcerns ?? []),
      ].includes(text),
  );

  function move(text: string, target: ConcernState) {
    onChange(moveConcern(session, text, target));
    if (target === "removed") setRemoved(text);
    setNotice(
      target === "open"
        ? "Concern reopened."
        : target === "resolved"
          ? "Concern resolved."
          : target === "deferred"
            ? "Carried into the brief."
            : "Concern removed.",
    );
  }
  function add(text: string) {
    if (!text.trim()) return;
    onChange(moveConcern(session, text.trim(), "open"));
    setDraft("");
    setAdding(false);
    setNotice("Concern added.");
  }

  return (
    <aside className="concerns-panel" aria-labelledby="concerns-title">
      <div className="panel-toolbar">
        <h2 id="concerns-title">
          <CircleHelp aria-hidden="true" />
          Concerns{" "}
          {session.concerns.length > 0 && (
            <Badge variant="secondary">{session.concerns.length}</Badge>
          )}
        </h2>
        <div className="inline-actions">
          <HelpTip label="About concerns">
            Resolve before approval, or carry an open question into the brief.
          </HelpTip>
          {(session.concerns.length > 0 || adding || review) && (
            <IconAction
              label={adding ? "Cancel new concern" : "Add concern"}
              icon={adding ? X : Plus}
              onClick={() => setAdding(!adding)}
            />
          )}
        </div>
      </div>
      {adding && (
        <form
          className="concern-form"
          onSubmit={(event) => {
            event.preventDefault();
            add(draft);
          }}
        >
          <Field>
            <FieldLabel htmlFor="new-concern">What needs attention?</FieldLabel>
            <Textarea
              id="new-concern"
              autoFocus
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              rows={3}
            />
          </Field>
          <div className="inline-actions">
            <Button size="sm" type="submit" disabled={!draft.trim()}>
              Add
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setAdding(false)}>
              Cancel
            </Button>
          </div>
        </form>
      )}
      <div className="concern-list">
        {session.concerns.length === 0 && !adding && (
          <Empty className="quiet-empty">
            <EmptyHeader>
              <EmptyMedia>
                {review ? (
                  <CircleCheck aria-hidden="true" />
                ) : (
                  <CircleHelp aria-hidden="true" />
                )}
              </EmptyMedia>
              <EmptyTitle>
                {review ? "No open concerns" : "Anything to watch out for?"}
              </EmptyTitle>
              {!review && (
                <EmptyDescription>
                  Keep questions and risks beside your notes.
                </EmptyDescription>
              )}
            </EmptyHeader>
            {!review && (
              <EmptyContent>
                <Button variant="outline" onClick={() => setAdding(true)}>
                  <Plus data-icon="inline-start" />
                  Add concern
                </Button>
              </EmptyContent>
            )}
          </Empty>
        )}
        {session.concerns.map((text, index) => (
          <article
            className="concern-item"
            data-editing={editing === text}
            key={text}
          >
            {editing === text ? (
              <>
                <Field>
                  <FieldLabel className="sr-only" htmlFor={`concern-${index}`}>
                    Concern wording
                  </FieldLabel>
                  <Textarea
                    id={`concern-${index}`}
                    autoFocus
                    value={editDraft}
                    onChange={(event) => setEditDraft(event.target.value)}
                  />
                </Field>
                <div className="inline-actions">
                  <Button
                    size="sm"
                    disabled={!editDraft.trim()}
                    onClick={() => {
                      onChange({
                        concerns: Array.from(
                          new Set(
                            session.concerns.map((value) =>
                              value === text ? editDraft.trim() : value,
                            ),
                          ),
                        ),
                      });
                      setEditing(null);
                    }}
                  >
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditing(null)}
                  >
                    Cancel
                  </Button>
                </div>
              </>
            ) : (
              <>
                <p>{recoverConcernText(text, session.rawCapture)}</p>
                <div className="concern-actions">
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`More actions for concern ${index + 1}`}
                        />
                      }
                    >
                      <MoreHorizontal aria-hidden="true" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuGroup>
                        <DropdownMenuItem
                          onClick={() => {
                            setEditing(text);
                            setEditDraft(
                              recoverConcernText(text, session.rawCapture),
                            );
                          }}
                        >
                          <Pencil />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => move(text, "resolved")}
                        >
                          <Check />
                          Mark resolved
                        </DropdownMenuItem>
                        {review && (
                          <DropdownMenuItem
                            onClick={() => move(text, "deferred")}
                          >
                            <Clock3 />
                            Carry into brief
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => move(text, "removed")}
                        >
                          <Trash2 />
                          Remove
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </>
            )}
          </article>
        ))}
      </div>
      <div role="status" className="concern-notice">
        {notice}
        {removed && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              move(removed, "open");
              setRemoved(null);
            }}
          >
            <CornerUpLeft data-icon="inline-start" />
            Undo
          </Button>
        )}
      </div>
      {(
        [
          {
            key: "deferredConcerns",
            label: "Carried forward",
            icon: Clock3,
          },
          { key: "resolvedConcerns", label: "Resolved", icon: Check },
          { key: "removedConcerns", label: "Removed", icon: Trash2 },
        ] as const
      ).map(
        ({ key, label, icon: Icon }) =>
          (session[key] ?? []).length > 0 && (
            <details className="concern-history" key={key}>
              <summary>
                <Icon aria-hidden="true" />
                {label}
                <span>{session[key]?.length}</span>
                <ChevronDown className="disclosure-icon" aria-hidden="true" />
              </summary>
              {session[key]?.map((text) => (
                <div className="history-item" key={text}>
                  <p>{recoverConcernText(text, session.rawCapture)}</p>
                  <IconAction
                    label={`Restore ${label.toLowerCase()} concern`}
                    icon={RotateCcw}
                    onClick={() => move(text, "open")}
                  />
                </div>
              ))}
            </details>
          ),
      )}
      {!review && suggestions.length > 0 && (
        <details className="concern-history">
          <summary>
            <Plus aria-hidden="true" />
            Suggested<span>{suggestions.length}</span>
            <ChevronDown className="disclosure-icon" aria-hidden="true" />
          </summary>
          {suggestions.map((text) => (
            <div className="history-item" key={text}>
              <p>{text}</p>
              <IconAction
                label="Keep suggested concern"
                icon={Plus}
                onClick={() => add(text)}
              />
            </div>
          ))}
        </details>
      )}
    </aside>
  );
}
