"use client";

import { useState, useEffect } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

function GSTPage() {
  const [filings, setFilings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("filings");

  async function load() {
    setLoading(true);
    const res = await fetch(`${API}/gst/filings`, { credentials: "include" });
    const j = await res.json();
    setFilings(j.data?.items || j.data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold tracking-tight">GST Management</h1><p className="text-sm text-muted-foreground">GST filings and compliance</p></div>
      </div>
      <div className="flex gap-2">
        <button onClick={() => setTab("filings")} className={`h-9 px-4 rounded-md text-sm font-medium ${tab === "filings" ? "bg-primary text-primary-foreground" : "border border-border hover:bg-muted"}`}>Filings</button>
        <button onClick={() => setTab("hsn")} className={`h-9 px-4 rounded-md text-sm font-medium ${tab === "hsn" ? "bg-primary text-primary-foreground" : "border border-border hover:bg-muted"}`}>HSN Summary</button>
      </div>
      <div className="bg-card border border-border rounded-lg p-6">
        {tab === "filings" ? (
          filings.length === 0 ? <p className="text-center text-muted-foreground py-8 text-sm">No filings yet</p> : (
            <div className="text-sm">Filing records will appear here.</div>
          )
        ) : (
          <p className="text-center text-muted-foreground py-8 text-sm">HSN-wise summary report</p>
        )}
      </div>
    </div>
  );
}

export default GSTPage;
