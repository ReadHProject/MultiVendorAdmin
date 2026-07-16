"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";
import { toast } from "@/components/ui/toaster";
import { Select } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { MobileFooter, MobileHeader } from "@/components/admin/mobile/mobile-layout";

const MARGIN_FIELDS = [
  { key: "dealerMargin", label: "Dealer Margin (%)" },
  { key: "wholesalerMargin", label: "Wholesaler Margin (%)" },
  { key: "retailMargin", label: "Retail Margin (%)" },
  { key: "parlourMargin", label: "Parlour Margin (%)" },
  { key: "onlineMargin", label: "Online Margin (%)" },
];

export default function SuppliersPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [viewingSupplier, setViewingSupplier] = useState(null);
  const [search, setSearch] = useState("");

  const defaultFormState = {
    companyName: "",
    contactName: "",
    gstin: "",
    email: "",
    phone: "",
    phone2: "",
    status: true,
    country: "INDIA",
    state: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    pincode: "",
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    accountHolderName: "",
    openingBalance: 0,
    balanceType: "CREDIT",
    creditPeriodDays: 0,
    dealerMargin: 0,
    wholesalerMargin: 0,
    retailMargin: 0,
    parlourMargin: 0,
    onlineMargin: 0,
  };

  const [form, setForm] = useState(defaultFormState);

  async function load() {
    setLoading(true);
    try {
      const data = await api.get("/suppliers", { params: { q: search } });
      setItems(data?.items || data || []);
    } catch {
      toast.error("Failed to load suppliers");
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [search]);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      // Map frontend fields to backend
      const payload = {
        companyName: form.companyName,
        contactName: form.contactName,
        gstin: form.gstin,
        email: form.email,
        phone: form.phone,
        phone2: form.phone2,
        address: `${form.addressLine1} ${form.addressLine2}, ${form.city}, ${form.state}, ${form.country} - ${form.pincode}`,
        addressLine1: form.addressLine1,
        addressLine2: form.addressLine2,
        city: form.city,
        state: form.state,
        country: form.country,
        pincode: form.pincode,
        bankName: form.bankName,
        bankAccount: form.accountNumber,
        ifsc: form.ifscCode,
        accountHolderName: form.accountHolderName,
        openingBalance: Number(form.openingBalance) || 0,
        balanceType: form.balanceType,
        creditDays: Number(form.creditPeriodDays) || 0,
        dealerMargin: Number(form.dealerMargin) || 0,
        wholesalerMargin: Number(form.wholesalerMargin) || 0,
        retailMargin: Number(form.retailMargin) || 0,
        parlourMargin: Number(form.parlourMargin) || 0,
        onlineMargin: Number(form.onlineMargin) || 0,
        status: form.status,
      };

      if (editingSupplier) {
        await api.put(`/suppliers/${editingSupplier.id}`, payload);
        toast.success("Supplier updated successfully");
      } else {
        await api.post("/suppliers", payload);
        toast.success("Supplier created successfully");
      }
      
      setShowForm(false);
      
      // Reset form
      setForm(defaultFormState);
      setEditingSupplier(null);
      load();
    } catch (err) {
      toast.error(err?.message || `Failed to ${editingSupplier ? 'update' : 'create'}`);
    }
  }

  function handleAddClick() {
    setEditingSupplier(null);
    setForm(defaultFormState);
    setShowForm(true);
  }

  function handleEditClick(item) {
    setEditingSupplier(item);
    setForm({
      companyName: item.companyName || "",
      contactName: item.contactName || "",
      gstin: item.gstin || "",
      email: item.email || "",
      phone: item.phone || "",
      phone2: item.phone2 || "",
      status: item.status !== false,
      country: item.country || "INDIA",
      state: item.state || "",
      addressLine1: item.addressLine1 || "",
      addressLine2: item.addressLine2 || "",
      city: item.city || "",
      pincode: item.pincode || "",
      bankName: item.bankName || "",
      accountNumber: item.bankAccount || "",
      ifscCode: item.ifsc || "",
      accountHolderName: item.accountHolderName || "",
      openingBalance: item.openingBalance || 0,
      balanceType: item.balanceType || "CREDIT",
      creditPeriodDays: item.creditDays || 0,
      dealerMargin: item.dealerMargin || 0,
      wholesalerMargin: item.wholesalerMargin || 0,
      retailMargin: item.retailMargin || 0,
      parlourMargin: item.parlourMargin || 0,
      onlineMargin: item.onlineMargin || 0,
    });
    setShowForm(true);
  }

  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this supplier?")) return;
    try {
      await api.delete(`/suppliers/${id}`);
      toast.success("Supplier deleted successfully");
      load();
    } catch (err) {
      toast.error(err?.message || "Failed to delete supplier");
    }
  }

  const columns = [
    {
      header: "CODE",
      cell: (item) => (
        <span className="text-xs text-blue-500 font-medium">
          {item.code || `SUP${item.id.slice(-4).toUpperCase()}`}
        </span>
      ),
    },
    {
      header: "COMPANY",
      cell: (item) => (
        <span className="font-semibold text-sm">{item.companyName}</span>
      ),
    },
    {
      header: "CONTACT",
      cell: (item) => (
        <span className="text-sm">{item.contactName || "---"}</span>
      ),
    },
    {
      header: "CONTACT DETAILS",
      cell: (item) => (
        <div>
          <div className="text-sm font-medium">{item.phone || "---"}</div>
          <div className="text-xs text-muted-foreground">{item.email}</div>
        </div>
      ),
    },
    {
      header: "CITY / STATE",
      cell: (item) => (
        <span className="text-sm text-muted-foreground">
          {item.city && item.state ? `${item.city}, ${item.state}` : "---"}
        </span>
      ),
    },
    {
      header: "MARGINS (D / W / P / R / O)",
      cell: (item) => (
        <span className="text-xs text-muted-foreground tracking-widest font-mono">
          D: {Number(item.dealerMargin || 0)}% | W: {Number(item.wholesalerMargin || 0)}% | P: {Number(item.parlourMargin || 0)}% | R: {Number(item.retailMargin || 0)}% | O: {Number(item.onlineMargin || 0)}%
        </span>
      ),
    },
    {
      header: "OPENING BAL.",
      cell: (item) => (
        <span className="text-sm font-medium text-emerald-600">
          ₹{Number(item.openingBalance || 0).toFixed(2)} ({item.balanceType === "DEBIT" ? "Dr" : "Cr"})
        </span>
      ),
    },
    {
      header: "STATUS",
      cell: (item) => (
        <Badge variant={item.status !== false ? "success" : "secondary"}>
          {item.status !== false ? "ACTIVE" : "INACTIVE"}
        </Badge>
      ),
    },
    {
      header: "ACTIONS",
      cell: (item) => (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-7 text-xs text-blue-500 border-blue-200" onClick={() => handleEditClick(item)}>
            Edit
          </Button>
          <Button variant="outline" size="sm" className="h-7 text-xs text-red-500 border-red-200" onClick={() => handleDelete(item.id)}>
            Delete
          </Button>
          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setViewingSupplier(item)}>
            View
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="hidden md:block">
        <div className="space-y-6 p-2 md:p-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Vendors & Suppliers</h1>
              <p className="text-sm text-muted-foreground">Manage your suppliers, vendors and procurements.</p>
            </div>
            <Button onClick={handleAddClick} className="bg-blue-600 hover:bg-blue-700">
              <Icon name="plus" size={16} className="mr-2" /> Add Supplier
            </Button>
          </div>

          <div className="bg-card border border-border rounded-lg p-2">
            <div className="relative max-w-md">
              <Icon name="search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by company, prefix or phone..."
                className="pl-9 bg-background border-none shadow-none"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-muted animate-pulse rounded" />
              ))}
            </div>
          ) : (
            <div className="bg-card border border-border rounded-lg overflow-x-auto">
              <DataTable columns={columns} data={items} empty="No suppliers found" />
            </div>
          )}
        </div>
      </div>

      {/* Mobile UI */}
      <div className="block md:hidden pb-24 min-h-screen bg-slate-950 text-slate-200">
        <MobileHeader title="Suppliers" showMenu={true} />
        
        <div className="p-4 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-semibold text-lg">{items.length} Suppliers</h2>
            <Button onClick={handleAddClick} className="bg-accent hover:bg-accent/90 text-white h-9 px-4 text-xs font-semibold rounded-custom shadow-lg shadow-accent/20">
              <Icon name="plus" size={16} className="mr-1" /> Add
            </Button>
          </div>
          
          <Input
            placeholder="Search suppliers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-slate-900 border-slate-800 text-slate-200 focus:ring-accent focus:border-accent w-full rounded-custom"
          />

          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-28 bg-slate-900 animate-pulse rounded-custom" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-sm">No suppliers found</div>
          ) : (
            <div className="space-y-3">
              {items.map((row) => (
                <div 
                  key={row.id} 
                  onClick={() => setViewingSupplier(row)} 
                  className="bg-slate-900 border border-slate-800 rounded-custom p-3 flex flex-col gap-2 cursor-pointer hover:border-slate-700 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-sm text-white">{row.companyName}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">{row.contactName || "No contact"}</p>
                    </div>
                    <Badge variant={row.status !== false ? "success" : "secondary"} className="text-[9px] uppercase">
                      {row.status !== false ? "ACTIVE" : "INACTIVE"}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-end mt-1">
                    <div className="text-xs text-slate-400">
                      <div className="flex items-center gap-1"><Icon name="phone" size={12}/> {row.phone || "---"}</div>
                      <div className="flex items-center gap-1 mt-0.5"><Icon name="map-pin" size={12}/> {row.city ? `${row.city}, ${row.state}` : "---"}</div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black text-emerald-400">₹{Number(row.openingBalance || 0).toFixed(2)}</span>
                      <span className="text-[10px] text-slate-500 block">Open Bal.</span>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-slate-800">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleEditClick(row); }}
                      className="px-3 py-1 bg-slate-800 text-slate-300 rounded-custom text-xs font-semibold hover:bg-slate-700"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDelete(row.id); }}
                      className="px-3 py-1 bg-red-500/10 text-red-400 rounded-custom text-xs font-semibold hover:bg-red-500/20"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <MobileFooter />
      </div>

      {/* ADD / EDIT SUPPLIER MODAL */}
      <Dialog controlledOpen={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 gap-0">
          <DialogHeader className="p-6 pb-4 border-b border-border sticky top-0 bg-card z-10 flex flex-row items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setShowForm(false)} className="shrink-0 -ml-2">
              <Icon name="arrow-left" size={20} />
            </Button>
            <DialogTitle className="text-xl">{editingSupplier ? "Edit Supplier" : "Add Supplier"}</DialogTitle>
          </DialogHeader>

          <div className="p-6 space-y-8 bg-slate-50/50 dark:bg-slate-900/20">
            {/* Personal Info */}
            <section className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <h3 className="text-base font-semibold mb-6 text-foreground">Personal Info</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Company Name <span className="text-red-500">*</span></label>
                  <Input 
                    value={form.companyName} 
                    onChange={e => setForm({...form, companyName: e.target.value})}
                    placeholder="COMPANY NAME"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name <span className="text-red-500">*</span></label>
                  <Input 
                    value={form.contactName} 
                    onChange={e => setForm({...form, contactName: e.target.value})}
                    placeholder="NAME"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">GSTIN</label>
                  <Input 
                    value={form.gstin} 
                    onChange={e => setForm({...form, gstin: e.target.value})}
                    placeholder="22AAAAAA0000A1Z5"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input 
                    type="email"
                    value={form.email} 
                    onChange={e => setForm({...form, email: e.target.value})}
                    placeholder="EMAIL@EXAMPLE.COM"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone Number <span className="text-red-500">*</span></label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 border border-r-0 border-input bg-muted text-muted-foreground text-sm rounded-l-md">+91</span>
                    <Input 
                      className="rounded-l-none"
                      value={form.phone} 
                      onChange={e => setForm({...form, phone: e.target.value})}
                      placeholder="9876543210"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone Number 2</label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 border border-r-0 border-input bg-muted text-muted-foreground text-sm rounded-l-md">+91</span>
                    <Input 
                      className="rounded-l-none"
                      value={form.phone2} 
                      onChange={e => setForm({...form, phone2: e.target.value})}
                      placeholder="9876543210"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status <span className="text-red-500">*</span></label>
                  <select 
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={form.status ? "Active" : "Inactive"}
                    onChange={e => setForm({...form, status: e.target.value === "Active"})}
                  >
                    <option>Active</option>
                    <option>Inactive</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Address */}
            <section className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <h3 className="text-base font-semibold mb-6 text-foreground">Address</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Country <span className="text-red-500">*</span></label>
                  <Input 
                    value={form.country} 
                    onChange={e => setForm({...form, country: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">State <span className="text-red-500">*</span></label>
                  <Input 
                    value={form.state} 
                    onChange={e => setForm({...form, state: e.target.value})}
                    placeholder="Select a state"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Address Line 1 <span className="text-red-500">*</span></label>
                  <Input 
                    value={form.addressLine1} 
                    onChange={e => setForm({...form, addressLine1: e.target.value})}
                    placeholder="ADDRESS LINE 1"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Address Line 2</label>
                  <Input 
                    value={form.addressLine2} 
                    onChange={e => setForm({...form, addressLine2: e.target.value})}
                    placeholder="ADDRESS LINE 2"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">City <span className="text-red-500">*</span></label>
                  <Input 
                    value={form.city} 
                    onChange={e => setForm({...form, city: e.target.value})}
                    placeholder="CITY"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Pincode <span className="text-red-500">*</span></label>
                  <Input 
                    value={form.pincode} 
                    onChange={e => setForm({...form, pincode: e.target.value})}
                    placeholder="PINCODE (6 DIGITS)"
                  />
                </div>
              </div>
            </section>

            {/* Bank Details */}
            <section className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <h3 className="text-base font-semibold mb-6 text-foreground">Bank Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Bank Name</label>
                  <Input 
                    value={form.bankName} 
                    onChange={e => setForm({...form, bankName: e.target.value})}
                    placeholder="BANK NAME"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Account Number</label>
                  <Input 
                    value={form.accountNumber} 
                    onChange={e => setForm({...form, accountNumber: e.target.value})}
                    placeholder="ACCOUNT NUMBER (9-18 DIGITS)"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">IFSC Code</label>
                  <Input 
                    value={form.ifscCode} 
                    onChange={e => setForm({...form, ifscCode: e.target.value})}
                    placeholder="IFSC CODE (E.G., SBIN0001234)"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Account Holder Name</label>
                  <Input 
                    value={form.accountHolderName} 
                    onChange={e => setForm({...form, accountHolderName: e.target.value})}
                    placeholder="ACCOUNT HOLDER NAME"
                  />
                </div>
              </div>
            </section>

            {/* Opening Balance & Settings */}
            <section className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <h3 className="text-base font-semibold mb-6 text-foreground">Opening Balance & Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Opening Balance <span className="text-red-500">*</span></label>
                  <Input 
                    type="number"
                    value={form.openingBalance} 
                    onChange={e => setForm({...form, openingBalance: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Balance Type <span className="text-red-500">*</span></label>
                  <select 
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={form.balanceType}
                    onChange={e => setForm({...form, balanceType: e.target.value})}
                  >
                    <option value="CREDIT">CREDIT</option>
                    <option value="DEBIT">DEBIT</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Credit Period (Days) <span className="text-red-500">*</span></label>
                  <Input 
                    type="number"
                    value={form.creditPeriodDays} 
                    onChange={e => setForm({...form, creditPeriodDays: e.target.value})}
                  />
                </div>
              </div>
            </section>

            {/* Pricing Margins */}
            <section className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <h3 className="text-base font-semibold mb-2 text-foreground">Pricing Margins (%)</h3>
              <p className="text-sm text-muted-foreground mb-6">Specify default margin percentages for different consumer roles.</p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {MARGIN_FIELDS.map(field => (
                  <div key={field.key} className="space-y-2">
                    <label className="text-sm font-medium">{field.label}</label>
                    <Input 
                      type="number"
                      value={form[field.key]} 
                      onChange={e => setForm({...form, [field.key]: e.target.value})}
                    />
                  </div>
                ))}
              </div>
            </section>

          </div>

          <DialogFooter className="p-4 border-t border-border bg-card sticky bottom-0 z-10">
            <div className="flex w-full justify-end gap-3">
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700">
                {editingSupplier ? "Save Changes" : "Save Supplier"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* VIEW SUPPLIER MODAL */}
      <Dialog controlledOpen={!!viewingSupplier} onOpenChange={(open) => !open && setViewingSupplier(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 gap-0">
          <DialogHeader className="p-6 pb-4 border-b border-border sticky top-0 bg-card z-10 flex flex-row items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setViewingSupplier(null)} className="shrink-0 -ml-2">
              <Icon name="arrow-left" size={20} />
            </Button>
            <DialogTitle className="text-xl">Supplier Details</DialogTitle>
          </DialogHeader>

          {viewingSupplier && (
            <div className="p-6 space-y-8 bg-slate-50/50 dark:bg-slate-900/20">
              {/* Personal Info */}
              <section className="bg-card border border-border rounded-xl p-6 shadow-sm">
                <h3 className="text-base font-semibold mb-4 text-foreground border-b pb-2">Personal Info</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-6">
                  <div>
                    <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Company Name</div>
                    <div className="text-sm font-semibold">{viewingSupplier.companyName || "---"}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Contact Name</div>
                    <div className="text-sm">{viewingSupplier.contactName || "---"}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">GSTIN</div>
                    <div className="text-sm">{viewingSupplier.gstin || "---"}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Email</div>
                    <div className="text-sm">{viewingSupplier.email || "---"}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Phone Number</div>
                    <div className="text-sm">{viewingSupplier.phone ? `+91 ${viewingSupplier.phone}` : "---"}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Phone Number 2</div>
                    <div className="text-sm">{viewingSupplier.phone2 ? `+91 ${viewingSupplier.phone2}` : "---"}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Status</div>
                    <div>
                      <Badge variant={viewingSupplier.status !== false ? "success" : "secondary"}>
                        {viewingSupplier.status !== false ? "ACTIVE" : "INACTIVE"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </section>

              {/* Address */}
              <section className="bg-card border border-border rounded-xl p-6 shadow-sm">
                <h3 className="text-base font-semibold mb-4 text-foreground border-b pb-2">Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-6">
                  <div className="lg:col-span-2">
                    <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Full Address</div>
                    <div className="text-sm">
                      {[viewingSupplier.addressLine1, viewingSupplier.addressLine2, viewingSupplier.city, viewingSupplier.state, viewingSupplier.country, viewingSupplier.pincode].filter(Boolean).join(", ")}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">City</div>
                    <div className="text-sm">{viewingSupplier.city || "---"}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">State</div>
                    <div className="text-sm">{viewingSupplier.state || "---"}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Country</div>
                    <div className="text-sm">{viewingSupplier.country || "INDIA"}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Pincode</div>
                    <div className="text-sm">{viewingSupplier.pincode || "---"}</div>
                  </div>
                </div>
              </section>

              {/* Bank Details */}
              <section className="bg-card border border-border rounded-xl p-6 shadow-sm">
                <h3 className="text-base font-semibold mb-4 text-foreground border-b pb-2">Bank Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-y-4 gap-x-6">
                  <div>
                    <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Bank Name</div>
                    <div className="text-sm">{viewingSupplier.bankName || "---"}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Account Number</div>
                    <div className="text-sm">{viewingSupplier.bankAccount || "---"}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">IFSC Code</div>
                    <div className="text-sm">{viewingSupplier.ifsc || "---"}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Account Holder</div>
                    <div className="text-sm">{viewingSupplier.accountHolderName || "---"}</div>
                  </div>
                </div>
              </section>

              {/* Account Settings */}
              <section className="bg-card border border-border rounded-xl p-6 shadow-sm">
                <h3 className="text-base font-semibold mb-4 text-foreground border-b pb-2">Account Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 gap-x-6">
                  <div>
                    <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Opening Balance</div>
                    <div className="text-sm font-semibold text-emerald-600">
                      ₹{Number(viewingSupplier.openingBalance || 0).toFixed(2)} ({viewingSupplier.balanceType === "DEBIT" ? "Dr" : "Cr"})
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Credit Period</div>
                    <div className="text-sm">{viewingSupplier.creditDays || 0} Days</div>
                  </div>
                </div>
              </section>

              {/* Pricing Margins */}
              <section className="bg-card border border-border rounded-xl p-6 shadow-sm">
                <h3 className="text-base font-semibold mb-4 text-foreground border-b pb-2">Pricing Margins</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-y-4 gap-x-6">
                  <div>
                    <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Dealer</div>
                    <div className="text-sm">{Number(viewingSupplier.dealerMargin || 0)}%</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Wholesaler</div>
                    <div className="text-sm">{Number(viewingSupplier.wholesalerMargin || 0)}%</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Retail</div>
                    <div className="text-sm">{Number(viewingSupplier.retailMargin || 0)}%</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Parlour</div>
                    <div className="text-sm">{Number(viewingSupplier.parlourMargin || 0)}%</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Online</div>
                    <div className="text-sm">{Number(viewingSupplier.onlineMargin || 0)}%</div>
                  </div>
                </div>
              </section>

            </div>
          )}
          
          <DialogFooter className="p-4 border-t border-border bg-card sticky bottom-0 z-10">
            <div className="flex w-full justify-end gap-3">
              <Button variant="outline" onClick={() => setViewingSupplier(null)}>
                Close
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
