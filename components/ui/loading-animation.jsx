"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function LoadingAnimation({ type = "spinner", className, rows = 5 }) {
  if (type === "spinner") {
    return (
      <div className={cn("flex flex-col items-center justify-center min-h-[400px] w-full gap-4", className)}>
        <div className="relative flex items-center justify-center h-16 w-16">
          <div className="absolute inset-0 rounded-full border-4 border-slate-200 dark:border-slate-800" />
          <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 animate-pulse font-medium">Loading data...</p>
      </div>
    );
  }

  if (type === "table") {
    return (
      <div className={cn("space-y-4 w-full", className)}>
        {/* Table Header Controls */}
        <div className="flex items-center justify-between mb-4">
          <div className="h-10 w-64 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-lg" />
          <div className="h-10 w-32 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-lg" />
        </div>
        {/* Table Body */}
        <div className="border border-border rounded-lg overflow-hidden">
          <div className="h-12 bg-slate-100 dark:bg-slate-900 animate-pulse border-b border-border" />
          {[...Array(rows)].map((_, i) => (
            <div key={i} className="h-16 bg-slate-50 dark:bg-slate-900/50 animate-pulse border-b border-border last:border-0" />
          ))}
        </div>
      </div>
    );
  }

  if (type === "card") {
    return (
      <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6", className)}>
        {[...Array(rows)].map((_, i) => (
          <div key={i} className="flex flex-col space-y-4 bg-card border border-border p-5 rounded-xl shadow-sm">
            <div className="h-40 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-lg w-full" />
            <div className="space-y-2">
              <div className="h-4 bg-slate-200 dark:bg-slate-800 animate-pulse rounded w-3/4" />
              <div className="h-4 bg-slate-200 dark:bg-slate-800 animate-pulse rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Default block skeleton
  return (
    <div className={cn("space-y-3", className)}>
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="h-14 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-lg w-full" />
      ))}
    </div>
  );
}
