"use client";

import { useState, useEffect } from "react";

function TemplateListPage({ type, title }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch(`/api/v1/${type}-templates`, { credentials: "include" });
    const j = await res.json();
    setItems(j.data?.items || j.data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, [type]);

  async function handleDelete(id) {
    if (!confirm("Delete?")) return;
    await fetch(`/api/v1/${type}-templates/${id}`, { method: "DELETE", credentials: "include" });
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold tracking-tight">{title}</h1><p className="text-sm text-muted-foreground">{items.length} templates</p></div>
      </div>
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/30">
            <tr>
              <th className="h-10 px-4 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground">Name</th>
              {type === "email" && <th className="h-10 px-4 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground">Subject</th>}
              <th className="h-10 px-4 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status</th>
              <th className="h-10 px-4 text-right text-[10px] font-black uppercase tracking-widest text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? [...Array(3)].map((_, i) => <tr key={i}><td colSpan={4} className="px-4 py-3"><div className="h-4 bg-muted animate-pulse rounded" /></td></tr>) :
              items.length === 0 ? <tr><td colSpan={4} className="px-4 py-12 text-center text-muted-foreground">No templates</td></tr> :
              items.map((t) => (
                <tr key={t.id} className="hover:bg-muted/50">
                  <td className="px-4 py-3 text-xs font-medium">{t.name}</td>
                  {type === "email" && <td className="px-4 py-3 text-xs text-muted-foreground">{t.subject || "---"}</td>}
                  <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${t.status ? "bg-emerald-100 text-emerald-800" : "bg-muted text-muted-foreground"}`}>{t.status ? "Active" : "Inactive"}</span></td>
                  <td className="px-4 py-3 text-right"><button onClick={() => handleDelete(t.id)} className="text-[10px] text-destructive hover:underline">Delete</button></td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EmailTemplatesPage() { return <TemplateListPage type="email" title="Email Templates" />; }
function SMSTemplatesPage() { return <TemplateListPage type="sms" title="SMS Templates" />; }
function WhatsAppTemplatesPage() { return <TemplateListPage type="whatsapp" title="WhatsApp Templates" />; }

export default EmailTemplatesPage;
export { SMSTemplatesPage, WhatsAppTemplatesPage };
