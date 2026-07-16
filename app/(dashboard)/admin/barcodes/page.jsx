"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { formatDate } from "@/lib/utils";

const STATUS_OPTIONS = ["", "IN_STOCK", "SOLD", "RETURNED", "DAMAGED"];
const STATUS_VARIANT = {
  IN_STOCK: "success",
  SOLD: "info",
  RETURNED: "warning",
  DAMAGED: "error",
};

function BarcodesPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");

  async function load() {
    setLoading(true);
    try {
      const params = status ? `?status=${status}` : "";
      const data = await api.get(`/barcodes${params}`);
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
      header: "Code",
      cell: (row) => <span className="text-xs font-mono font-bold">{row.code}</span>,
    },
    {
      header: "Product",
      cell: (row) => <span className="text-xs">{row.product?.name || "---"}</span>,
    },
    {
      header: "SKU",
      cell: (row) => <span className="text-xs font-mono text-muted-foreground">{row.sku || row.product?.sku || "---"}</span>,
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
      <PageHeader title="Barcodes" description={`${items.length} barcodes`} />

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
        <DataTable columns={columns} data={items} empty="No barcodes found" />
      )}
    </div>
  );
}

export default BarcodesPage;
