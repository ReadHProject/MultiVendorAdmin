"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { toast } from "@/components/ui/toaster";
import { Icon } from "@/components/ui/icon";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  useGetBrandsQuery,
  useCreateBrandMutation,
  useUpdateBrandMutation,
  useDeleteBrandMutation,
} from "@/store/api/slices/brandsApi";
import { MobileFooter, MobileHeader } from "@/components/admin/mobile/mobile-layout";

export default function BrandsPage() {
  const router = useRouter();
  const { data: response, isLoading, refetch } = useGetBrandsQuery();
  const brands = response?.data || [];
  const [createBrand, { isLoading: isCreating }] = useCreateBrandMutation();
  const [updateBrand, { isLoading: isUpdating }] = useUpdateBrandMutation();
  const [deleteBrand] = useDeleteBrandMutation();

  // Create Form State
  const [createForm, setCreateForm] = useState({
    name: "",
    description: "",
    defaultDiscount: 0,
  });

  // Edit Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    id: "",
    name: "",
    description: "",
    defaultDiscount: 0,
    applyToProducts: false,
  });

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!createForm.name.trim()) return toast.error("Brand name is required");
    try {
      await createBrand({
        name: createForm.name.trim(),
        description: createForm.description.trim() || undefined,
        defaultDiscount: Number(createForm.defaultDiscount),
      }).unwrap();
      toast.success("Brand created successfully");
      setCreateForm({ name: "", description: "", defaultDiscount: 0 });
      refetch();
    } catch (err) {
      toast.error(err.message || "Failed to create brand");
    }
  };

  const handleEditClick = (brand) => {
    setEditForm({
      id: brand.id,
      name: brand.name,
      description: brand.description || "",
      defaultDiscount: Number(brand.defaultDiscount) || 0,
      applyToProducts: false,
    });
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editForm.name.trim()) return toast.error("Brand name is required");
    try {
      await updateBrand({
        id: editForm.id,
        name: editForm.name.trim(),
        description: editForm.description.trim() || undefined,
        defaultDiscount: Number(editForm.defaultDiscount),
        applyToProducts: editForm.applyToProducts,
      }).unwrap();
      toast.success("Brand updated successfully");
      setEditModalOpen(false);
      refetch();
    } catch (err) {
      toast.error(err.message || "Failed to update brand");
    }
  };

  const handleDelete = async (brand) => {
    if (!window.confirm(`Are you sure you want to delete ${brand.name}?`)) return;
    try {
      await deleteBrand(brand.id).unwrap();
      toast.success("Brand deleted successfully");
      refetch();
    } catch (err) {
      toast.error(err.message || "Failed to delete brand");
    }
  };

  return (
    <>
      <div className="hidden md:block">
        <div className="mb-6 flex items-center gap-2 text-foreground font-bold text-2xl">
          <button onClick={() => router.back()} className="text-muted-foreground hover:text-foreground text-sm font-medium mr-2 flex items-center gap-1 transition-colors">
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Back
          </button>
          Brands Management
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - List */}
          <div className="lg:col-span-8 bg-card rounded-xl border border-border shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-border bg-muted/20">
              <h3 className="font-bold text-base text-foreground">Existing Brands ({brands.length})</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="px-6 py-3 font-semibold text-muted-foreground">Name</th>
                    <th className="px-6 py-3 font-semibold text-muted-foreground">Slug</th>
                    <th className="px-6 py-3 font-semibold text-muted-foreground">Description</th>
                    <th className="px-6 py-3 font-semibold text-muted-foreground">Default Discount</th>
                    <th className="px-6 py-3 font-semibold text-muted-foreground text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {isLoading ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-muted-foreground">Loading brands...</td>
                    </tr>
                  ) : brands.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-muted-foreground">No brands found. Add one on the right.</td>
                    </tr>
                  ) : (
                    brands.map((brand) => (
                      <tr key={brand.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4 font-bold text-foreground">{brand.name}</td>
                        <td className="px-6 py-4 text-muted-foreground">{brand.slug}</td>
                        <td className="px-6 py-4 text-muted-foreground">{brand.description || "-"}</td>
                        <td className="px-6 py-4">
                          <span className="text-emerald-600 font-bold">{Number(brand.defaultDiscount)}%</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <button onClick={() => handleEditClick(brand)} className="text-amber-500 hover:text-amber-600 transition-colors">
                              <span className="material-symbols-outlined text-[20px]">edit</span>
                            </button>
                            <button onClick={() => handleDelete(brand)} className="text-slate-400 hover:text-destructive transition-colors">
                              <span className="material-symbols-outlined text-[20px]">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Column - Form */}
          <div className="lg:col-span-4 bg-card rounded-xl border border-border shadow-sm h-fit">
            <div className="px-6 py-4 border-b border-border bg-muted/20">
              <h3 className="font-bold text-base text-foreground">Add New Brand</h3>
            </div>
            <form onSubmit={handleCreateSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Brand Name <span className="text-destructive">*</span>
                </label>
                <Input
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  placeholder="e.g. Lakme"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Description
                </label>
                <Textarea
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  placeholder="Optional description..."
                  rows={3}
                  className="resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Default Discount (%)
                </label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={createForm.defaultDiscount}
                  onChange={(e) => setCreateForm({ ...createForm, defaultDiscount: e.target.value })}
                />
              </div>
              <Button type="submit" disabled={isCreating} className="w-full bg-[#1A1F2C] hover:bg-[#0f121a] text-white font-bold h-11">
                {isCreating ? "Creating..." : "Create Brand"}
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Mobile UI */}
      <div className="block md:hidden pb-24 min-h-screen bg-slate-950 text-slate-200">
        <MobileHeader title="Brands" showMenu={true} />
        <div className="p-4 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-custom overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-800 font-semibold flex justify-between items-center">
              Existing Brands
              <span className="text-xs bg-slate-800 px-2 py-0.5 rounded-full text-slate-400">{brands.length}</span>
            </div>
            {isLoading ? (
              <div className="p-8 text-center text-slate-500 text-sm">Loading...</div>
            ) : brands.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">No brands found.</div>
            ) : (
              <div className="divide-y divide-slate-800/50">
                {brands.map(brand => (
                  <div key={brand.id} className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-semibold text-white">{brand.name}</div>
                      <div className="flex gap-2">
                        <button onClick={() => handleEditClick(brand)} className="text-amber-500 p-1"><Icon name="edit" size={16} /></button>
                        <button onClick={() => handleDelete(brand)} className="text-slate-500 hover:text-red-400 p-1"><Icon name="trash" size={16} /></button>
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>Discount: <span className="text-emerald-400 font-bold">{Number(brand.defaultDiscount)}%</span></span>
                      {brand._count?.products > 0 && <span>{brand._count.products} Products</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-custom">
            <div className="px-4 py-3 border-b border-slate-800 font-semibold">Add New Brand</div>
            <form onSubmit={handleCreateSubmit} className="p-4 space-y-4">
              <Input
                value={createForm.name}
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                placeholder="Brand Name *"
                className="bg-slate-950 border-slate-800"
                required
              />
              <Input
                type="number"
                value={createForm.defaultDiscount}
                onChange={(e) => setCreateForm({ ...createForm, defaultDiscount: e.target.value })}
                placeholder="Default Discount (%)"
                className="bg-slate-950 border-slate-800"
              />
              <Button type="submit" disabled={isCreating} className="w-full bg-accent text-white font-bold h-11 rounded-custom">
                Create
              </Button>
            </form>
          </div>
        </div>
        <MobileFooter />
      </div>

      {/* Edit Modal */}
      <Dialog controlledOpen={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Brand</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-5 py-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Brand Name <span className="text-destructive">*</span>
              </label>
              <Input
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Description
              </label>
              <Textarea
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                placeholder="Optional description..."
                rows={3}
                className="resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Default Discount (%)
              </label>
              <Input
                type="number"
                min="0"
                max="100"
                value={editForm.defaultDiscount}
                onChange={(e) => setEditForm({ ...editForm, defaultDiscount: e.target.value })}
              />
            </div>
            
            <div className="flex items-start gap-3">
              <div className="flex items-center h-5">
                <input
                  id="applyToProducts"
                  type="checkbox"
                  className="w-4 h-4 rounded border-border text-blue-600 focus:ring-blue-600"
                  checked={editForm.applyToProducts}
                  onChange={(e) => setEditForm({ ...editForm, applyToProducts: e.target.checked })}
                />
              </div>
              <label htmlFor="applyToProducts" className="text-sm text-foreground">
                Apply this discount to all existing products under this brand?
              </label>
            </div>

            <DialogFooter className="gap-2 sm:gap-0 mt-6">
              <DialogClose 
                type="button" 
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-bold transition-all h-9 px-4 w-full sm:w-auto bg-slate-100 hover:bg-slate-200 border-none text-slate-700"
              >
                Cancel
              </DialogClose>
              <Button type="submit" disabled={isUpdating} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-medium">
                {isUpdating ? "Updating..." : "Update Brand"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
