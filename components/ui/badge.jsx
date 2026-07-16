import { cn } from "../../lib/utils";

const variants = {
  default: "bg-muted text-muted-foreground",
  secondary: "bg-secondary text-secondary-foreground",
  destructive: "bg-destructive/10 text-destructive",
  outline: "border border-border text-foreground",
  success: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
  warning: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  error: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300",
  info: "bg-primary text-primary-foreground",
};

export function Badge({ className, variant = "default", ...props }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
