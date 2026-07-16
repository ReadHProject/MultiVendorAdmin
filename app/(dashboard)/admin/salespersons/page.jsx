"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";
import { toast } from "@/components/ui/toaster";

export default function SalespersonsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const data = await api.get("/salespersons");
      setItems(data?.items || data || []);
    } catch {
      toast("Failed to load salespersons", "error");
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const columns = [
    {
      header: "Name",
      cell: (item) => (
        <div>
          <div className="text-xs font-medium">
            {item.user?.name || item.name || "---"}
          </div>
          <div className="text-[10px] text-muted-foreground">
            {item.user?.email || item.email || "---"}
          </div>
        </div>
      ),
    },
    {
      header: "Email",
      cell: (item) => (
        <span className="text-xs">
          {item.user?.email || item.email || "---"}
        </span>
      ),
    },
    {
      header: "Code",
      cell: (item) => (
        <span className="text-xs font-mono text-muted-foreground">
          {item.employeeCode || item.code || "---"}
        </span>
      ),
    },
    {
      header: "Area",
      cell: (item) => (
        <span className="text-xs">
          {item.assignedArea || item.area || "---"}
        </span>
      ),
    },
    {
      header: "Target",
      className: "text-right",
      cell: (item) => (
        <span className="text-xs">
          {item.target ? `₹${item.target}` : "---"}
        </span>
      ),
    },
    {
      header: "Commission %",
      className: "text-right",
      cell: (item) => (
        <span className="text-xs">
          {item.commissionPct ?? item.commissionRate ?? "---"}%
        </span>
      ),
    },
    {
      header: "Status",
      cell: (item) => (
        <Badge variant={item.isActive !== false ? "success" : "secondary"}>
          {item.isActive !== false ? "Active" : "Inactive"}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Salespersons"
        description={`${items.length} salespersons`}
      />

      {loading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 bg-muted animate-pulse rounded" />
          ))}
        </div>
      ) : (
        <DataTable columns={columns} data={items} empty="No salespersons" />
      )}
    </div>
  );
}
