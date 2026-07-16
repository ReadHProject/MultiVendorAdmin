"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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
  REJECTED: "error",
  SUSPENDED: "secondary",
};

export default function VendorsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  async function load() {
    setLoading(true);
    try {
      const query = statusFilter ? `?status=${statusFilter}` : "";
      const data = await api.get(`/vendors${query}`);
      setItems(data?.items || data || []);
    } catch {
      toast("Failed to load vendors", "error");
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [statusFilter]);

  async function handleApprove(id, status) {
    try {
      await api.patch(`/vendors/${id}/approve`, { status });
      toast(`Vendor ${status.toLowerCase()}`, "success");
      load();
    } catch (err) {
      toast(err?.message || "Failed", "error");
    }
  }

  const columns = [
    {
      header: "Company",
      cell: (item) => (
        <div>
          <div className="text-xs font-medium">{item.companyName}</div>
          <div className="text-[10px] text-muted-foreground font-mono">
            {item.gstin || "No GSTIN"}
          </div>
        </div>
      ),
    },
    {
      header: "Contact",
      cell: (item) => (
        <span className="text-xs">{item.user?.email || "---"}</span>
      ),
    },
    {
      header: "Email",
      cell: (item) => (
        <span className="text-xs">{item.user?.email || "---"}</span>
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
      header: "Commission %",
      className: "text-right",
      cell: (item) => (
        <span className="text-xs">{item.commissionRate ?? 0}%</span>
      ),
    },
    {
      header: "Products",
      className: "text-right",
      cell: (item) => (
        <span className="text-xs">{item._count?.products || 0}</span>
      ),
    },
    {
      header: "Orders",
      className: "text-right",
      cell: (item) => (
        <span className="text-xs">{item._count?.orders || 0}</span>
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
        item.status === "PENDING" ? (
          <div className="flex justify-end gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleApprove(item.id, "APPROVED")}
              className="text-emerald-600 hover:text-emerald-700"
            >
              <Icon name="check" size={14} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleApprove(item.id, "REJECTED")}
              className="text-destructive hover:text-destructive"
            >
              <Icon name="x" size={14} />
            </Button>
          </div>
        ) : (
          <Link
            href={`/admin/vendors/${item.id}`}
            className="text-xs text-primary hover:underline"
          >
            View
          </Link>
        ),
    },
  ];

  const statuses = ["", "PENDING", "APPROVED", "REJECTED", "SUSPENDED"];

  return (
    <div className="space-y-6">
      <PageHeader title="Vendors" description={`${items.length} vendors`} />

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
        <DataTable columns={columns} data={items} empty="No vendors" />
      )}
    </div>
  );
}
