"use client";

import { useGetPermissionsQuery } from "@/store/api/slices/rolesApi";

function PermissionsPage() {
  const { data, isLoading } = useGetPermissionsQuery();
  const permGroups = data?.data || {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Permission Matrix</h1>
        <p className="text-sm text-muted-foreground">{Object.keys(permGroups).length} modules, {Object.values(permGroups).flat().length} total permissions</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />)}
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(permGroups).map(([module, perms]) => (
            <div key={module} className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="px-4 py-3 bg-muted/30 border-b border-border">
                <h3 className="text-sm font-black uppercase tracking-wide">{module}</h3>
              </div>
              <div className="p-4">
                <div className="flex flex-wrap gap-2">
                  {perms.map((p) => (
                    <div key={p.id} className="flex items-center gap-2 px-3 py-1.5 bg-background border border-border rounded-md">
                      <span className="text-xs font-bold">{p.action}</span>
                      {p.description && <span className="text-[10px] text-muted-foreground">- {p.description}</span>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PermissionsPage;
