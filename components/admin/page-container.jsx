import { cn } from "@/lib/utils";

export function PageHeader({ title, description, actions, className }) {
  return (
    <div className={cn("flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8", className)}>
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-on-surface">{title}</h1>
        {description && <p className="text-on-surface-variant mt-1">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function PageContainer({ className, ...props }) {
  return (
    <div
      className={cn("space-y-8 max-w-[1440px] mx-auto w-full", className)}
      {...props}
    />
  );
}

export function PageSection({ className, ...props }) {
  return <div className={cn("space-y-3", className)} {...props} />;
}

export function PageGrid({ className, ...props }) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3",
        className
      )}
      {...props}
    />
  );
}
