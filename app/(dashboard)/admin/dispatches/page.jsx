"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";
import { toast } from "@/components/ui/toaster";

const statusVariant = {
  PENDING: "warning",
  IN_TRANSIT: "info",
  COMPLETED: "success",
  CANCELLED: "error",
};

export default function DispatchesPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const data = await api.get("/dispatches");
      setItems(data?.items || data || []);
    } catch {
      toast("Failed to load dispatches", "error");
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

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
          {item.order?.user?.name || "---"}
        </span>
      ),
    },
    {
      header: "Warehouse",
      cell: (item) => (
        <span className="text-xs">{item.warehouse?.name || "---"}</span>
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
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dispatches"
        description={`${items.length} dispatches`}
      />

      {loading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 bg-muted animate-pulse rounded" />
          ))}
        </div>
      ) : (
        <DataTable columns={columns} data={items} empty="No dispatches" />
      )}
    </div>
  );
}
