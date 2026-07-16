"use client";
import { cn } from "../../lib/utils";
import { Icon } from "../../components/ui/icon";

const toneStyles = {
  default: "bg-surface-container-high text-on-surface-variant",
  primary: "bg-primary/10 text-primary",
  success: "bg-emerald-100 text-emerald-700",
  warning: "bg-amber-100 text-amber-700",
  danger: "bg-error/10 text-error",
};

export function KpiCard({ label, value, hint, iconName, trend, tone = "default", className }) {
  return (
    <div className={cn(
      "bg-card p-6 rounded-xl shadow-sm border border-border/60 flex flex-col justify-between h-32 hover:shadow-md hover:border-border/80 transition-all duration-300 dark:shadow-none relative overflow-hidden group",
      className
    )}>
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      <div className="flex justify-between items-start">
        <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">{label}</p>
        {iconName && (
          <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full", toneStyles[tone])}>
            <Icon name={iconName} size={16} />
          </div>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold text-on-surface tabular-nums">{value}</p>
        {(hint || trend) && (
          <div className="mt-1 flex items-center gap-1.5 text-xs">
            {trend && (
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 font-semibold",
                  trend.value > 0 ? "text-emerald-600" : trend.value < 0 ? "text-error" : "text-on-surface-variant"
                )}
              >
                <Icon name={trend.value >= 0 ? "trending-up" : "trending-down"} size={12} />
                {Math.abs(trend.value)}%
              </span>
            )}
            {hint && <span className="text-on-surface-variant">{hint}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
