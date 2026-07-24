"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/admin/status-badge";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";
import { Pagination } from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import { Plus, MoreVertical } from "lucide-react";
import { MobileFooter, MobileHeader } from "@/components/admin/mobile/mobile-layout";
import { toast } from "sonner";

export default function PurchaseOrdersPage() {
  const router = useRouter();
  
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  
  // Pagination & Filters
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({
    supplierInvoiceNo: "",
    supplierName: "",
    status: "",
    dateFrom: "",
    dateTo: "",
    pageSize: 10
  });

  const statuses = ["", "DRAFT", "SUBMITTED", "APPROVED", "ORDERED", "PARTIAL_RECEIVED", "RECEIVED", "CANCELLED"];

  const fetchPOs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(page) });
      if (filters.status) params.append("status", filters.status);
      if (filters.supplierInvoiceNo) params.append("invoiceNo", filters.supplierInvoiceNo);
      if (filters.supplierName) params.append("supplier", filters.supplierName);
      if (filters.dateFrom) params.append("dateFrom", filters.dateFrom);
      if (filters.dateTo) params.append("dateTo", filters.dateTo);
      params.append("pageSize", filters.pageSize);

      const [res, supRes] = await Promise.all([
        api.get(`/purchase-orders?${params.toString()}`),
        api.get(`/suppliers`)
      ]);
      setItems(res?.items || res || []);
      setTotal(res?.total || 0);
      setSuppliers(supRes?.items || supRes || []);
    } catch (err) {
      setError(err.message || "Failed to load purchase orders");
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => {
    fetchPOs();
  }, [page]); // we only auto-fetch on page change, or initial load. Filters require manual 'Search' button click.

  function handleSearch() {
    setPage(1);
    fetchPOs();
  }

  function handleReset() {
    setFilters({
      supplierInvoiceNo: "",
      supplierName: "",
      status: "",
      dateFrom: "",
      dateTo: "",
      pageSize: 10
    });
    setPage(1);
    // State updates are async, so we just let the user click search after reset or we can fetch immediately
    setTimeout(() => {
      fetchPOs();
    }, 100);
  }

  const totalPages = Math.ceil(total / filters.pageSize);

  const columns = [
    {
      header: "PO NO",
      cell: (item) => (
        <button
          onClick={() => router.push(`/admin/purchase-orders/${item.id}`)}
          className="text-xs font-bold text-primary hover:underline"
        >
          {item.poNumber}
        </button>
      ),
    },
    {
      header: "SUPPLIER INVOICE NO",
      cell: (item) => (
        <span className="text-xs">{item.supplierInvoiceNumber || "---"}</span>
      ),
    },
    {
      header: "SUPPLIER DATE",
      cell: (item) => (
        <span className="text-xs text-muted-foreground">
          {item.supplierInvoiceDate ? new Date(item.supplierInvoiceDate).toLocaleDateString() : "---"}
        </span>
      ),
    },
    {
      header: "SUPPLIER",
      cell: (item) => (
        <span className="text-xs font-medium">
          {item.supplier?.companyName || "---"}
        </span>
      ),
    },
    {
      header: "CREATED TIME",
      cell: (item) => (
        <span className="text-xs text-muted-foreground">
          {item.createdAt ? new Date(item.createdAt).toLocaleString() : "---"}
        </span>
      ),
    },
    {
      header: "PRE GST AMT",
      className: "text-right",
      cell: (item) => (
        <span className="text-xs">₹{item.subtotal || 0}</span>
      ),
    },
    {
      header: "AFTER GST (TOTAL)",
      className: "text-right",
      cell: (item) => (
        <span className="text-xs font-medium">₹{item.grandTotal || 0}</span>
      ),
    },
    {
      header: "EXTRA MARGIN",
      className: "text-right",
      cell: (item) => (
        <span className="text-xs">
          {item.extraMargin || 0} {item.marginType === 'PERCENTAGE' ? '%' : '₹'}
        </span>
      ),
    },
    {
      header: "AFTER MARGIN TOTAL",
      className: "text-right",
      cell: (item) => (
        <span className="text-xs font-bold text-emerald-600">
          ₹{item.payableAmount || item.grandTotal || 0}
        </span>
      ),
    },
    {
      header: "ACTUAL QTY",
      className: "text-center",
      cell: (item) => {
        const qty = item.items?.reduce((sum, i) => sum + (i.actualQty || i.quantity || 0), 0) || 0;
        return <span className="text-xs">{qty}</span>;
      }
    },
    {
      header: "BILLED QTY",
      className: "text-center",
      cell: (item) => {
        const qty = item.items?.reduce((sum, i) => sum + (i.billedQty || i.quantity || 0), 0) || 0;
        return <span className="text-xs">{qty}</span>;
      }
    },
    {
      header: "STATUS",
      cell: (item) => <StatusBadge status={item.status} />,
    },
    {
      header: "ACTIONS",
      className: "text-center",
      cell: (item) => (
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => router.push(`/admin/purchase-orders/${item.id}`)}>
          <MoreVertical className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <>
      {/* Desktop UI */}
      <div className="space-y-6 hidden md:block">
        <PageHeader
          title="Manage Purchases"
          description={`${total} Purchase Orders`}
          actions={
            <Button onClick={() => router.push('/admin/purchase-orders/new')} className="bg-rose-600 hover:bg-rose-700 text-white rounded-lg">
              <Plus className="h-4 w-4 mr-1" /> Create Purchase Order
            </Button>
          }
        />

        <div className="bg-card p-4 rounded-xl shadow-sm border border-border space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Supplier Invoice No</label>
              <Input 
                placeholder="Invoice No"
                value={filters.supplierInvoiceNo}
                onChange={e => setFilters({...filters, supplierInvoiceNo: e.target.value})}
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Supplier Name</label>
              <select 
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={filters.supplierName}
                onChange={e => setFilters({...filters, supplierName: e.target.value})}
              >
                <option value="" className="bg-background">All Suppliers</option>
                {suppliers.map(s => <option key={s.id} value={s.id} className="bg-background">{s.companyName}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">All Status</label>
              <select 
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={filters.status}
                onChange={e => setFilters({...filters, status: e.target.value})}
              >
                <option value="">All Status</option>
                {statuses.filter(Boolean).map(s => <option key={s} value={s} className="bg-background">{s}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Supplier Date From</label>
              <Input 
                type="date"
                value={filters.dateFrom}
                onChange={e => setFilters({...filters, dateFrom: e.target.value})}
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Supplier Date To</label>
              <Input 
                type="date"
                value={filters.dateTo}
                onChange={e => setFilters({...filters, dateTo: e.target.value})}
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Page Size</label>
              <select 
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={filters.pageSize}
                onChange={e => setFilters({...filters, pageSize: Number(e.target.value)})}
              >
                <option value={10} className="bg-background">10 / page</option>
                <option value={20} className="bg-background">20 / page</option>
                <option value={50} className="bg-background">50 / page</option>
              </select>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={handleSearch} className="bg-blue-600 hover:bg-blue-700 text-white h-9">
              Search
            </Button>
            <Button variant="outline" onClick={handleReset} className="h-9">
              Reset
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-sm text-destructive">
            {error}
            <button onClick={fetchPOs} className="ml-2 underline hover:no-underline">Retry</button>
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
            <DataTable columns={columns} data={items} empty="No purchase orders found" />
            <Pagination page={page} totalPages={totalPages || 1} onPageChange={setPage} />
          </>
        )}
      </div>

      {/* Mobile UI */}
      <div className="block md:hidden pb-24 min-h-screen bg-slate-950 text-slate-200">
        <MobileHeader title="Manage Purchases" showMenu={true} />
        
        <div className="p-4 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-semibold text-lg">{total} Orders</h2>
            <Button onClick={() => router.push('/admin/purchase-orders/new')} className="bg-rose-600 hover:bg-rose-700 text-white h-9 px-4 text-xs font-semibold rounded-custom shadow-lg shadow-rose-600/20">
              <Plus className="h-4 w-4 mr-1" /> New
            </Button>
          </div>
          
          <Input
            placeholder="Search invoice no..."
            value={filters.supplierInvoiceNo}
            onChange={(e) => setFilters({...filters, supplierInvoiceNo: e.target.value})}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="bg-slate-900 border-slate-800 text-slate-200 focus:ring-rose-500 focus:border-rose-500 w-full rounded-custom"
          />

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-custom p-4 text-sm text-red-400">
              {error}
              <button onClick={fetchPOs} className="ml-2 underline hover:no-underline">Retry</button>
            </div>
          )}

          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-24 bg-slate-900 animate-pulse rounded-custom" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-sm">No purchase orders found</div>
          ) : (
            <div className="space-y-3">
              {items.map((row) => (
                <div 
                  key={row.id} 
                  onClick={() => router.push(`/admin/purchase-orders/${row.id}`)} 
                  className="bg-slate-900 border border-slate-800 rounded-custom p-3 flex gap-3 cursor-pointer hover:border-slate-700 transition-colors flex-col"
                >
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium text-sm text-white">{row.poNumber}</h4>
                    <StatusBadge status={row.status} />
                  </div>
                  <div className="text-xs text-slate-400 mt-1 flex justify-between items-center">
                    <span>{row.supplier?.companyName || "Unknown Supplier"}</span>
                    <span className="font-bold text-emerald-400 text-sm">
                      ₹{row.payableAmount || row.grandTotal || 0}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 flex justify-between mt-1">
                    <span>Inv: {row.supplierInvoiceNumber || "N/A"}</span>
                    <span>{row.createdAt ? new Date(row.createdAt).toLocaleDateString() : ""}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {totalPages > 1 && (
            <div className="pt-4 pb-2 border-t border-slate-800 flex justify-between items-center">
              <button 
                disabled={page === 1} 
                onClick={() => setPage(p => p - 1)}
                className="text-xs font-medium text-slate-400 disabled:opacity-50 px-3 py-1"
              >
                Prev
              </button>
              <span className="text-xs text-slate-500">Page {page} of {totalPages}</span>
              <button 
                disabled={page === totalPages} 
                onClick={() => setPage(p => p + 1)}
                className="text-xs font-medium text-rose-500 disabled:opacity-50 px-3 py-1"
              >
                Next
              </button>
            </div>
          )}
        </div>

        <MobileFooter />
      </div>
    </>
  );
}
