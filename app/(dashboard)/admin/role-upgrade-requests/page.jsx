"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { formatDate } from "@/lib/utils";

const STATUS_VARIANT = {
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "error",
};

function RoleUpgradeRequestsPage() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const data = await api.get(`/role-upgrade-requests?page=${page}`);
      setItems(data?.items || data || []);
      setTotal(data?.total || 0);
    } catch {
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [page]);

  async function handleApprove(id) {
    try {
      await api.patch(`/role-upgrade-requests/${id}`, { status: "APPROVED", adminNote: "Approved" });
      load();
    } catch {
    }
  }

  async function handleReject(id) {
    const note = prompt("Rejection reason:");
    if (note === null) return;
    try {
      await api.patch(`/role-upgrade-requests/${id}`, { status: "REJECTED", adminNote: note });
      load();
    } catch {
    }
  }

  const columns = [
    {
      header: "User",
      cell: (row) => <span className="text-xs font-medium">{row.user?.name || row.userId}</span>,
    },
    {
      header: "Current Role",
      cell: (row) => <span className="text-xs">{row.currentRole?.name || "---"}</span>,
    },
    {
      header: "Requested Role",
      cell: (row) => <span className="text-xs font-bold">{row.requestedRole?.name || "---"}</span>,
    },
    {
      header: "Status",
      cell: (row) => (
        <Badge variant={STATUS_VARIANT[row.status] || "default"}>{row.status}</Badge>
      ),
    },
    {
      header: "Date",
      cell: (row) => <span className="text-xs text-muted-foreground">{formatDate(row.createdAt)}</span>,
    },
    {
      header: "Actions",
      className: "text-right",
      cell: (row) =>
        row.status === "PENDING" && (
          <div className="flex justify-end gap-1">
            <Button variant="ghost" size="sm" onClick={() => handleApprove(row.id)} className="text-emerald-600 hover:text-emerald-700 text-xs">
              Approve
            </Button>
            <Button variant="ghost" size="sm" onClick={() => handleReject(row.id)} className="text-destructive hover:text-destructive text-xs">
              Reject
            </Button>
          </div>
        ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Role Upgrade Requests" description={`${total} total requests`} />

      {loading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      ) : (
        <DataTable columns={columns} data={items} empty="No requests found" />
      )}
    </div>
  );
}

export default RoleUpgradeRequestsPage;
