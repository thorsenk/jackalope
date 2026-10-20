"use client";

import type { ComponentProps, ReactNode } from "react";
import { ArrowRight, CircleHelp, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function IconAction({
  label,
  icon: Icon,
  ...props
}: Omit<ComponentProps<typeof Button>, "children"> & {
  label: string;
  icon: LucideIcon;
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button variant="ghost" size="icon" aria-label={label} {...props} />
        }
      >
        <Icon aria-hidden="true" />
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

export function HelpTip({
  children,
  label = "More information",
}: {
  children: ReactNode;
  label?: string;
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={<Button variant="ghost" size="icon-sm" aria-label={label} />}
      >
        <CircleHelp aria-hidden="true" />
      </TooltipTrigger>
      <TooltipContent>{children}</TooltipContent>
    </Tooltip>
  );
}

export function StageFooter({
  children,
  onContinue,
  label = "Continue",
  disabled = false,
  icon: Icon = ArrowRight,
}: {
  children?: ReactNode;
  onContinue: () => void;
  label?: string;
  disabled?: boolean;
  icon?: LucideIcon;
}) {
  return (
    <div className="stage-footer">
      <div className="footer-context">{children}</div>
      <Button size="lg" disabled={disabled} onClick={onContinue}>
        {label}
        <Icon data-icon="inline-end" aria-hidden="true" />
      </Button>
    </div>
  );
}
