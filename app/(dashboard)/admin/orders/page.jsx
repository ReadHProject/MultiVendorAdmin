"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { formatMoney, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/admin/status-badge";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";
import { Pagination } from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import { MobileFooter, MobileHeader } from "@/components/admin/mobile/mobile-layout";
import { Icon } from "@/components/ui/icon";

const STATUS_FILTERS = [
  { value: "", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "DISPATCHED", label: "Dispatched" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "RETURNED", label: "Returned" },
];

export default function OrdersPage() {
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(page) });
      if (q) params.set("q", q);
      if (status) params.set("status", status);
      const res = await api.get(`/orders?${params.toString()}`);
      setData(res);
    } catch (err) {
      setError(err.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [page, q, status]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const items = data?.items || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / 20);

  const columns = [
    {
      header: "Order #",
      cell: (row) => (
        <span className="text-xs font-bold">{row.orderNumber}</span>
      ),
    },
    {
      header: "Customer",
      cell: (row) => (
        <span className="text-xs">{row.user?.name || "---"}</span>
      ),
    },
    {
      header: "Status",
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: "Payment",
      cell: (row) => (
        <StatusBadge status={row.paymentStatus} />
      ),
    },
    {
      header: "Total",
      className: "text-right",
      cell: (row) => (
        <span className="text-xs font-black">
          {formatMoney(row.grandTotal)}
        </span>
      ),
    },
    {
      header: "Date",
      cell: (row) => (
        <span className="text-xs text-muted-foreground">
          {formatDate(row.createdAt)}
        </span>
      ),
    },
    {
      header: "Actions",
      className: "text-right",
      cell: (row) => (
        <Link
          href={`/admin/orders/${row.id}`}
          className="text-xs text-primary hover:underline"
        >
          View
        </Link>
      ),
    },
  ];

  return (
    <>
      <div className="hidden md:block">
        <div className="space-y-6">
          <PageHeader title="Orders" description={`${total} orders`} />

          <div className="flex flex-wrap gap-2">
            {STATUS_FILTERS.map((s) => (
              <button
                key={s.value}
                onClick={() => {
                  setStatus(s.value);
                  setPage(1);
                }}
                className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-colors ${
                  status === s.value
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border hover:bg-muted"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            <Input
              placeholder="Search orders..."
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              className="max-w-sm"
            />
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-sm text-destructive">
              {error}
              <button
                onClick={fetchOrders}
                className="ml-2 underline hover:no-underline"
              >
                Retry
              </button>
            </div>
          )}

          {loading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-14 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : (
            <>
              <DataTable columns={columns} data={items} empty="No orders found" />
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </>
          )}
        </div>
      </div>

      {/* Mobile UI */}
      <div className="block md:hidden pb-24 min-h-screen bg-slate-950 text-slate-200">
        <MobileHeader title="Orders" showMenu={true} />
        
        <div className="p-4 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-semibold text-lg">{total} Orders</h2>
          </div>
          
          <Input
            placeholder="Search orders..."
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            className="bg-slate-900 border-slate-800 text-slate-200 focus:ring-accent focus:border-accent w-full rounded-custom"
          />

          <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
            {STATUS_FILTERS.map((s) => (
              <button
                key={s.value}
                onClick={() => {
                  setStatus(s.value);
                  setPage(1);
                }}
                className={`whitespace-nowrap px-3 py-1.5 rounded-full text-[11px] font-bold transition-colors ${
                  status === s.value
                    ? "bg-accent text-white"
                    : "bg-slate-900 border border-slate-800 text-slate-400"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-custom p-4 text-sm text-red-400">
              {error}
              <button onClick={fetchOrders} className="ml-2 underline hover:no-underline">Retry</button>
            </div>
          )}

          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-28 bg-slate-900 animate-pulse rounded-custom" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-sm">No orders found</div>
          ) : (
            <div className="space-y-3">
              {items.map((row) => (
                <Link 
                  key={row.id} 
                  href={`/admin/orders/${row.id}`}
                  className="block bg-slate-900 border border-slate-800 rounded-custom p-3 flex flex-col gap-2 hover:border-slate-700 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-sm text-white">{row.orderNumber}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">{row.user?.name || "Unknown Customer"}</p>
                    </div>
                    <StatusBadge status={row.status} />
                  </div>
                  <div className="flex justify-between items-end mt-1">
                    <div className="text-xs text-slate-400">
                      <div className="flex items-center gap-1 mt-0.5"><Icon name="calendar" size={12}/> {formatDate(row.createdAt)}</div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black text-emerald-400">{formatMoney(row.grandTotal)}</span>
                    </div>
                  </div>
                </Link>
              ))}
              {totalPages > 1 && (
                <div className="flex justify-between items-center pt-4">
                  <Button 
                    onClick={() => setPage(p => Math.max(1, p - 1))} 
                    disabled={page === 1}
                    className="bg-slate-900 border-slate-800 text-slate-300"
                    variant="outline"
                  >
                    Prev
                  </Button>
                  <span className="text-xs text-slate-400">Page {page} of {totalPages}</span>
                  <Button 
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
                    disabled={page === totalPages}
                    className="bg-slate-900 border-slate-800 text-slate-300"
                    variant="outline"
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
        <MobileFooter />
      </div>
    </>
  );
}
