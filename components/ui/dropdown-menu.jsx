"use client";
import React from "react";
import { cn } from "@/lib/utils";

const DropdownContext = React.createContext(null);

function useDropdown() {
  const ctx = React.useContext(DropdownContext);
  if (!ctx) throw new Error("DropdownMenu components must be used inside <DropdownMenu>");
  return ctx;
}

export function DropdownMenu({ children }) {
  const [open, setOpen] = React.useState(false);
  const [triggerEl, setTriggerEl] = React.useState(null);
  return (
    <DropdownContext.Provider value={{ open, setOpen, triggerEl, setTriggerEl }}>
      <div className="relative inline-block">{children}</div>
    </DropdownContext.Provider>
  );
}

export const DropdownMenuTrigger = React.forwardRef(
  ({ className, onClick, children, ...props }, ref) => {
    const { setOpen, open, setTriggerEl } = useDropdown();
    return (
      <button
        ref={(node) => {
          setTriggerEl(node);
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
        }}
        type="button"
        aria-expanded={open}
        onClick={(e) => {
          setOpen(!open);
          onClick?.(e);
        }}
        className={className}
        {...props}
      >
        {children}
      </button>
    );
  }
);
DropdownMenuTrigger.displayName = "DropdownMenuTrigger";

export function DropdownMenuContent({className, align = "start", children}) {
  const { open, setOpen, triggerEl } = useDropdown();
  const ref = React.useRef(null);

  React.useEffect(() => {
    if (!open) return;
    const onClick = (e) => {
      const target = e.target;
      if (ref.current && ref.current.contains(target)) return;
      if (triggerEl && triggerEl.contains(target)) return;
      setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, setOpen, triggerEl]);

  if (!open) return null;
  const alignClass =
    align === "end" ? "right-0" : align === "center" ? "left-1/2 -translate-x-1/2" : "left-0";
  return (
    <div
      ref={ref}
      role="menu"
      className={cn(
        "absolute z-50 mt-1 min-w-[12rem] overflow-hidden rounded-md border bg-popover text-popover-foreground p-1 shadow-md animate-in fade-in-0 zoom-in-95",
        alignClass,
        className
      )}
    >
      {children}
    </div>
  );
}

export const DropdownMenuItem = React.forwardRef(({ className, inset, onClick, disabled, ...props }, ref) => {
  const { setOpen } = useDropdown();
  return (
    <div
      ref={ref}
      role="menuitem"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      onClick={(e) => {
        if (disabled) return;
        onClick?.(e);
        setOpen(false);
      }}
      onKeyDown={(e) => {
        if (disabled) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.(e);
          setOpen(false);
        }
      }}
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
        inset && "pl-8",
        disabled && "pointer-events-none opacity-50",
        className
      )}
      {...props}
    />
  );
});
DropdownMenuItem.displayName = "DropdownMenuItem";

export function DropdownMenuLabel({ className, ...props }) {
  return <div className={cn("px-2 py-1.5 text-xs font-semibold text-muted-foreground", className)} {...props} />;
}

export function DropdownMenuSeparator({ className, ...props }) {
  return <div className={cn("-mx-1 my-1 h-px bg-border", className)} {...props} />;
}

export function DropdownMenuShortcut({ className, ...props }) {
  return <span className={cn("ml-auto text-xs tracking-widest opacity-60", className)} {...props} />;
}
