"use client";

import { useState, useEffect } from "react";

function POSPage() {
  const [session, setSession] = useState(null);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  async function searchProducts() {
    if (!search.trim()) { setProducts([]); return; }
    setLoading(true);
    const res = await fetch(`/api/v1/products?q=${encodeURIComponent(search)}&pageSize=10`, { credentials: "include" });
    const j = await res.json();
    setProducts(j.data?.items || []);
    setLoading(false);
  }

  useEffect(() => { const t = setTimeout(searchProducts, 300); return () => clearTimeout(t); }, [search]);

  function addToCart(product) {
    const variant = product.variants?.[0];
    if (!variant) return;
    setCart((prev) => {
      const existing = prev.find((i) => i.variantId === variant.id);
      if (existing) return prev.map((i) => i.variantId === variant.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { productId: product.id, variantId: variant.id, name: product.name, sku: variant.sku, price: Number(variant.price), quantity: 1 }];
    });
    setSearch(""); setProducts([]);
  }

  function updateQty(variantId, qty) {
    if (qty < 1) { setCart((prev) => prev.filter((i) => i.variantId !== variantId)); return; }
    setCart((prev) => prev.map((i) => i.variantId === variantId ? { ...i, quantity: qty } : i));
  }

  const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <div className="h-[calc(100vh-3.5rem)] flex gap-4">
      <div className="flex-1 flex flex-col">
        <div className="p-4 border border-border rounded-lg bg-card mb-4">
          <input className="w-full h-10 px-4 rounded-md border border-input bg-background text-sm" placeholder="Scan barcode or search product..." value={search} onChange={(e) => setSearch(e.target.value)} autoFocus />
          {products.length > 0 && (
            <div className="mt-2 border border-border rounded-md max-h-48 overflow-y-auto">
              {products.map((p) => (
                <button key={p.id} onClick={() => addToCart(p)} className="w-full px-3 py-2 text-left text-xs hover:bg-muted flex justify-between border-b border-border last:border-0">
                  <span>{p.name} - {p.variants?.[0]?.sku}</span>
                  <span className="font-black">₹{p.variants?.[0]?.price || 0}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex-1 border border-border rounded-lg bg-card overflow-hidden">
          <div className="p-3 border-b border-border bg-muted/30">
            <h3 className="text-xs font-black uppercase">Cart ({cart.length} items)</h3>
          </div>
          <div className="overflow-y-auto h-[calc(100%-2.5rem)]">
            {cart.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">Scan or search to add items</div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-muted/20 sticky top-0">
                  <tr><th className="h-8 px-3 text-left text-[10px] font-black uppercase">Item</th><th className="h-8 px-3 text-center text-[10px] font-black uppercase w-20">Qty</th><th className="h-8 px-3 text-right text-[10px] font-black uppercase w-24">Price</th><th className="h-8 px-3 text-right text-[10px] font-black uppercase w-24">Total</th></tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {cart.map((item) => (
                    <tr key={item.variantId}>
                      <td className="px-3 py-2"><div className="text-xs font-medium">{item.name}</div><div className="text-[10px] text-muted-foreground font-mono">{item.sku}</div></td>
                      <td className="px-3 py-2 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => updateQty(item.variantId, item.quantity - 1)} className="w-6 h-6 rounded border border-border text-xs hover:bg-muted">-</button>
                          <span className="w-8 text-center text-xs font-bold">{item.quantity}</span>
                          <button onClick={() => updateQty(item.variantId, item.quantity + 1)} className="w-6 h-6 rounded border border-border text-xs hover:bg-muted">+</button>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-right text-xs">₹{item.price}</td>
                      <td className="px-3 py-2 text-right text-xs font-black">₹{item.price * item.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
      <div className="w-80 border border-border rounded-lg bg-card p-4 flex flex-col">
        <h3 className="text-sm font-black mb-4">Order Summary</h3>
        <div className="space-y-2 text-xs flex-1">
          <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="font-black">₹{total}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Tax</span><span>₹0</span></div>
          <div className="border-t border-border pt-2 flex justify-between"><span className="font-bold">Grand Total</span><span className="font-black text-lg">₹{total}</span></div>
        </div>
        <div className="space-y-2 mt-4">
          <button disabled={cart.length === 0} className="w-full h-10 bg-primary text-primary-foreground rounded-md text-sm font-bold hover:opacity-90 disabled:opacity-30">Complete Sale</button>
          <button onClick={() => setCart([])} className="w-full h-9 border border-border rounded-md text-xs font-medium hover:bg-muted">Clear Cart</button>
        </div>
      </div>
    </div>
  );
}

export default POSPage;
