"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { formatMoney, formatDate, cn } from "@/lib/utils";
import { toast } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/admin/status-badge";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";
import { Pagination } from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ProductFormModal from "@/components/admin/product-form-modal";
import { DropdownWithCreate } from "@/components/admin/dropdown-with-create";
import { useGetSuppliersQuery, useCreateSupplierMutation } from "@/store/api/slices/suppliersApi";
import { useRouter } from "next/navigation";
import { MobileFooter, MobileHeader } from "@/components/admin/mobile/mobile-layout";
import { resolveImageUrl } from "@/components/admin/image-uploader";
export default function ProductsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [receivingProducts, setReceivingProducts] = useState([]);

  const { data: suppliersData } = useGetSuppliersQuery({ pageSize: 100 });
  const [createSupplier] = useCreateSupplierMutation();

  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [receiveForm, setReceiveForm] = useState({
    supplier: "",
    overrideCost: "",
    overrideMrp: "",
    quantity: "10",
    notes: ""
  });
  const [submittingReceive, setSubmittingReceive] = useState(false);

  const [expandedProductId, setExpandedProductId] = useState(null);

  const toggleSelection = (id) => {
    setSelectedProducts(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const toggleAll = (checked) => {
    if (checked && data?.items) {
      setSelectedProducts(data.items.map(item => item.id));
    } else {
      setSelectedProducts([]);
    }
  };

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(page) });
      params.set("status", "ACTIVE");
      if (q) params.set("q", q);
      const res = await api.get(`/products?${params.toString()}`);
      setData(res);
    } catch (err) {
      setError(err.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [page, q]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleReceiveStock = async (form, productIds) => {
    setSubmittingReceive(true);
    try {
      // 1. Get warehouse ID
      let warehouseId = "";
      const whRes = await api.get("/warehouses");
      const whList = Array.isArray(whRes) ? whRes : whRes?.items || [];
      if (whList.length > 0) warehouseId = whList[0].id;
      if (!warehouseId) throw new Error("No warehouse found");

      // 2. Create Purchase Order
      const poItems = productIds.map(pid => {
        const product = data?.items?.find(p => p.id === pid) || {};
        return {
          productId: pid,
          quantity: Number(form.quantity),
          unitCost: Number(form.costPrice || form.overrideCost || product.preGst || 0),
          preGstRate: Number(form.costPrice || form.overrideCost || product.preGst || 0),
          gstPercent: Number(form.gst || product.taxRate || 0),
          discountPercent: Number(form.discount || 0),
        }
      });

      const poRes = await api.post("/purchase-orders", {
        supplierId: form.supplier,
        warehouseId,
        status: "SUBMITTED",
        items: poItems,
        notes: form.notes
      });
      const poId = poRes.data?.id || poRes.id;

      // 3. Approve PO
      await api.patch(`/purchase-orders/${poId}/approve`);

      // 4. Receive PO
      await api.post(`/purchase-orders/${poId}/receive`, {
        items: poItems.map(it => ({
          purchaseOrderId: poId,
          productId: it.productId,
          warehouseId,
          quantity: it.quantity
        }))
      });

      setShowReceiveModal(false);
      setExpandedProductId(null);
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to receive stock");
    } finally {
      setSubmittingReceive(false);
    }
  };

  const handleDeleteSelected = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedProducts.length} products?`)) return;
    
    try {
      await Promise.all(selectedProducts.map(id => api.delete(`/products/${id}`)));
      setSelectedProducts([]);
      fetchProducts();
      toast.success(`${selectedProducts.length} product(s) deleted successfully`);
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to delete products");
    }
  };

  const items = data?.items || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / 20);

  const columns = [
    {
      header: (
        <input
          type="checkbox"
          onChange={(e) => toggleAll(e.target.checked)}
          checked={data?.items?.length > 0 && selectedProducts.length === data.items.length}
          className="rounded border-slate-300"
        />
      ),
      className: "w-10",
      cell: (row) => (
        <input
          type="checkbox"
          checked={selectedProducts.includes(row.id)}
          onChange={() => toggleSelection(row.id)}
          className="rounded border-slate-300"
        />
      ),
    },
    {
      header: "PRODUCT NAME",
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded bg-muted flex items-center justify-center shrink-0">
            {(row.image || row.images?.[0]) ? (
              <img
                src={resolveImageUrl(row.image || row.images?.[0])}
                alt=""
                className="h-full w-full object-cover rounded"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement.innerHTML = '<span class="text-muted-foreground text-sm">📦</span>';
                }}
              />
            ) : (
              <span className="text-muted-foreground text-sm">📦</span>
            )}
          </div>
          <div>
            <button
              onClick={() => setEditProduct(row)}
              className="font-black text-slate-800 hover:underline text-xs text-left leading-tight"
            >
              {row.name}
            </button>
            <div className="text-[10px] text-muted-foreground mt-1 font-medium">
              Stock: {row.initialStock || 0} • {row.variants?.[0]?.sku || "---"}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: "BARCODE",
      cell: (row) => <span className="text-xs text-muted-foreground">{row.barcode || row.variants?.[0]?.barcode || "---"}</span>,
    },
    {
      header: "BRAND",
      cell: (row) => <span className="text-xs text-muted-foreground">{row.brand?.name || "---"}</span>,
    },
    {
      header: "CATEGORY",
      cell: (row) => <span className="text-xs text-muted-foreground">{row.category?.name || "---"}</span>,
    },
    {
      header: "PRE-GST",
      cell: (row) => <span className="text-xs text-muted-foreground">{formatMoney(row.preGst || 0)}</span>,
    },
    {
      header: "DEALER",
      cell: (row) => {
        const rp = row.rolePrices?.find(rp => rp.role?.name?.toUpperCase() === "DEALER");
        return <span className="text-xs text-muted-foreground">{formatMoney(rp?.price ?? row.dealerPrice ?? 0)}</span>;
      }
    },
    {
      header: "WHOLESALER",
      cell: (row) => {
        const rp = row.rolePrices?.find(rp => rp.role?.name?.toUpperCase() === "WHOLESALER");
        return <span className="text-xs text-muted-foreground">{formatMoney(rp?.price ?? row.wholesalerPrice ?? 0)}</span>;
      }
    },
    {
      header: "PARLOUR",
      cell: (row) => {
        const rp = row.rolePrices?.find(rp => rp.role?.name?.toUpperCase() === "PARLOUR");
        return <span className="text-xs text-muted-foreground">{formatMoney(rp?.price ?? row.parlourPrice ?? 0)}</span>;
      }
    },
    {
      header: "RETAILER",
      cell: (row) => {
        const rp = row.rolePrices?.find(rp => rp.role?.name?.toUpperCase() === "RETAILER");
        return <span className="text-xs text-muted-foreground">{formatMoney(rp?.price ?? row.retailPrice ?? 0)}</span>;
      }
    },
    {
      header: "GENERAL",
      cell: (row) => {
        const rp = row.rolePrices?.find(rp => rp.role?.name?.toUpperCase() === "GENERAL");
        return <span className="text-xs text-muted-foreground">{formatMoney(rp?.price ?? row.onlinePrice ?? 0)}</span>;
      }
    },
    {
      header: "MRP",
      cell: (row) => <span className="text-xs font-black">{formatMoney(row.mrp || 0)}</span>,
    },
    {
      header: "ACTIONS",
      className: "text-right",
      cell: (row) => (
        <div className="flex gap-2 justify-end items-center">
          <Button
            size="sm"
            variant="outline"
            className={cn("h-7 text-xs border-none font-semibold px-3", expandedProductId === row.id ? "bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600" : "bg-slate-100 hover:bg-slate-200 text-slate-800")}
            onClick={() => {
              if (expandedProductId === row.id) {
                setExpandedProductId(null);
              } else {
                setExpandedProductId(row.id);
              }
            }}
          >
            {expandedProductId === row.id ? "Close Form" : "Receive Stock"}
          </Button>
          {/* <button className="text-red-500 hover:text-red-700 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button> */}
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="space-y-6 hidden md:block">
        <PageHeader
          title="Products Management"
          description={`${total} products`}
          actions={
            <div className="flex gap-3">
              <Button variant="outline" className="font-bold border-slate-200 text-slate-700 hover:bg-slate-50" onClick={() => setShowHistoryModal(true)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                View Receipt History
              </Button>
              <Button variant="outline" className="font-bold border-slate-200 text-slate-700 hover:bg-slate-50">
                Manage Brands
              </Button>
              <Button onClick={() => setShowCreate(true)} className="bg-[#E53935] hover:bg-[#D32F2F] text-white font-bold rounded-lg shadow-sm">
                <Plus className="h-4 w-4 mr-1" /> Add Product
              </Button>
            </div>
          }
        />

        <div className="flex gap-3">
          <Input
            placeholder="Search products..."
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
              onClick={fetchProducts}
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
              empty="No products found"
              renderExpandedRow={(row) =>
                expandedProductId === row.id ? (
                  <InlineReceiveForm
                    product={row}
                    suppliersData={suppliersData}
                    createSupplier={createSupplier}
                    onClose={() => setExpandedProductId(null)}
                    onSubmit={(form) => handleReceiveStock(form, [row.id])}
                    submitting={submittingReceive}
                  />
                ) : null
              }
            />
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}

        {/* Create Product Modal */}
        <ProductFormModal
          open={showCreate}
          onOpenChange={setShowCreate}
          onCreated={() => {
            fetchProducts();
          }}
        />

        {/* Edit Product Modal */}
        <ProductFormModal
          open={!!editProduct}
          onOpenChange={(open) => {
            if (!open) setEditProduct(null);
          }}
          editProduct={editProduct}
          onCreated={() => {
            setEditProduct(null);
            fetchProducts();
          }}
        />

        {/* Floating Action Bar */}
        {selectedProducts.length > 0 && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#1A1F2C] text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-4 z-40 border border-slate-700/50">
            <div className="flex items-center gap-2 pr-4 border-r border-slate-700">
              <div className="w-5 h-5 rounded flex items-center justify-center bg-red-500/20 text-red-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </div>
              <span className="font-medium text-sm">{selectedProducts.length} Items selected</span>
            </div>

            <Button
              className="bg-[#E53935] hover:bg-[#D32F2F] text-white font-medium"
              onClick={() => {
                setReceivingProducts(selectedProducts);
                setShowReceiveModal(true);
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              Receive Inventory
            </Button>

            {selectedProducts.length === 1 && (
              <Button
                variant="ghost"
                className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/10"
                onClick={() => {
                  const productToEdit = data?.items?.find(p => p.id === selectedProducts[0]);
                  if (productToEdit) setEditProduct(productToEdit);
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                Edit
              </Button>
            )}

            <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-white/10">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
              Print Barcodes
            </Button>

            <Button variant="ghost" className="text-red-400 hover:text-red-300 hover:bg-red-400/10" onClick={handleDeleteSelected}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              Delete
            </Button>

            <Button variant="ghost" className="text-slate-400 hover:text-white hover:bg-white/10 px-2" onClick={() => setSelectedProducts([])}>
              Clear
            </Button>
          </div>
        )}

        {/* Bulk Receive Inventory Modal */}
        <Dialog controlledOpen={showReceiveModal} onOpenChange={setShowReceiveModal}>
          <DialogContent className="max-w-xl overflow-hidden flex flex-col p-0 rounded-xl gap-0">
            <div className="flex items-center justify-between px-6 py-5 border-b bg-surface shrink-0">
              <h2 className="text-xl font-bold text-foreground">Bulk Receive Inventory</h2>
            </div>

            <div className="px-6 py-5 overflow-y-auto max-h-[70vh] bg-surface-bright">
              <div className="bg-destructive/5 text-destructive border border-destructive/20 rounded-lg p-3.5 text-sm mb-6 flex items-center">
                <span className="font-bold mr-1">{receivingProducts.length}</span> products selected for stock receipt.
              </div>

              <div className="space-y-5">
                <div>
                  <DropdownWithCreate
                    label="Supplier"
                    value={receiveForm.supplier}
                    onChange={(val) => setReceiveForm({ ...receiveForm, supplier: val })}
                    options={(suppliersData?.data?.items || []).map(s => ({ ...s, name: s.companyName }))}
                    placeholder="Select a supplier or create new..."
                    createMutation={createSupplier}
                    createLabel="Supplier"
                    createFields={[
                      { name: "companyName", label: "Supplier Name", type: "text", required: true },
                      { name: "contactName", label: "Contact Person", type: "text" },
                      { name: "phone", label: "Phone", type: "text" },
                    ]}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="text-sm font-semibold text-foreground mb-1.5 block">Override Cost (Optional)</label>
                    <Input
                      placeholder="Use existing product cost"
                      value={receiveForm.overrideCost}
                      onChange={e => setReceiveForm({ ...receiveForm, overrideCost: e.target.value })}
                      className="h-10 bg-background"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-foreground mb-1.5 block">Override MRP (Optional)</label>
                    <Input
                      placeholder="Use existing product MRP"
                      value={receiveForm.overrideMrp}
                      onChange={e => setReceiveForm({ ...receiveForm, overrideMrp: e.target.value })}
                      className="h-10 bg-background"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-foreground mb-1.5 block">
                    Quantity to Receive (per product) <span className="text-destructive">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <Input
                      className="w-24 h-10 bg-background"
                      value={receiveForm.quantity}
                      onChange={e => setReceiveForm({ ...receiveForm, quantity: e.target.value })}
                    />
                    <Button type="button" variant="outline" className="h-10 px-4 bg-background" onClick={() => setReceiveForm(p => ({ ...p, quantity: String(Number(p.quantity || 0) + 5) }))}>+5</Button>
                    <Button type="button" variant="outline" className="h-10 px-4 border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive bg-background" onClick={() => setReceiveForm(p => ({ ...p, quantity: String(Number(p.quantity || 0) + 10) }))}>+10</Button>
                    <Button type="button" variant="outline" className="h-10 px-4 bg-background" onClick={() => setReceiveForm(p => ({ ...p, quantity: String(Number(p.quantity || 0) + 50) }))}>+50</Button>
                    <Button type="button" variant="outline" className="h-10 px-4 bg-background" onClick={() => setReceiveForm(p => ({ ...p, quantity: String(Number(p.quantity || 0) + 100) }))}>+100</Button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-foreground mb-1.5 block">Notes</label>
                  <textarea
                    className="flex min-h-[90px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                    value={receiveForm.notes}
                    onChange={e => setReceiveForm({ ...receiveForm, notes: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t flex justify-between items-center bg-surface shrink-0">
              <Button variant="secondary" className="px-6 font-medium bg-muted hover:bg-muted/80 text-foreground" onClick={() => setShowReceiveModal(false)}>
                Cancel
              </Button>
              <div className="flex gap-3">
                <Button disabled={submittingReceive} onClick={() => handleReceiveStock(receiveForm, receivingProducts)} className="bg-[#E53935] hover:bg-[#D32F2F] text-white font-bold px-6">
                  {submittingReceive ? "Receiving..." : "Receive Only"}
                </Button>
                <Button disabled={submittingReceive} onClick={() => handleReceiveStock(receiveForm, receivingProducts)} className="bg-[#1A1F2C] hover:bg-[#0f121a] text-white font-bold px-5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                  Receive & Print
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <ReceiptHistoryModal open={showHistoryModal} onOpenChange={setShowHistoryModal} />
      </div>

      {/* Mobile UI */}
      <div className="block md:hidden pb-24 min-h-screen bg-slate-950 text-slate-200">
        <MobileHeader
          title="Products"
          showMenu={true}
        />

        <div className="p-4 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-semibold text-lg">{total} Products</h2>
            <Button onClick={() => router.push('/admin/products/new')} className="bg-accent hover:bg-accent/90 text-white h-9 px-4 text-xs font-semibold rounded-custom shadow-lg shadow-accent/20">
              <Plus className="h-4 w-4 mr-1" /> Add
            </Button>
          </div>

          <Input
            placeholder="Search products..."
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            className="bg-slate-900 border-slate-800 text-slate-200 focus:ring-accent focus:border-accent w-full rounded-custom"
          />

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-custom p-4 text-sm text-red-400">
              {error}
              <button onClick={fetchProducts} className="ml-2 underline hover:no-underline">Retry</button>
            </div>
          )}

          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-24 bg-slate-900 animate-pulse rounded-custom" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-sm">No products found</div>
          ) : (
            <div className="space-y-3">
              {items.map((row) => (
                <div
                  key={row.id}
                  onClick={() => router.push(`/admin/products/${row.id}`)}
                  className="bg-slate-900 border border-slate-800 rounded-custom p-3 flex gap-3 cursor-pointer hover:border-slate-700 transition-colors"
                >
                  <div className="h-16 w-16 rounded-custom bg-slate-800 overflow-hidden shrink-0 border border-slate-700">
                    {row.image || row.images?.[0] ? (
                      <img src={row.image || row.images?.[0]} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex items-center justify-center h-full w-full text-slate-500 text-xs">No img</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium text-sm truncate text-white">{row.name}</h4>
                      <span className="font-bold text-sm text-accent whitespace-nowrap ml-2">
                        {formatMoney(row.variants?.[0]?.price || 0)}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-1 flex justify-between">
                      <span>{row.category?.name || "Uncategorized"}</span>
                      <span>{row.variants?.[0]?.sku || ""}</span>
                    </div>
                    <div className="mt-2">
                      <StatusBadge status={row.status} />
                    </div>
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
                className="text-xs font-medium text-accent disabled:opacity-50 px-3 py-1"
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

function InlineReceiveForm({ product, suppliersData, createSupplier, onClose, onSubmit, submitting }) {
  const [form, setForm] = useState({
    supplier: "",
    quantity: "10",
    notes: "",
    mrp: product.mrp || 0,
    gst: product.taxRate || 18,
    discount: 0,
    costPrice: product.preGst || 0,
    purchasePrice: product.preGst || 0
  });

  return (
    <div className="p-5 border-t border-b border-slate-100 bg-white">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center text-[#E53935] font-bold text-sm tracking-wide gap-2 uppercase">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          Receive Inventory Stock Form
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div>
          <DropdownWithCreate
            label="SUPPLIER"
            required
            value={form.supplier}
            onChange={(val) => setForm({ ...form, supplier: val })}
            options={(suppliersData?.data?.items || []).map(s => ({ ...s, name: s.companyName }))}
            placeholder="Search supplier..."
            createMutation={createSupplier}
            createLabel="Supplier"
            createFields={[
              { name: "companyName", label: "Supplier Name", type: "text", required: true },
              { name: "contactName", label: "Contact Person", type: "text" },
              { name: "phone", label: "Phone", type: "text" },
            ]}
          />
          <p className="text-[10px] text-muted-foreground mt-1.5">If the supplier doesn't exist, type name and click "+ Create".</p>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-500 mb-2 block uppercase tracking-wider">
            Quantity to Receive <span className="text-destructive">*</span>
          </label>
          <div className="flex items-center gap-1.5">
            <Input
              className="w-20 h-9"
              value={form.quantity}
              onChange={e => setForm({ ...form, quantity: e.target.value })}
            />
            <Button type="button" variant="outline" size="sm" className="h-9 px-2 text-xs" onClick={() => setForm(p => ({ ...p, quantity: String(Number(p.quantity || 0) + 5) }))}>+5</Button>
            <Button type="button" variant="outline" size="sm" className="h-9 px-2 text-xs border-destructive text-destructive hover:bg-destructive/10" onClick={() => setForm(p => ({ ...p, quantity: String(Number(p.quantity || 0) + 10) }))}>+10</Button>
            <Button type="button" variant="outline" size="sm" className="h-9 px-2 text-xs" onClick={() => setForm(p => ({ ...p, quantity: String(Number(p.quantity || 0) + 50) }))}>+50</Button>
            <Button type="button" variant="outline" size="sm" className="h-9 px-2 text-xs" onClick={() => setForm(p => ({ ...p, quantity: String(Number(p.quantity || 0) + 100) }))}>+100</Button>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-500 mb-2 block uppercase tracking-wider">Notes</label>
          <Input
            className="h-9"
            placeholder="Optional notes about this stock receipt..."
            value={form.notes}
            onChange={e => setForm({ ...form, notes: e.target.value })}
          />
        </div>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 mb-6">
        <h4 className="text-xs font-bold text-slate-700 mb-4 uppercase tracking-wider">Cost Price Calculator</h4>
        <div className="grid grid-cols-5 gap-4">
          <div>
            <label className="text-[10px] font-semibold text-slate-500 mb-1.5 block uppercase">MRP Price *</label>
            <Input
              className="h-9 bg-white"
              value={form.mrp}
              onChange={e => setForm({ ...form, mrp: e.target.value })}
            />
          </div>
          <div>
            <label className="text-[10px] font-semibold text-slate-500 mb-1.5 block uppercase">GST %</label>
            <Input
              className="h-9 bg-white"
              value={form.gst}
              onChange={e => setForm({ ...form, gst: e.target.value })}
            />
          </div>
          <div>
            <label className="text-[10px] font-semibold text-slate-500 mb-1.5 block uppercase">Discount %</label>
            <Input
              className="h-9 bg-white"
              value={form.discount}
              onChange={e => setForm({ ...form, discount: e.target.value })}
            />
          </div>
          <div>
            <label className="text-[10px] font-semibold text-slate-500 mb-1.5 block uppercase">Cost Price *</label>
            <Input
              className="h-9 bg-white"
              value={form.costPrice}
              onChange={e => setForm({ ...form, costPrice: e.target.value })}
            />
          </div>
          <div>
            <label className="text-[10px] font-semibold text-slate-500 mb-1.5 block uppercase">Purchase Price</label>
            <Input
              className="h-9 bg-white"
              value={form.purchasePrice}
              onChange={e => setForm({ ...form, purchasePrice: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="secondary" className="px-6 font-medium bg-slate-100 hover:bg-slate-200 text-slate-700" onClick={onClose}>
          Cancel
        </Button>
        <Button disabled={submitting} onClick={() => onSubmit(form)} className="bg-[#E53935] hover:bg-[#D32F2F] text-white font-bold px-6">
          {submitting ? "Receiving..." : "Receive Only"}
        </Button>
        <Button disabled={submitting} onClick={() => onSubmit(form)} className="bg-[#1A1F2C] hover:bg-[#0f121a] text-white font-bold px-5">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
          Receive & Print
        </Button>
      </div>
    </div>
  );
}

function ReceiptHistoryModal({ open, onOpenChange }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open) {
      setLoading(true);
      api.get("/purchase-orders?status=RECEIVED")
        .then(res => setHistory(res.data?.items || []))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [open]);

  return (
    <Dialog controlledOpen={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[900px] p-0 rounded-xl overflow-hidden gap-0">
        <div className="flex items-center justify-between px-6 py-5 border-b bg-surface shrink-0">
          <div className="flex items-center text-[#E53935] font-bold text-base tracking-wide gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            Inventory Receipt History
          </div>
        </div>
        <div className="p-6 overflow-y-auto max-h-[60vh] bg-surface-bright">
          <table className="w-full text-sm">
            <thead className="border-b">
              <tr>
                <th className="h-10 text-left font-medium text-slate-500 uppercase text-[10px]">DATE & TIME</th>
                <th className="h-10 text-left font-medium text-slate-500 uppercase text-[10px]">PO NUMBER</th>
                <th className="h-10 text-left font-medium text-slate-500 uppercase text-[10px]">SUPPLIER</th>
                <th className="h-10 text-left font-medium text-slate-500 uppercase text-[10px]">RECEIVED ITEMS</th>
                <th className="h-10 text-right font-medium text-slate-500 uppercase text-[10px]">COST PRICE</th>
                <th className="h-10 text-right font-medium text-slate-500 uppercase text-[10px]">TOTAL QTY</th>
                <th className="h-10 text-right font-medium text-slate-500 uppercase text-[10px]">TOTAL AMOUNT</th>
                <th className="h-10 text-right font-medium text-slate-500 uppercase text-[10px]">STATUS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="8" className="p-4 text-center text-muted-foreground">Loading...</td></tr>
              ) : history.length === 0 ? (
                <tr><td colSpan="8" className="p-4 text-center text-muted-foreground">No receipt history</td></tr>
              ) : (
                history.map(po => {
                  const totalQty = po.items?.reduce((s, i) => s + i.quantity, 0) || 0;
                  const costPrice = totalQty > 0 ? po.grandTotal / totalQty : 0;
                  return (
                    <tr key={po.id} className="border-b last:border-0 hover:bg-slate-50">
                      <td className="p-3 text-xs">{new Date(po.createdAt).toLocaleString(undefined, { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' })}</td>
                      <td className="p-3 text-xs font-bold">{po.poNumber}</td>
                      <td className="p-3 text-xs">
                        <div className="font-bold">{po.supplier?.companyName}</div>
                        {po.supplier?.contactName && <div className="text-[10px] text-slate-400">{po.supplier.contactName}</div>}
                      </td>
                      <td className="p-3 text-xs text-slate-600">{po.items?.map(i => i.product?.name).join(', ') || '---'}</td>
                      <td className="p-3 text-xs text-right text-slate-600">{formatMoney(costPrice)}</td>
                      <td className="p-3 text-xs font-bold text-right">{totalQty}</td>
                      <td className="p-3 text-xs font-bold text-right">{formatMoney(po.grandTotal)}</td>
                      <td className="p-3 text-right">
                        <span className="px-2 py-1 rounded-full border border-emerald-500 text-emerald-600 font-bold text-[10px]">RECEIVED</span>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t flex justify-end bg-surface shrink-0">
          <Button className="bg-[#1A1F2C] hover:bg-[#0f121a] text-white font-bold px-6" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}