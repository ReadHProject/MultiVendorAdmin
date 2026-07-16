"use client";
import { useEffect, useState } from "react";
import { PageContainer } from "@/components/admin/page-container";
import { StatusBadge } from "@/components/admin/status-badge";
import { FilterBar } from "@/components/admin/filter-bar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { toast } from "@/components/ui/toaster";
import { DataTable } from "@/components/ui/data-table";

export function CrudListPage({title, description, endpoint, searchPlaceholder = "Search..."}) {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");

  async function load() {
    const res = await fetch(endpoint + (q ? `?q=${encodeURIComponent(q)}` : ""));
    const json = await res.json();
    setItems(json.data || []);
  }
  useEffect(() => { load(); }, [q, endpoint]);

  async function create(e) {
    e.preventDefault();
    const res = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
    const json = await res.json();
    if (!res.ok) return toast(json.error?.message || "Failed", "error");
    toast("Created", "success");
    setShowForm(false); setName(""); load();
  }

  async function deactivate(id) {
    if (!confirm("Deactivate?")) return;
    const res = await fetch(`${endpoint}/${id}`, { method: "DELETE" });
    if (res.ok) { toast("Deactivated", "success"); load(); }
  }

  const columns = [
    { header: "Name", cell: (i) => <span className="font-medium">{i.name}</span> },
    { header: "Slug", cell: (i) => <span className="font-mono text-xs text-muted-foreground">{i.slug}</span> },
    { header: "Status", cell: (i) => <StatusBadge status={i.status} /> },
    {

      cell: (i) => (
        <Button variant="ghost" size="sm" onClick={() => deactivate(i.id)} className="text-destructive hover:text-destructive">
          <Icon name="trash" size={14} />
        </Button>
      )
    }
  ];

  return (
    <PageContainer>
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <Button onClick={() => setShowForm((s) => !s)}><Icon name={showForm ? "x" : "plus"} size={14} /> {showForm ? "Cancel" : "New"}</Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={create} className="flex gap-2">
              <input required autoFocus className="h-9 flex-1 rounded-md border border-input bg-background px-3 py-1 text-sm" placeholder="Name *" value={name} onChange={(e) => setName(e.target.value)} />
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button type="submit">Create</Button>
            </form>
          </CardContent>
        </Card>
      )}

      <FilterBar search={q} onSearchChange={setQ} searchPlaceholder={searchPlaceholder} />
      <DataTable columns={columns} data={items} rowKey={(i) => i.id} empty={`No ${title.toLowerCase()} yet`} />
    </PageContainer>
  );
}
