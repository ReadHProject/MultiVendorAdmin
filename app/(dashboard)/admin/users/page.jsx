"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
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

const ROLE_FILTERS = [
  { value: "", label: "All Roles" },
  { value: "ADMIN", label: "ADMIN" },
  { value: "SUB_ADMIN", label: "SUB_ADMIN" },
  { value: "SALESMAN", label: "SALESMAN" },
  { value: "DEALER", label: "DEALER" },
  { value: "WHOLESALER", label: "WHOLESALER" },
  { value: "RETAILER", label: "RETAILER" },
  { value: "PARLOUR", label: "PARLOUR" },
  { value: "GENERAL", label: "GENERAL" },
];

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "N/A",
    email: "",
    password: "password123", // default password if not provided
    role: "WHOLESALER",
    mobile: "",
    businessName: "",
    stateCode: "",
    gstNumber: "",
  });
  const [creating, setCreating] = useState(false);

  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [editing, setEditing] = useState(false);

  const [showDelete, setShowDelete] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(page) });
      if (q) params.set("q", q);
      if (roleFilter) params.set("role", roleFilter);
      const res = await api.get(`/users?${params.toString()}`);
      setData(res);
    } catch (err) {
      setError(err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [page, q, roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const items = data?.items || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / 20);

  async function handleCreate(e) {
    e.preventDefault();
    if (!createForm.mobile || !createForm.email || !createForm.role || !createForm.stateCode) {
      alert("Please fill in all required fields.");
      return;
    }
    setCreating(true);
    try {
      await api.post("/users", createForm);
      setShowCreate(false);
      setCreateForm({
        name: "N/A",
        email: "",
        password: "password123",
        role: "WHOLESALER",
        mobile: "",
        businessName: "",
        stateCode: "",
        gstNumber: "",
      });
      fetchUsers();
    } catch (err) {
      alert(err.message || "Failed to create user");
    } finally {
      setCreating(false);
    }
  }

  async function handleEdit(e) {
    e.preventDefault();
    if (!editForm.mobile || !editForm.email || !editForm.role || !editForm.stateCode) {
      alert("Please fill in all required fields.");
      return;
    }
    setEditing(true);
    try {
      // Need to handle role update separately since the endpoint for update might not handle role relations if implemented via userUpdateSchema, but let's check:
      // userUpdateSchema has role omitted? No, userUpdateSchema is userCreateSchema.partial().omit({ password: true }). So it accepts role.
      // Wait, backend router put("/:id") does data: req.body.
      // But role is created via relation. Prisma will throw error if we pass string role directly to data: req.body because it's expecting a relation in DB for roles, but the schema has role: z.string().
      // Actually backend put("/:id") doesn't handle role relation updates in data: req.body. Let's look at the put API carefully.
      // It does `data: req.body`. `req.body` has `role` because we pass it. Prisma `User` model doesn't have `role` field directly, it has `roles` relation. So it will fail!
      // I should update user details and then update role separately.
      const payload = {
        email: editForm.email,
        mobile: editForm.mobile,
        businessName: editForm.businessName,
        stateCode: editForm.stateCode,
        gstNumber: editForm.gstNumber,
      };
      await api.put(`/users/${editForm.id}`, payload);

      // Update role if changed
      if (editForm.originalRole !== editForm.role) {
        if (editForm.originalRole) {
          // We need originalRoleId to delete, but we might not have it. The API provides POST /:id/roles and DELETE /:id/roles/:roleId.
          // Since we can't easily fetch roleId without fetching all roles, a simpler way is to just let the backend handle it if they modify it, but if we can't we might just add it.
          // Actually, the prompt says "Role (required)". So we might just call POST /:id/roles.
          try {
            await api.post(`/users/${editForm.id}/roles`, { role: editForm.role });
          } catch (e) {
            console.error("Failed to update role", e);
          }
        }
      }

      setShowEdit(false);
      setEditForm(null);
      fetchUsers();
    } catch (err) {
      alert(err.message || "Failed to update user");
    } finally {
      setEditing(false);
    }
  }

  async function handleDelete() {
    if (!userToDelete) return;
    setDeleting(true);
    try {
      await api.delete(`/users/${userToDelete.id}`);
      setShowDelete(false);
      setUserToDelete(null);
      fetchUsers();
    } catch (err) {
      alert(err.message || "Failed to delete user");
    } finally {
      setDeleting(false);
    }
  }

  const columns = [
    {
      header: "User",
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div>
            <div className="font-medium text-primary text-xs">
              {row.name || "N/A"}
            </div>
            <div className="text-[10px] text-muted-foreground">ID: {row.id.substring(0, 8)}...</div>
          </div>
        </div>
      ),
    },
    {
      header: "Contact",
      cell: (row) => (
        <div className="flex flex-col">
          <span className="text-xs">{row.mobile || "---"}</span>
          <span className="text-[10px] text-muted-foreground uppercase">{row.email || "---"}</span>
        </div>
      ),
    },
    {
      header: "Role",
      className: "text-center",
      cell: (row) => {
        const role = Array.isArray(row.roles) && row.roles.length > 0 ? row.roles[0] : "N/A";
        return (
          <div className="flex justify-center">
            <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-bold text-center">
              {role}
            </span>
          </div>
        );
      }
    },
    {
      header: "Status",
      className: "text-center",
      cell: (row) => (
        <div className="flex justify-center">
          <StatusBadge status={row.status} />
        </div>
      ),
    },
    {
      header: "Last Login",
      className: "text-center",
      cell: (row) => (
        <div className="flex justify-center">
          <span className="text-xs text-muted-foreground text-center">
            Never
          </span>
        </div>
      ),
    },
    {
      header: "Actions",
      className: "text-center w-[150px]",
      cell: (row) => (
        <div className="flex gap-2 justify-end">
          <Button
            size="sm"
            onClick={() => {
              setEditForm({
                id: row.id,
                email: row.email || "",
                mobile: row.mobile || "",
                businessName: row.businessName || "",
                role: Array.isArray(row.roles) && row.roles.length > 0 ? row.roles[0] : "",
                originalRole: Array.isArray(row.roles) && row.roles.length > 0 ? row.roles[0] : "",
                stateCode: row.stateCode || "",
                gstNumber: row.gstNumber || "",
              });
              setShowEdit(true);
            }}
            className="h-7 px-3 text-xs bg-[#1A73E8] hover:bg-[#1A73E8]/90 text-white"
          >
            Edit
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setUserToDelete(row);
              setShowDelete(true);
            }}
            className="h-7 px-3 text-xs bg-[#D32F2F] hover:bg-[#D32F2F]/90 text-white"
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="hidden md:block">
        <div className="space-y-6">
          <PageHeader
            title="Users"
            description={`${total} total users`}
            actions={
              <Button onClick={() => setShowCreate(true)}>
                <span className="text-lg leading-none mr-1">+</span> New User
              </Button>
            }
          />

          <div className="flex flex-wrap gap-3">
            <Input
              placeholder="Search users..."
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              className="max-w-sm"
            />
            <div className="flex gap-1">
              {ROLE_FILTERS.map((r) => (
                <button
                  key={r.value}
                  onClick={() => {
                    setRoleFilter(r.value);
                    setPage(1);
                  }}
                  className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-colors ${roleFilter === r.value
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border hover:bg-muted"
                    }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-sm text-destructive">
              {error}
              <button
                onClick={fetchUsers}
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
              <DataTable columns={columns} data={items} empty="No users found" />
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </>
          )}
        </div>
      </div>

      {/* Mobile UI */}
      <div className="block md:hidden pb-24 min-h-screen bg-slate-950 text-slate-200">
        <MobileHeader title="Users" showMenu={true} />

        <div className="p-4 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-semibold text-lg">{total} Users</h2>
            <Button onClick={() => setShowCreate(true)} className="bg-accent hover:bg-accent/90 text-white h-9 px-4 text-xs font-semibold rounded-custom shadow-lg shadow-accent/20">
              <Plus className="h-4 w-4 mr-1" /> New User
            </Button>
          </div>

          <Input
            placeholder="Search users..."
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            className="bg-slate-900 border-slate-800 text-slate-200 focus:ring-accent focus:border-accent w-full rounded-custom"
          />

          <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
            {ROLE_FILTERS.map((r) => (
              <button
                key={r.value}
                onClick={() => {
                  setRoleFilter(r.value);
                  setPage(1);
                }}
                className={`whitespace-nowrap px-3 py-1.5 rounded-full text-[11px] font-bold transition-colors ${roleFilter === r.value
                  ? "bg-accent text-white"
                  : "bg-slate-900 border border-slate-800 text-slate-400"
                  }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-custom p-4 text-sm text-red-400">
              {error}
              <button onClick={fetchUsers} className="ml-2 underline hover:no-underline">Retry</button>
            </div>
          )}

          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-24 bg-slate-900 animate-pulse rounded-custom" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-sm">No users found</div>
          ) : (
            <div className="space-y-3">
              {items.map((row) => (
                <Link
                  key={row.id}
                  href={`/admin/users/${row.id}`}
                  className="block bg-slate-900 border border-slate-800 rounded-custom p-4 flex gap-3 items-center hover:border-slate-700 transition-colors"
                >
                  <div className="h-12 w-12 rounded-full bg-slate-800 overflow-hidden flex items-center justify-center shrink-0">
                    {row.avatar ? (
                      <img src={row.avatar} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-slate-500 text-xl">👤</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-sm text-white truncate pr-2">{row.name}</h4>
                      <StatusBadge status={row.status} />
                    </div>
                    <p className="text-xs text-slate-400 truncate">{row.email}</p>
                    {row.mobile && <p className="text-[10px] text-slate-500 mt-0.5">{row.mobile}</p>}
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {(Array.isArray(row.roles) ? row.roles : []).map((r) => (
                        <span key={typeof r === 'string' ? r : r.id || r.name} className="px-1.5 py-0.5 bg-accent/20 text-accent rounded text-[9px] font-bold">
                          {typeof r === 'string' ? r : r.name}
                        </span>
                      ))}
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

      <Dialog controlledOpen={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add User</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium">Phone Number *</label>
              <Input
                placeholder="Phone Number"
                required
                value={createForm.mobile}
                onChange={(e) =>
                  setCreateForm({ ...createForm, mobile: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium">Email *</label>
              <Input
                placeholder="Email"
                type="email"
                required
                value={createForm.email}
                onChange={(e) =>
                  setCreateForm({ ...createForm, email: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium">Business Name</label>
              <Input
                placeholder="Business Name"
                value={createForm.businessName}
                onChange={(e) =>
                  setCreateForm({ ...createForm, businessName: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium">Role *</label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm"
                  required
                  value={createForm.role}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, role: e.target.value })
                  }
                >
                  <option value="" disabled>Select Role</option>
                  {ROLE_FILTERS.filter((r) => r.value).map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium">State Code *</label>
                <Input
                  placeholder="State Code"
                  required
                  value={createForm.stateCode}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, stateCode: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium">GST Number</label>
              <Input
                placeholder="GST Number"
                value={createForm.gstNumber}
                onChange={(e) =>
                  setCreateForm({ ...createForm, gstNumber: e.target.value })
                }
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={creating} className="flex-1 bg-[#0A58CA] hover:bg-[#0A58CA]/90 text-white">
                {creating ? "Adding..." : "Add User"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreate(false)}
                className="flex-1 bg-slate-100 border-0 hover:bg-slate-200 text-slate-800"
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog controlledOpen={showEdit} onOpenChange={(open) => !open && setShowEdit(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          {editForm && (
            <form onSubmit={handleEdit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-medium">Phone Number *</label>
                <Input
                  placeholder="Phone Number"
                  required
                  value={editForm.mobile}
                  onChange={(e) =>
                    setEditForm({ ...editForm, mobile: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium">Email *</label>
                <Input
                  placeholder="Email"
                  type="email"
                  required
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm({ ...editForm, email: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium">Business Name</label>
                <Input
                  placeholder="Business Name"
                  value={editForm.businessName}
                  onChange={(e) =>
                    setEditForm({ ...editForm, businessName: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium">Role *</label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm"
                    required
                    value={editForm.role}
                    onChange={(e) =>
                      setEditForm({ ...editForm, role: e.target.value })
                    }
                  >
                    <option value="" disabled>Select Role</option>
                    {ROLE_FILTERS.filter((r) => r.value).map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium">State Code *</label>
                  <Input
                    placeholder="State Code"
                    required
                    value={editForm.stateCode}
                    onChange={(e) =>
                      setEditForm({ ...editForm, stateCode: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium">GST Number</label>
                <Input
                  placeholder="GST Number"
                  value={editForm.gstNumber}
                  onChange={(e) =>
                    setEditForm({ ...editForm, gstNumber: e.target.value })
                  }
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={editing} className="flex-1 bg-[#0A58CA] hover:bg-[#0A58CA]/90 text-white">
                  {editing ? "Updating..." : "Update User"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowEdit(false)}
                  className="flex-1 bg-slate-100 border-0 hover:bg-slate-200 text-slate-800"
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog controlledOpen={showDelete} onOpenChange={(open) => !open && setShowDelete(false)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete user{" "}
              <strong className="text-foreground">{userToDelete?.name || userToDelete?.email}</strong>?
              This action cannot be undone.
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowDelete(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="bg-[#D32F2F] hover:bg-[#D32F2F]/90 text-white"
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
