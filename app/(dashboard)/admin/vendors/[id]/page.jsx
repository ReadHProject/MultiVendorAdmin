"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/ui/data-table";
import { toast } from "@/components/ui/toaster";

const statusVariant = {
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "error",
  SUSPENDED: "secondary",
};

export default function VendorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("overview");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    companyName: "",
    gstin: "",
    address: "",
    commissionRate: "",
  });

  async function load() {
    setLoading(true);
    try {
      const data = await api.get(`/vendors/${params.id}`);
      setVendor(data);
      if (data) {
        setForm({
          name: data.name || data.user?.name || "",
          email: data.user?.email || data.email || "",
          phone: data.phone || "",
          companyName: data.companyName || "",
          gstin: data.gstin || "",
          address: data.address || "",
          commissionRate: data.commissionRate?.toString() || "",
        });
      }
    } catch {
      toast("Failed to load vendor", "error");
    }
    setLoading(false);
  }

  useEffect(() => {
    if (params.id) load();
  }, [params.id]);

  async function handleSave() {
    setSaving(true);
    try {
      await api.patch(`/vendors/${params.id}`, {
        ...form,
        commissionRate: form.commissionRate
          ? Number(form.commissionRate)
          : undefined,
      });
      toast("Vendor updated", "success");
      load();
    } catch (err) {
      toast(err?.message || "Failed to update", "error");
    }
    setSaving(false);
  }

  async function handleApprove(commissionRate) {
    try {
      await api.patch(`/vendors/${params.id}/approve`, {
        status: "APPROVED",
        commissionRate: commissionRate ? Number(commissionRate) : undefined,
      });
      toast("Vendor approved", "success");
      load();
    } catch (err) {
      toast(err?.message || "Failed to approve", "error");
    }
  }

  async function handleReject() {
    try {
      await api.patch(`/vendors/${params.id}/approve`, { status: "REJECTED" });
      toast("Vendor rejected", "success");
      load();
    } catch (err) {
      toast(err?.message || "Failed to reject", "error");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Vendor not found
      </div>
    );
  }

  const productColumns = [
    {
      header: "Product",
      cell: (item) => (
        <span className="text-xs font-medium">{item.name}</span>
      ),
    },
    {
      header: "SKU",
      cell: (item) => (
        <span className="text-xs font-mono text-muted-foreground">
          {item.sku || "---"}
        </span>
      ),
    },
    {
      header: "Price",
      className: "text-right",
      cell: (item) => (
        <span className="text-xs">
          {item.price ? `₹${item.price}` : "---"}
        </span>
      ),
    },
  ];

  const orderColumns = [
    {
      header: "Order #",
      cell: (item) => (
        <span className="text-xs font-bold">{item.orderNumber}</span>
      ),
    },
    {
      header: "Customer",
      cell: (item) => (
        <span className="text-xs">{item.user?.name || "---"}</span>
      ),
    },
    {
      header: "Status",
      cell: (item) => <Badge variant="secondary">{item.status}</Badge>,
    },
    {
      header: "Total",
      className: "text-right",
      cell: (item) => (
        <span className="text-xs font-bold">
          {item.grandTotal ? `₹${item.grandTotal}` : "---"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
          >
            <Icon name="chevron-left" size={16} />
          </Button>
          <div>
            <h1 className="text-lg font-bold">{form.companyName || form.name}</h1>
            <Badge variant={statusVariant[vendor.status] || "secondary"}>
              {vendor.status}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          {vendor.status === "PENDING" && (
            <>
              <Button
                variant="success"
                size="sm"
                onClick={() => handleApprove(form.commissionRate)}
              >
                <Icon name="check" size={14} /> Approve
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleReject}
              >
                <Icon name="x" size={14} /> Reject
              </Button>
            </>
          )}
          <Button size="sm" onClick={handleSave} disabled={saving}>
            <Icon name="save" size={14} />{" "}
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      <div className="flex gap-2">
        {["overview", "products", "orders"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
              tab === t
                ? "bg-primary text-primary-foreground"
                : "border border-border hover:bg-muted"
            }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black uppercase text-muted-foreground">
                  Name
                </label>
                <Input
                  className="mt-1"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-muted-foreground">
                  Email
                </label>
                <Input
                  className="mt-1"
                  value={form.email}
                  onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-muted-foreground">
                  Phone
                </label>
                <Input
                  className="mt-1"
                  value={form.phone}
                  onChange={(e) =>
                    setForm({ ...form, phone: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-muted-foreground">
                  Company
                </label>
                <Input
                  className="mt-1"
                  value={form.companyName}
                  onChange={(e) =>
                    setForm({ ...form, companyName: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-muted-foreground">
                  GSTIN
                </label>
                <Input
                  className="mt-1"
                  value={form.gstin}
                  onChange={(e) =>
                    setForm({ ...form, gstin: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-muted-foreground">
                  Commission Rate %
                </label>
                <Input
                  type="number"
                  className="mt-1"
                  value={form.commissionRate}
                  onChange={(e) =>
                    setForm({ ...form, commissionRate: e.target.value })
                  }
                />
              </div>
              <div className="col-span-2">
                <label className="text-[10px] font-black uppercase text-muted-foreground">
                  Address
                </label>
                <Input
                  className="mt-1"
                  value={form.address}
                  onChange={(e) =>
                    setForm({ ...form, address: e.target.value })
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {tab === "products" && (
        <DataTable
          columns={productColumns}
          data={vendor.products || []}
          empty="No products"
        />
      )}

      {tab === "orders" && (
        <DataTable
          columns={orderColumns}
          data={vendor.orders || []}
          empty="No orders"
        />
      )}
    </div>
  );
}
