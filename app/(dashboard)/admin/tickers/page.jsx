"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

const TYPE_VARIANT = {
  INFO: "info",
  WARNING: "warning",
  SUCCESS: "success",
};

function TickersPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ message: "", type: "INFO" });
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const data = await api.get("/tickers");
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
      await api.post("/tickers", form);
      setShowForm(false);
      setForm({ message: "", type: "INFO" });
      load();
    } catch {
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this ticker?")) return;
    try {
      await api.delete(`/tickers/${id}`);
      load();
    } catch {
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ticker Messages"
        description={`${items.length} messages`}
        actions={
          <Button onClick={() => setShowForm(!showForm)} variant={showForm ? "outline" : "default"}>
            {showForm ? "Cancel" : "New Ticker"}
          </Button>
        }
      />

      {showForm && (
        <div className="bg-card border border-border rounded-lg p-6">
          <form onSubmit={handleCreate} className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="block text-xs font-medium mb-1">Message</label>
              <Input
                placeholder="Ticker message"
                required
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
              />
            </div>
            <div className="w-36">
              <label className="block text-xs font-medium mb-1">Type</label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INFO">Info</SelectItem>
                  <SelectItem value="WARNING">Warning</SelectItem>
                  <SelectItem value="SUCCESS">Success</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Creating..." : "Create"}
            </Button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">No tickers found</div>
      ) : (
        <div className="space-y-2">
          {items.map((t) => (
            <div key={t.id} className="bg-card border border-border rounded-lg p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge variant={TYPE_VARIANT[t.type] || "default"}>{t.type}</Badge>
                <span className="text-sm">{t.message}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => handleDelete(t.id)} className="text-destructive hover:text-destructive">
                Delete
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TickersPage;
