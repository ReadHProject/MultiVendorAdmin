"use client";

import { useState, useEffect } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

function SKUsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch(`${API}/skus`, { credentials: "include" });
    const j = await res.json();
    setItems(j.data?.items || j.data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold tracking-tight">SKU Management</h1><p className="text-sm text-muted-foreground">{items.length} SKUs</p></div>
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/30">
            <tr>
              <th className="h-10 px-4 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground">SKU</th>
              <th className="h-10 px-4 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground">Product</th>
              <th className="h-10 px-4 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground">Variant</th>
              <th className="h-10 px-4 text-right text-[10px] font-black uppercase tracking-widest text-muted-foreground">Price</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? [...Array(5)].map((_, i) => <tr key={i}><td colSpan={4} className="px-4 py-3"><div className="h-4 bg-muted animate-pulse rounded" /></td></tr>) :
              items.length === 0 ? <tr><td colSpan={4} className="px-4 py-12 text-center text-muted-foreground">No SKUs</td></tr> :
              items.map((s) => (
                <tr key={s.id} className="hover:bg-muted/50">
                  <td className="px-4 py-3 text-xs font-mono font-bold">{s.sku}</td>
                  <td className="px-4 py-3 text-xs">{s.product?.name || "---"}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{s.name || "---"}</td>
                  <td className="px-4 py-3 text-xs text-right font-black">{s.price ? `₹${s.price}` : "---"}</td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SKUsPage;
