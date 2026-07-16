"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";
import { toast } from "@/components/ui/toaster";

const statusVariant = {
  PENDING: "warning",
  PAID: "success",
  FAILED: "error",
  REFUNDED: "info",
};

export default function PaymentsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  async function load() {
    setLoading(true);
    try {
      const query = statusFilter ? `?status=${statusFilter}` : "";
      const data = await api.get(`/payments${query}`);
      setItems(data?.items || data || []);
    } catch {
      toast("Failed to load payments", "error");
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [statusFilter]);

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
      header: "Method",
      cell: (item) => (
        <span className="text-xs font-medium">{item.method || "---"}</span>
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
      header: "Amount",
      className: "text-right",
      cell: (item) => (
        <span className="text-xs font-black">
          {item.amount ? `₹${item.amount}` : "---"}
        </span>
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

  const statuses = ["", "PENDING", "PAID", "FAILED", "REFUNDED"];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payments"
        description={`${items.length} payments`}
      />

      <div className="flex gap-2">
        {statuses.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-colors ${
              statusFilter === s
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border hover:bg-muted"
            }`}
          >
            {s || "All"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 bg-muted animate-pulse rounded" />
          ))}
        </div>
      ) : (
        <DataTable columns={columns} data={items} empty="No payments" />
      )}
    </div>
  );
}
