"use client";

import { useState, useEffect } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

function StoresPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch(`${API}/stores`, { credentials: "include" });
    const j = await res.json();
    setItems(j.data?.items || j.data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold tracking-tight">Stores</h1><p className="text-sm text-muted-foreground">{items.length} stores</p></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? [...Array(3)].map((_, i) => <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />) :
          items.length === 0 ? <div className="col-span-3 text-center py-12 text-muted-foreground text-sm">No stores configured</div> :
          items.map((s) => (
            <div key={s.id} className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-bold text-sm">{s.name}</h3>
                  <p className="text-[10px] text-muted-foreground font-mono">{s.code}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${s.status === "ACTIVE" ? "bg-emerald-100 text-emerald-800" : "bg-muted text-muted-foreground"}`}>{s.status}</span>
              </div>
              <div className="text-[10px] text-muted-foreground space-y-0.5">
                <p>Type: {s.type}</p>
                {s.city && <p>{s.city}, {s.state}</p>}
                {s.phone && <p>{s.phone}</p>}
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );
}

export default StoresPage;
