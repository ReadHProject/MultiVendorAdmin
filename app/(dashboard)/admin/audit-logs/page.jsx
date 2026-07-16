"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/ui/data-table";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { formatDate } from "@/lib/utils";

const ACTION_VARIANT = {
  CREATE: "success",
  create: "success",
  UPDATE: "info",
  update: "info",
  DELETE: "error",
  delete: "error",
};

function AuditPage() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [entityType, setEntityType] = useState("");
  const [actionFilter, setActionFilter] = useState("");

  async function load() {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: "20" });
      if (entityType) params.set("entityType", entityType);
      if (actionFilter) params.set("action", actionFilter);
      const data = await api.get("/audit-logs?" + params.toString());
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
  }, [page, entityType, actionFilter]);

  const columns = [
    {
      header: "Timestamp",
      cell: (row) => <span className="text-xs text-muted-foreground">{formatDate(row.createdAt)}</span>,
    },
    {
      header: "Actor",
      cell: (row) => <span className="text-xs font-medium">{row.user?.name || row.actor || "---"}</span>,
    },
    {
      header: "Action",
      cell: (row) => (
        <Badge variant={ACTION_VARIANT[row.action] || "default"}>{row.action}</Badge>
      ),
    },
    {
      header: "Entity",
      cell: (row) => (
        <span className="text-xs">
          <span className="font-medium">{row.entityType}</span>
          {row.entityId && <span className="text-muted-foreground ml-1">#{String(row.entityId).slice(0, 8)}</span>}
        </span>
      ),
    },
    {
      header: "IP Address",
      cell: (row) => <span className="text-xs font-mono text-muted-foreground">{row.ipAddress || "---"}</span>,
    },
  ];

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="space-y-6">
      <PageHeader title="Audit Logs" description={`${total} records`} />

      <div className="flex flex-wrap items-center gap-3">
        <Input
          className="w-56"
          placeholder="Filter by entity type..."
          value={entityType}
          onChange={(e) => { setEntityType(e.target.value); setPage(1); }}
        />
        <Select value={actionFilter} onValueChange={(v) => { setActionFilter(v); setPage(1); }}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Actions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Actions</SelectItem>
            <SelectItem value="CREATE">Create</SelectItem>
            <SelectItem value="UPDATE">Update</SelectItem>
            <SelectItem value="DELETE">Delete</SelectItem>
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
        <>
          <DataTable columns={columns} data={items} empty="No audit logs found" />
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="h-8 px-3 rounded-md border border-border text-xs font-medium disabled:opacity-50 hover:bg-muted"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="h-8 px-3 rounded-md border border-border text-xs font-medium disabled:opacity-50 hover:bg-muted"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default AuditPage;
