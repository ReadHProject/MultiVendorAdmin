"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ImageUploader, resolveImageUrl } from "@/components/admin/image-uploader";

function SlidersPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", subtitle: "", image: "", buttonText: "", url: "", status: true });
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
      setForm({ title: "", subtitle: "", image: "", buttonText: "", url: "", status: true });
      load();
    } catch (err) {
      alert(err.message || "Failed to create slider");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggleStatus(slider) {
    try {
      await api.put(`/sliders/${slider.id}`, { ...slider, status: !slider.status });
      load();
    } catch (err) {
      alert(err.message || "Failed to update status");
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
          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1">Title *</label>
              <Input placeholder="Slider title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Subtitle</label>
              <Input placeholder="Subtitle" value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium mb-1">Banner Image *</label>
              <ImageUploader 
                value={form.image ? [form.image] : []} 
                onChange={(urls) => setForm({ ...form, image: urls[0] || "" })} 
                maxFiles={1} 
                purpose="slider"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Button Text</label>
              <Input placeholder="E.g. Shop Now" value={form.buttonText} onChange={(e) => setForm({ ...form, buttonText: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Link URL</label>
              <Input placeholder="/store/products" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Status</label>
              <select 
                value={form.status ? "true" : "false"} 
                onChange={(e) => setForm({ ...form, status: e.target.value === "true" })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
            <div className="sm:col-span-2 flex justify-end">
              <Button type="submit" disabled={submitting || !form.image}>
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
              <div className="h-48 bg-muted flex items-center justify-center relative group">
                {s.image ? (
                  <img src={resolveImageUrl(s.image)} alt={s.title} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-muted-foreground text-xs">No Image</span>
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="secondary" size="sm" onClick={() => handleToggleStatus(s)}>
                    {s.status ? "Mark Inactive" : "Mark Active"}
                  </Button>
                </div>
              </div>
              <div className="p-3 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-sm">{s.title}</h3>
                    <p className="text-xs text-muted-foreground">{s.subtitle || "No subtitle"}</p>
                  </div>
                  <Badge variant={s.status ? "success" : "default"}>{s.status ? "ACTIVE" : "INACTIVE"}</Badge>
                </div>
                {s.buttonText && (
                  <p className="text-[11px] text-muted-foreground">Btn: {s.buttonText}</p>
                )}
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
