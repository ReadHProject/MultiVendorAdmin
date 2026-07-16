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
  PENDING: "warning",
  APPROVED: "success",
  PAID: "info",
  CANCELLED: "secondary",
};

export default function CommissionsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [selected, setSelected] = useState([]);
  const [bulkApproving, setBulkApproving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const query = statusFilter ? `?status=${statusFilter}` : "";
      const data = await api.get(`/commissions${query}`);
      setItems(data?.items || data || []);
    } catch {
      toast("Failed to load commissions", "error");
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [statusFilter]);

  async function handleBulkApprove() {
    if (selected.length === 0) return;
    setBulkApproving(true);
    try {
      await api.post("/commissions/bulk-approve", { ids: selected });
      toast(`${selected.length} commissions approved`, "success");
      setSelected([]);
      load();
    } catch (err) {
      toast(err?.message || "Failed to bulk approve", "error");
    }
    setBulkApproving(false);
  }

  function toggleSelect(id) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function toggleSelectAll() {
    const pending = items.filter((i) => i.status === "PENDING");
    if (selected.length === pending.length) {
      setSelected([]);
    } else {
      setSelected(pending.map((i) => i.id));
    }
  }

  const columns = [
    {
      header: "",
      className: "w-10",
      cell: (item) =>
        item.status === "PENDING" ? (
          <input
            type="checkbox"
            checked={selected.includes(item.id)}
            onChange={() => toggleSelect(item.id)}
            className="h-4 w-4 rounded border-input"
          />
        ) : null,
    },
    {
      header: "Salesman",
      cell: (item) => (
        <span className="text-xs font-medium">
          {item.salesman?.name || item.salesperson?.name || "---"}
        </span>
      ),
    },
    {
      header: "Order",
      cell: (item) => (
        <span className="text-xs">
          {item.order?.orderNumber || "---"}
        </span>
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
      header: "%",
      className: "text-right",
      cell: (item) => (
        <span className="text-xs text-muted-foreground">
          {item.percentage ?? "---"}%
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
  ];

  const statuses = ["", "PENDING", "APPROVED", "PAID", "CANCELLED"];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Commissions"
        description={`${items.length} commission records`}
        actions={
          selected.length > 0 ? (
            <Button
              variant="success"
              size="sm"
              disabled={bulkApproving}
              onClick={handleBulkApprove}
            >
              <Icon name="check" size={14} />{" "}
              {bulkApproving
                ? "Approving..."
                : `Approve ${selected.length} selected`}
            </Button>
          ) : null
        }
      />

      <div className="flex gap-2">
        {statuses.map((s) => (
          <button
            key={s}
            onClick={() => {
              setStatusFilter(s);
              setSelected([]);
            }}
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

      {items.filter((i) => i.status === "PENDING").length > 0 && (
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={
              selected.length ===
              items.filter((i) => i.status === "PENDING").length
            }
            onChange={toggleSelectAll}
            className="h-4 w-4 rounded border-input"
          />
          <span className="text-xs text-muted-foreground">
            Select all pending
          </span>
        </div>
      )}

      {loading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 bg-muted animate-pulse rounded" />
          ))}
        </div>
      ) : (
        <DataTable columns={columns} data={items} empty="No commissions" />
      )}
    </div>
  );
}
