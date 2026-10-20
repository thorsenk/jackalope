# Jackalope

Jackalope turns project notes into a reviewed brief. Keep the original wording, make the important decisions, and export something useful for the next person.

## The workflow

1. **Notes** — paste or write the starting material. Read by section, edit the source, and keep concerns alongside it.
2. **Decisions** — see proposed wording immediately. Accept it, edit it, or reject it. Earlier wording stays in decision history when replaced.
3. **Review** — check six decision areas. Resolve open concerns or explicitly carry them into the brief, then approve.
4. **Export** — copy or download the brief. Changing the approved content returns it to Draft and requires another review.

Common actions use Lucide icons with keyboard/focus tooltips. The concern menu provides named alternatives for touch use. Document actions contains backup download/import; export actions contains a full backup and a new-workshop action.

Approval applies to this workshop brief. It does not publish company positioning, send a message, or deliver work to a recipient.

## Saved work

Sessions save in this browser. Download a JSON backup to preserve the complete source, decisions, concerns, and approval state or move them to another device. The Markdown export includes the original notes and decision history.

The Cornell route keeps section questions and synthesis in a separate browser draft. On its first visit, it starts from the guided document; subsequent edits save independently.

Clarification proposals are selected deterministically from source notes. The application does not currently run an artificial intelligence facilitator, authenticate users, or store work on a server.

## Run locally

```bash
npm ci
npm run dev
```

Open the address printed in the terminal (default port 43127).

## Verify

```bash
npm test
npm run lint
npx tsc --noEmit
npm run build
```

The interface refactor's baseline findings, screenshots, and verification record are in `docs/interface-review/`.

## Interface

Next.js, TypeScript, Tailwind CSS, Base UI/shadcn, and Lucide. The current charcoal/indigo interface uses the existing `nice-things-interface` token family. Application layout lives in one responsive stylesheet; reusable controls, tooltips, menus, toggles, fields, alerts, and empty states use the shared component layer.

### Positioning reviews

A source document with four numbered candidate quotations and the six-part evaluation rubric gets a positioning flow: compare the original wording on each source criterion, add evidence, then choose or revise wording separately. Judgments begin blank. Review confirmation records a local review brief; it does not finalize company positioning. Revisions do not inherit earlier sentence ratings, and changed source retains prior review snapshots. Other documents keep the general workshop flow.
