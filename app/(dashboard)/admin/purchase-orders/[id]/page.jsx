"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DataTable } from "@/components/ui/data-table";
import { toast } from "@/components/ui/toaster";

const statusVariant = {
  DRAFT: "secondary",
  SUBMITTED: "info",
  APPROVED: "success",
  ORDERED: "secondary",
  PARTIAL_RECEIVED: "warning",
  RECEIVED: "success",
  CANCELLED: "error",
};

function formatMoney(amount) {
  if (!amount && amount !== 0) return "---";
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(amount);
}

export default function PurchaseOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [po, setPo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const data = await api.get(`/purchase-orders/${params.id}`);
      setPo(data);
    } catch {
      toast("Failed to load purchase order", "error");
    }
    setLoading(false);
  }

  useEffect(() => {
    if (params.id) load();
  }, [params.id]);

  async function handleStatusUpdate(status) {
    setUpdating(true);
    try {
      await api.patch(`/purchase-orders/${params.id}/status`, { status });
      toast(`PO ${status.toLowerCase()}`, "success");
      load();
    } catch (err) {
      toast(err?.message || "Failed to update", "error");
    }
    setUpdating(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!po) {
    return <div className="text-center py-12 text-muted-foreground">Purchase order not found</div>;
  }

  const canEdit = ["DRAFT", "SUBMITTED"].includes(po.status);

  const itemColumns = [
    { header: "Product", cell: (item) => <span className="text-xs font-medium">{item.product?.name || "---"}</span> },
    { header: "Barcode", cell: (item) => <span className="text-xs font-mono text-muted-foreground">{item.barcode || "---"}</span> },
    { header: "Actual Qty", className: "text-right", cell: (item) => <span className="text-xs">{item.actualQty}</span> },
    { header: "Billed Qty", className: "text-right", cell: (item) => <span className="text-xs">{item.billedQty}</span> },
    { header: "Pack", className: "text-right", cell: (item) => <span className="text-xs">{item.packSize}</span> },
    { header: "Rate", className: "text-right", cell: (item) => <span className="text-xs">{formatMoney(item.preGstRate)}</span> },
    { header: "Pre-GST Amt", className: "text-right", cell: (item) => <span className="text-xs">{formatMoney(item.preGstAmount)}</span> },
    { header: "Disc%", className: "text-right", cell: (item) => <span className="text-xs">{item.discountPercent || 0}%</span> },
    { header: "GST%", className: "text-right", cell: (item) => <span className="text-xs">{item.gstPercent || 0}%</span> },
    { header: "GST Amt", className: "text-right", cell: (item) => <span className="text-xs">{formatMoney(item.gstAmount)}</span> },
    { header: "Transport", className: "text-right", cell: (item) => <span className="text-xs">{formatMoney(item.itemTransportCost)}</span> },
    { header: "Final Amt", className: "text-right", cell: (item) => <span className="text-xs font-bold">{formatMoney(item.finalAmount)}</span> },
  ];

  const statuses = ["SUBMITTED", "APPROVED", "ORDERED", "RECEIVED", "CANCELLED"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <Icon name="chevron-left" size={16} />
          </Button>
          <div>
            <h1 className="text-lg font-bold">{po.poNumber}</h1>
            <Badge variant={statusVariant[po.status] || "secondary"}>{po.status}</Badge>
          </div>
        </div>
        <div className="flex gap-2">
          {canEdit && (
            <Link href={`/admin/purchase-orders/${po.id}/edit`}>
              <Button variant="outline" size="sm"><Icon name="edit" size={14} className="mr-1" /> Edit</Button>
            </Link>
          )}
          {statuses.filter((s) => s !== po.status).map((s) => (
            <Button key={s} variant={s === "CANCELLED" ? "destructive" : "outline"} size="sm" disabled={updating} onClick={() => handleStatusUpdate(s)}>
              {s}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-[10px] font-black uppercase text-muted-foreground">Supplier</div>
            <div className="text-sm font-medium mt-1">{po.supplier?.companyName || "---"}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-[10px] font-black uppercase text-muted-foreground">Warehouse</div>
            <div className="text-sm font-medium mt-1">{po.warehouse?.name || "---"}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-[10px] font-black uppercase text-muted-foreground">Invoice</div>
            <div className="text-sm font-medium mt-1">{po.supplierInvoiceNumber || "---"}</div>
            {po.supplierInvoiceDate && <div className="text-xs text-muted-foreground">{new Date(po.supplierInvoiceDate).toLocaleDateString()}</div>}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-[10px] font-black uppercase text-muted-foreground">Payable Amount</div>
            <div className="text-sm font-black mt-1 text-primary">{formatMoney(po.payableAmount)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-[10px] font-black uppercase text-muted-foreground">Subtotal</div>
              <div className="text-sm mt-1">{formatMoney(po.subtotal)}</div>
            </div>
            <div>
              <div className="text-[10px] font-black uppercase text-muted-foreground">Tax Total</div>
              <div className="text-sm mt-1">{formatMoney(po.taxTotal)}</div>
            </div>
            <div>
              <div className="text-[10px] font-black uppercase text-muted-foreground">Transport Cost</div>
              <div className="text-sm mt-1">{formatMoney(po.transportCost)}</div>
            </div>
            <div>
              <div className="text-[10px] font-black uppercase text-muted-foreground">Extra Margin</div>
              <div className="text-sm mt-1">{po.extraMargin ? `${po.extraMargin}% (${po.marginType})` : "---"}</div>
            </div>
            <div>
              <div className="text-[10px] font-black uppercase text-muted-foreground">Grand Total</div>
              <div className="text-sm font-bold mt-1">{formatMoney(po.grandTotal)}</div>
            </div>
            <div>
              <div className="text-[10px] font-black uppercase text-muted-foreground">Payable</div>
              <div className="text-sm font-black mt-1 text-primary">{formatMoney(po.payableAmount)}</div>
            </div>
            {po.invoiceFile && (
              <div>
                <div className="text-[10px] font-black uppercase text-muted-foreground">Invoice File</div>
                <a href={po.invoiceFile} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline mt-1 block">View Invoice</a>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Items ({po.items?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={itemColumns} data={po.items || []} empty="No items" />
        </CardContent>
      </Card>
    </div>
  );
}
