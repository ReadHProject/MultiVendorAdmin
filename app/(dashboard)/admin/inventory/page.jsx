"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/admin/status-badge";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";
import { Pagination } from "@/components/ui/pagination";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { MobileFooter, MobileHeader } from "@/components/admin/mobile/mobile-layout";
import { Icon } from "@/components/ui/icon";
import { Plus } from "lucide-react";

export default function InventoryPage() {
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [data, setData] = useState(null);
  const [warehouses, setWarehouses] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddStock, setShowAddStock] = useState(false);
  const [addForm, setAddForm] = useState({
    productId: "",
    variantId: "",
    warehouseId: "",
    quantity: "",
    batchNumber: "",
    reorderLevel: "",
  });
  const [adding, setAdding] = useState(false);

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(page) });
      if (q) params.set("q", q);
      if (warehouseId) params.set("warehouseId", warehouseId);
      const res = await api.get(`/inventory?${params.toString()}`);
      setData(res);
    } catch (err) {
      setError(err.message || "Failed to load inventory");
    } finally {
      setLoading(false);
    }
  }, [page, q, warehouseId]);

  const fetchWarehouses = useCallback(async () => {
    try {
      const res = await api.get("/warehouses");
      setWarehouses(Array.isArray(res) ? res : res?.items || []);
    } catch {}
  }, []);

  const fetchAlerts = useCallback(async () => {
    try {
      const res = await api.get("/inventory/alerts");
      setAlerts(Array.isArray(res) ? res : res?.items || []);
    } catch {}
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  useEffect(() => {
    fetchWarehouses();
    fetchAlerts();
  }, [fetchWarehouses, fetchAlerts]);

  const items = data?.items || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / 20);

  async function handleAddStock(e) {
    e.preventDefault();
    setAdding(true);
    try {
      await api.post("/inventory", {
        ...addForm,
        quantity: addForm.quantity ? Number(addForm.quantity) : undefined,
        reorderLevel: addForm.reorderLevel
          ? Number(addForm.reorderLevel)
          : undefined,
      });
      setShowAddStock(false);
      setAddForm({
        productId: "",
        variantId: "",
        warehouseId: "",
        quantity: "",
        batchNumber: "",
        reorderLevel: "",
      });
      fetchInventory();
    } catch (err) {
      alert(err.message || "Failed to add stock");
    } finally {
      setAdding(false);
    }
  }

  const columns = [
    {
      header: "Product",
      cell: (row) => (
        <span className="text-xs font-medium">
          {row.product?.name || "---"}
        </span>
      ),
    },
    {
      header: "Warehouse",
      cell: (row) => (
        <span className="text-xs">{row.warehouse?.name || "---"}</span>
      ),
    },
    {
      header: "Batch",
      cell: (row) => (
        <span className="text-xs text-muted-foreground">
          {row.batchNumber || "---"}
        </span>
      ),
    },
    {
      header: "Quantity",
      className: "text-right",
      cell: (row) => (
        <span
          className={`text-xs font-black ${
            row.quantity <= row.reorderLevel
              ? "text-destructive"
              : "text-foreground"
          }`}
        >
          {row.quantity}
        </span>
      ),
    },
    {
      header: "Reorder Level",
      className: "text-right",
      cell: (row) => (
        <span className="text-xs text-muted-foreground">
          {row.reorderLevel}
        </span>
      ),
    },
    {
      header: "Status",
      cell: (row) => {
        const status =
          row.quantity <= 0
            ? "OUT_OF_STOCK"
            : row.quantity <= row.reorderLevel
            ? "LOW_STOCK"
            : "IN_STOCK";
        return <StatusBadge status={status} />;
      },
    },
  ];

  return (
    <>
      <div className="hidden md:block">
        <div className="space-y-6">
      <PageHeader
        title="Inventory"
        description={`${total} stock records`}
        actions={
          <Button onClick={() => setShowAddStock(true)}>
            <span className="text-lg leading-none mr-1">+</span> Add Stock
          </Button>
        }
      />

      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Search products..."
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(1);
          }}
          className="max-w-sm"
        />
        <select
          className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
          value={warehouseId}
          onChange={(e) => {
            setWarehouseId(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All Warehouses</option>
          {warehouses.map((w) => (
            <option key={w.id} value={w.id}>
              {w.name}
            </option>
          ))}
        </select>
      </div>

      {alerts.length > 0 && (
        <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4">
          <h3 className="text-xs font-black text-destructive uppercase tracking-tight mb-2">
            Low Stock Alerts ({alerts.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {alerts.slice(0, 5).map((a) => (
              <span
                key={a.id}
                className="px-2 py-1 bg-destructive/10 rounded text-[10px] font-bold text-destructive"
              >
                Product #{a.productId}: {a.currentQty} left (reorder:{" "}
                {a.reorderLevel})
              </span>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-sm text-destructive">
          {error}
          <button
            onClick={fetchInventory}
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
          <DataTable
            columns={columns}
            data={items}
            empty="No inventory records"
          />
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
      </div>
      </div>

      {/* Mobile UI */}
      <div className="block md:hidden pb-24 min-h-screen bg-slate-950 text-slate-200">
        <MobileHeader title="Inventory" showMenu={true} />
        
        <div className="p-4 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-semibold text-lg">{total} Records</h2>
            <Button onClick={() => setShowAddStock(true)} className="bg-accent hover:bg-accent/90 text-white h-9 px-4 text-xs font-semibold rounded-custom shadow-lg shadow-accent/20">
              <Plus className="h-4 w-4 mr-1" /> Add Stock
            </Button>
          </div>
          
          <div className="flex flex-col gap-2">
             <Input
               placeholder="Search products..."
               value={q}
               onChange={(e) => {
                 setQ(e.target.value);
                 setPage(1);
               }}
               className="bg-slate-900 border-slate-800 text-slate-200 focus:ring-accent focus:border-accent w-full rounded-custom"
             />
             <select
               className="h-10 rounded-custom border border-slate-800 bg-slate-900 px-3 text-sm focus:border-accent focus:ring-accent"
               value={warehouseId}
               onChange={(e) => {
                 setWarehouseId(e.target.value);
                 setPage(1);
               }}
             >
               <option value="">All Warehouses</option>
               {warehouses.map((w) => (
                 <option key={w.id} value={w.id}>
                   {w.name}
                 </option>
               ))}
             </select>
          </div>

          {alerts.length > 0 && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-custom p-4">
              <h3 className="text-xs font-black text-red-400 uppercase tracking-tight mb-3">
                Low Stock Alerts ({alerts.length})
              </h3>
              <div className="flex flex-col gap-2">
                {alerts.slice(0, 5).map((a) => (
                  <div
                    key={a.id}
                    className="flex justify-between items-center py-2 px-3 bg-red-500/10 rounded-custom border border-red-500/20"
                  >
                    <span className="text-xs font-bold text-red-400">Product #{a.productId}</span>
                    <span className="text-xs text-red-400">{a.currentQty} left (min: {a.reorderLevel})</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-custom p-4 text-sm text-red-400">
              {error}
              <button onClick={fetchInventory} className="ml-2 underline hover:no-underline">Retry</button>
            </div>
          )}

          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-28 bg-slate-900 animate-pulse rounded-custom" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-sm">No inventory found</div>
          ) : (
            <div className="space-y-3">
              {items.map((row) => {
                const status = row.quantity <= 0 ? "OUT_OF_STOCK" : row.quantity <= row.reorderLevel ? "LOW_STOCK" : "IN_STOCK";
                const isLow = status !== "IN_STOCK";
                return (
                  <div 
                    key={row.id} 
                    className={`block bg-slate-900 border ${isLow ? 'border-red-500/30' : 'border-slate-800'} rounded-custom p-4 flex flex-col gap-3`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-sm text-white">{row.product?.name || "Unknown"}</h4>
                        <p className="text-xs text-slate-400 mt-1">{row.warehouse?.name || "No Warehouse"}</p>
                      </div>
                      <StatusBadge status={status} />
                    </div>
                    
                    <div className="flex justify-between items-center pt-3 border-t border-slate-800/50">
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-0.5">Quantity</p>
                        <p className={`text-lg font-black ${isLow ? 'text-red-400' : 'text-emerald-400'}`}>
                          {row.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-0.5">Reorder Lvl</p>
                        <p className="text-sm font-bold text-slate-300">
                          {row.reorderLevel}
                        </p>
                      </div>
                    </div>
                    {row.batchNumber && (
                      <div className="text-[10px] text-slate-500 mt-1 text-right">
                         Batch: {row.batchNumber}
                      </div>
                    )}
                  </div>
                );
              })}
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

      <Dialog controlledOpen={showAddStock} onOpenChange={setShowAddStock}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Stock</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddStock} className="space-y-3">
            <Input
              placeholder="Product ID *"
              required
              value={addForm.productId}
              onChange={(e) =>
                setAddForm({ ...addForm, productId: e.target.value })
              }
            />
            <Input
              placeholder="Variant ID"
              value={addForm.variantId}
              onChange={(e) =>
                setAddForm({ ...addForm, variantId: e.target.value })
              }
            />
            <select
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
              required
              value={addForm.warehouseId}
              onChange={(e) =>
                setAddForm({ ...addForm, warehouseId: e.target.value })
              }
            >
              <option value="">Select Warehouse *</option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
            <Input
              placeholder="Quantity *"
              type="number"
              required
              value={addForm.quantity}
              onChange={(e) =>
                setAddForm({ ...addForm, quantity: e.target.value })
              }
            />
            <Input
              placeholder="Batch Number"
              value={addForm.batchNumber}
              onChange={(e) =>
                setAddForm({ ...addForm, batchNumber: e.target.value })
              }
            />
            <Input
              placeholder="Reorder Level"
              type="number"
              value={addForm.reorderLevel}
              onChange={(e) =>
                setAddForm({ ...addForm, reorderLevel: e.target.value })
              }
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddStock(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={adding}>
                {adding ? "Adding..." : "Add Stock"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
