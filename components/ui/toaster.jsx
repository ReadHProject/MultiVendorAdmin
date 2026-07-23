"use client";
import { toast as sonnerToast } from "sonner";

// Wrapper to support both sonner's API (toast.success) and legacy API (toast("msg", "success"))
export const toast = Object.assign(
  (message, type = "default") => {
    if (type === "success") return sonnerToast.success(message);
    if (type === "error") return sonnerToast.error(message);
    if (type === "info") return sonnerToast.info(message);
    return sonnerToast(message);
  },
  {
    success: (msg) => sonnerToast.success(msg),
    error: (msg) => sonnerToast.error(msg),
    info: (msg) => sonnerToast.info(msg),
    warning: (msg) => sonnerToast.warning(msg),
  }
);

export function Toaster() {
  return null; // sonner's Toaster is already rendered in app/layout.jsx
}
