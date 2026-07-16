"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/admin/status-badge";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";

export default function WarehouseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [warehouse, setWarehouse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    code: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    phone: "",
    email: "",
    capacity: 0,
    status: "ACTIVE",
  });

  const fetchWarehouse = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/warehouses/${params.id}`);
      setWarehouse(res);
    } catch (err) {
      setError(err.message || "Failed to load warehouse");
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchWarehouse();
  }, [fetchWarehouse]);

  useEffect(() => {
    if (warehouse) {
      setForm({
        name: warehouse.name || "",
        code: warehouse.code || "",
        address: warehouse.address || "",
        city: warehouse.city || "",
        state: warehouse.state || "",
        pincode: warehouse.pincode || "",
        phone: warehouse.phone || "",
        email: warehouse.email || "",
        capacity: warehouse.capacity || 0,
        status: warehouse.status || "ACTIVE",
      });
    }
  }, [warehouse]);

  async function handleSave() {
    setSaving(true);
    try {
      await api.put(`/warehouses/${params.id}`, form);
      fetchWarehouse();
    } catch (err) {
      alert(err.message || "Failed to update warehouse");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this warehouse? This action cannot be undone.")) return;
    setDeleting(true);
    try {
      await api.delete(`/warehouses/${params.id}`);
      router.push("/admin/warehouses");
    } catch (err) {
      alert(err.message || "Failed to delete warehouse");
    } finally {
      setDeleting(false);
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
        <Button variant="outline" onClick={fetchWarehouse}>
          Retry
        </Button>
      </div>
    );
  }

  const w = warehouse;
  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "inventory", label: "Inventory" },
  ];

  const inventoryColumns = [
    {
      header: "Product",
      cell: (row) => (
        <span className="text-xs font-medium">
          {row.product?.name || "---"}
        </span>
      ),
    },
    {
      header: "SKU",
      cell: (row) => (
        <span className="text-xs font-mono">{row.variant?.sku || "---"}</span>
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
            <h1 className="text-lg font-black">{w?.name}</h1>
            <p className="text-xs text-muted-foreground font-mono">{w?.code}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={deleting}
            onClick={handleDelete}
            className="border-destructive text-destructive hover:bg-destructive/10"
          >
            {deleting ? "Deleting..." : "Delete"}
          </Button>
          <Button size="sm" disabled={saving} onClick={handleSave}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
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

      {activeTab === "overview" && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black uppercase text-muted-foreground">
                  Name
                </label>
                <Input
                  className="mt-1"
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-muted-foreground">
                  Code
                </label>
                <Input
                  className="mt-1"
                  value={form.code}
                  onChange={(e) =>
                    setForm({ ...form, code: e.target.value })
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
              <div>
                <label className="text-[10px] font-black uppercase text-muted-foreground">
                  City
                </label>
                <Input
                  className="mt-1"
                  value={form.city}
                  onChange={(e) =>
                    setForm({ ...form, city: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-muted-foreground">
                  State
                </label>
                <Input
                  className="mt-1"
                  value={form.state}
                  onChange={(e) =>
                    setForm({ ...form, state: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-muted-foreground">
                  Pincode
                </label>
                <Input
                  className="mt-1"
                  value={form.pincode}
                  onChange={(e) =>
                    setForm({ ...form, pincode: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-muted-foreground">
                  Capacity
                </label>
                <Input
                  type="number"
                  className="mt-1"
                  value={form.capacity}
                  onChange={(e) =>
                    setForm({ ...form, capacity: Number(e.target.value) })
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
                  Status
                </label>
                <select
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm mt-1"
                  value={form.status}
                  onChange={(e) =>
                    setForm({ ...form, status: e.target.value })
                  }
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="MAINTENANCE">Maintenance</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "inventory" && (
        <Card>
          <CardHeader>
            <CardTitle>
              Inventory ({w?.inventory?.length || 0} items)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <DataTable
              columns={inventoryColumns}
              data={w?.inventory || []}
              empty="No inventory in this warehouse"
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
