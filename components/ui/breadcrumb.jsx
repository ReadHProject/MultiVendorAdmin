"use client";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Breadcrumb({ className, ...props }) {
  return <nav aria-label="breadcrumb" className={cn("", className)} {...props} />;
}

export function BreadcrumbList({ className, ...props }) {
  return <ol className={cn("flex flex-wrap items-center gap-1.5 break-words text-sm text-muted-foreground", className)} {...props} />;
}

export function BreadcrumbItem({ className, ...props }) {
  return <li className={cn("inline-flex items-center gap-1.5", className)} {...props} />;
}

export function BreadcrumbLink({className, href, children, ...props}) {
  return (
    <Link href={href} className={cn("transition-colors hover:text-foreground", className)}>
      {children}
    </Link>
  );
}

export function BreadcrumbPage({ className, children, ...props }) {
  return <span role="link" aria-disabled="true" aria-current="page" className={cn("font-normal text-foreground", className)} {...props}>{children}</span>;
}

export function BreadcrumbSeparator({className, children}) {
  return (
    <li role="presentation" aria-hidden="true" className={cn("[&>svg]:size-3.5 text-muted-foreground/60", className)}>
      {children ?? (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      )}
    </li>
  );
}
