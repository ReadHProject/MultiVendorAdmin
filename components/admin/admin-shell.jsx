"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useDispatch } from "react-redux";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { api } from "@/lib/api";
import { logout } from "@/store/slices/authSlice";

const NAV = [
  { label: "Dashboard", icon: "dashboard", href: "/admin" },
  { label: "Users", icon: "group", href: "/admin/users" },
  { label: "Products", icon: "category", href: "/admin/products" },
  { label: "Categories", icon: "account_tree", href: "/admin/categories" },
  { label: "Inventory", icon: "inventory_2", href: "/admin/inventory" },
  { label: "Suppliers", icon: "handshake", href: "/admin/suppliers" },
  { label: "Purchase Orders", icon: "receipt_long", href: "/admin/purchase-orders" },
  { label: "Orders", icon: "shopping_cart", href: "/admin/orders" },
];

export function AdminShell({ user = { name: "Admin", roles: ["ADMIN"] }, children }) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const handleToggle = () => setIsSidebarOpen(prev => !prev);
    const handleClose = () => setIsSidebarOpen(false);

    document.addEventListener('toggle-sidebar', handleToggle);
    document.addEventListener('close-sidebar', handleClose);

    return () => {
      document.removeEventListener('toggle-sidebar', handleToggle);
      document.removeEventListener('close-sidebar', handleClose);
    };
  }, []);

  const isActive = (href) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname === href || pathname.startsWith(href + "/");
  };

  async function handleLogout() {
    try {
      await api.post("/auth/logout");
    } catch { }
    localStorage.removeItem("erp_access_token");
    dispatch(logout());
    router.push("/login");
  }

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar Overlay (Mobile) */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 h-full z-50 bg-slate-900 dark:bg-slate-950 flex flex-col border-r border-slate-700 dark:border-slate-800 transition-all duration-300",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        isCollapsed ? "w-sidebar md:w-sidebar-collapsed" : "w-sidebar"
      )}>
        {/* Logo */}
        <div className={cn(
            "p-6 flex items-center justify-between transition-all duration-300",
            isCollapsed ? "md:px-2 md:justify-center" : "px-6"
        )}>
          <div className={cn("overflow-hidden transition-all", isCollapsed ? "md:hidden md:opacity-0" : "opacity-100")}>
            <h1 className="text-xl font-black text-white tracking-tight">Nexus ERP</h1>
            <p className="text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase mt-1">Admin Console</p>
          </div>
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex p-1 hover:bg-white/10 rounded-md text-white/60 hover:text-white transition-colors shrink-0 items-center justify-center"
          >
            <span className="material-symbols-outlined">
                {isCollapsed ? 'menu' : 'chevron_left'}
            </span>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-grow space-y-1 mt-4 overflow-y-auto">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsSidebarOpen(false)}
              className={cn(
                "flex items-center gap-3 py-2.5 rounded-lg mx-2 active:scale-95 transition-all",
                isActive(item.href)
                  ? "bg-white/10 text-white"
                  : "text-slate-400 hover:bg-white/5 hover:text-white",
                isCollapsed ? "px-4 md:px-0 md:justify-center" : "px-4"
              )}
            >
              <span className="material-symbols-outlined text-xl shrink-0">{item.icon}</span>
              <span className={cn(
                  "text-xs font-semibold whitespace-nowrap transition-all duration-200", 
                  isCollapsed ? "md:hidden md:opacity-0" : "opacity-100"
              )}>
                {item.label}
              </span>
            </Link>
          ))}
        </nav>

        {/* User Profile */}
        <div className={cn(
            "mt-auto border-t border-slate-700 dark:border-slate-800 py-4 flex items-center gap-3 transition-all",
            isCollapsed ? "px-6 md:px-0 md:justify-center" : "px-6"
        )}>
          <div className="w-8 h-8 shrink-0 rounded-lg bg-white/10 flex items-center justify-center text-white font-bold text-xs shrink-0">
            {user.name?.[0] ?? "A"}
          </div>
          <div className={cn("overflow-hidden transition-all", isCollapsed ? "md:hidden md:opacity-0" : "opacity-100")}>
            <p className="text-xs font-bold text-white truncate">{user.name || "Admin"}</p>
            <p className="text-[10px] text-slate-400 truncate">{user.roles?.[0] || "ADMIN"}</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={cn(
          "flex-grow flex flex-col h-full bg-background overflow-hidden transition-all duration-300 ml-0",
          isCollapsed ? "md:ml-sidebar-collapsed" : "md:ml-sidebar"
      )}>
        {/* Header */}
        <header className="sticky top-0 z-30 bg-card border-b border-border h-14 flex items-center justify-between px-6 shrink-0 hidden md:flex">
          {/* Left: Search */}
          <div className="flex items-center gap-6 flex-grow max-w-3xl">
            <div className="relative w-72">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-lg">search</span>
              <input
                className="w-full pl-9 pr-4 py-1.5 bg-muted border border-border rounded-md text-xs focus:ring-1 focus:ring-primary outline-none"
                placeholder="Search orders, customers, items..."
                type="text"
              />
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/admin/orders"
              className="flex items-center gap-2 px-3 py-1.5 border border-primary text-primary font-bold rounded-md hover:bg-primary/5 transition-all text-xs active:scale-95"
            >
              <span className="material-symbols-outlined text-[16px]">drafts</span>
              Create Draft
            </Link>
            <Link
              href="/admin/orders"
              className="flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground font-bold rounded-md hover:opacity-90 active:scale-95 transition-all text-xs"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              New Order
            </Link>
            <div className="h-6 w-px bg-border mx-1"></div>
            <ThemeToggle />
            <button className="relative p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors">
              <span className="material-symbols-outlined text-xl">notifications</span>
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-destructive rounded-full"></span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-1.5 border border-destructive/20 text-destructive font-bold rounded-md hover:bg-destructive/5 transition-all text-xs"
            >
              <span className="material-symbols-outlined text-[16px]">logout</span>
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="p-0 md:p-6 overflow-y-auto h-full max-w-[1600px]">
          {children}
        </div>
      </main>
    </div>
  );
}
