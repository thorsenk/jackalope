const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");
require.extensions[".ts"] = (mod, file) =>
  mod._compile(
    ts.transpileModule(
      fs.readFileSync(file, "utf8").replaceAll('"@/lib/', '"./'),
      {
        compilerOptions: {
          module: ts.ModuleKind.CommonJS,
          target: ts.ScriptTarget.ES2022,
        },
      },
    ).outputText,
    file,
  );
const lib = path.resolve(__dirname, "../src/lib");
const {
  createEmptySession,
  buildClarifyFromCapture,
  suggestConcerns,
} = require(path.join(lib, "session.ts"));
const { parseWorkshopBackup } = require(path.join(lib, "backup.ts"));
const { briefToMarkdown } = require(path.join(lib, "export.ts"));
const { recoverConcernText, documentSections } = require(
  path.join(lib, "document-sections.ts"),
);
const { saveSession, loadSession } = require(path.join(lib, "storage.ts"));

test("workshop backup roundtrip preserves full source and decision state", () => {
  const source =
    "Intent for a complex household.\n\nINFORMATION BRICKS\n" +
    "Preserve every word. ".repeat(1500);
  const sectionId = documentSections(source)[0].id;
  const session = {
    ...createEmptySession(),
    rawCapture: source,
    concerns: ["Open question"],
    resolvedConcerns: ["Resolved"],
    removedConcerns: ["Removed"],
    deferredConcerns: ["Carried"],
    cornellSummary: "Synthesis",
    cornellSectionCues: { [sectionId]: "What matters?" },
    reviewedSections: [sectionId],
    claims: [
      {
        id: "a",
        kind: "who_outcome",
        text: "A real decision",
        status: "accepted",
      },
    ],
    clarifyDrafts: { taste_bar: "An unfinished draft" },
  };
  assert.deepEqual(
    JSON.parse(
      JSON.stringify(parseWorkshopBackup(JSON.parse(JSON.stringify(session)))),
    ),
    session,
  );
  assert.equal(
    parseWorkshopBackup({ title: "Older backup", raw: source }).rawCapture,
    source,
  );
  assert.equal(
    parseWorkshopBackup({
      rawCapture: source,
      claims: [{ text: { bad: "data" } }],
    }),
    null,
  );
});
test("separate draft storage and storage failure are explicit", () => {
  const values = new Map();
  global.window = {};
  global.localStorage = {
    getItem: (k) => values.get(k) ?? null,
    setItem: (k, v) => values.set(k, v),
  };
  const main = { ...createEmptySession(), title: "Main" };
  assert.equal(saveSession(main), true);
  assert.equal(saveSession({ ...main, title: "Candidate" }, "candidate"), true);
  assert.equal(loadSession().title, "Main");
  assert.equal(loadSession("candidate").title, "Candidate");
  global.localStorage.setItem = () => {
    throw new Error("Quota exceeded");
  };
  assert.equal(saveSession(main), false);
  delete global.window;
  delete global.localStorage;
});
test("markdown has real line breaks and includes preserved status/source", () => {
  const source = "A complete source.\n\nSecond paragraph.";
  const markdown = briefToMarkdown({
    ...createEmptySession(),
    title: "Test",
    rawCapture: source,
    resolvedConcerns: ["Resolved question"],
    cornellSummary: "Synthesis",
  });
  assert.ok(markdown.startsWith("# Test\n\n"));
  assert.ok(!markdown.includes("\\n\\n"));
  assert.ok(markdown.includes(source));
  assert.ok(markdown.includes("Resolved question"));
});
test("full concerns survive and legacy text is recovered only on unique exact match", () => {
  const full = "My worry: " + "complete concern ".repeat(50);
  assert.ok(suggestConcerns(full).includes(full.trim()));
  const prefix = full.slice(0, 120);
  assert.equal(recoverConcernText(prefix, full), full.trim());
  assert.equal(recoverConcernText(prefix, full + "\n" + full), prefix);
  assert.equal(recoverConcernText(prefix, "Different source."), prefix);
});
test("custom clarification proposals use captured wording, never unrelated sample assumptions", () => {
  const raw =
    "Household users need to coordinate the day.\n\nVisual craft matters.\n\nThe build must protect privacy.";
  const turns = buildClarifyFromCapture(raw, "A custom workshop");
  assert.equal(turns.length, 6);
  assert.ok(
    turns.every((t) => t.options.every((o) => raw.includes(o.claimText))),
  );
  assert.ok(!JSON.stringify(turns).includes("Friday one-pager"));
});

