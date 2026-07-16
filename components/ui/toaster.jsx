"use client";
import React from "react";

let toastId = 0;
const listeners = new Set();
let toasts = [];

function notify(message, type = "default") {
  const id = ++toastId;
  const toast = { id, message, type };
  toasts = [...toasts, toast];
  listeners.forEach((l) => l(toasts));
  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id);
    listeners.forEach((l) => l(toasts));
  }, 4000);
}

export const toast = {
  success: (msg) => notify(msg, "success"),
  error: (msg) => notify(msg, "error"),
  info: (msg) => notify(msg, "info"),
};

export function Toaster() {
  const [current, setCurrent] = React.useState(toasts);
  React.useEffect(() => {
    listeners.add(setCurrent);
    return () => listeners.delete(setCurrent);
  }, []);
  if (current.length === 0) return null;
  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm">
      {current.map((t) => (
        <div key={t.id} className={`px-4 py-3 rounded-lg shadow-lg text-sm font-medium animate-in fade-in slide-in-from-bottom-2 ${
          t.type === "success" ? "bg-emerald-600 text-white" :
          t.type === "error" ? "bg-destructive text-white" :
          "bg-foreground text-background"
        }`}>
          {t.message}
        </div>
      ))}
    </div>
  );
}
