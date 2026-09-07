# Jackalope

**Jackalope** is NiceThings’ interactive design-thinking intake. Agents facilitate a short workshop with you. The goal is a coherent, finishable brief — not a soft, agent-shaped dump that someone has to re-interpret later.

This is **not** classic design-thinking stage gates (Empathize → Define → Ideate → Prototype → Test). The intake follows an exploratory interview spine: one consequential call at a time, with concrete options you can accept, reject, or reframe.

## The thin workflow

1. **Capture** — Dump messy intent out loud or in writing. Keep the worries. Don’t force structure yet.
2. **Clarify** — Answer one serious question at a time. Prefer recognizing a good option over filling blank worksheets. Distinguish *proposed* from *accepted*.
3. **Lock** — The brief is good enough to run when these are accepted: who/outcome, taste bars + hard constraints, non-goals, shared terms, and what’s authorized without Kyle.
4. **Hand off** — Download or copy a markdown brief. Status stays visible so the factory can run without language drift.

## Public preview

Lasting static preview: [https://thorsenk.github.io/jackalope/](https://thorsenk.github.io/jackalope/)

## Run locally

```bash
npm install
npm run dev
```

Open the URL printed in the terminal (default is `http://localhost:3000`). For a fixed port:

```bash
npm run dev -- -p 43127
```

## Try the sample

1. Open the app and click **Load sample workshop**.
2. Skim the capture dump, keep or drop concerns, then continue to **Clarify**.
3. For each question, accept / reject / reframe an option (reject stays on the question so you can pick another).
4. On **Lock**, confirm every gate row is accepted, then lock.
5. On **Hand off**, copy or download the markdown brief.

Sessions save automatically in `localStorage` so you can refresh and resume.

## Stack

Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui. Client-side state only for v1 — no auth, no database.

## Design system

Jackalope is a NiceThings surface. Visual language comes from **`nice-things-interface` v0.1.0** (`design-system/tokens.json` → `--nt-*` CSS variables). Dark-only charcoal, thin borders, Inter, selective indigo accent `#504FB2`. Workshop-specific patterns IDS doesn’t define yet are listed in [`docs/ids-gaps.md`](docs/ids-gaps.md).
