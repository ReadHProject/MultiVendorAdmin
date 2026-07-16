"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, LayoutDashboard, Package, ShoppingCart, User, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

export function MobilePageLayout({ children, className }) {
  return (
    <div className={cn("flex flex-col min-h-screen bg-slate-950 text-slate-200 pb-24 font-sans block md:hidden", className)}>
      {children}
    </div>
  );
}

export function MobileHeader({ title, onBack, onDiscard, onSave, saveText = "Save", saving = false, showMenu = false }) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {showMenu ? (
          <button
            type="button"
            onClick={() => document.dispatchEvent(new CustomEvent('toggle-sidebar'))}
            className="p-2 hover:bg-slate-800 rounded-md"
          >
            <Menu className="h-6 w-6" />
          </button>
        ) : (
          <button
            type="button"
            onClick={onBack || (() => router.back())}
            className="p-2 hover:bg-slate-800 rounded-md"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        )}
        <h1 className="text-lg font-semibold">{title}</h1>
      </div>
      <div className="flex items-center gap-2">
        {onDiscard && (
          <button
            type="button"
            onClick={onDiscard}
            className="text-sm font-medium text-slate-400 px-3 py-2"
          >
            Discard
          </button>
        )}
        {onSave && (
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="bg-accent text-white text-sm font-semibold px-4 py-2 rounded-md shadow-lg shadow-accent/20 disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? "Saving..." : saveText}
          </button>
        )}
      </div>
    </header>
  );
}

export function MobileTabs({ tabs, activeTab, onChange }) {
  return (
    <nav className="sticky top-[57px] z-40 bg-slate-950 border-b border-slate-800 overflow-x-auto no-scrollbar">
      <div className="flex whitespace-nowrap px-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              "px-4 py-3 text-sm font-medium border-b-2 transition-colors",
              activeTab === tab.id
                ? "border-accent text-accent"
                : "border-transparent text-slate-400"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </nav>
  );
}

export function MobileFooter() {
  const pathname = usePathname();

  const NAV_ITEMS = [
    { id: "dashboard", label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { id: "catalog", label: "Products", href: "/admin/products", icon: Package },
    { id: "orders", label: "Orders", href: "/admin/orders", icon: ShoppingCart },
    { id: "menu", label: "Menu", href: "#", icon: Menu, isAction: true },
  ];

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 px-6 py-4 flex justify-between items-center z-50 block md:hidden pb-[env(safe-area-inset-bottom)]">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;

        if (item.isAction) {
          return (
            <button
              key={item.id}
              onClick={() => document.dispatchEvent(new CustomEvent('toggle-sidebar'))}
              className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-200"
            >
              <Icon className="h-6 w-6" />
              <span className="text-[10px]">{item.label}</span>
            </button>
          );
        }

        const isActive = pathname === item.href || (item.href !== "/admin" && pathname?.startsWith(item.href));

        return (
          <Link
            key={item.id}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1",
              isActive ? "text-accent" : "text-slate-400"
            )}
          >
            <Icon className="h-6 w-6" />
            <span className="text-[10px]">{item.label}</span>
          </Link>
        );
      })}
    </footer>
  );
}
