"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { cn, formatMoney, formatDate } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { KpiCard } from "@/components/admin/kpi-card";
import { MobileFooter, MobileHeader } from "@/components/admin/mobile/mobile-layout";

const QUICK_ACTIONS = [
  { label: "New Order", icon: "shopping-cart", href: "/admin/orders" },
  { label: "Inventory", icon: "warehouse", href: "/admin/inventory" },
  { label: "Suppliers", icon: "truck", href: "/admin/suppliers" },
  { label: "Reports", icon: "bar-chart", href: "/admin/reports" },
  { label: "Commissions", icon: "cash", href: "/admin/commissions" },
  { label: "Users", icon: "users", href: "/admin/users" },
];

const STATUS_COLORS = {
  pending: "warning",
  confirmed: "info",
  processing: "info",
  shipped: "secondary",
  delivered: "success",
  cancelled: "destructive",
  draft: "default",
};

function SkeletonCard() {
  return <div className="h-32 bg-muted animate-pulse rounded-xl" />;
}

function SkeletonTable() {
  return (
    <div className="space-y-3 p-6">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-10 bg-muted animate-pulse rounded" />
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const data = await api.get("/dashboard/summary");
        setSummary(data);
      } catch (err) {
        if (err.status === 401) {
          localStorage.removeItem("erp_access_token");
          window.location.href = "/login";
          return;
        }
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <SkeletonTable />
          </div>
          <div className="space-y-6">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Icon name="alert-triangle" size={48} className="mx-auto text-destructive mb-4" />
          <p className="text-sm text-muted-foreground">Failed to load dashboard data</p>
          <p className="text-xs text-destructive mt-1">{error}</p>
        </div>
      </div>
    );
  }

  const recentOrders = summary?.recentOrders || [];
  const lowStock = summary?.lowStock || [];
  const commissionRanking = summary?.commissionRanking || [];

  return (
    <>
      {/* Desktop UI */}
      <div className="space-y-6 hidden md:block">
        <section className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black tracking-tight text-foreground">Dashboard</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Real-time overview of your business</p>
          </div>
        </section>

        <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <KpiCard label="Total Orders" value={summary?.totalOrders || 0} iconName="shopping-cart" tone="primary" hint="All time" />
          <KpiCard label="Commission Wallet" value={formatMoney(summary?.commissionWallet || 0)} iconName="cash" tone="success" hint="Available balance" />
          <KpiCard label="Pending Drafts" value={summary?.pendingDrafts || 0} iconName="file-text" tone="warning" hint="Awaiting confirmation" />
          <KpiCard label="Monthly Revenue" value={formatMoney(summary?.revenueThisMonth || 0)} iconName="trending-up" tone="success" hint="This month" />
          <KpiCard label="Low Stock Alert" value={lowStock.length} iconName="alert-triangle" tone="danger" hint="Items below threshold" />
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm uppercase tracking-widest">Recent Orders</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 border-b border-border/60">
                      <tr>
                        <th className="h-10 px-4 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground">Order</th>
                        <th className="h-10 px-4 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground">Customer</th>
                        <th className="h-10 px-4 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status</th>
                        <th className="h-10 px-4 text-right text-[10px] font-black uppercase tracking-widest text-muted-foreground">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {recentOrders.length === 0 ? (
                        <tr><td colSpan={4} className="p-8 text-center text-muted-foreground text-sm">No orders yet</td></tr>
                      ) : (
                        recentOrders.map((order) => (
                          <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                            <td className="px-4 py-3"><Link href={`/admin/orders/${order.id}`} className="text-xs font-bold text-primary hover:underline">{order.orderNumber}</Link></td>
                            <td className="px-4 py-3 text-xs">{order.user?.name || "---"}</td>
                            <td className="px-4 py-3"><Badge variant={STATUS_COLORS[order.status] || "default"}>{order.status}</Badge></td>
                            <td className="px-4 py-3 text-xs font-black text-right">{formatMoney(order.grandTotal)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle className="text-sm uppercase tracking-widest">Commission Ranking</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {commissionRanking.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No commission data</p>
                  ) : (
                    commissionRanking.slice(0, 5).map((item, index) => (
                      <div key={item.id || index} className="flex items-center justify-between p-2 hover:bg-muted/20 rounded-lg transition-colors">
                        <div className="flex items-center gap-3">
                          <span className={cn("flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-black", index === 0 ? "bg-amber-100 text-amber-800" : index === 1 ? "bg-slate-100 text-slate-800" : index === 2 ? "bg-orange-100 text-orange-800" : "bg-muted text-muted-foreground")}>{index + 1}</span>
                          <span className="text-xs font-bold truncate max-w-[120px]">{item.name || item.salesperson?.name}</span>
                        </div>
                        <span className="text-xs font-black text-emerald-600">{formatMoney(item.commission || item.totalCommission || 0)}</span>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className={cn(lowStock.length > 0 && "border-destructive/30 bg-destructive/5")}>
              <CardHeader><CardTitle className="text-sm uppercase tracking-widest text-destructive">Critical Stock Alerts</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {lowStock.length === 0 ? (
                    <p className="text-xs text-muted-foreground">All stock healthy</p>
                  ) : (
                    lowStock.slice(0, 5).map((item) => (
                      <div key={item.id} className="flex justify-between items-center text-[10px] p-2 hover:bg-muted/30 rounded-lg transition-colors">
                        <span className="font-bold truncate pr-2">{item.product?.name}</span>
                        <Badge variant="destructive">{item.quantity} Left</Badge>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-sm uppercase tracking-widest">Quick Actions</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3">
                  {QUICK_ACTIONS.map((action) => (
                    <Link key={action.href} href={action.href} className="flex flex-col items-center gap-2 p-3 rounded-lg border border-border/60 hover:border-primary/30 hover:bg-primary/5 hover:shadow-sm transition-all duration-300">
                      <Icon name={action.icon} size={20} className="text-primary" />
                      <span className="text-[10px] font-bold text-center">{action.label}</span>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>

      {/* Mobile UI */}
      <div className="block md:hidden pb-24 min-h-screen bg-slate-950 text-slate-200">
        <MobileHeader title="Dashboard" showMenu={true} />

        <div className="p-4 space-y-6">
          {/* Welcome Section */}
          <section className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-white">Welcome back!</h1>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[11px] font-bold uppercase tracking-wider">Admin</span>
              <span className="text-slate-400 text-sm">Nexus Systems</span>
            </div>
          </section>

          {/* Stats Grid */}
          <section className="grid grid-cols-2 gap-3">
            <div className="bg-slate-900 p-4 rounded-custom border border-slate-800 flex flex-col justify-between shadow-sm">
              <div>
                <div className="flex justify-between items-start">
                  <Icon name="shopping-cart" size={20} className="text-white" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Orders</span>
                </div>
                <p className="text-2xl font-bold mt-2 text-white">{summary?.totalOrders || 0}</p>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Total Orders</p>
            </div>
            
            <div className="bg-slate-900 p-4 rounded-custom border border-slate-800 flex flex-col justify-between shadow-sm">
              <div>
                <div className="flex justify-between items-start">
                  <Icon name="file-text" size={20} className="text-amber-500" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Drafts</span>
                </div>
                <p className="text-2xl font-bold mt-2 text-white">{summary?.pendingDrafts || 0}</p>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Pending Drafts</p>
            </div>

            <div className="bg-slate-900 p-4 rounded-custom border border-slate-800 flex flex-col justify-between shadow-sm">
              <div>
                <div className="flex justify-between items-start">
                  <Icon name="trending-up" size={20} className="text-emerald-500" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Revenue</span>
                </div>
                <p className="text-xl font-bold mt-2 text-emerald-400 truncate">{formatMoney(summary?.revenueThisMonth || 0)}</p>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">This Month</p>
            </div>

            <div className="bg-slate-900 p-4 rounded-custom border border-slate-800 flex flex-col justify-between shadow-sm">
              <div>
                <div className="flex justify-between items-start">
                  <Icon name="cash" size={20} className="text-blue-400" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Wallet</span>
                </div>
                <p className="text-xl font-bold mt-2 text-blue-400 truncate">{formatMoney(summary?.commissionWallet || 0)}</p>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Available</p>
            </div>
          </section>

          {/* Quick Actions Grid */}
          <section className="space-y-3">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest px-1">Quick Actions</h3>
            <div className="grid grid-cols-3 gap-3">
              {QUICK_ACTIONS.map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="bg-slate-900 p-4 rounded-custom shadow-sm border border-slate-800 flex flex-col items-center gap-2 active:bg-slate-800 transition-colors"
                >
                  <Icon name={action.icon} size={24} className="text-slate-300" />
                  <span className="text-[11px] font-semibold text-slate-300 text-center">{action.label}</span>
                </Link>
              ))}
            </div>
          </section>

          {/* Recent Orders */}
          <section className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Recent Orders</h3>
              <Link href="/admin/orders" className="text-white text-xs font-bold border-b border-transparent hover:border-white">View All</Link>
            </div>
            <div className="space-y-3">
              {recentOrders.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-sm border border-slate-800 rounded-custom bg-slate-900">No orders yet</div>
              ) : (
                recentOrders.map((order) => (
                  <Link key={order.id} href={`/admin/orders/${order.id}`} className="block bg-slate-900 p-4 rounded-custom border border-slate-800 active:bg-slate-800 transition-colors">
                    <div className="flex justify-between items-center">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">{order.orderNumber}</span>
                          <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[9px] font-black uppercase">
                            {order.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">{formatDate(order.createdAt)} • {order.user?.name || "Guest"}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-white">{formatMoney(order.grandTotal)}</p>
                        <p className="text-[10px] text-slate-400">{order.paymentMethod || "N/A"}</p>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </section>

          {/* Critical Stock Alerts */}
          {lowStock.length > 0 && (
            <section className="space-y-3">
              <h3 className="text-sm font-bold text-red-400 uppercase tracking-widest px-1">Critical Stock Alerts</h3>
              <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-custom shadow-sm space-y-3">
                {lowStock.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex justify-between items-center text-[10px]">
                    <span className="font-bold text-white truncate pr-2">{item.product?.name}</span>
                    <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 font-black uppercase text-[9px]">{item.quantity} Left</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Help Widget */}
          <section className="bg-slate-900 p-6 rounded-custom border border-slate-800 flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center text-white flex-shrink-0">
              <Icon name="headset" size={24} />
            </div>
            <div className="flex-grow">
              <h4 className="font-bold text-sm text-white">Need Help?</h4>
              <p className="text-xs text-slate-400 leading-tight">Chat with your account manager for inventory support.</p>
            </div>
            <button className="bg-white text-slate-900 p-2 rounded-full shadow-lg active:scale-95 transition-transform">
              <Icon name="message-circle" size={20} />
            </button>
          </section>
        </div>

        <MobileFooter />
      </div>
    </>
  );
}
