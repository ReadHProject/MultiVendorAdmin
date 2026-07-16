"use client";

import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icon } from "@/components/ui/icon";
import { toast } from "@/components/ui/toaster";
import { api } from "@/lib/api";

function formatMoney(amount) {
  if (!amount && amount !== 0) return "---";
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(amount);
}

const emptyItem = {
  productId: "",
  productName: "",
  barcode: "",
  actualQty: 1,
  billedQty: 1,
  packSize: 1,
  preGstRate: 0,
  discountPercent: 0,
  additionalDiscountPercent: 0,
  gstPercent: 0,
  itemTransportCost: 0,
};

export default function AddProductModal({ open, onOpenChange, onAdd }) {
  const [searchMode, setSearchMode] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [item, setItem] = useState({ ...emptyItem });
  const [creating, setCreating] = useState(false);

  // Create product form (inline)
  const [newProduct, setNewProduct] = useState({ name: "", barcode: "", purchasePrice: 0, mrp: 0, gstRate: 0 });

  const searchProducts = useCallback(async (q) => {
    if (!q || q.length < 2) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const data = await api.get(`/products?q=${encodeURIComponent(q)}&pageSize=10`);
      setSearchResults(data?.items || data || []);
    } catch {
      setSearchResults([]);
    }
    setSearching(false);
  }, []);

  useEffect(() => {
    if (!searchMode || !searchQuery) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(() => searchProducts(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery, searchMode, searchProducts]);

  function selectProduct(product) {
    setItem({
      ...emptyItem,
      productId: product.id,
      productName: product.name,
      barcode: product.barcode || "",
      preGstRate: Number(product.purchasePrice) || 0,
      gstPercent: Number(product.gstRate) || 0,
    });
    setSearchMode(false);
  }

  function updateField(field, value) {
    setItem((prev) => ({ ...prev, [field]: value }));
  }

  function handleAdd() {
    if (!item.productId) {
      toast("Select a product first", "error");
      return;
    }
    if (!item.actualQty || item.actualQty < 1) {
      toast("Actual quantity must be at least 1", "error");
      return;
    }
    onAdd({ ...item });
    resetModal();
  }

  function resetModal() {
    setItem({ ...emptyItem });
    setSearchQuery("");
    setSearchResults([]);
    setSearchMode(true);
    setNewProduct({ name: "", barcode: "", purchasePrice: 0, mrp: 0, gstRate: 0 });
  }

  function handleOpenChange(open) {
    if (!open) resetModal();
    onOpenChange(open);
  }

  async function handleCreateProduct() {
    if (!newProduct.name) {
      toast("Product name is required", "error");
      return;
    }
    setCreating(true);
    try {
      const created = await api.post("/products", {
        name: newProduct.name,
        barcode: newProduct.barcode || undefined,
        purchasePrice: Number(newProduct.purchasePrice) || 0,
        mrp: Number(newProduct.mrp) || 0,
        gstRate: Number(newProduct.gstRate) || 0,
        status: "ACTIVE",
      });
      selectProduct(created);
      toast("Product created", "success");
    } catch (err) {
      toast(err?.message || "Failed to create product", "error");
    }
    setCreating(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{searchMode ? "Add Product" : item.productName}</DialogTitle>
        </DialogHeader>

        {searchMode ? (
          <div className="space-y-4">
            <div>
              <Label>Search by name or barcode</Label>
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type product name or scan barcode..."
                autoFocus
              />
            </div>

            {searching && <div className="text-xs text-muted-foreground">Searching...</div>}

            <div className="max-h-48 overflow-y-auto space-y-1">
              {searchResults.map((p) => (
                <button
                  key={p.id}
                  onClick={() => selectProduct(p)}
                  className="w-full text-left px-3 py-2 rounded-md hover:bg-muted transition-colors flex items-center justify-between"
                >
                  <div>
                    <div className="text-sm font-medium">{p.name}</div>
                    <div className="text-xs text-muted-foreground">{p.barcode ? `Barcode: ${p.barcode}` : "No barcode"}</div>
                  </div>
                  <div className="text-xs font-bold">{formatMoney(p.purchasePrice)}</div>
                </button>
              ))}
              {!searching && searchQuery.length >= 2 && searchResults.length === 0 && (
                <div className="border rounded-md p-4 text-center">
                  <p className="text-sm text-muted-foreground mb-3">Product not found</p>
                  <div className="space-y-3">
                    <Input
                      placeholder="Product name"
                      value={newProduct.name}
                      onChange={(e) => setNewProduct((p) => ({ ...p, name: e.target.value }))}
                    />
                    <div className="flex gap-2">
                      <Input
                        placeholder="Barcode"
                        value={newProduct.barcode}
                        onChange={(e) => setNewProduct((p) => ({ ...p, barcode: e.target.value }))}
                      />
                      <Input
                        type="number"
                        placeholder="Purchase price"
                        value={newProduct.purchasePrice}
                        onChange={(e) => setNewProduct((p) => ({ ...p, purchasePrice: e.target.value }))}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="MRP"
                        value={newProduct.mrp}
                        onChange={(e) => setNewProduct((p) => ({ ...p, mrp: e.target.value }))}
                      />
                      <Input
                        type="number"
                        placeholder="GST %"
                        value={newProduct.gstRate}
                        onChange={(e) => setNewProduct((p) => ({ ...p, gstRate: e.target.value }))}
                      />
                    </div>
                    <Button onClick={handleCreateProduct} disabled={creating} className="w-full">
                      {creating ? "Creating..." : "Create & Add"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground">{item.productName} — {item.barcode || "No barcode"}</p>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Actual Qty</Label>
                <Input type="number" value={item.actualQty} onChange={(e) => updateField("actualQty", parseInt(e.target.value) || 0)} min={1} />
              </div>
              <div>
                <Label>Billed Qty</Label>
                <Input type="number" value={item.billedQty} onChange={(e) => updateField("billedQty", parseInt(e.target.value) || 0)} min={0} />
              </div>
              <div>
                <Label>Pack Size</Label>
                <Input type="number" value={item.packSize} onChange={(e) => updateField("packSize", parseInt(e.target.value) || 1)} min={1} />
              </div>
              <div>
                <Label>Rate (Pre-GST)</Label>
                <Input type="number" step="0.01" value={item.preGstRate} onChange={(e) => updateField("preGstRate", parseFloat(e.target.value) || 0)} />
              </div>
              <div>
                <Label>Discount %</Label>
                <Input type="number" step="0.01" value={item.discountPercent} onChange={(e) => updateField("discountPercent", parseFloat(e.target.value) || 0)} />
              </div>
              <div>
                <Label>Addl Discount %</Label>
                <Input type="number" step="0.01" value={item.additionalDiscountPercent} onChange={(e) => updateField("additionalDiscountPercent", parseFloat(e.target.value) || 0)} />
              </div>
              <div>
                <Label>GST %</Label>
                <Input type="number" step="0.01" value={item.gstPercent} onChange={(e) => updateField("gstPercent", parseFloat(e.target.value) || 0)} />
              </div>
              <div>
                <Label>Transport Cost</Label>
                <Input type="number" step="0.01" value={item.itemTransportCost} onChange={(e) => updateField("itemTransportCost", parseFloat(e.target.value) || 0)} />
              </div>
            </div>
            <div className="flex justify-between items-center pt-2">
              <Button variant="ghost" size="sm" onClick={() => setSearchMode(true)}>
                <Icon name="arrow-left" size={14} className="mr-1" /> Change Product
              </Button>
              <Button onClick={handleAdd}>Add to Purchase</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
