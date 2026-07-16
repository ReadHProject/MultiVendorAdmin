"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";
import { toast } from "@/components/ui/toaster";

const statusVariant = {
  REQUESTED: "warning",
  APPROVED: "success",
  REJECTED: "error",
  RESTOCKED: "info",
  DAMAGED: "secondary",
};

export default function ReturnsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const data = await api.get("/returns");
      setItems(data?.items || data || []);
    } catch {
      toast("Failed to load returns", "error");
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleApprove(id) {
    try {
      await api.patch(`/returns/${id}`, { status: "APPROVED" });
      toast("Return approved", "success");
      load();
    } catch (err) {
      toast(err?.message || "Failed to approve", "error");
    }
  }

  async function handleReject(id) {
    try {
      await api.patch(`/returns/${id}`, { status: "REJECTED" });
      toast("Return rejected", "success");
      load();
    } catch (err) {
      toast(err?.message || "Failed to reject", "error");
    }
  }

  const columns = [
    {
      header: "Order",
      cell: (item) => (
        <span className="text-xs font-bold">
          {item.order?.orderNumber || "---"}
        </span>
      ),
    },
    {
      header: "Customer",
      cell: (item) => (
        <span className="text-xs">
          {item.order?.user?.name || item.customer || "---"}
        </span>
      ),
    },
    {
      header: "Reason",
      cell: (item) => (
        <span className="text-xs text-muted-foreground">
          {item.reason || "---"}
        </span>
      ),
    },
    {
      header: "Status",
      cell: (item) => (
        <Badge variant={statusVariant[item.status] || "secondary"}>
          {item.status}
        </Badge>
      ),
    },
    {
      header: "Date",
      cell: (item) => (
        <span className="text-xs text-muted-foreground">
          {item.createdAt
            ? new Date(item.createdAt).toLocaleDateString()
            : "---"}
        </span>
      ),
    },
    {
      header: "",
      className: "text-right",
      cell: (item) =>
        item.status === "REQUESTED" ? (
          <div className="flex justify-end gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleApprove(item.id)}
              className="text-emerald-600 hover:text-emerald-700"
            >
              <Icon name="check" size={14} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleReject(item.id)}
              className="text-destructive hover:text-destructive"
            >
              <Icon name="x" size={14} />
            </Button>
          </div>
        ) : null,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Returns"
        description={`${items.length} return requests`}
      />

      {loading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 bg-muted animate-pulse rounded" />
          ))}
        </div>
      ) : (
        <DataTable columns={columns} data={items} empty="No returns" />
      )}
    </div>
  );
}
