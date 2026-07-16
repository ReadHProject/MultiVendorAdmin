"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Icon } from "@/components/ui/icon";

export default function CreatePurchaseInvoice() {
  const router = useRouter();
  
  // Header form state
  const [warehouseId, setWarehouseId] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [supplierInvoiceNumber, setSupplierInvoiceNumber] = useState("");
  const [supplierInvoiceDate, setSupplierInvoiceDate] = useState("");
  
  // Data sources
  const [warehouses, setWarehouses] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  
  // Items and Grid
  const [items, setItems] = useState([]);
  
  // Footer state
  const [extraMarginName, setExtraMarginName] = useState("");
  const [extraMarginPercent, setExtraMarginPercent] = useState("");
  const [extraMarginValue, setExtraMarginValue] = useState("");
  const [billDiscountPercent, setBillDiscountPercent] = useState("");
  
  // Add Product Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState({
    barcode: "",
    productId: "",
    packSize: 1,
    mrp: 0,
    gstPercent: 18,
    discountPercent: 0,
    preGstRate: 0,
    purchasePrice: 0, // Maps to unitCost
    actualQty: 1,
    billedQty: 1,
    additionalDiscountPercent: 0,
    transportCost: 0,
    calculatedAmt: 0,
    // Selling prices
    dealerPrice: 0,
    wholesalePrice: 0,
    parlourPrice: 0,
    retailPrice: 0,
    onlinePrice: 0
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [whRes, supRes, prodRes] = await Promise.all([
          api.get("/warehouses"),
          api.get("/suppliers"),
          api.get("/products")
        ]);
        setWarehouses(whRes.items || whRes || []);
        setSuppliers(supRes.items || supRes || []);
        setProducts(prodRes.items || prodRes || []);
      } catch (e) {
        toast.error("Failed to load related data");
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    // Calculate modal amount whenever relevant fields change
    const { billedQty, preGstRate, gstPercent, discountPercent, additionalDiscountPercent, transportCost } = modalData;
    let base = Number(preGstRate) * Number(billedQty);
    // apply discount
    let afterDisc = base - (base * (Number(discountPercent) / 100));
    // apply additional discount
    let afterAddDisc = afterDisc - (afterDisc * (Number(additionalDiscountPercent) / 100));
    // apply gst
    let gstAmt = afterAddDisc * (Number(gstPercent) / 100);
    let finalAmt = afterAddDisc + gstAmt + Number(transportCost || 0);
    
    setModalData(prev => ({ ...prev, calculatedAmt: finalAmt }));
  }, [
    modalData.billedQty, modalData.preGstRate, modalData.gstPercent, 
    modalData.discountPercent, modalData.additionalDiscountPercent, modalData.transportCost
  ]);

  const handleSaveItem = () => {
    if (!modalData.productId) return toast.error("Select a product");
    const product = products.find(p => p.id === modalData.productId);
    
    const newItem = {
      ...modalData,
      productName: product?.name || "Unknown Product",
      unitCost: modalData.preGstRate, 
      quantity: modalData.actualQty, 
      finalAmount: modalData.calculatedAmt
    };
    
    setItems([...items, newItem]);
    setIsModalOpen(false);
    toast.success("Item added to grid");
  };

  const grandTotal = items.reduce((sum, item) => sum + (item.finalAmount || 0), 0) + Number(extraMarginValue || 0);

  const handleSubmit = async (status = "SUBMITTED") => {
    try {
      if (!supplierId || !warehouseId) return toast.error("Please select City and Supplier");
      if (items.length === 0) return toast.error("Please add at least one item");
      
      const payload = {
        supplierId,
        warehouseId,
        supplierInvoiceNumber,
        supplierInvoiceDate: supplierInvoiceDate || null,
        extraMargin: Number(extraMarginValue || 0),
        marginType: "FIXED",
        payableAmount: grandTotal,
        items: items.map((it) => ({
          productId: it.productId,
          barcode: it.barcode,
          quantity: Number(it.actualQty),
          actualQty: Number(it.actualQty),
          billedQty: Number(it.billedQty),
          packSize: Number(it.packSize),
          unitCost: Number(it.preGstRate),
          preGstRate: Number(it.preGstRate),
          discountPercent: Number(it.discountPercent),
          additionalDiscountPercent: Number(it.additionalDiscountPercent),
          gstPercent: Number(it.gstPercent),
          transportCost: Number(it.transportCost),
          finalAmount: Number(it.finalAmount)
        })),
        status: status
      };

      await api.post("/purchase-orders", payload);
      toast.success(`Purchase Order saved as ${status}`);
      router.push("/admin/purchase-orders");
    } catch (e) {
      if (e.details && e.details.length > 0) {
        const msg = e.details.map(d => `${d.field}: ${d.message}`).join(" | ");
        toast.error(`Validation Error: ${msg}`);
      } else {
        toast.error(e.message || "Failed to save purchase order");
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex justify-between items-center bg-card p-4 rounded-xl shadow-sm border border-border">
        <div className="flex items-center gap-3">
          <Link href="/admin/purchase-orders">
            <Icon name="arrow-back" className="text-muted-foreground cursor-pointer hover:text-foreground transition-colors" />
          </Link>
          <h1 className="text-lg font-bold text-foreground">Create Purchase Invoice</h1>
        </div>
      </div>

      {/* Main Form Box */}
      <div className="bg-card p-6 rounded-xl shadow-sm border border-border space-y-8">
        
        {/* Header Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase">City *</label>
            <select 
              className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
              value={warehouseId} onChange={e => setWarehouseId(e.target.value)}
            >
              <option value="" className="bg-background">Select City / Warehouse...</option>
              {warehouses.map(w => <option key={w.id} value={w.id} className="bg-background">{w.name}</option>)}
            </select>
          </div>
          
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase">Supplier *</label>
            <div className="flex gap-2">
              <select 
                className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                value={supplierId} onChange={e => setSupplierId(e.target.value)}
              >
                <option value="" className="bg-background">Select Supplier...</option>
                {suppliers.map(s => <option key={s.id} value={s.id} className="bg-background">{s.companyName}</option>)}
              </select>
              <button className="h-10 px-3 bg-primary/10 text-primary hover:bg-primary/20 rounded-md text-xs font-semibold whitespace-nowrap transition-colors">View Details</button>
            </div>
          </div>
          
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase">Supplier Invoice No</label>
            <input 
              className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
              placeholder="Enter Invoice Number"
              value={supplierInvoiceNumber} onChange={e => setSupplierInvoiceNumber(e.target.value)}
            />
          </div>
          
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase flex items-center justify-between">
              <span>Invoice Date</span>
              <span className="text-rose-500 cursor-pointer hover:underline">+ New Product</span>
            </label>
            <input 
              type="date"
              className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
              value={supplierInvoiceDate} onChange={e => setSupplierInvoiceDate(e.target.value)}
            />
          </div>
        </div>

        {/* Upload Zone */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-muted-foreground uppercase">Upload Invoice Copy (Bill File)</label>
          <div className="border-2 border-dashed border-border rounded-lg p-10 flex flex-col items-center justify-center text-muted-foreground cursor-pointer hover:bg-muted/50 transition-colors">
            <Icon name="description" className="text-4xl mb-2 opacity-50" />
            <span className="text-sm">Drag & drop or click to upload bill invoice</span>
          </div>
        </div>

        {/* Grid Section */}
        <div className="border border-border rounded-lg bg-background overflow-hidden">
          <div className="p-4 flex justify-between items-center border-b border-border bg-card">
            <h2 className="font-bold text-foreground">Saved Product Items</h2>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-md text-sm font-semibold flex items-center shadow-sm"
            >
              + Add Product Item
            </button>
          </div>
          
          <div className="overflow-x-auto bg-card min-h-[150px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border text-[10px] font-bold text-muted-foreground uppercase bg-muted/30">
                  <th className="p-3">S.No</th>
                  <th className="p-3">Barcode</th>
                  <th className="p-3">Product</th>
                  <th className="p-3">Act. Qty</th>
                  <th className="p-3">Billed Qty</th>
                  <th className="p-3">Pack Size</th>
                  <th className="p-3">Pre-GST Rate</th>
                  <th className="p-3">Pre-GST Amt</th>
                  <th className="p-3">Disc %</th>
                  <th className="p-3">Add. Disc %</th>
                  <th className="p-3">GST %</th>
                  <th className="p-3">Trans Cost</th>
                  <th className="p-3 text-right">Final Amount</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan="13" className="p-6 text-center text-muted-foreground text-sm">
                      No items added yet. Click "Add Product Item" to list products.
                    </td>
                  </tr>
                ) : (
                  items.map((item, idx) => (
                    <tr key={idx} className="border-b border-border/50 text-xs hover:bg-muted/30 transition-colors">
                      <td className="p-3">{idx + 1}</td>
                      <td className="p-3">{item.barcode || "---"}</td>
                      <td className="p-3 font-medium text-foreground">{item.productName}</td>
                      <td className="p-3">{item.actualQty}</td>
                      <td className="p-3">{item.billedQty}</td>
                      <td className="p-3">{item.packSize}</td>
                      <td className="p-3">{item.preGstRate}</td>
                      <td className="p-3">{Number(item.preGstRate * item.billedQty).toFixed(2)}</td>
                      <td className="p-3">{item.discountPercent}</td>
                      <td className="p-3">{item.additionalDiscountPercent}</td>
                      <td className="p-3">{item.gstPercent}</td>
                      <td className="p-3">{item.transportCost}</td>
                      <td className="p-3 text-right font-bold text-foreground">₹{item.finalAmount?.toFixed(2)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Totals */}
        <div className="border border-border rounded-lg p-4 bg-card flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-4 items-end flex-wrap flex-1">
            <div className="space-y-1 w-48">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Extra Margin Name</label>
              <input 
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                placeholder="e.g. Festival Margin"
                value={extraMarginName} onChange={e => setExtraMarginName(e.target.value)}
              />
            </div>
            <div className="space-y-1 w-32">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Extra Margin (%)</label>
              <input 
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                placeholder="e.g. 5"
                value={extraMarginPercent} onChange={e => setExtraMarginPercent(e.target.value)}
              />
            </div>
            <span className="text-xs font-bold text-muted-foreground mb-2">OR</span>
            <div className="space-y-1 w-32">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Extra Margin Value</label>
              <input 
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                placeholder="e.g. 200"
                value={extraMarginValue} onChange={e => setExtraMarginValue(e.target.value)}
              />
            </div>
            <div className="space-y-1 w-32">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Bill Discount (%)</label>
              <input 
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                placeholder="e.g. 10"
                value={billDiscountPercent} onChange={e => setBillDiscountPercent(e.target.value)}
              />
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-[10px] font-bold text-muted-foreground uppercase">Grand Total</div>
            <div className="text-2xl font-black text-rose-600">₹{grandTotal.toFixed(2)}</div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button onClick={() => router.push("/admin/purchase-orders")} className="px-6 py-2 border border-border rounded-md text-sm font-semibold hover:bg-muted transition-colors">Cancel</button>
          <button 
            onClick={() => handleSubmit("DRAFT")}
            className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-md text-sm font-semibold shadow-sm transition-colors"
          >
            Save Draft
          </button>
          <button 
            onClick={() => handleSubmit("SUBMITTED")}
            className="px-6 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-md text-sm font-semibold shadow-sm transition-colors"
          >
            Submit Order
          </button>
        </div>
      </div>

      {/* Add Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-border flex justify-between items-center bg-muted/30">
              <h2 className="text-lg font-bold text-foreground">Add Product Item</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                <Icon name="close" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Barcode</label>
                  <input 
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                    value={modalData.barcode} onChange={e => setModalData({...modalData, barcode: e.target.value})}
                  />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Product</label>
                  <select 
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                    value={modalData.productId} onChange={e => setModalData({...modalData, productId: e.target.value})}
                  >
                    <option value="" className="bg-background">Select product...</option>
                    {products.map(p => <option key={p.id} value={p.id} className="bg-background">{p.name}</option>)}
                  </select>
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Pack Size</label>
                  <input 
                    type="number" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                    value={modalData.packSize} onChange={e => setModalData({...modalData, packSize: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-rose-500 uppercase">MRP/Piece</label>
                  <input 
                    type="number" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm text-rose-500"
                    value={modalData.mrp} onChange={e => setModalData({...modalData, mrp: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">GST %</label>
                  <input 
                    type="number" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                    value={modalData.gstPercent} onChange={e => setModalData({...modalData, gstPercent: e.target.value})}
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Disc %</label>
                  <input 
                    type="number" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                    value={modalData.discountPercent} onChange={e => setModalData({...modalData, discountPercent: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Pre-GST Rate</label>
                  <input 
                    type="number" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                    value={modalData.preGstRate} onChange={e => setModalData({...modalData, preGstRate: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Purchase Price</label>
                  <input 
                    type="number" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                    value={modalData.purchasePrice} onChange={e => setModalData({...modalData, purchasePrice: e.target.value})}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Actual Qty.</label>
                  <input 
                    type="number" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                    value={modalData.actualQty} onChange={e => setModalData({...modalData, actualQty: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Billed Qty.</label>
                  <input 
                    type="number" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                    value={modalData.billedQty} onChange={e => setModalData({...modalData, billedQty: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Add. Disc %</label>
                  <input 
                    type="number" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                    value={modalData.additionalDiscountPercent} onChange={e => setModalData({...modalData, additionalDiscountPercent: e.target.value})}
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Trans. Cost</label>
                  <input 
                    type="number" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                    value={modalData.transportCost} onChange={e => setModalData({...modalData, transportCost: e.target.value})}
                  />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Calculated Amt</label>
                  <input 
                    type="text" readOnly className="flex h-9 w-full rounded-md border border-input bg-muted/50 px-3 py-1 text-sm shadow-sm font-bold text-foreground"
                    value={`₹${modalData.calculatedAmt.toFixed(2)}`}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <h3 className="text-sm font-bold mb-3 text-foreground">Set Selling Prices (Overrides)</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Dealer Price</label>
                    <input type="number" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm" value={modalData.dealerPrice} onChange={e => setModalData({...modalData, dealerPrice: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Wholesale</label>
                    <input type="number" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm" value={modalData.wholesalePrice} onChange={e => setModalData({...modalData, wholesalePrice: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Parlour Price</label>
                    <input type="number" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm" value={modalData.parlourPrice} onChange={e => setModalData({...modalData, parlourPrice: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Retail Price</label>
                    <input type="number" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm" value={modalData.retailPrice} onChange={e => setModalData({...modalData, retailPrice: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Online Price</label>
                    <input type="number" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm" value={modalData.onlinePrice} onChange={e => setModalData({...modalData, onlinePrice: e.target.value})} />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-border flex justify-end gap-3 bg-muted/30">
              <button onClick={() => setIsModalOpen(false)} className="px-6 py-2 border border-border bg-background rounded-md text-sm font-semibold hover:bg-muted transition-colors">Cancel</button>
              <button onClick={handleSaveItem} className="px-6 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-md text-sm font-semibold shadow-sm transition-colors">Save Item</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
