"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Claim, ClaimStatus } from "@/lib/types";
import { CLAIM_KIND_LABELS } from "@/lib/types";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<ClaimStatus, string> = {
  proposed:
    "border-[var(--nt-proposed)]/40 bg-[var(--nt-proposed-soft)] text-[var(--nt-proposed)]",
  accepted:
    "border-[var(--nt-accepted)]/40 bg-[var(--nt-accepted-soft)] text-[var(--nt-accepted)]",
  rejected: "border-border bg-muted/50 text-muted-foreground line-through",
  reframed:
    "border-[var(--nt-accent)]/40 bg-[var(--nt-accent-soft)] text-[var(--nt-accent)]",
};

export function StatusBadge({ status }: { status: ClaimStatus }) {
  return (
    <Badge
      variant="outline"
      className={cn("rounded-md font-mono text-[10px] tracking-wider uppercase", STATUS_STYLES[status])}
    >
      {status}
    </Badge>
  );
}

export function ClaimRow({
  claim,
  onAccept,
  onReject,
  compact,
}: {
  claim: Claim;
  onAccept?: () => void;
  onReject?: () => void;
  compact?: boolean;
}) {
  return (
    <article
      className={cn(
        "rounded-[var(--nt-radius-medium)] border border-border/70 bg-card/40 px-4 py-3 transition-colors",
        claim.status === "accepted" && "border-[var(--nt-accepted)]/30",
        claim.status === "proposed" && "border-[var(--nt-proposed)]/30",
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-[10px] tracking-[0.14em] text-muted-foreground uppercase">
          {CLAIM_KIND_LABELS[claim.kind]}
        </span>
        <StatusBadge status={claim.status} />
      </div>
      <p
        className={cn(
          "mt-2 text-[15px] leading-relaxed text-foreground",
          compact && "text-sm",
        )}
      >
        {claim.text}
      </p>
      {claim.originalText && claim.originalText !== claim.text && (
        <p className="mt-2 text-xs text-muted-foreground">
          Was: {claim.originalText}
        </p>
      )}
      {claim.concern && (
        <p className="mt-1 text-xs text-[var(--nt-proposed)]">
          Concern kept: {claim.concern}
        </p>
      )}
      {(onAccept || onReject) && claim.status === "proposed" && (
        <div className="mt-3 flex flex-wrap gap-2">
          {onAccept && (
            <Button size="sm" onClick={onAccept}>
              Accept
            </Button>
          )}
          {onReject && (
            <Button size="sm" variant="outline" onClick={onReject}>
              Reject
            </Button>
          )}
        </div>
      )}
    </article>
  );
}
