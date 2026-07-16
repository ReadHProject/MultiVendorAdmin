"use client";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/icon";

export function FilterBar({ search, onSearchChange, searchPlaceholder = "Search...", children, className }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {search !== undefined && onSearchChange && (
        <div className="relative">
          <Icon name="search" size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="h-9 w-full sm:w-64 rounded-md border border-input bg-background pl-8 pr-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
      )}
      {children}
    </div>
  );
}
