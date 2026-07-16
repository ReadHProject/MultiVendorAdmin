"use client";

import { useState } from "react";
import { useGetRolesQuery, useCreateRoleMutation, useGetPermissionsQuery, useUpdateRoleMutation, useDeleteRoleMutation } from "@/store/api/slices/rolesApi";

function RolesPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [form, setForm] = useState({ name: "", description: "", permissionIds: [] });

  const { data, isLoading } = useGetRolesQuery();
  const { data: permsData } = useGetPermissionsQuery();
  const [createRole] = useCreateRoleMutation();
  const [updateRole] = useUpdateRoleMutation();
  const [deleteRole] = useDeleteRoleMutation();

  const roles = data?.data || [];
  const permGroups = permsData?.data || {};

  function startEdit(role) {
    setEditingRole(role);
    setForm({ name: role.name, description: role.description || "", permissionIds: role.permissions?.map((p) => p.id || p.permissionId) || [] });
    setShowForm(true);
  }

  function togglePermission(permId) {
    setForm((f) => ({
      ...f,
      permissionIds: f.permissionIds.includes(permId)
        ? f.permissionIds.filter((id) => id !== permId)
        : [...f.permissionIds, permId],
    }));
  }

  function selectAllInGroup(permIds) {
    setForm((f) => {
      const allSelected = permIds.every((id) => f.permissionIds.includes(id));
      return {
        ...f,
        permissionIds: allSelected
          ? f.permissionIds.filter((id) => !permIds.includes(id))
          : [...new Set([...f.permissionIds, ...permIds])],
      };
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (editingRole) {
        await updateRole({ id: editingRole.id, ...form }).unwrap();
      } else {
        await createRole(form).unwrap();
      }
      setShowForm(false);
      setEditingRole(null);
      setForm({ name: "", description: "", permissionIds: [] });
    } catch (err) {
      alert(err?.data?.error?.message || "Failed");
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this role?")) return;
    try { await deleteRole(id).unwrap(); } catch (err) { alert(err?.data?.error?.message || "Cannot delete"); }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Roles & Permissions</h1>
          <p className="text-sm text-muted-foreground">{roles.length} roles configured</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditingRole(null); setForm({ name: "", description: "", permissionIds: [] }); }} className="h-9 px-4 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90">
          {showForm ? "Cancel" : "New Role"}
        </button>
      </div>

      {showForm && (
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-sm font-bold mb-4">{editingRole ? "Edit Role" : "Create Role"}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input className="h-9 px-3 rounded-md border border-input bg-background text-sm" placeholder="Role Name *" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <input className="h-9 px-3 rounded-md border border-input bg-background text-sm" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>

            <div className="border-t pt-4">
              <p className="text-xs font-bold mb-3">Permissions ({form.permissionIds.length} selected)</p>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {Object.entries(permGroups).map(([module, perms]) => {
                  const permIds = perms.map((p) => p.id);
                  const allSelected = permIds.every((id) => form.permissionIds.includes(id));
                  const someSelected = permIds.some((id) => form.permissionIds.includes(id));
                  return (
                    <div key={module} className="border rounded-md p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <input type="checkbox" checked={allSelected} ref={(el) => { if (el) el.indeterminate = someSelected && !allSelected; }} onChange={() => selectAllInGroup(permIds)} className="rounded" />
                        <span className="text-xs font-bold uppercase tracking-wide">{module}</span>
                      </div>
                      <div className="flex flex-wrap gap-1 ml-6">
                        {perms.map((p) => (
                          <button key={p.id} type="button" onClick={() => togglePermission(p.id)} className={`px-2 py-0.5 rounded text-[10px] font-medium border transition-colors ${form.permissionIds.includes(p.id) ? "bg-primary text-primary-foreground border-primary" : "bg-background text-muted-foreground border-border hover:bg-muted"}`}>
                            {p.action}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => { setShowForm(false); setEditingRole(null); }} className="h-9 px-4 border border-border rounded-md text-sm hover:bg-muted">Cancel</button>
              <button type="submit" className="h-9 px-4 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90">
                {editingRole ? "Update Role" : "Create Role"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          [...Array(6)].map((_, i) => <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />)
        ) : roles.map((role) => (
          <div key={role.id} className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-bold text-sm">{role.name}</h3>
                <p className="text-[10px] text-muted-foreground">{role.description || "No description"}</p>
              </div>
              {role.isSystem && <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded text-[9px] font-bold">SYSTEM</span>}
            </div>
            <div className="flex items-center gap-4 text-[10px] text-muted-foreground mb-3">
              <span>{role._count?.users || 0} users</span>
              <span>{role._count?.permissions || 0} permissions</span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => startEdit(role)} className="flex-1 h-7 border border-border rounded text-xs font-medium hover:bg-muted">Edit</button>
              {!role.isSystem && <button onClick={() => handleDelete(role.id)} className="h-7 px-3 border border-destructive/20 text-destructive rounded text-xs font-medium hover:bg-destructive/5">Delete</button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RolesPage;
