"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/admin/status-badge";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export default function WarehousesPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    code: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    capacity: "",
  });
  const [creating, setCreating] = useState(false);

  const fetchWarehouses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/warehouses");
      setData(Array.isArray(res) ? res : res?.items || res?.data || []);
    } catch (err) {
      setError(err.message || "Failed to load warehouses");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWarehouses();
  }, [fetchWarehouses]);

  const warehouses = Array.isArray(data) ? data : data?.items || [];

  async function handleCreate(e) {
    e.preventDefault();
    setCreating(true);
    try {
      await api.post("/warehouses", {
        ...createForm,
        capacity: createForm.capacity ? Number(createForm.capacity) : undefined,
      });
      setShowCreate(false);
      setCreateForm({
        name: "",
        code: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
        capacity: "",
      });
      fetchWarehouses();
    } catch (err) {
      alert(err.message || "Failed to create warehouse");
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this warehouse?")) return;
    try {
      await api.delete(`/warehouses/${id}`);
      fetchWarehouses();
    } catch (err) {
      alert(err.message || "Failed to delete warehouse");
    }
  }

  const columns = [
    {
      header: "Warehouse",
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded bg-muted overflow-hidden flex items-center justify-center shrink-0">
            <span className="text-muted-foreground text-sm">🏭</span>
          </div>
          <div>
            <Link
              href={`/admin/warehouses/${row.id}`}
              className="font-medium text-primary hover:underline text-xs"
            >
              {row.name}
            </Link>
            <div className="text-[10px] text-muted-foreground font-mono">
              {row.code}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: "Location",
      cell: (row) => (
        <span className="text-xs">
          {[row.city, row.state].filter(Boolean).join(", ") || row.address || "---"}
        </span>
      ),
    },
    {
      header: "Status",
      cell: (row) => <StatusBadge status={row.status || "ACTIVE"} />,
    },
    {
      header: "Capacity",
      className: "text-right",
      cell: (row) => (
        <span className="text-xs text-muted-foreground">
          {row.capacity || "---"}
        </span>
      ),
    },
    {
      header: "Stock Items",
      className: "text-right",
      cell: (row) => (
        <span className="text-xs font-bold">
          {row._count?.inventory || 0}
        </span>
      ),
    },
    {
      header: "Actions",
      className: "text-right",
      cell: (row) => (
        <div className="flex items-center justify-end gap-2">
          <Link
            href={`/admin/warehouses/${row.id}`}
            className="text-xs text-primary hover:underline"
          >
            Edit
          </Link>
          <button
            onClick={() => handleDelete(row.id)}
            className="text-xs text-destructive hover:underline"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Warehouses"
        description={`${warehouses.length} warehouses`}
        actions={
          <Button onClick={() => setShowCreate(true)}>
            <span className="text-lg leading-none mr-1">+</span> New Warehouse
          </Button>
        }
      />

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-sm text-destructive">
          {error}
          <button
            onClick={fetchWarehouses}
            className="ml-2 underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-14 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={warehouses}
          empty="No warehouses found"
        />
      )}

      <Dialog controlledOpen={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Warehouse</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-3">
            <Input
              placeholder="Name *"
              required
              value={createForm.name}
              onChange={(e) =>
                setCreateForm({ ...createForm, name: e.target.value })
              }
            />
            <Input
              placeholder="Code *"
              required
              value={createForm.code}
              onChange={(e) =>
                setCreateForm({ ...createForm, code: e.target.value })
              }
            />
            <Input
              placeholder="Address"
              value={createForm.address}
              onChange={(e) =>
                setCreateForm({ ...createForm, address: e.target.value })
              }
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                placeholder="City"
                value={createForm.city}
                onChange={(e) =>
                  setCreateForm({ ...createForm, city: e.target.value })
                }
              />
              <Input
                placeholder="State"
                value={createForm.state}
                onChange={(e) =>
                  setCreateForm({ ...createForm, state: e.target.value })
                }
              />
            </div>
            <Input
              placeholder="Pincode"
              value={createForm.pincode}
              onChange={(e) =>
                setCreateForm({ ...createForm, pincode: e.target.value })
              }
            />
            <Input
              placeholder="Capacity"
              type="number"
              value={createForm.capacity}
              onChange={(e) =>
                setCreateForm({ ...createForm, capacity: e.target.value })
              }
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreate(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={creating}>
                {creating ? "Creating..." : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
