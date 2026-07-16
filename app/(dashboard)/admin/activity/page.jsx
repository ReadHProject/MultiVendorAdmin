"use client";

import { useState, useEffect } from "react";
import { formatDate } from "@/lib/utils";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

function ActivityPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  async function load() {
    setLoading(true);
    const [actRes, statsRes] = await Promise.all([
      fetch(`${API}/activities`, { credentials: "include" }),
      fetch(`${API}/activities/stats`, { credentials: "include" }),
    ]);
    const actJ = await actRes.json();
    const statsJ = await statsRes.json();
    setItems(actJ.data?.items || []);
    setStats(statsJ.data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const typeIcons = { LOGIN: "login", CREATE: "add_circle", UPDATE: "edit", DELETE: "delete", APPROVE: "check_circle", REJECT: "cancel", STATUS_CHANGE: "swap_horiz", EXPORT: "download", IMPORT: "upload" };

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold tracking-tight">Activity Tracking</h1><p className="text-sm text-muted-foreground">User activity feed</p></div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-card border border-border rounded-lg p-4"><p className="text-[10px] font-black text-muted-foreground uppercase">Today</p><p className="text-xl font-black">{stats.todayCount}</p></div>
          <div className="bg-card border border-border rounded-lg p-4"><p className="text-[10px] font-black text-muted-foreground uppercase">This Week</p><p className="text-xl font-black">{stats.weekCount}</p></div>
        </div>
      )}

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="divide-y divide-border">
          {loading ? [...Array(5)].map((_, i) => <div key={i} className="p-4"><div className="h-8 bg-muted animate-pulse rounded" /></div>) :
            items.length === 0 ? <div className="p-12 text-center text-muted-foreground text-sm">No activity</div> :
            items.map((a) => (
              <div key={a.id} className="p-4 flex items-start gap-3 hover:bg-muted/50">
                <span className="material-symbols-outlined text-lg text-muted-foreground">{typeIcons[a.type] || "circle"}</span>
                <div className="flex-1">
                  <p className="text-xs">{a.description}</p>
                  <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
                    <span>{a.user?.name || "System"}</span>
                    <span>{formatDate(a.createdAt)}</span>
                    {a.ipAddress && <span className="font-mono">{a.ipAddress}</span>}
                  </div>
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
}

export default ActivityPage;
