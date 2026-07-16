"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

function SlidersPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", subtitle: "", image: "", url: "", status: "ACTIVE" });
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const data = await api.get("/sliders");
      setItems(data?.items || data || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/sliders", form);
      setShowForm(false);
      setForm({ title: "", subtitle: "", image: "", url: "", status: "ACTIVE" });
      load();
    } catch {
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this slider?")) return;
    try {
      await api.delete(`/sliders/${id}`);
      load();
    } catch {
    }
  }

  const STATUS_VARIANT = { ACTIVE: "success", INACTIVE: "default" };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sliders"
        description={`${items.length} sliders`}
        actions={
          <Button onClick={() => setShowForm(!showForm)} variant={showForm ? "outline" : "default"}>
            {showForm ? "Cancel" : "New Slider"}
          </Button>
        }
      />

      {showForm && (
        <div className="bg-card border border-border rounded-lg p-6">
          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1">Title *</label>
              <Input placeholder="Slider title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Subtitle</label>
              <Input placeholder="Subtitle" value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Image URL *</label>
              <Input placeholder="Image URL" required value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Link URL</label>
              <Input placeholder="Link URL" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />
            </div>
            <div className="sm:col-span-2 flex justify-end">
              <Button type="submit" disabled={submitting}>
                {submitting ? "Creating..." : "Create"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">No sliders found</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((s) => (
            <div key={s.id} className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
              <div className="h-36 bg-muted flex items-center justify-center">
                {s.image ? (
                  <img src={s.image} alt={s.title} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-muted-foreground text-xs">No Image</span>
                )}
              </div>
              <div className="p-3 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-sm">{s.title}</h3>
                    <p className="text-xs text-muted-foreground">{s.subtitle || "No subtitle"}</p>
                  </div>
                  <Badge variant={STATUS_VARIANT[s.status] || "default"}>{s.status}</Badge>
                </div>
                {s.url && (
                  <p className="text-[10px] text-primary truncate">{s.url}</p>
                )}
                <div className="flex justify-end">
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(s.id)} className="text-destructive hover:text-destructive text-xs">
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SlidersPage;
