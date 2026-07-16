"use client";
import React from "react";
import { cn } from "@/lib/utils";

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export const Checkbox = React.forwardRef(
  ({ className, checked = false, onCheckedChange, onClick, indeterminate, disabled, name, value, ...props }, ref) => {
    const state = indeterminate ? "indeterminate" : checked ? "checked" : "unchecked";
    return (
      <button
        ref={ref}
        type="button"
        role="checkbox"
        aria-checked={indeterminate ? "mixed" : checked}
        data-state={state}
        disabled={disabled}
        onClick={(e) => {
          if (!indeterminate) onCheckedChange?.(!checked);
          else onCheckedChange?.(true);
          onClick?.(e);
        }}
        className={cn(
          "peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          (checked || indeterminate) && "bg-primary text-primary-foreground",
          className
        )}
        {...props}
      >
        {indeterminate ? (
          <span className="flex h-full w-full items-center justify-center">
            <span className="h-0.5 w-2 bg-primary-foreground rounded-full" />
          </span>
        ) : checked ? (
          <span className="flex h-full w-full items-center justify-center text-primary-foreground">
            <CheckIcon />
          </span>
        ) : null}
        {name && <input type="hidden" name={name} value={value ?? (checked ? "true" : "false")} />}
      </button>
    );
  }
);
Checkbox.displayName = "Checkbox";
