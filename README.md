# Jackalope

**Jackalope** is NiceThings' interactive design-thinking intake. Agents facilitate a short workshop with you. The goal is a coherent, finishable brief — not a soft, agent-shaped dump that someone has to re-interpret later.

This is **not** classic design-thinking stage gates (Empathize → Define → Ideate → Prototype → Test). The intake follows an exploratory interview spine: one consequential call at a time, with concrete options you can accept, reject, or reframe.

## The thin workflow

1. **Capture** — Dump messy intent out loud or in writing. Keep the worries. Don't force structure yet.
2. **Clarify** — Answer one serious question at a time. Prefer recognizing a good option over filling blank worksheets. Distinguish *proposed* from *accepted*.
3. **Lock** — The brief is good enough to run when these are accepted: who/outcome, taste bars + hard constraints, non-goals, shared terms, and what's authorized without Kyle. Open concerns must be resolved or deferred.
4. **Hand off** — Local export only (copy/download .md) — no recipient in v1.

## Run locally

```bash
npm install
npm run dev
```

Opens on port **43127**.

## Live preview

Public site: https://thorsenk.github.io/jackalope/

## Design system

Jackalope is a NiceThings surface. Visual language comes from **`nice-things-interface` v0.1.0** (`design-system/tokens.json` → `--nt-*` CSS variables). Dark-only charcoal, thin borders, Inter, selective indigo accent `#504FB2`. Gaps: [`docs/ids-gaps.md`](docs/ids-gaps.md).
