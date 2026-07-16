"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { formatMoney, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/admin/status-badge";
import { MobileFooter, MobileHeader } from "@/components/admin/mobile/mobile-layout";
import { Icon } from "@/components/ui/icon";

const STATUS_COLORS = {
  DRAFT: "bg-gray-100 text-gray-700",
  PENDING: "bg-yellow-100 text-yellow-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  PACKED: "bg-indigo-100 text-indigo-700",
  DISPATCHED: "bg-purple-100 text-purple-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
  RETURNED: "bg-orange-100 text-orange-700",
};

const NEXT_STATUSES = {
  DRAFT: ["PENDING"],
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PACKED", "CANCELLED"],
  PACKED: ["DISPATCHED"],
  DISPATCHED: ["DELIVERED"],
  DELIVERED: ["RETURNED"],
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("items");
  const [statusNote, setStatusNote] = useState("");
  const [updating, setUpdating] = useState(false);

  const fetchOrder = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/orders/${params.id}`);
      setOrder(res);
    } catch (err) {
      setError(err.message || "Failed to load order");
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  async function handleStatusChange(status) {
    setUpdating(true);
    try {
      await api.patch(`/orders/${params.id}/status`, {
        status,
        note: statusNote,
      });
      setStatusNote("");
      fetchOrder();
    } catch (err) {
      alert(err.message || "Failed to update status");
    } finally {
      setUpdating(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive mb-2">{error}</p>
        <Button variant="outline" onClick={fetchOrder}>
          Retry
        </Button>
      </div>
    );
  }

  const o = order;
  const tabs = [
    { id: "items", label: "Items" },
    { id: "payment", label: "Payment" },
    { id: "history", label: "History" },
  ];

  return (
    <>
      <div className="hidden md:block">
        <div className="max-w-4xl space-y-6">
          <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-8 h-8 rounded-md border border-border flex items-center justify-center hover:bg-muted"
          >
            ←
          </button>
          <div>
            <h1 className="text-lg font-black">
              Order {o?.orderNumber}
            </h1>
            <p className="text-xs text-muted-foreground">
              {formatDate(o?.createdAt)}
            </p>
          </div>
        </div>
        <StatusBadge status={o?.status} />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">
              Customer
            </p>
            <p className="text-sm font-bold">{o?.user?.name}</p>
            <p className="text-xs text-muted-foreground">{o?.user?.email}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">
              Payment
            </p>
            <p className="text-sm font-bold">{formatMoney(o?.grandTotal)}</p>
            <p className="text-xs text-muted-foreground">
              {o?.paymentMethod || "N/A"} / {o?.paymentStatus}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">
              Shipping
            </p>
            <p className="text-sm font-bold">{o?.shippingAddress?.name}</p>
            <p className="text-xs text-muted-foreground">
              {o?.shippingAddress?.city}, {o?.shippingAddress?.state}{" "}
              {o?.shippingAddress?.pincode}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-1 border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "items" && (
        <Card>
          <CardHeader>
            <CardTitle>Items ({o?.items?.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead className="bg-muted/20">
                <tr>
                  <th className="h-8 px-3 text-left text-[10px] font-black uppercase">
                    Item
                  </th>
                  <th className="h-8 px-3 text-center text-[10px] font-black uppercase w-16">
                    Qty
                  </th>
                  <th className="h-8 px-3 text-right text-[10px] font-black uppercase w-24">
                    Price
                  </th>
                  <th className="h-8 px-3 text-right text-[10px] font-black uppercase w-24">
                    Tax
                  </th>
                  <th className="h-8 px-3 text-right text-[10px] font-black uppercase w-24">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {o?.items?.map((item) => (
                  <tr key={item.id}>
                    <td className="px-3 py-2">
                      <div className="text-xs font-medium">{item.name}</div>
                      <div className="text-[10px] text-muted-foreground font-mono">
                        {item.sku}
                      </div>
                    </td>
                    <td className="px-3 py-2 text-center text-xs">
                      {item.quantity}
                    </td>
                    <td className="px-3 py-2 text-right text-xs">
                      {formatMoney(item.unitPrice)}
                    </td>
                    <td className="px-3 py-2 text-right text-xs">
                      {item.taxRate}%
                    </td>
                    <td className="px-3 py-2 text-right text-xs font-black">
                      {formatMoney(item.unitPrice * item.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {activeTab === "payment" && (
        <Card>
          <CardHeader>
            <CardTitle>Payment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">
                  Payment Method
                </p>
                <p className="text-sm">{o?.paymentMethod || "N/A"}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">
                  Payment Status
                </p>
                <StatusBadge status={o?.paymentStatus} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">
                  Subtotal
                </p>
                <p className="text-sm">{formatMoney(o?.subtotal)}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">
                  Tax
                </p>
                <p className="text-sm">{formatMoney(o?.taxTotal)}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">
                  Shipping
                </p>
                <p className="text-sm">{formatMoney(o?.shippingCharge)}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">
                  Grand Total
                </p>
                <p className="text-sm font-bold">
                  {formatMoney(o?.grandTotal)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "history" && (
        <Card>
          <CardHeader>
            <CardTitle>Status History</CardTitle>
          </CardHeader>
          <CardContent>
            {o?.statusHistory?.length > 0 ? (
              <div className="space-y-2">
                {o.statusHistory.map((h) => (
                  <div
                    key={h.id}
                    className="flex items-start gap-3 text-xs"
                  >
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        STATUS_COLORS[h.status] || ""
                      }`}
                    >
                      {h.status}
                    </span>
                    <span className="text-muted-foreground ml-2">
                      {h.note}
                    </span>
                    <span className="ml-auto text-muted-foreground">
                      {formatDate(h.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No status history available
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Update Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <input
            className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
            placeholder="Note (optional)"
            value={statusNote}
            onChange={(e) => setStatusNote(e.target.value)}
          />
          <div className="flex gap-2">
            {(NEXT_STATUSES[o?.status] || []).map((s) => (
              <Button
                key={s}
                variant="outline"
                size="sm"
                disabled={updating}
                onClick={() => handleStatusChange(s)}
              >
                {s}
              </Button>
            ))}
            {(NEXT_STATUSES[o?.status] || []).length === 0 && (
              <p className="text-xs text-muted-foreground">
                No status transitions available
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
    </div>

      {/* Mobile UI */}
      <div className="block md:hidden pb-24 min-h-screen bg-slate-950 text-slate-200">
        <MobileHeader title={`Order ${o?.orderNumber}`} showMenu={false} />
        
        <div className="p-4 space-y-4">
          <div className="flex justify-between items-start">
             <div>
               <h1 className="text-xl font-bold">Order {o?.orderNumber}</h1>
               <p className="text-xs text-slate-400 mt-1">{formatDate(o?.createdAt)}</p>
             </div>
             <StatusBadge status={o?.status} />
          </div>
          
          <div className="bg-slate-900 border border-slate-800 rounded-custom p-4">
             <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Customer</h3>
             <p className="text-sm font-bold">{o?.user?.name}</p>
             <p className="text-xs text-slate-400">{o?.user?.email}</p>
          </div>
          
          <div className="bg-slate-900 border border-slate-800 rounded-custom p-4">
             <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Shipping</h3>
             <p className="text-sm font-bold">{o?.shippingAddress?.name}</p>
             <p className="text-xs text-slate-400">{o?.shippingAddress?.city}, {o?.shippingAddress?.state} {o?.shippingAddress?.pincode}</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-custom p-4 space-y-3">
             <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Payment</h3>
             <div className="flex justify-between text-sm">
                <span className="text-slate-400">Method</span>
                <span className="font-medium">{o?.paymentMethod || "N/A"}</span>
             </div>
             <div className="flex justify-between text-sm">
                <span className="text-slate-400">Status</span>
                <StatusBadge status={o?.paymentStatus} />
             </div>
             <div className="flex justify-between text-sm">
                <span className="text-slate-400">Subtotal</span>
                <span>{formatMoney(o?.subtotal)}</span>
             </div>
             <div className="flex justify-between text-sm">
                <span className="text-slate-400">Tax</span>
                <span>{formatMoney(o?.taxTotal)}</span>
             </div>
             <div className="flex justify-between text-sm">
                <span className="text-slate-400">Shipping</span>
                <span>{formatMoney(o?.shippingCharge)}</span>
             </div>
             <div className="flex justify-between text-lg font-black pt-2 border-t border-slate-800 text-emerald-400">
                <span>Total</span>
                <span>{formatMoney(o?.grandTotal)}</span>
             </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-custom p-4 space-y-4">
             <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Items ({o?.items?.length})</h3>
             {o?.items?.map(item => (
                <div key={item.id} className="flex justify-between items-start pb-3 border-b border-slate-800 last:border-0 last:pb-0">
                   <div className="flex-1 pr-2">
                     <p className="text-sm font-medium">{item.name}</p>
                     <p className="text-[10px] text-slate-500 font-mono mt-0.5">{item.sku}</p>
                     <p className="text-xs text-slate-400 mt-1">Qty: {item.quantity} × {formatMoney(item.unitPrice)} (Tax: {item.taxRate}%)</p>
                   </div>
                   <div className="text-right">
                     <p className="text-sm font-black text-white">{formatMoney(item.unitPrice * item.quantity)}</p>
                   </div>
                </div>
             ))}
          </div>
          
          <div className="bg-slate-900 border border-slate-800 rounded-custom p-4">
             <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">History</h3>
             <div className="space-y-4 border-l-2 border-slate-800 ml-2 pl-4">
               {o?.statusHistory?.length > 0 ? (
                 o.statusHistory.map(h => (
                    <div key={h.id} className="relative">
                      <div className="absolute -left-[23px] top-1 w-2.5 h-2.5 rounded-full bg-slate-500 ring-4 ring-slate-900" />
                      <p className="text-xs font-bold text-slate-300">{h.status}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{formatDate(h.createdAt)}</p>
                      {h.note && <p className="text-xs text-slate-400 mt-1">{h.note}</p>}
                    </div>
                 ))
               ) : (
                 <p className="text-sm text-slate-500">No status history</p>
               )}
             </div>
          </div>
          
          <div className="bg-slate-900 border border-slate-800 rounded-custom p-4">
             <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Update Status</h3>
             <input
               className="w-full h-10 px-3 rounded-md border border-slate-800 bg-slate-950 text-sm mb-3 focus:border-accent focus:ring-accent"
               placeholder="Note (optional)"
               value={statusNote}
               onChange={(e) => setStatusNote(e.target.value)}
             />
             <div className="flex flex-wrap gap-2">
               {(NEXT_STATUSES[o?.status] || []).map((s) => (
                 <Button
                   key={s}
                   size="sm"
                   disabled={updating}
                   onClick={() => handleStatusChange(s)}
                   className="bg-accent text-white hover:bg-accent/90"
                 >
                   {s}
                 </Button>
               ))}
               {(NEXT_STATUSES[o?.status] || []).length === 0 && (
                 <p className="text-xs text-slate-500">
                   No status transitions available
                 </p>
               )}
             </div>
          </div>
          
        </div>
        
        <MobileFooter />
      </div>
    </>
  );
}
