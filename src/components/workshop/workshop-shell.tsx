import Link from "next/link";
import { Layers2 } from "lucide-react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { WorkshopApp } from "./workshop-app";

export function WorkshopShell({
  variant = "standard",
}: {
  variant?: "standard" | "cornell";
}) {
  return (
    <TooltipProvider delay={300}>
      <div className="nt-shell">
        <header className="app-topbar">
          <div className="app-topbar-inner">
            <Link href="/" className="app-brand" aria-label="Jackalope home">
              <Layers2 aria-hidden="true" />
              <h1>Jackalope</h1>
              <span>by NiceThings</span>
            </Link>
            <nav className="candidate-nav" aria-label="Document format">
              <Link
                href="/"
                aria-current={variant === "standard" ? "page" : undefined}
              >
                Document
              </Link>
              <Link
                href="/cornell"
                aria-current={variant === "cornell" ? "page" : undefined}
              >
                Cornell
              </Link>
            </nav>
          </div>
        </header>
        <main className="app-main" id="workshop-main" tabIndex={-1}>
          <WorkshopApp key={variant} variant={variant} />
        </main>
      </div>
    </TooltipProvider>
  );
}
