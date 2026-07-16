"use client";
import React from "react";
import { cn } from "@/lib/utils";

function startOfMonth(d) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function fmt(d) {
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS = ["Su","Mo","Tu","We","Th","Fr","Sa"];

export const DatePicker = React.forwardRef(
  ({ value, onChange, placeholder = "Pick a date", disabled, className, minDate, maxDate }, ref) => {
    const [open, setOpen] = React.useState(false);
    const [view, setView] = React.useState(value ?? new Date());
    const containerRef = React.useRef(null);

    React.useEffect(() => {
      if (!open) return;
      const onClick = (e) => {
        if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
      };
      const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
      document.addEventListener("mousedown", onClick);
      document.addEventListener("keydown", onKey);
      return () => {
        document.removeEventListener("mousedown", onClick);
        document.removeEventListener("keydown", onKey);
      };
    }, [open]);

    const first = startOfMonth(view);
    const startWeekday = first.getDay();
    const daysInMonth = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < startWeekday; i++) cells.push(null);
    for (let i = 1; i <= daysInMonth; i++) cells.push(new Date(view.getFullYear(), view.getMonth(), i));

    const isDisabled = (d) => {
      if (minDate && d < new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate())) return true;
      if (maxDate && d > new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate())) return true;
      return false;
    };

    return (
      <div className="relative inline-block w-full">
        <button
          ref={containerRef}
          type="button"
          disabled={disabled}
          onClick={() => setOpen(!open)}
          className={cn(
            "flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
            !value && "text-muted-foreground",
            className
          )}
        >
          <span className="flex items-center gap-2">
            <svg className="h-4 w-4 opacity-70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            {value ? fmt(value) : placeholder}
          </span>
          {value && (
            <span
              role="button"
              tabIndex={-1}
              aria-label="Clear date"
              onClick={(e) => {
                e.stopPropagation();
                onChange?.(null);
              }}
              className="ml-2 rounded-sm p-0.5 hover:bg-accent"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </span>
          )}
        </button>
        {open && (
          <div
            ref={ref}
            className="absolute z-50 mt-1 w-[260px] rounded-md border bg-popover p-3 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95"
          >
            <div className="flex items-center justify-between mb-2">
              <button
                type="button"
                onClick={() => setView(new Date(view.getFullYear(), view.getMonth() - 1, 1))}
                className="h-7 w-7 inline-flex items-center justify-center rounded hover:bg-accent"
                aria-label="Previous month"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
              </button>
              <div className="text-sm font-medium">
                {MONTHS[view.getMonth()]} {view.getFullYear()}
              </div>
              <button
                type="button"
                onClick={() => setView(new Date(view.getFullYear(), view.getMonth() + 1, 1))}
                className="h-7 w-7 inline-flex items-center justify-center rounded hover:bg-accent"
                aria-label="Next month"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
              </button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground mb-1">
              {DAYS.map((d) => <div key={d} className="py-1">{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {cells.map((d, i) => {
                if (!d) return <div key={i} />;
                const disabled = isDisabled(d);
                const selected = value && isSameDay(d, value);
                const today = isSameDay(d, new Date());
                return (
                  <button
                    key={i}
                    type="button"
                    disabled={disabled}
                    onClick={() => {
                      onChange?.(d);
                      setOpen(false);
                    }}
                    className={cn(
                      "h-8 w-8 rounded text-sm inline-flex items-center justify-center transition-colors",
                      selected && "bg-primary text-primary-foreground",
                      !selected && today && "border border-primary text-primary",
                      !selected && !today && "hover:bg-accent hover:text-accent-foreground",
                      disabled && "opacity-30 cursor-not-allowed hover:bg-transparent"
                    )}
                  >
                    {d.getDate()}
                  </button>
                );
              })}
            </div>
            <div className="mt-2 flex justify-between">
              <button
                type="button"
                onClick={() => { onChange?.(new Date()); setOpen(false); }}
                className="text-xs text-primary hover:underline"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => { onChange?.(null); setOpen(false); }}
                className="text-xs text-muted-foreground hover:underline"
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }
);
DatePicker.displayName = "DatePicker";
