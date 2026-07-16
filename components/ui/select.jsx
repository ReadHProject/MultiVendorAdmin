"use client";
import React from "react";
import { cn } from "@/lib/utils";

const SelectContext = React.createContext(null);

function useSelectCtx() {
  const ctx = React.useContext(SelectContext);
  if (!ctx) throw new Error("Select components must be used inside <Select>");
  return ctx;
}

export function Select({value: controlledValue, defaultValue = "", onValueChange, children, disabled}) {
  const [internal, setInternal] = React.useState(defaultValue);
  const [open, setOpen] = React.useState(false);
  const [triggerEl, setTriggerEl] = React.useState(null);
  const [options, setOptions] = React.useState([]);
  const value = controlledValue ?? internal;
  const setValue = (v) => {
    onValueChange?.(v);
    if (controlledValue === undefined) setInternal(v);
  };
  const registerOption = React.useCallback((opt) => {
    setOptions((prev) => {
      const existing = prev.find((p) => p.value === opt.value);
      if (existing) {
        if (existing.label === opt.label) return prev;
        return prev.map((p) => (p.value === opt.value ? opt : p));
      }
      return [...prev, opt];
    });
  }, []);
  return (
    <SelectContext.Provider value={{ value, setValue, open, setOpen, triggerEl, setTriggerEl, options, registerOption }}>
      <div className="relative inline-block w-full">{children}</div>
    </SelectContext.Provider>
  );
}

export const SelectTrigger = React.forwardRef(
  ({ className, children, ...props }, ref) => {
    const { setOpen, open, setTriggerEl, value, options } = useSelectCtx();
    const selected = options.find((o) => o.value === value);
    return (
      <button
        ref={(node) => {
          setTriggerEl(node);
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
        }}
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className={cn(
          "flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      >
        <span className={cn("truncate", !selected && "text-muted-foreground")}>
          {children ?? selected?.label ?? "Select..."}
        </span>
        <svg className="h-4 w-4 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
    );
  }
);
SelectTrigger.displayName = "SelectTrigger";

export function SelectValue({placeholder}) {
  const { value, options } = useSelectCtx();
  const selected = options.find((o) => o.value === value);
  return <span className={cn(!selected && "text-muted-foreground")}>{selected?.label ?? placeholder ?? ""}</span>;
}

export function SelectContent({className, children}) {
  const { open, setOpen, triggerEl } = useSelectCtx();
  const ref = React.useRef(null);

  React.useEffect(() => {
    if (!open) return;
    const onClick = (e) => {
      const target = e.target;
      if (ref.current && ref.current.contains(target)) return;
      if (triggerEl && triggerEl.contains(target)) return;
      setOpen(false);
    };
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, setOpen, triggerEl]);

  return (
    <>
      {!open && <div className="hidden">{children}</div>}
      {open && (
        <div
          ref={ref}
          role="listbox"
          className={cn(
            "absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95",
            className
          )}
        >
          <div className="p-1">{children}</div>
        </div>
      )}
    </>
  );
}

export const SelectItem = React.forwardRef(({ className, children, value: itemValue, disabled, label, ...props }, ref) => {
  const { setValue, value: selectedValue, registerOption, setOpen } = useSelectCtx();
  React.useEffect(() => {
    registerOption({ value: itemValue, label: label || (typeof children === "string" ? children : itemValue) });
  }, [itemValue, children, label, registerOption]);
  const isSelected = selectedValue === itemValue;
  return (
    <div
      ref={ref}
      role="option"
      aria-selected={isSelected}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      onClick={() => {
        if (disabled) return;
        setValue(itemValue);
        setOpen(false);
      }}
      onKeyDown={(e) => {
        if (disabled) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setValue(itemValue);
          setOpen(false);
        }
      }}
      className={cn(
        "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
        isSelected && "bg-accent/50",
        disabled && "pointer-events-none opacity-50",
        className
      )}
      {...props}
    >
      {isSelected && (
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center text-primary">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </span>
      )}
      {children}
    </div>
  );
});
SelectItem.displayName = "SelectItem";

export function SelectLabel({ className, ...props }) {
  return <div className={cn("px-2 py-1.5 text-xs font-semibold text-muted-foreground", className)} {...props} />;
}

export function SelectSeparator({ className, ...props }) {
  return <div className={cn("-mx-1 my-1 h-px bg-border", className)} {...props} />;
}
