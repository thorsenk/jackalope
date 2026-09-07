import { WorkshopApp } from "@/components/workshop/workshop-app";

export default function Home() {
  return (
    <div className="nt-shell relative flex min-h-full flex-1 flex-col">
      <header className="nt-nav relative z-10 border-b">
        <div className="mx-auto flex w-full max-w-5xl items-end justify-between gap-6 px-4 py-4 sm:px-6">
          <div className="space-y-1.5">
            <p className="nt-label">NiceThings · design harness</p>
            <h1 className="text-[24px] font-semibold tracking-tight text-[var(--nt-fg-highest)]">
              Jackalope
            </h1>
            <p className="nt-body max-w-xl text-[13px] leading-relaxed">
              Interactive design-thinking intake. Agents facilitate; you decide.
              Capture → Clarify → Lock → Hand off.
            </p>
          </div>
          <p className="nt-label hidden max-w-[11rem] text-right leading-relaxed sm:block">
            Not stage-gate DT.
            <br />
            Exploratory interview spine.
          </p>
        </div>
      </header>

      <main className="relative z-10 flex-1 px-4 py-6 sm:px-6 sm:py-8">
        <WorkshopApp />
      </main>

      <footer className="relative z-10 border-t border-[var(--nt-border-subtle)] px-4 py-4 sm:px-6">
        <p className="mx-auto max-w-5xl text-[12px] text-[var(--nt-fg-muted)]">
          Sessions persist in this browser. Export the markdown brief when the
          lock gate is met — who/outcome, taste, constraints, non-goals, shared
          terms, and what’s authorized without Kyle.
        </p>
      </footer>
    </div>
  );
}
