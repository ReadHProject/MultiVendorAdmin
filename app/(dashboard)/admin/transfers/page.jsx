"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { formatDate } from "@/lib/utils";

const STATUS_OPTIONS = ["", "PENDING", "IN_TRANSIT", "COMPLETED", "CANCELLED"];
const STATUS_VARIANT = {
  PENDING: "warning",
  IN_TRANSIT: "info",
  COMPLETED: "success",
  CANCELLED: "error",
};

function TransfersPage() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");

  async function load() {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page) });
      if (status) params.set("status", status);
      const data = await api.get(`/transfers?${params.toString()}`);
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
  }, [page, status]);

  const columns = [
    {
      header: "ID",
      cell: (row) => <span className="text-xs font-mono font-bold">#{String(row.id).slice(0, 8)}</span>,
    },
    {
      header: "From",
      cell: (row) => <span className="text-xs">{row.fromWarehouse?.name || row.from || "---"}</span>,
    },
    {
      header: "To",
      cell: (row) => <span className="text-xs">{row.toWarehouse?.name || row.to || "---"}</span>,
    },
    {
      header: "Items",
      cell: (row) => <span className="text-xs font-mono">{row.items?.length || row.itemCount || 0}</span>,
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
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Warehouse Transfers" description={`${total} transfers`} />

      <div className="flex items-center gap-3">
        <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s} value={s}>
                {s || "All Statuses"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      ) : (
        <DataTable columns={columns} data={items} empty="No transfers found" />
      )}
    </div>
  );
}

export default TransfersPage;
