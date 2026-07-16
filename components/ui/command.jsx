"use client";
import React from "react";
import { cn } from "@/lib/utils";

export function Command({ items, placeholder = "Type a command or search...", emptyMessage = "No results found.", controlledOpen, onOpenChange }) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = (v) => { onOpenChange?.(v); if (controlledOpen === undefined) setInternalOpen(v); };
  const [query, setQuery] = React.useState("");
  const [active, setActive] = React.useState(0);
  const inputRef = React.useRef(null);

  React.useEffect(() => {
    function onKey(e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(!open);
      } else if (e.key === "Escape" && open) {
        setOpen(false);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  React.useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [open]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((it) => {
      const hay = [it.label, it.group, ...(it.keywords ?? [])].join(" ").toLowerCase();
      return hay.includes(q);
    });
  }, [items, query]);

  const grouped = React.useMemo(() => {
    const map = new Map();
    filtered.forEach((it) => {
      const g = it.group ?? "General";
      if (!map.has(g)) map.set(g, []);
      map.get(g).push(it);
    });
    return Array.from(map.entries());
  }, [filtered]);

  React.useEffect(() => { setActive(0); }, [query]);

  function onKeyDown(e) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const it = filtered[active];
      if (it) {
        it.onSelect?.();
        setOpen(false);
      }
    }
  }

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-lg border bg-card text-card-foreground shadow-2xl animate-in fade-in-0 zoom-in-95">
        <div className="flex items-center border-b px-3">
          <svg className="mr-2 h-4 w-4 shrink-0 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={placeholder}
            className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <div className="max-h-80 overflow-y-auto p-1">
          {filtered.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">{emptyMessage}</div>
          ) : (
            grouped.map(([group, list]) => (
              <div key={group} className="mb-1">
                <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">{group}</div>
                {list.map((it) => {
                  const globalIdx = filtered.indexOf(it);
                  const isActive = globalIdx === active;
                  return (
                    <div
                      key={it.id}
                      onMouseEnter={() => setActive(globalIdx)}
                      onClick={() => { it.onSelect?.(); setOpen(false); }}
                      className={cn(
                        "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
                        isActive && "bg-accent text-accent-foreground"
                      )}
                    >
                      <span className="flex-1 truncate">{it.label}</span>
                      {it.shortcut && <span className="ml-auto text-xs tracking-widest opacity-60">{it.shortcut}</span>}
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>
        <div className="border-t px-3 py-2 text-xs text-muted-foreground flex items-center justify-between">
          <span>Press <kbd className="rounded border bg-muted px-1">↑↓</kbd> to navigate</span>
          <span>Press <kbd className="rounded border bg-muted px-1">↵</kbd> to select</span>
        </div>
      </div>
    </div>
  );
}