test("Cornell section identities survive insertion and reordering, and old positional cues migrate", () => {
  const before =
    "## School\nHomework context.\n\n## Sharing\nRecipient context.";
  const after =
    "## New section\nNew idea.\n\n## Sharing\nRecipient context.\n\n## School\nHomework context.";
  const school = documentSections(before).find((s) => s.title === "School");
  assert.equal(
    documentSections(after).find((s) => s.title === "School").id,
    school.id,
  );
  const migrated = parseWorkshopBackup({
    ...createEmptySession(),
    rawCapture: before,
    cornellSectionCues: { "section-1": "School question" },
    reviewedSections: ["section-1"],
  });
  assert.equal(migrated.cornellSectionCues[school.id], "School question");
  assert.equal(migrated.reviewedSections[0], school.id);
});
test("backup validation rejects unsafe nested optional fields and preserves approval snapshot", () => {
  const base = {
    ...createEmptySession(),
    rawCapture: "Source",
    lockedAt: "2026-10-20T15:00:00Z",
    handoffStatus: "ready",
  };
  assert.equal(parseWorkshopBackup(base).lockedAt, base.lockedAt);
  assert.equal(parseWorkshopBackup(base).handoffStatus, "ready");
  assert.equal(
    parseWorkshopBackup({
      ...base,
      claims: [
        {
          id: "a",
          kind: "taste_bar",
          text: "Text",
          status: "accepted",
          originalText: { bad: true },
        },
      ],
    }),
    null,
  );
  assert.equal(
    parseWorkshopBackup({
      ...base,
      clarifyTurns: [
        {
          id: "q",
          prompt: "Question",
          facilitation: "Help",
          options: [
            { id: "a", label: "A", claimText: "Text", claimKind: "wrong" },
          ],
        },
      ],
    }),
    null,
  );
  assert.equal(
    parseWorkshopBackup({
      ...base,
      clarifyTurns: [
        {
          id: "q",
          prompt: "Question",
          facilitation: "Help",
          options: [],
          response: { type: "accept", concern: { bad: true } },
        },
      ],
    }),
    null,
  );
});

test("reading projection preserves full paragraph text and headings", () => {
  const long = "A full concern. ".repeat(100);
  const sections = documentSections(
    `Opening intent.\n\nBRICK BUILDER\n${long}\n\n## Sharing\nSecond paragraph.`,
  );
  assert.deepEqual(
    sections.map((s) => s.title),
    ["Intent & context", "Brick Builder", "Sharing"],
  );
  assert.equal(sections[1].body, long.trim());
  assert.equal(sections[2].body, "Second paragraph.");
});
test("reading projection does not treat uppercase words within prose as headings", () => {
  assert.equal(
    documentSections("School API access matters.\n\nKeep NASA source links.")
      .length,
    1,
  );
  assert.equal(documentSections("").length, 0);
});

test("concern dispositions are reversible without touching source or decisions", () => {
  const { moveConcern } = require(path.join(lib, "concerns.ts"));
  const base = {
    ...createEmptySession(),
    rawCapture: "Original source, unchanged.",
    concerns: ["Keep this worry"],
    claims: [
      {
        id: "a",
        kind: "who_outcome",
        text: "Accepted outcome",
        status: "accepted",
      },
    ],
  };
  for (const target of ["resolved", "deferred", "removed"]) {
    const moved = { ...base, ...moveConcern(base, "Keep this worry", target) };
    assert.equal(moved.concerns.length, 0);
    assert.equal(moved.rawCapture, base.rawCapture);
    assert.deepEqual(moved.claims, base.claims);
    const restored = {
      ...moved,
      ...moveConcern(moved, "Keep this worry", "open"),
    };
    assert.deepEqual(restored.concerns, ["Keep this worry"]);
    assert.equal(restored.resolvedConcerns.length, 0);
    assert.equal(restored.deferredConcerns.length, 0);
    assert.equal(restored.removedConcerns.length, 0);
  }
  assert.deepEqual(base.concerns, ["Keep this worry"]);
});

