"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Icon } from "@/components/ui/icon";
import { toast } from "@/components/ui/toaster";
import SupplierDetailsModal from "@/components/purchase-orders/supplier-details-modal";
import AddProductModal from "@/components/purchase-orders/add-product-modal";

function formatMoney(amount) {
  if (!amount && amount !== 0) return "---";
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(amount);
}

export default function EditPurchaseOrderPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    supplierId: "",
    warehouseId: "",
    expectedDate: "",
    supplierInvoiceNumber: "",
    supplierInvoiceDate: "",
    transportCost: 0,
    extraMargin: 0,
    marginType: "PERCENTAGE",
    notes: "",
  });
  const [items, setItems] = useState([]);
  const [saving, setSaving] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [supplierModalOpen, setSupplierModalOpen] = useState(false);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  useEffect(() => {
    async function init() {
      try {
        const [poData, suppliersData, warehousesData] = await Promise.all([
          api.get(`/purchase-orders/${params.id}`),
          api.get("/suppliers?pageSize=200"),
          api.get("/warehouses"),
        ]);

        setSuppliers(suppliersData?.items || suppliersData || []);
        setWarehouses(warehousesData?.items || warehousesData || []);

        setForm({
          supplierId: poData.supplierId || "",
          warehouseId: poData.warehouseId || "",
          expectedDate: poData.expectedDate ? poData.expectedDate.slice(0, 10) : "",
          supplierInvoiceNumber: poData.supplierInvoiceNumber || "",
          supplierInvoiceDate: poData.supplierInvoiceDate ? poData.supplierInvoiceDate.slice(0, 10) : "",
          transportCost: Number(poData.transportCost) || 0,
          extraMargin: Number(poData.extraMargin) || 0,
          marginType: poData.marginType || "PERCENTAGE",
          notes: poData.notes || "",
        });

        setSelectedSupplier(suppliersData?.items?.find((s) => s.id === poData.supplierId) || null);

        setItems((poData.items || []).map((it) => ({
          id: it.id,
          productId: it.productId,
          productName: it.product?.name || "Unknown",
          barcode: it.barcode || "",
          actualQty: it.actualQty,
          billedQty: it.billedQty,
          packSize: it.packSize,
          preGstRate: Number(it.preGstRate),
          discountPercent: Number(it.discountPercent),
          additionalDiscountPercent: Number(it.additionalDiscountPercent),
          gstPercent: Number(it.gstPercent),
          itemTransportCost: Number(it.itemTransportCost),
        })));
      } catch (err) {
        toast(err?.message || "Failed to load purchase order", "error");
        router.push("/admin/purchase-orders");
      }
      setLoading(false);
    }
    init();
  }, [params.id, router]);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSupplierChange(value) {
    updateField("supplierId", value);
    setSelectedSupplier(suppliers.find((s) => s.id === value) || null);
  }

  function handleAddItem(newItem) {
    setItems((prev) => [...prev, { ...newItem, id: Date.now().toString() }]);
    setProductModalOpen(false);
  }

  function removeItem(id) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  const totals = useMemo(() => {
    let subtotal = 0;
    let totalDiscount = 0;
    let taxTotal = 0;

    for (const it of items) {
      const qty = it.actualQty || 0;
      const rate = it.preGstRate || 0;
      const preGstAmount = rate * qty;
      const discPct = (it.discountPercent || 0) + (it.additionalDiscountPercent || 0);
      const discountAmount = preGstAmount * (discPct / 100);
      const afterDiscount = preGstAmount - discountAmount;
      const gstPct = it.gstPercent || 0;
      const gstAmount = afterDiscount * (gstPct / 100);

      subtotal += preGstAmount;
      totalDiscount += discountAmount;
      taxTotal += gstAmount;
    }

    const poTransport = Number(form.transportCost) || 0;
    const grandTotal = subtotal + taxTotal + poTransport;
    const extraMargin = Number(form.extraMargin) || 0;
    const payableAmount = form.marginType === "FIXED"
      ? grandTotal + extraMargin
      : (subtotal + poTransport) * (1 + extraMargin / 100);

    return { subtotal, totalDiscount, taxTotal, grandTotal, payableAmount };
  }, [items, form.transportCost, form.extraMargin, form.marginType]);

  async function handleSave() {
    if (!form.supplierId) { toast("Select a supplier", "error"); return; }
    if (!form.warehouseId) { toast("Select a warehouse", "error"); return; }
    if (items.length === 0) { toast("Add at least one item", "error"); return; }

    setSaving(true);
    try {
      const payload = {
        supplierId: form.supplierId,
        warehouseId: form.warehouseId,
        expectedDate: form.expectedDate || undefined,
        supplierInvoiceNumber: form.supplierInvoiceNumber || undefined,
        supplierInvoiceDate: form.supplierInvoiceDate || undefined,
        transportCost: Number(form.transportCost) || 0,
        extraMargin: Number(form.extraMargin) || 0,
        marginType: form.marginType,
        notes: form.notes || undefined,
        items: items.map(({ id, productName, ...it }) => ({
          ...it,
          actualQty: it.actualQty,
          billedQty: it.billedQty || it.actualQty,
          packSize: it.packSize || 1,
          preGstRate: Number(it.preGstRate) || 0,
          discountPercent: Number(it.discountPercent) || 0,
          additionalDiscountPercent: Number(it.additionalDiscountPercent) || 0,
          gstPercent: Number(it.gstPercent) || 0,
          itemTransportCost: Number(it.itemTransportCost) || 0,
        })),
      };

      await api.put(`/purchase-orders/${params.id}`, payload);
      toast("Purchase order updated", "success");
      router.push(`/admin/purchase-orders/${params.id}`);
    } catch (err) {
      toast(err?.message || "Failed to update purchase order", "error");
    }
    setSaving(false);
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;
  }

  const itemColumns = [
    { header: "Product", cell: (it) => <span className="text-xs font-medium">{it.productName}</span> },
    { header: "Barcode", cell: (it) => <span className="text-xs font-mono text-muted-foreground">{it.barcode || "---"}</span> },
    { header: "Qty", cell: (it) => <span className="text-xs">{it.actualQty}</span> },
    { header: "Rate", className: "text-right", cell: (it) => <span className="text-xs">{formatMoney(it.preGstRate)}</span> },
    { header: "Disc%", className: "text-right", cell: (it) => <span className="text-xs">{it.discountPercent + (it.additionalDiscountPercent || 0)}%</span> },
    { header: "GST%", className: "text-right", cell: (it) => <span className="text-xs">{it.gstPercent}%</span> },
    { header: "Final", className: "text-right", cell: (it) => <span className="text-xs font-bold">{formatMoney((it.preGstRate * it.actualQty * (1 - ((it.discountPercent || 0) + (it.additionalDiscountPercent || 0)) / 100)) * (1 + (it.gstPercent || 0) / 100) + (it.itemTransportCost || 0))}</span> },
    { header: "", cell: (it) => (<button onClick={() => removeItem(it.id)} className="text-destructive hover:text-destructive/80"><Icon name="trash-2" size={14} /></button>) },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <Icon name="chevron-left" size={16} />
          </Button>
          <h1 className="text-lg font-bold">Edit Purchase Order</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push(`/admin/purchase-orders/${params.id}`)}>Cancel</Button>
          <Button disabled={saving} onClick={handleSave}>{saving ? "Saving..." : "Save Changes"}</Button>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>Purchase Details</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label>Supplier *</Label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Select value={form.supplierId} onValueChange={handleSupplierChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map((s) => (<SelectItem key={s.id} value={s.id}>{s.companyName}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="outline" size="icon" disabled={!form.supplierId} onClick={() => setSupplierModalOpen(true)} title="View Supplier Details">
                  <Icon name="info" size={14} />
                </Button>
              </div>
            </div>
            <div className="space-y-1">
              <Label>Warehouse *</Label>
              <Select value={form.warehouseId} onValueChange={(v) => updateField("warehouseId", v)}>
                <SelectTrigger><SelectValue placeholder="Select Warehouse" /></SelectTrigger>
                <SelectContent>
                  {warehouses.map((w) => (<SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Expected Date</Label>
              <Input type="date" value={form.expectedDate} onChange={(e) => updateField("expectedDate", e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="space-y-1">
              <Label>Supplier Invoice No.</Label>
              <Input value={form.supplierInvoiceNumber} onChange={(e) => updateField("supplierInvoiceNumber", e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Invoice Date</Label>
              <Input type="date" value={form.supplierInvoiceDate} onChange={(e) => updateField("supplierInvoiceDate", e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Transport Cost</Label>
              <Input type="number" step="0.01" value={form.transportCost} onChange={(e) => updateField("transportCost", e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="space-y-1">
              <Label>Extra Margin</Label>
              <Input type="number" step="0.01" value={form.extraMargin} onChange={(e) => updateField("extraMargin", e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Margin Type</Label>
              <Select value={form.marginType} onValueChange={(v) => updateField("marginType", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                  <SelectItem value="FIXED">Fixed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Notes</Label>
              <Input value={form.notes} onChange={(e) => updateField("notes", e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Items ({items.length})</CardTitle>
          <Button size="sm" onClick={() => setProductModalOpen(true)}>
            <Icon name="plus" size={14} className="mr-1" /> Add Item
          </Button>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No items</p>
              <Button variant="outline" size="sm" className="mt-2" onClick={() => setProductModalOpen(true)}>Add item</Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    {itemColumns.map((col, i) => (
                      <th key={i} className={`text-[10px] font-black uppercase text-muted-foreground px-2 py-2 ${col.className || "text-left"}`}>{col.header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.map((it) => (
                    <tr key={it.id} className="border-b last:border-0 hover:bg-muted/50">
                      {itemColumns.map((col, i) => (
                        <td key={i} className={`px-2 py-2 ${col.className || ""}`}>{col.cell(it)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Totals</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-[10px] font-black uppercase text-muted-foreground">Subtotal (Pre-GST)</div>
              <div className="text-lg font-bold">{formatMoney(totals.subtotal)}</div>
            </div>
            <div>
              <div className="text-[10px] font-black uppercase text-muted-foreground">Total Discount</div>
              <div className="text-lg font-bold text-destructive">{formatMoney(totals.totalDiscount)}</div>
            </div>
            <div>
              <div className="text-[10px] font-black uppercase text-muted-foreground">Tax Total (GST)</div>
              <div className="text-lg font-bold">{formatMoney(totals.taxTotal)}</div>
            </div>
            <div>
              <div className="text-[10px] font-black uppercase text-muted-foreground">Transport Cost</div>
              <div className="text-lg font-bold">{formatMoney(Number(form.transportCost) || 0)}</div>
            </div>
            <div>
              <div className="text-[10px] font-black uppercase text-muted-foreground">Grand Total</div>
              <div className="text-lg font-bold">{formatMoney(totals.grandTotal)}</div>
            </div>
            <div>
              <div className="text-[10px] font-black uppercase text-muted-foreground">Extra Margin</div>
              <div className="text-lg font-bold">{form.extraMargin ? `${form.extraMargin}%` : "0%"}</div>
            </div>
            <div className="md:col-span-2">
              <div className="text-[10px] font-black uppercase text-primary">Payable Amount</div>
              <div className="text-2xl font-black text-primary">{formatMoney(totals.payableAmount)}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <SupplierDetailsModal supplier={selectedSupplier} open={supplierModalOpen} onOpenChange={setSupplierModalOpen} />
      <AddProductModal open={productModalOpen} onOpenChange={setProductModalOpen} onAdd={handleAddItem} />
    </div>
  );
}
