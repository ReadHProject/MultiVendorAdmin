"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { formatMoney, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/admin/status-badge";
import { DataTable } from "@/components/ui/data-table";
import { MobileFooter, MobileHeader } from "@/components/admin/mobile/mobile-layout";
import { Icon } from "@/components/ui/icon";

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  const fetchUser = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/users/${params.id}`);
      setUser(res);
    } catch (err) {
      setError(err.message || "Failed to load user");
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive mb-2">{error}</p>
        <Button variant="outline" onClick={fetchUser}>
          Retry
        </Button>
      </div>
    );
  }

  const u = user;
  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "orders", label: "Orders" },
  ];

  const orderColumns = [
    {
      header: "Order #",
      cell: (row) => (
        <span className="text-xs font-bold">{row.orderNumber}</span>
      ),
    },
    {
      header: "Status",
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: "Payment",
      cell: (row) => <StatusBadge status={row.paymentStatus} />,
    },
    {
      header: "Total",
      className: "text-right",
      cell: (row) => (
        <span className="text-xs font-black">
          {formatMoney(row.grandTotal)}
        </span>
      ),
    },
    {
      header: "Date",
      cell: (row) => (
        <span className="text-xs text-muted-foreground">
          {formatDate(row.createdAt)}
        </span>
      ),
    },
    {
      header: "Actions",
      className: "text-right",
      cell: (row) => (
        <Link
          href={`/admin/orders/${row.id}`}
          className="text-xs text-primary hover:underline"
        >
          View
        </Link>
      ),
    },
  ];

  return (
    <>
      <div className="hidden md:block">
        <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-8 h-8 rounded-md border border-border flex items-center justify-center hover:bg-muted"
          >
            ←
          </button>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-muted overflow-hidden flex items-center justify-center">
              {u?.avatar ? (
                <img
                  src={u.avatar}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-muted-foreground text-lg">👤</span>
              )}
            </div>
            <div>
              <h1 className="text-lg font-black">{u?.name}</h1>
              <p className="text-xs text-muted-foreground">{u?.email}</p>
            </div>
          </div>
        </div>
        <StatusBadge status={u?.status} />
      </div>

      <div className="flex gap-1 border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4 space-y-3">
              <h3 className="text-sm font-bold">Account Details</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Name</span>
                  <span className="font-medium">{u?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email</span>
                  <span className="font-medium">{u?.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mobile</span>
                  <span className="font-medium">{u?.mobile || "---"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Business</span>
                  <span className="font-medium">
                    {u?.businessName || "---"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Joined</span>
                  <span className="font-medium">{formatDate(u?.createdAt)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 space-y-3">
              <h3 className="text-sm font-bold">Roles & Status</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <StatusBadge status={u?.status} />
                </div>
                <div>
                  <span className="text-muted-foreground">Roles</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(Array.isArray(u?.roles) ? u?.roles : []).map((r) => (
                      <span
                        key={typeof r === 'string' ? r : r.id || r.name}
                        className="px-1.5 py-0.5 bg-primary/10 text-primary rounded text-[9px] font-bold"
                      >
                        {typeof r === 'string' ? r : r.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "orders" && (
        <Card>
          <CardHeader>
            <CardTitle>Orders ({u?.orders?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <DataTable
              columns={orderColumns}
              data={u?.orders || []}
              empty="No orders found"
            />
          </CardContent>
        </Card>
      )}
    </div>
    </div>

      {/* Mobile UI */}
      <div className="block md:hidden pb-24 min-h-screen bg-slate-950 text-slate-200">
        <MobileHeader title="User Profile" showMenu={false} />
        
        <div className="p-4 space-y-4">
          <div className="flex items-center gap-4 bg-slate-900 border border-slate-800 rounded-custom p-4">
            <div className="h-14 w-14 rounded-full bg-slate-800 overflow-hidden flex items-center justify-center shrink-0 border border-slate-700">
              {u?.avatar ? (
                <img src={u.avatar} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="text-slate-500 text-2xl">👤</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold text-white truncate">{u?.name}</h1>
              <p className="text-xs text-slate-400 truncate">{u?.email}</p>
            </div>
          </div>
          
          <div className="bg-slate-900 border border-slate-800 rounded-custom p-4 space-y-3">
             <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Account Details</h3>
             <div className="flex justify-between text-sm">
                <span className="text-slate-400">Status</span>
                <StatusBadge status={u?.status} />
             </div>
             <div className="flex justify-between text-sm">
                <span className="text-slate-400">Mobile</span>
                <span className="font-medium text-slate-300">{u?.mobile || "---"}</span>
             </div>
             <div className="flex justify-between text-sm">
                <span className="text-slate-400">Business</span>
                <span className="font-medium text-slate-300">{u?.businessName || "---"}</span>
             </div>
             <div className="flex justify-between text-sm">
                <span className="text-slate-400">Joined</span>
                <span className="font-medium text-slate-300">{formatDate(u?.createdAt)}</span>
             </div>
             <div>
                <span className="text-slate-400 text-sm block mb-1">Roles</span>
                <div className="flex flex-wrap gap-1">
                  {(Array.isArray(u?.roles) ? u?.roles : []).map((r) => (
                    <span key={typeof r === 'string' ? r : r.id || r.name} className="px-2 py-0.5 bg-accent/20 text-accent rounded text-[10px] font-bold">
                      {typeof r === 'string' ? r : r.name}
                    </span>
                  ))}
                </div>
             </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-custom p-4 space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Orders ({u?.orders?.length || 0})</h3>
            {u?.orders?.length > 0 ? (
              <div className="space-y-3">
                {u.orders.map((row) => (
                  <Link 
                    key={row.id} 
                    href={`/admin/orders/${row.id}`}
                    className="block bg-slate-950 border border-slate-800 rounded-lg p-3 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-sm text-white">{row.orderNumber}</h4>
                      <StatusBadge status={row.status} />
                    </div>
                    <div className="flex justify-between items-end mt-1">
                      <div className="text-xs text-slate-400">
                        <div className="flex items-center gap-1"><Icon name="calendar" size={12}/> {formatDate(row.createdAt)}</div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-black text-emerald-400">{formatMoney(row.grandTotal)}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No orders found</p>
            )}
          </div>
        </div>
        
        <MobileFooter />
      </div>
    </>
  );
}
