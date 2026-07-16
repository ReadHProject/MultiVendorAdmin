"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useGetProductQuery, useUpdateProductMutation, useDeleteProductMutation } from "@/store/api/slices/productsApi";
import { toast } from "sonner";
import { ArrowLeft, Save, Trash2, Loader2, Plus, X, Package } from "lucide-react";
import { MobilePageLayout, MobileHeader, MobileTabs, MobileFooter } from "@/components/admin/mobile/mobile-layout";

function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: product, isLoading, error } = useGetProductQuery(params.id);
  const [updateProduct] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [mobileTab, setMobileTab] = useState("general");
  const [form, setForm] = useState({
    name: "", slug: "", description: "", type: "SIMPLE", status: "ACTIVE",
    categoryId: "", brandId: "", unit: "", measurement: "", gstRate: 0, hsnCode: "", image: "",
  });
  const [variants, setVariants] = useState([]);
  const [newVariant, setNewVariant] = useState({ sku: "", name: "", mrp: 0, price: 0, weight: 0 });

  useEffect(() => {
    if (product?.data) {
      const p = product.data;
      setForm({
        name: p.name || "", slug: p.slug || "", description: p.description || "",
        type: p.type || "SIMPLE", status: p.status || "ACTIVE",
        categoryId: p.categoryId || "", brandId: p.brandId || "",
        unit: p.unit || "", measurement: p.measurement || "",
        gstRate: p.gstRate || 0, hsnCode: p.hsnCode || "", image: p.image || "",
      });
      setVariants(p.variants || []);
    }
  }, [product]);

  async function handleSave() {
    setSaving(true);
    try {
      await updateProduct({ id: params.id, ...form, variants }).unwrap();
      toast.success("Product updated");
    } catch (err) {
      toast.error(err?.data?.error?.message || "Failed to update");
    }
    setSaving(false);
  }

  async function handleDelete() {
    if (!confirm("Deactivate this product?")) return;
    setDeleting(true);
    try {
      await deleteProduct(params.id).unwrap();
      toast.success("Product deactivated");
      router.push("/admin/products");
    } catch (err) {
      toast.error(err?.data?.error?.message || "Failed to delete");
    }
    setDeleting(false);
  }

  function addVariant() {
    if (!newVariant.sku || !newVariant.name) return;
    setVariants([...variants, { ...newVariant, id: `temp-${Date.now()}` }]);
    setNewVariant({ sku: "", name: "", mrp: 0, price: 0, weight: 0 });
  }

  function removeVariant(idx) {
    setVariants(variants.filter((_, i) => i !== idx));
  }

  if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  if (error) return <div className="text-center py-12 text-destructive">Product not found</div>;

  return (
    <>
    <div className="max-w-4xl space-y-6 hidden md:block">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="w-8 h-8 rounded-md border border-border flex items-center justify-center hover:bg-muted"><ArrowLeft className="h-4 w-4" /></button>
          <div><h1 className="text-lg font-black">Edit Product</h1><p className="text-xs text-muted-foreground">{form.slug}</p></div>
        </div>
        <div className="flex gap-2">
          <button onClick={handleDelete} disabled={deleting} className="h-9 px-3 border border-destructive text-destructive rounded-md text-xs font-bold hover:bg-destructive/10 disabled:opacity-50"><Trash2 className="h-4 w-4 mr-1 inline" />Delete</button>
          <button onClick={handleSave} disabled={saving} className="h-9 px-4 bg-primary text-primary-foreground rounded-md text-xs font-bold hover:opacity-90 disabled:opacity-50"><Save className="h-4 w-4 mr-1 inline" />{saving ? "Saving..." : "Save"}</button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 border border-border rounded-lg bg-card p-4">
        <div><label className="text-[10px] font-black uppercase text-muted-foreground">Name *</label><input className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm mt-1" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
        <div><label className="text-[10px] font-black uppercase text-muted-foreground">Slug</label><input className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm mt-1" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} /></div>
        <div><label className="text-[10px] font-black uppercase text-muted-foreground">Type</label>
          <select className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm mt-1" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            <option value="SIMPLE">Simple</option><option value="VARIABLE">Variable</option>
          </select>
        </div>
        <div><label className="text-[10px] font-black uppercase text-muted-foreground">Status</label>
          <select className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm mt-1" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option><option value="OUT_OF_STOCK">Out of Stock</option>
          </select>
        </div>
        <div><label className="text-[10px] font-black uppercase text-muted-foreground">Unit</label><input className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm mt-1" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} /></div>
        <div><label className="text-[10px] font-black uppercase text-muted-foreground">Measurement</label><input className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm mt-1" value={form.measurement} onChange={(e) => setForm({ ...form, measurement: e.target.value })} /></div>
        <div><label className="text-[10px] font-black uppercase text-muted-foreground">GST Rate (%)</label><input type="number" className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm mt-1" value={form.gstRate} onChange={(e) => setForm({ ...form, gstRate: Number(e.target.value) })} /></div>
        <div><label className="text-[10px] font-black uppercase text-muted-foreground">HSN Code</label><input className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm mt-1" value={form.hsnCode} onChange={(e) => setForm({ ...form, hsnCode: e.target.value })} /></div>
        <div className="col-span-2"><label className="text-[10px] font-black uppercase text-muted-foreground">Description</label><textarea className="w-full h-20 px-3 py-2 rounded-md border border-input bg-background text-sm mt-1 resize-none" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
      </div>

      <div className="border border-border rounded-lg bg-card p-4">
        <h3 className="text-sm font-black mb-3">Variants ({variants.length})</h3>
        <div className="divide-y divide-border">
          {variants.map((v, idx) => (
            <div key={v.id || idx} className="flex items-center gap-3 py-2">
              <span className="text-xs font-mono flex-1">{v.sku}</span>
              <span className="text-xs flex-1">{v.name}</span>
              <span className="text-xs w-20 text-right">MRP: ₹{v.mrp}</span>
              <span className="text-xs w-20 text-right font-bold">₹{v.price}</span>
              <button onClick={() => removeVariant(idx)} className="w-6 h-6 rounded border border-border flex items-center justify-center hover:bg-destructive/10 hover:text-destructive"><X className="h-3 w-3" /></button>
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-3 pt-3 border-t border-border">
          <input placeholder="SKU" className="h-8 px-2 rounded border border-input bg-background text-xs w-32" value={newVariant.sku} onChange={(e) => setNewVariant({ ...newVariant, sku: e.target.value })} />
          <input placeholder="Name" className="h-8 px-2 rounded border border-input bg-background text-xs flex-1" value={newVariant.name} onChange={(e) => setNewVariant({ ...newVariant, name: e.target.value })} />
          <input type="number" placeholder="MRP" className="h-8 px-2 rounded border border-input bg-background text-xs w-24" value={newVariant.mrp} onChange={(e) => setNewVariant({ ...newVariant, mrp: Number(e.target.value) })} />
          <input type="number" placeholder="Price" className="h-8 px-2 rounded border border-input bg-background text-xs w-24" value={newVariant.price} onChange={(e) => setNewVariant({ ...newVariant, price: Number(e.target.value) })} />
          <button onClick={addVariant} className="h-8 px-3 bg-primary text-primary-foreground rounded text-xs font-bold hover:opacity-90"><Plus className="h-3 w-3 mr-1 inline" />Add</button>
        </div>
      </div>
    </div>

    {/* Mobile UI */}
    <MobilePageLayout>
      <MobileHeader 
        title="Edit Product"
        onSave={handleSave}
        saving={saving}
        onDiscard={() => router.back()}
      />
      <MobileTabs 
        tabs={[
          { id: "general", label: "General Info" },
          { id: "inventory", label: "Inventory" },
          { id: "variants", label: "Variants" }
        ]}
        activeTab={mobileTab}
        onChange={setMobileTab}
      />
      
      <main className="p-4 space-y-6">
        {mobileTab === "general" && (
          <section className="space-y-4">
            <div>
              <label className="text-[10px] font-black uppercase text-muted-foreground block mb-1">Name *</label>
              <input className="w-full h-10 px-3 rounded-md border border-input bg-slate-900 text-sm focus:ring-accent focus:border-accent text-slate-200" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-muted-foreground block mb-1">Slug</label>
              <input className="w-full h-10 px-3 rounded-md border border-input bg-slate-900 text-sm focus:ring-accent focus:border-accent text-slate-200" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black uppercase text-muted-foreground block mb-1">Type</label>
                <select className="w-full h-10 px-3 rounded-md border border-input bg-slate-900 text-sm focus:ring-accent focus:border-accent text-slate-200" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  <option value="SIMPLE">Simple</option><option value="VARIABLE">Variable</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-muted-foreground block mb-1">Status</label>
                <select className="w-full h-10 px-3 rounded-md border border-input bg-slate-900 text-sm focus:ring-accent focus:border-accent text-slate-200" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option><option value="OUT_OF_STOCK">Out of Stock</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-muted-foreground block mb-1">Description</label>
              <textarea className="w-full h-24 px-3 py-2 rounded-md border border-input bg-slate-900 text-sm resize-none focus:ring-accent focus:border-accent text-slate-200" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="pt-4 border-t border-slate-800">
              <button onClick={handleDelete} disabled={deleting} className="w-full h-10 border border-red-500 text-red-500 rounded-md text-sm font-bold hover:bg-red-500/10 disabled:opacity-50 flex items-center justify-center">
                <Trash2 className="h-4 w-4 mr-2" /> Deactivate Product
              </button>
            </div>
          </section>
        )}
        
        {mobileTab === "inventory" && (
          <section className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black uppercase text-muted-foreground block mb-1">Unit</label>
                <input className="w-full h-10 px-3 rounded-md border border-input bg-slate-900 text-sm focus:ring-accent focus:border-accent text-slate-200" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-muted-foreground block mb-1">Measurement</label>
                <input className="w-full h-10 px-3 rounded-md border border-input bg-slate-900 text-sm focus:ring-accent focus:border-accent text-slate-200" value={form.measurement} onChange={(e) => setForm({ ...form, measurement: e.target.value })} />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-muted-foreground block mb-1">GST Rate (%)</label>
                <input type="number" className="w-full h-10 px-3 rounded-md border border-input bg-slate-900 text-sm focus:ring-accent focus:border-accent text-slate-200" value={form.gstRate} onChange={(e) => setForm({ ...form, gstRate: Number(e.target.value) })} />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-muted-foreground block mb-1">HSN Code</label>
                <input className="w-full h-10 px-3 rounded-md border border-input bg-slate-900 text-sm focus:ring-accent focus:border-accent text-slate-200" value={form.hsnCode} onChange={(e) => setForm({ ...form, hsnCode: e.target.value })} />
              </div>
            </div>
          </section>
        )}

        {mobileTab === "variants" && (
          <section className="space-y-4">
            <div className="border border-slate-800 rounded-md p-3 bg-slate-900">
              <h3 className="text-sm font-semibold mb-3">Variants ({variants.length})</h3>
              <div className="divide-y divide-slate-800">
                {variants.map((v, idx) => (
                  <div key={v.id || idx} className="py-3 flex flex-col gap-2">
                    <div className="flex justify-between">
                      <span className="text-xs font-mono font-medium text-slate-300">{v.sku}</span>
                      <button onClick={() => removeVariant(idx)} className="text-red-400 hover:text-red-300"><X className="h-4 w-4" /></button>
                    </div>
                    <div className="text-sm text-slate-200">{v.name}</div>
                    <div className="flex justify-between items-center text-xs mt-1">
                      <span className="text-slate-400">MRP: ₹{v.mrp}</span>
                      <span className="font-bold text-accent">₹{v.price}</span>
                    </div>
                  </div>
                ))}
                {variants.length === 0 && <div className="text-xs text-slate-500 py-2">No variants</div>}
              </div>
            </div>

            <div className="border border-slate-800 rounded-md p-3 bg-slate-900 space-y-3 mt-4">
              <h4 className="text-xs font-semibold text-slate-400 uppercase">Add Variant</h4>
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="SKU" className="h-10 px-3 rounded-md border border-input bg-slate-950 text-xs text-slate-200 focus:border-accent focus:ring-accent" value={newVariant.sku} onChange={(e) => setNewVariant({ ...newVariant, sku: e.target.value })} />
                <input placeholder="Name" className="h-10 px-3 rounded-md border border-input bg-slate-950 text-xs text-slate-200 focus:border-accent focus:ring-accent" value={newVariant.name} onChange={(e) => setNewVariant({ ...newVariant, name: e.target.value })} />
                <input type="number" placeholder="MRP" className="h-10 px-3 rounded-md border border-input bg-slate-950 text-xs text-slate-200 focus:border-accent focus:ring-accent" value={newVariant.mrp} onChange={(e) => setNewVariant({ ...newVariant, mrp: Number(e.target.value) })} />
                <input type="number" placeholder="Price" className="h-10 px-3 rounded-md border border-input bg-slate-950 text-xs text-slate-200 focus:border-accent focus:ring-accent" value={newVariant.price} onChange={(e) => setNewVariant({ ...newVariant, price: Number(e.target.value) })} />
              </div>
              <button onClick={addVariant} className="w-full h-10 mt-2 bg-slate-800 text-slate-200 rounded-md text-sm font-semibold hover:bg-slate-700 flex items-center justify-center gap-1"><Plus className="h-4 w-4" /> Add Variant</button>
            </div>
          </section>
        )}
      </main>
      <MobileFooter />
    </MobilePageLayout>
    </>
  );
}

export default ProductDetailPage;
