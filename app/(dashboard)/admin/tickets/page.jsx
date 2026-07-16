"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { formatDate } from "@/lib/utils";

const STATUS_OPTIONS = ["", "OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];
const STATUS_VARIANT = {
  OPEN: "info",
  IN_PROGRESS: "warning",
  RESOLVED: "success",
  CLOSED: "default",
};
const PRIORITY_VARIANT = {
  LOW: "default",
  MEDIUM: "info",
  HIGH: "warning",
  URGENT: "error",
};

function TicketsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");

  async function load() {
    setLoading(true);
    try {
      const params = status ? `?status=${status}` : "";
      const data = await api.get(`/tickets${params}`);
      setItems(data?.items || data || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [status]);

  const columns = [
    {
      header: "Subject",
      cell: (row) => (
        <Link href={`/admin/tickets/${row.id}`} className="text-sm font-medium text-primary hover:underline">
          {row.subject}
        </Link>
      ),
    },
    {
      header: "Status",
      cell: (row) => (
        <Badge variant={STATUS_VARIANT[row.status] || "default"}>{row.status}</Badge>
      ),
    },
    {
      header: "Priority",
      cell: (row) => (
        <Badge variant={PRIORITY_VARIANT[row.priority] || "default"}>{row.priority}</Badge>
      ),
    },
    {
      header: "Created By",
      cell: (row) => <span className="text-xs">{row.user?.name || row.createdBy || "---"}</span>,
    },
    {
      header: "Assigned To",
      cell: (row) => <span className="text-xs">{row.assignedTo?.name || row.assignedTo || "---"}</span>,
    },
    {
      header: "Replies",
      cell: (row) => <span className="text-xs font-mono">{row.replies?.length || row.replyCount || 0}</span>,
    },
    {
      header: "Date",
      cell: (row) => <span className="text-xs text-muted-foreground">{formatDate(row.createdAt)}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Support Tickets" description={`${items.length} tickets`} />

      <div className="flex items-center gap-3">
        <Select value={status} onValueChange={setStatus}>
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
        <DataTable columns={columns} data={items} empty="No tickets found" />
      )}
    </div>
  );
}

export default TicketsPage;