test("approval requires all categories and open concerns remain blocking", () => {
  const { isLockReady } = require(path.join(lib, "storage.ts"));
  const { LOCK_GATE_KINDS } = require(path.join(lib, "types.ts"));
  const claims = LOCK_GATE_KINDS.map((kind) => ({
    id: kind,
    kind,
    text: "Deliberate decision",
    status: "accepted",
  }));
  assert.equal(isLockReady(claims, { concerns: [] }), true);
  assert.equal(isLockReady(claims.slice(1), { concerns: [] }), false);
  assert.equal(isLockReady(claims, { concerns: ["Unresolved"] }), false);
});

test("replacing a decision retains its earlier wording without duplicate active answers", () => {
  const { recordDecision } = require(path.join(lib, "decisions.ts"));
  const previous = {
    id: "old",
    kind: "who_outcome",
    text: "Original accepted wording",
    status: "accepted",
  };
  const next = {
    id: "new",
    kind: "who_outcome",
    text: "Revised accepted wording",
    status: "accepted",
  };
  const result = recordDecision([previous], next);
  assert.equal(result.length, 2);
  assert.equal(result[0].text, previous.text);
  assert.equal(result[0].status, "reframed");
  assert.equal(result.filter((c) => c.status === "accepted").length, 1);
  const rejected = recordDecision(result, {
    id: "rejected",
    kind: "who_outcome",
    text: "Rejected alternative",
    status: "rejected",
  });
  assert.equal(rejected.length, 3);
  assert.equal(rejected.filter((c) => c.status === "accepted").length, 0);
  assert.equal(previous.status, "accepted");
});

test("decision display removes duplicate source headings without altering stored wording", () => {
  const { decisionTextForDisplay } = require(path.join(lib, "decisions.ts"));
  const source =
    "## Constraints\n\nKeep the original evidence.\nAnother complete line.";
  assert.equal(
    decisionTextForDisplay(source, "hard_constraint"),
    "Keep the original evidence.\nAnother complete line.",
  );
  assert.equal(
    source,
    "## Constraints\n\nKeep the original evidence.\nAnother complete line.",
  );
  assert.equal(
    decisionTextForDisplay(
      "Plain first line\nKeep this too.",
      "hard_constraint",
    ),
    "Plain first line\nKeep this too.",
  );
  assert.equal(
    decisionTextForDisplay("## A heading alone", "hard_constraint"),
    "A heading alone",
  );
  assert.equal(
    decisionTextForDisplay(
      "## People we must not target\n\nResearchers",
      "who_outcome",
    ),
    "People we must not target\n\nResearchers",
  );
});

test("numbered source candidates become distinct unapproved choices with original wording", () => {
  const source =
    "## C1 · Plain\n> We make tools for gardeners.\n\n## C2 · Specific\n> We help growers plan their planting.";
  const turns = buildClarifyFromCapture(source, "Positioning review");
  assert.equal(turns[0].options.length, 2);
  assert.equal(turns[0].options[0].claimText, "We make tools for gardeners.");
  assert.equal(
    turns[0].options[1].claimText,
    "We help growers plan their planting.",
  );
  assert.equal(turns[0].response, undefined);
  assert.equal(new Set(turns[0].options.map((option) => option.id)).size, 2);
});

test("candidate quotations preserve wrapped lines, paragraphs, and boundaries", () => {
  const source =
    "## C1 · Private\n> We help gardeners grow food\n> without collecting their personal data.\n>\n> Only with their permission.\n\nCommentary outside the quote.\n\n## C2 · Local\n> We help growers\nplan their planting.\n\nOutside commentary.";
  const options = buildClarifyFromCapture(source, "Positioning review")[0].options;
  assert.equal(
    options[0].claimText,
    "We help gardeners grow food\nwithout collecting their personal data.\n\nOnly with their permission.",
  );
  assert.equal(options[1].claimText, "We help growers\nplan their planting.");
});
