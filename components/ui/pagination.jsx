"use client";
import { cn } from "@/lib/utils";

function buildPageList(current, total, siblings) {
  const totalNumbers = siblings * 2 + 5;
  if (total <= totalNumbers) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const left = Math.max(current - siblings, 1);
  const right = Math.min(current + siblings, total);
  const showLeftEllipsis = left > 2;
  const showRightEllipsis = right < total - 1;
  const items = [1];
  if (showLeftEllipsis) items.push("ellipsis");
  for (let i = left; i <= right; i++) {
    if (i !== 1 && i !== total) items.push(i);
  }
  if (showRightEllipsis) items.push("ellipsis");
  if (total !== 1) items.push(total);
  return items;
}

export function Pagination({ page, totalPages, onPageChange, siblingCount = 1, className }) {
  if (totalPages <= 1) return null;
  const items = buildPageList(page, totalPages, siblingCount);
  const baseBtn =
    "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium h-9 min-w-9 px-3 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50";
  return (
    <nav role="navigation" aria-label="pagination" className={cn("flex items-center justify-center gap-1", className)}>
      <button
        className={cn(baseBtn, "border border-input bg-background hover:bg-accent hover:text-accent-foreground gap-1")}
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Previous
      </button>
      {items.map((it, i) =>
        it === "ellipsis" ? (
          <span key={`e-${i}`} className="h-9 w-9 inline-flex items-center justify-center text-muted-foreground">
            …
          </span>
        ) : (
          <button
            key={it}
            aria-current={it === page ? "page" : undefined}
            className={cn(
              baseBtn,
              it === page ? "bg-primary text-primary-foreground hover:bg-primary/90" : "border border-input bg-background hover:bg-accent hover:text-accent-foreground"
            )}
            onClick={() => onPageChange(it)}
          >
            {it}
          </button>
        )
      )}
      <button
        className={cn(baseBtn, "border border-input bg-background hover:bg-accent hover:text-accent-foreground gap-1")}
        disabled={page === totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Next
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </nav>
  );
}
