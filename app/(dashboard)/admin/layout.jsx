import { AdminShell } from "@/components/admin/admin-shell";
import { Toaster } from "@/components/ui/toaster";

export default function AdminLayout({ children }) {
  return (
    <AdminShell>
      {children}
      <Toaster />
    </AdminShell>
  );
}
