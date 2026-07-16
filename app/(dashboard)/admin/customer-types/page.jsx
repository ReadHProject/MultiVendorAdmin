"use client";

import { useState, useEffect } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

function CustomerTypesPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", discountPct: 0, sortOrder: 0 });

  async function load() {
    setLoading(true);
    const res = await fetch(`${API}/customer-types`, { credentials: "include" });
    const j = await res.json();
    setItems(j.data?.items || j.data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleCreate(e) {
    e.preventDefault();
    await fetch(`${API}/customer-types`, { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(form) });
    setShowForm(false); setForm({ name: "", description: "", discountPct: 0, sortOrder: 0 }); load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold tracking-tight">Customer Types</h1><p className="text-sm text-muted-foreground">{items.length} types</p></div>
        <button onClick={() => setShowForm(!showForm)} className="h-9 px-4 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90">{showForm ? "Cancel" : "New Type"}</button>
      </div>
      {showForm && (
        <div className="bg-card border border-border rounded-lg p-6">
          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input className="h-9 px-3 rounded-md border border-input bg-background text-sm" placeholder="Name *" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input className="h-9 px-3 rounded-md border border-input bg-background text-sm" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <input type="number" className="h-9 px-3 rounded-md border border-input bg-background text-sm" placeholder="Discount %" value={form.discountPct} onChange={(e) => setForm({ ...form, discountPct: Number(e.target.value) })} />
            <div className="flex gap-2"><input type="number" className="flex-1 h-9 px-3 rounded-md border border-input bg-background text-sm" placeholder="Sort Order" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} />
            <button type="submit" className="h-9 px-4 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90">Create</button></div>
          </form>
        </div>
      )}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/30">
            <tr>
              <th className="h-10 px-4 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground">Name</th>
              <th className="h-10 px-4 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground">Description</th>
              <th className="h-10 px-4 text-right text-[10px] font-black uppercase tracking-widest text-muted-foreground">Discount</th>
              <th className="h-10 px-4 text-right text-[10px] font-black uppercase tracking-widest text-muted-foreground">Sort</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? [...Array(3)].map((_, i) => <tr key={i}><td colSpan={4} className="px-4 py-3"><div className="h-4 bg-muted animate-pulse rounded" /></td></tr>) :
              items.map((ct) => (
                <tr key={ct.id} className="hover:bg-muted/50">
                  <td className="px-4 py-3 text-xs font-medium">{ct.name}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{ct.description || "---"}</td>
                  <td className="px-4 py-3 text-xs text-right">{ct.discountPct}%</td>
                  <td className="px-4 py-3 text-xs text-right text-muted-foreground">{ct.sortOrder}</td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CustomerTypesPage;
