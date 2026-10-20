"use client";

import { Check, ChevronDown, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/** Compact navigation at widths where an outline would become a scrolling rail. */
export function OutlineMenu({
  label,
  items,
  index,
  onSelect,
  completeLabel = "Reviewed",
}: {
  label: string;
  items: { id: string; title: string; complete?: boolean }[];
  index: number;
  onSelect: (index: number) => void;
  completeLabel?: string;
}) {
  return (
    <div className="outline-menu">
      <DropdownMenu>
        <DropdownMenuTrigger
          className="outline-menu-trigger"
          render={<Button variant="outline" aria-label={label} />}
        >
          <List data-icon="inline-start" />
          <span>
            {index + 1} / {items.length} · {items[index]?.title}
          </span>
          <ChevronDown data-icon="inline-end" />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="outline-menu-content">
          <DropdownMenuGroup>
            {items.map((item, itemIndex) => (
              <DropdownMenuItem
                key={item.id}
                onClick={() => onSelect(itemIndex)}
              >
                <span className="outline-marker">{itemIndex + 1}</span>
                <span>{item.title}</span>
                {(item.complete || itemIndex === index) && (
                  <Check
                    aria-label={item.complete ? completeLabel : "Current"}
                  />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
