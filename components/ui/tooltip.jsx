"use client";
import React from "react";
import { cn } from "@/lib/utils";

export function Tooltip({ content, children, side = "top", className }) {
  const [open, setOpen] = React.useState(false);
  const sideClass = {

  }[side];
  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {children}
      {open && (
        <span
          role="tooltip"
          className={cn(
            "absolute z-50 overflow-hidden rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground shadow-md animate-in fade-in-0 zoom-in-95 whitespace-nowrap pointer-events-none",
            sideClass,
            className
          )}
        >
          {content}
        </span>
      )}
    </span>
  );
}
