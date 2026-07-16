"use client";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

function toneFor(status) {
  const s = String(status || "").toUpperCase();
  if (["DELIVERED", "PAID", "COMPLETED", "APPROVED", "ACTIVE", "SUCCESS", "IN_STOCK", "OPEN", "RESOLVED", "RESTOCKED", "READY"].includes(s)) return "success";
  if (["PENDING", "REQUESTED", "PROCESSING", "DRAFT", "PARTIAL", "IN_PROGRESS", "OPENED", "NEW"].includes(s)) return "warning";
  if (["FAILED", "CANCELLED", "CANCELED", "REJECTED", "EXPIRED", "SUSPENDED", "INACTIVE", "RETURNED", "DAMAGED", "DISABLED", "OUT_OF_STOCK", "ARCHIVED", "ERROR", "BLOCKED"].includes(s)) return "destructive";
  if (["CONFIRMED", "PACKED", "SHIPPED", "DISPATCHED", "IN_TRANSIT", "OUT_FOR_DELIVERY", "INFO"].includes(s)) return "info";
  if (["MAINTENANCE", "HOLD"].includes(s)) return "secondary";
  return "default";
}

export function StatusBadge({status, className, prefix}) {
  let statusStr = "";
  if (typeof status === "boolean") {
    statusStr = status ? "ACTIVE" : "INACTIVE";
  } else if (typeof status === "string") {
    statusStr = status;
  } else {
    statusStr = String(status || "");
  }

  const tone = toneFor(statusStr);
  return (
    <Badge tone={tone} className={cn(className)}>
      {prefix}{statusStr.replace(/_/g, " ")}
    </Badge>
  );
}
