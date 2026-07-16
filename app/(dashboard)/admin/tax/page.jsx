"use client";

import { useState, useEffect } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

function TaxPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch(`${API}/tax/rules`, { credentials: "include" });
    const j = await res.json();
    setItems(j.data?.items || j.data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold tracking-tight">Tax Rules</h1><p className="text-sm text-muted-foreground">{items.length} rules configured</p></div>
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/30">
            <tr>
              <th className="h-10 px-4 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground">Name</th>
              <th className="h-10 px-4 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground">Type</th>
              <th className="h-10 px-4 text-right text-[10px] font-black uppercase tracking-widest text-muted-foreground">Rate</th>
              <th className="h-10 px-4 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground">HSN</th>
              <th className="h-10 px-4 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? [...Array(3)].map((_, i) => <tr key={i}><td colSpan={5} className="px-4 py-3"><div className="h-4 bg-muted animate-pulse rounded" /></td></tr>) :
              items.length === 0 ? <tr><td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">No tax rules</td></tr> :
              items.map((r) => (
                <tr key={r.id} className="hover:bg-muted/50">
                  <td className="px-4 py-3 text-xs font-medium">{r.name}</td>
                  <td className="px-4 py-3 text-xs">{r.type}</td>
                  <td className="px-4 py-3 text-xs text-right font-black">{r.rate}%</td>
                  <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{r.hsnCode || "---"}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${r.status ? "bg-emerald-100 text-emerald-800" : "bg-muted text-muted-foreground"}`}>{r.status ? "Active" : "Inactive"}</span></td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TaxPage;
