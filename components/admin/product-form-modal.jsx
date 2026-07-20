"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { BarcodeGenerator } from "@/components/admin/barcode-generator";
import { ImageUploader } from "@/components/admin/image-uploader";
import { RolePricingEditor } from "@/components/admin/role-pricing-editor";
import { DropdownWithCreate } from "@/components/admin/dropdown-with-create";
import {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
} from "@/store/api/slices/categoriesApi";
import {
  useGetBrandsQuery,
  useCreateBrandMutation,
} from "@/store/api/slices/brandsApi";
import {
  useGetCustomerTypesQuery,
  useCreateCustomerTypeMutation,
} from "@/store/api/slices/customerTypesApi";
import {
  useGetProductTypesQuery,
  useCreateProductTypeMutation,
} from "@/store/api/slices/productTypesApi";
import { useGetRolesQuery } from "@/store/api/slices/rolesApi";
import { ArrowLeft, Save, Info, Package, IndianRupee, Image, Plus } from "lucide-react";

const TAX_OPTIONS = ["0%", "5%", "12%", "18%", "28%"];

const SECTIONS = [
  { id: "general", label: "General Info", icon: Info },
  { id: "inventory", label: "Inventory", icon: Package },
  { id: "pricing", label: "Pricing Rules", icon: IndianRupee },
  { id: "media", label: "Media", icon: Image },
];

const INITIAL_FORM = {
  name: "",
  description: "",
  productTypeId: "",
  status: "ACTIVE",
  customerTypeId: "",
  categoryId: "",
  subCategoryId: "",
  brandId: "",
  barcode: "",
  purchasePrice: "",
  mrp: "",
  discountPercent: "",
  unit: "Pcs",
  measurement: "",
  taxPercent: "18%",
  variantType: "Simple Product",
  minOrderQty: "1",
  maxOrderQty: "",
  initialStock: "0",
  customSku: "",
  preGst: "",
};

export default function ProductFormModal({ open, onOpenChange, onCreated, editProduct }) {
  const [activeSection, setActiveSection] = useState("general");
  const [form, setForm] = useState(INITIAL_FORM);
  const [images, setImages] = useState([]);
  const [rolePricing, setRolePricing] = useState([]);
  const [creating, setCreating] = useState(false);
  const [subCatCreateOpen, setSubCatCreateOpen] = useState(false);
  const [subCatName, setSubCatName] = useState("");
  const [creatingSubCat, setCreatingSubCat] = useState(false);

  const scrollRef = useRef(null);
  const sectionRefs = useRef({});
  const scrollingFromNav = useRef(false);

  const { data: customerTypesData } = useGetCustomerTypesQuery();
  const { data: productTypesData } = useGetProductTypesQuery();
  const { data: categoriesData, refetch: refetchCategories } = useGetCategoriesQuery();
  const { data: brandsData } = useGetBrandsQuery();
  const { data: rolesData } = useGetRolesQuery();
  const [createCustomerType] = useCreateCustomerTypeMutation();
  const [createProductType] = useCreateProductTypeMutation();
  const [createCategory] = useCreateCategoryMutation();
  const [createBrand] = useCreateBrandMutation();

  const customerTypes = customerTypesData?.data || customerTypesData || [];
  const productTypes = productTypesData?.data || productTypesData || [];
  const categories = categoriesData?.data || categoriesData || [];
  const brands = brandsData?.data || brandsData || [];

  const selectedProductTypeName = productTypes
    .find((pt) => pt.id === form.productTypeId)?.name?.toLowerCase();

  const isJewelry = selectedProductTypeName === "jewelry" || selectedProductTypeName === "jewellery";
  const isStandard = selectedProductTypeName === "cosmetics" || selectedProductTypeName === "cutlery";

  function flattenTree(nodes, depth = 0) {
    if (!Array.isArray(nodes)) return [];
    return nodes.reduce((acc, node) => {
      acc.push({ id: node.id, name: `${"  ".repeat(depth)}${node.name}` });
      if (node.children) {
        acc.push(...flattenTree(node.children, depth + 1));
      }
      return acc;
    }, []);
  }

  const rootCategories = categories.map((c) => ({ id: c.id, name: c.name }));

  const selectedCategory = categories.find((c) => c.id === form.categoryId);
  const subCategories = selectedCategory
    ? (selectedCategory.children || []).map((child) => ({
      id: child.id,
      name: child.name,
    }))
    : [];

  useEffect(() => {
    if (open) {
      if (editProduct) {
        setForm({
          name: editProduct.name || "",
          description: editProduct.description || "",
          productTypeId: editProduct.productTypeId || "",
          status: editProduct.status || "ACTIVE",
          customerTypeId: editProduct.customerTypeId || "",
          categoryId: editProduct.categoryId || "",
          subCategoryId: editProduct.subCategoryId || "",
          brandId: editProduct.brandId || "",
          barcode: editProduct.barcode || "",
          purchasePrice: String(editProduct.variants?.[0]?.price ?? editProduct.purchasePrice ?? ""),
          mrp: String(editProduct.variants?.[0]?.mrp ?? editProduct.mrp ?? ""),
          discountPercent: String(editProduct.discountPercent ?? ""),
          unit: editProduct.unit || "Pcs",
          measurement: editProduct.measurement || "",
          taxPercent: editProduct.taxPercent != null ? `${parseFloat(editProduct.taxPercent)}%` : "18%",
          variantType: editProduct.variantType || "Simple Product",
          minOrderQty: String(editProduct.minOrderQty ?? "1"),
          maxOrderQty: String(editProduct.maxOrderQty ?? ""),
          initialStock: String(editProduct.initialStock ?? "0"),
          customSku: editProduct.customSku || "",
          preGst: String(editProduct.preGst ?? ""),
        });
        setImages(
          editProduct.images?.length
            ? editProduct.images
            : editProduct.image
              ? [editProduct.image]
              : []
        );
        setRolePricing(editProduct.rolePrices?.map((rp) => ({
          role: typeof rp.role === "object" ? rp.role?.name : rp.role,
          price: Number(rp.price) || 0,
          mrp: Number(rp.mrp) || 0,
          discountPercent: Number(rp.discountPercent) || 0,
          minQty: Number(rp.minQty) || 1,
          commissionPercent: Number(rp.commissionPercent) || 0,
          visible: rp.visible !== false,
        })) || []);
      } else {
        setForm(INITIAL_FORM);
        setImages([]);
        setRolePricing([]);
      }
      setActiveSection("general");
      setSubCatCreateOpen(false);
      setSubCatName("");
    }
  }, [open, editProduct]);

  const handleScroll = useCallback(() => {
    if (scrollingFromNav.current) return;
    const container = scrollRef.current;
    if (!container) return;
    const containerTop = container.getBoundingClientRect().top;
    let current = "general";
    for (const section of SECTIONS) {
      const el = sectionRefs.current[section.id];
      if (el) {
        const elTop = el.getBoundingClientRect().top - containerTop;
        if (elTop <= 120) {
          current = section.id;
        }
      }
    }
    setActiveSection(current);
  }, []);

  function scrollToSection(id) {
    setActiveSection(id);
    const el = sectionRefs.current[id];
    const container = scrollRef.current;
    if (el && container) {
      scrollingFromNav.current = true;
      const containerTop = container.getBoundingClientRect().top;
      const elTop = el.getBoundingClientRect().top;
      const offset = container.scrollTop + (elTop - containerTop) - 16;
      container.scrollTo({ top: offset, behavior: "smooth" });
      setTimeout(() => { scrollingFromNav.current = false; }, 800);
    }
  }

  function updateField(field, value) {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "categoryId") {
        next.subCategoryId = "";
      }
      return next;
    });
  }

  // Calculate pricing when MRP, discount, or tax changes for Cosmetics/Cutlery
  useEffect(() => {
    if (isStandard) {
      const mrp = parseFloat(form.mrp) || 0;
      const discount = parseFloat(form.discountPercent) || 0;
      let gst = 0;
      if (typeof form.taxPercent === 'string') {
        gst = parseFloat(form.taxPercent.replace('%', '')) || 0;
      } else {
        gst = parseFloat(form.taxPercent) || 0;
      }

      if (mrp > 0) {
        const purchasePrice = mrp - (mrp * discount) / 100;
        const costPrice = purchasePrice / (1 + gst / 100);

        const newPurchaseStr = purchasePrice.toFixed(2);
        const newCostStr = costPrice.toFixed(2);

        setForm((prev) => {
          if (prev.purchasePrice !== newPurchaseStr || prev.preGst !== newCostStr) {
            return { ...prev, purchasePrice: newPurchaseStr, preGst: newCostStr };
          }
          return prev;
        });
      }
    }
  }, [form.mrp, form.discountPercent, form.taxPercent, isStandard]);

  async function handleCreateSubCategory() {
    if (!subCatName.trim()) {
      toast.error("Sub category name is required");
      return;
    }
    if (!form.categoryId) {
      toast.error("Please select a parent category first");
      return;
    }
    setCreatingSubCat(true);
    try {
      const result = await createCategory({ name: subCatName.trim(), parentId: form.categoryId }).unwrap();
      toast.success("Sub category created successfully");
      setSubCatCreateOpen(false);
      setSubCatName("");
      refetchCategories();
      if (result && result.data && result.data.id) {
        updateField("subCategoryId", result.data.id);
      }
    } catch (err) {
      toast.error(err?.data?.error?.message || "Failed to create sub category");
    } finally {
      setCreatingSubCat(false);
    }
  }

  async function handleCreate() {
    if (!form.name.trim()) {
      toast.error("Product name is required");
      scrollToSection("general");
      return;
    }

    setCreating(true);
    try {
      const payload = {
        name: form.name,
        description: form.description,
        productTypeId: form.productTypeId || null,
        status: form.status,
        customerTypeId: form.customerTypeId || null,
        categoryId: form.categoryId || null,
        subCategoryId: form.subCategoryId || null,
        brandId: form.brandId || null,
        barcode: form.barcode || null,
        purchasePrice: parseFloat(form.purchasePrice) || 0,
        mrp: parseFloat(form.mrp) || 0,
        discountPercent: parseFloat(form.discountPercent) || 0,
        unit: form.unit,
        measurement: form.measurement,
        taxPercent: isNaN(parseFloat(form.taxPercent)) ? 18 : parseFloat(form.taxPercent),
        variantType: form.variantType,
        minOrderQty: parseInt(form.minOrderQty) || 1,
        maxOrderQty: parseInt(form.maxOrderQty) || 0,
        initialStock: parseInt(form.initialStock) || 0,
        customSku: form.customSku || null,
        preGst: parseFloat(form.preGst) || 0,
        image: images[0] || null,
        images: images,
        rolePrices: rolePricing,
      };

      if (editProduct) {
        console.log("editProduct: ", payload);
        await api.put(`/products/${editProduct.id}`, payload);
        toast.success("Product updated successfully");
      } else {
        console.log("addProduct: ", payload);
        await api.post("/products", payload);
        toast.success("Product created successfully");
      }
      onCreated?.();
      onOpenChange(false);
    } catch (err) {
      const msg = err.details?.length
        ? `${err.message}: ${err.details.map((d) => d.field).join(", ")}`
        : err.message || "Failed to create product";
      toast.error(msg);
    } finally {
      setCreating(false);
    }
  }

  function handleDiscard() {
    setForm(INITIAL_FORM);
    setImages([]);
    setRolePricing([]);
    setActiveSection("general");
    onOpenChange(false);
  }

  return (
    <Dialog controlledOpen={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[96vw] max-w-7xl h-[96vh] md:h-[auto] md:max-h-[96vh] p-0 gap-0 overflow-hidden rounded-lg grid-rows-[auto_1fr]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-surface shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={handleDiscard}
              className="text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-muted transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h2 className="text-lg font-semibold text-foreground">
              {editProduct ? "Edit Product" : "Add New Product"}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleDiscard}
              className="text-sm font-medium text-muted-foreground px-4 py-2 rounded-lg hover:bg-muted transition-colors"
            >
              Discard
            </button>
            <button
              type="button"
              onClick={handleCreate}
              disabled={creating}
              className="bg-primary text-primary-foreground text-sm font-medium px-5 py-2 rounded-lg shadow-sm hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {creating ? "Saving..." : "Save Product"}
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex flex-1 overflow-hidden min-h-0">
          {/* Side Navigation */}
          <div className="w-[200px] bg-muted/30 border-r border-border flex flex-col py-4 shrink-0 hidden sm:flex">
            {(isStandard ? SECTIONS : SECTIONS.filter(s => s.id === "general")).map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => scrollToSection(section.id)}
                  className={`flex items-center gap-3 px-4 py-3 text-left transition-colors ${isActive
                    ? "bg-card text-foreground border-l-4 border-primary font-medium"
                    : "text-muted-foreground hover:bg-muted border-l-4 border-transparent"
                    }`}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span className="text-[13px] font-medium">{section.label}</span>
                </button>
              );
            })}
          </div>

          {/* Form Content Area - All sections scrollable */}
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto p-6 bg-surface-bright"
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleCreate();
              }}
              className="space-y-8 max-w-full"
            >
              {/* Section: General Info */}
              <section ref={(el) => (sectionRefs.current.general = el)}>
                <h3 className="text-base font-semibold text-foreground mb-4 pb-2 border-b border-border flex items-center gap-2">
                  <Info className="h-4 w-4 text-muted-foreground" /> General Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                  {/* Product Type */}
                  <div>
                    <div className="flex justify-between items-end mb-1.5">
                      <Label className="text-sm font-medium text-foreground">
                        Product Type <span className="text-destructive">*</span>
                      </Label>
                    </div>
                    <DropdownWithCreate
                      label="Product Type"
                      value={form.productTypeId}
                      onChange={(val) => updateField("productTypeId", val)}
                      options={productTypes
                        .filter(pt => ["cosmetic", "cosmetics", "cutlery", "jewellery", "jewelry"].includes(pt.name?.toLowerCase()))
                        .map((pt) => ({ id: pt.id, name: pt.name }))}
                      placeholder="Select Type..."
                      createMutation={createProductType}
                      createFields={[{ name: "name", label: "Type Name", type: "text", required: true }]}
                    />
                    <p className="text-[11px] text-muted-foreground mt-1.5">
                      Select Cosmetics, Jewellery, or Cutlery to display specific forms.
                    </p>
                  </div>
                  {/* Product Name */}
                  {(isStandard || isJewelry) && (
                    <div>
                      <Label className="text-sm font-medium text-foreground mb-1.5 block">
                        {isJewelry ? "Actual Product Name" : "Product Name"} <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        value={form.name}
                        onChange={(e) => updateField("name", e.target.value)}
                        placeholder={isJewelry ? "Actual Product Name" : "e.g. 24k Gold Necklace"}
                        className="mt-1"
                        required
                      />
                    </div>
                  )}

                  {isStandard && (
                    <>
                      {/* Customer Type */}
                      <div>
                        <div className="flex justify-between items-end mb-1.5">
                          <Label className="text-sm font-medium text-foreground">Customer Type</Label>
                        </div>
                        <DropdownWithCreate
                          label="Customer Type"
                          value={form.customerTypeId}
                          onChange={(val) => updateField("customerTypeId", val)}
                          options={customerTypes.map((ct) => ({ id: ct.id, name: ct.name }))}
                          placeholder="Select Type..."
                          createMutation={createCustomerType}
                          createFields={[{ name: "name", label: "Type Name", type: "text", required: true }]}
                        />
                      </div>
                      {/* Category */}
                      <div>
                        <div className="flex justify-between items-end mb-1.5">
                          <Label className="text-sm font-medium text-foreground">
                            Category <span className="text-destructive">*</span>
                          </Label>
                        </div>
                        <DropdownWithCreate
                          label="Category"
                          value={form.categoryId}
                          onChange={(val) => updateField("categoryId", val)}
                          options={rootCategories}
                          placeholder="Select Category..."
                          createMutation={createCategory}
                          createFields={[{ name: "name", label: "Category Name", type: "text", required: true }]}
                        />
                      </div>
                      {/* Sub Category */}
                      <div>
                        <div className="flex justify-between items-end mb-1.5">
                          <Label className="text-sm font-medium text-foreground">Sub Category</Label>
                        </div>
                        <div className="flex gap-2 mt-1 items-center">
                          <div className="flex-1">
                            <Select
                              value={form.subCategoryId}
                              onValueChange={(val) => updateField("subCategoryId", val)}
                              disabled={!form.categoryId}
                            >
                              <SelectTrigger>
                                <SelectValue
                                  placeholder={form.categoryId ? "Select Sub Category..." : "Select Category first..."}
                                />
                              </SelectTrigger>
                              <SelectContent>
                                {subCategories.map((sc) => (
                                  <SelectItem key={sc.id} value={sc.id}>
                                    {sc.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSubCatCreateOpen(true)}
                            disabled={!form.categoryId}
                            aria-label="Create new sub category"
                            className="inline-flex items-center justify-center h-9 w-9 rounded-md border border-input bg-background text-sm font-medium hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50 shrink-0"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Inline Sub Category Create - Portal Modal */}
                        {subCatCreateOpen && createPortal(
                          <div className="fixed inset-0 z-[100] flex items-center justify-center">
                            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSubCatCreateOpen(false)} />
                            <div className="relative z-10 bg-card rounded-lg shadow-xl w-full max-w-sm mx-4 p-6 border">
                              <h3 className="text-lg font-semibold mb-4">Create New Sub Category</h3>
                              <div className="py-2">
                                <Label className="text-sm font-medium">
                                  Sub Category Name <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                  value={subCatName}
                                  onChange={(e) => setSubCatName(e.target.value)}
                                  placeholder="Enter sub category name"
                                  className="mt-1.5"
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      e.preventDefault();
                                      handleCreateSubCategory();
                                    }
                                  }}
                                />
                              </div>
                              <div className="flex justify-end gap-2 mt-4">
                                <button
                                  type="button"
                                  onClick={() => setSubCatCreateOpen(false)}
                                  className="inline-flex items-center justify-center rounded-lg text-sm font-bold border border-outline-variant bg-transparent px-4 py-2 hover:bg-muted transition-colors"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  onClick={handleCreateSubCategory}
                                  disabled={creatingSubCat}
                                  className="inline-flex items-center justify-center rounded-lg text-sm font-bold bg-primary text-primary-foreground px-4 py-2 hover:opacity-90 transition-opacity disabled:opacity-50"
                                >
                                  {creatingSubCat ? "Creating..." : "Create"}
                                </button>
                              </div>
                            </div>
                          </div>,
                          document.body
                        )}
                      </div>
                      {/* Brand */}
                      <div>
                        <div className="flex justify-between items-end mb-1.5">
                          <Label className="text-sm font-medium text-foreground">Brand</Label>
                        </div>
                        <DropdownWithCreate
                          label="Brand"
                          value={form.brandId}
                          onChange={(val) => updateField("brandId", val)}
                          options={brands.map((b) => ({ id: b.id, name: b.name }))}
                          placeholder="Select Brand..."
                          createMutation={createBrand}
                          createFields={[{ name: "name", label: "Brand Name", type: "text", required: true }]}
                        />
                      </div>
                    </>
                  )}

                  {isJewelry && (
                    <>
                      {/* Category */}
                      <div className="col-span-full">
                        <div className="flex justify-between items-end mb-1.5">
                          <Label className="text-sm font-medium text-foreground">
                            Category <span className="text-destructive">*</span>
                          </Label>
                        </div>
                        <DropdownWithCreate
                          label="Category"
                          value={form.categoryId}
                          onChange={(val) => updateField("categoryId", val)}
                          options={rootCategories}
                          placeholder="Select Category..."
                          createMutation={createCategory}
                          createFields={[{ name: "name", label: "Category Name", type: "text", required: true }]}
                        />
                      </div>
                      {/* Barcode */}
                      <div className="md:col-span-1">
                        <Label className="text-sm font-medium text-foreground mb-1.5 block">Barcode (12-Digit Numeric)</Label>
                        <BarcodeGenerator
                          value={form.barcode}
                          onChange={(val) => updateField("barcode", val)}
                          variant="EAN13"
                        />
                      </div>
                      {/* Min Stock */}
                      <div className="md:col-span-1">
                        <Label className="text-sm font-medium text-foreground mb-1.5 block">Min Stock (Remainder Limit)</Label>
                        <Input
                          type="number"
                          min="0"
                          value={form.minOrderQty}
                          onChange={(e) => updateField("minOrderQty", e.target.value)}
                          placeholder="0"
                          className="mt-1"
                        />
                      </div>
                      {/* Image */}
                      <div className="col-span-full">
                        <Label className="text-sm font-medium text-foreground mb-1.5 block">Display Jewellery (Image) <span className="text-destructive">*</span></Label>
                        <ImageUploader
                          value={images}
                          onChange={setImages}
                          purpose="product"
                          multiple={false}
                          maxFiles={1}
                        />
                      </div>
                    </>
                  )}
                </div>
              </section>

              {isStandard && (
                <>
                  {/* Section: Inventory */}
                  <section ref={(el) => (sectionRefs.current.inventory = el)}>
                    <h3 className="text-base font-semibold text-foreground mb-4 pb-2 border-b border-border flex items-center gap-2">
                      <Package className="h-4 w-4 text-muted-foreground" /> Inventory Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-5">
                      {/* Custom SKU */}
                      <div className="md:col-span-2">
                        <Label className="text-sm font-medium text-foreground mb-1.5 block">Custom SKU</Label>
                        <div className="flex mt-1">
                          <Input
                            value={form.customSku}
                            onChange={(e) => updateField("customSku", e.target.value)}
                            placeholder="Auto/Manual"
                            className="rounded-r-none border-r-0"
                          />
                          <button
                            type="button"
                            className="bg-muted border border-border border-l-0 rounded-r-lg px-3 flex items-center justify-center text-muted-foreground hover:bg-muted/80 transition-colors"
                            title="Auto-generate"
                          >
                            <span className="material-symbols-outlined text-[18px]">autorenew</span>
                          </button>
                        </div>
                      </div>
                      {/* Initial Stock */}
                      <div>
                        <Label className="text-sm font-medium text-foreground mb-1.5 block">Initial Stock</Label>
                        <Input
                          type="number"
                          min="0"
                          value={form.initialStock}
                          onChange={(e) => updateField("initialStock", e.target.value)}
                          placeholder="0"
                          className="mt-1 text-right"
                        />
                      </div>
                      {/* Barcode */}
                      <div className="md:col-span-2">
                        <Label className="text-sm font-medium text-foreground mb-1.5 block">Barcode Serial Number</Label>
                        <BarcodeGenerator
                          value={form.barcode}
                          onChange={(val) => updateField("barcode", val)}
                          variant="EAN13"
                        />
                      </div>
                      {/* Unit */}
                      <div>
                        <Label className="text-sm font-medium text-foreground mb-1.5 block">Unit</Label>
                        <Select value={form.unit} onValueChange={(val) => updateField("unit", val)}>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Pcs" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Pcs">Pcs</SelectItem>
                            <SelectItem value="Kg">Kg</SelectItem>
                            <SelectItem value="Gm">Gm</SelectItem>
                            <SelectItem value="Litre">Litre</SelectItem>
                            <SelectItem value="Box">Box</SelectItem>
                            <SelectItem value="Pack">Pack</SelectItem>
                            <SelectItem value="Pair">Pair</SelectItem>
                            <SelectItem value="Set">Set</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {/* Measurement */}
                      <div>
                        <Label className="text-sm font-medium text-foreground mb-1.5 block">Measurement</Label>
                        <Input
                          value={form.measurement}
                          onChange={(e) => updateField("measurement", e.target.value)}
                          placeholder="e.g. 10g"
                          className="mt-1"
                        />
                      </div>
                      {/* Min Order Qty */}
                      <div>
                        <Label className="text-sm font-medium text-foreground mb-1.5 block">Min Order Qty</Label>
                        <Input
                          type="number"
                          min="1"
                          value={form.minOrderQty}
                          onChange={(e) => updateField("minOrderQty", e.target.value)}
                          placeholder="1"
                          className="mt-1 text-right"
                        />
                      </div>
                      {/* Max Order Qty */}
                      <div>
                        <Label className="text-sm font-medium text-foreground mb-1.5 block">Max Order Qty</Label>
                        <Input
                          type="number"
                          min="0"
                          value={form.maxOrderQty}
                          onChange={(e) => updateField("maxOrderQty", e.target.value)}
                          placeholder="Unlimited"
                          className="mt-1 text-right placeholder:text-muted-foreground"
                        />
                      </div>
                    </div>
                  </section>

                  {/* Section: Base Pricing */}
                  <section ref={(el) => (sectionRefs.current.pricing = el)}>
                    <h3 className="text-base font-semibold text-foreground mb-4 pb-2 border-b border-border flex items-center gap-2">
                      <IndianRupee className="h-4 w-4 text-muted-foreground" /> Base Pricing
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-x-4 gap-y-5">
                      <div>
                        <Label className="text-sm font-medium text-foreground mb-1.5 block">
                          MRP <span className="text-destructive">*</span>
                        </Label>
                        <div className="relative mt-1">
                          <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">₹</span>
                          <Input
                            type="number"
                            step="0.01"
                            value={form.mrp}
                            onChange={(e) => updateField("mrp", e.target.value)}
                            placeholder="0.00"
                            className="pl-7 text-right"
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-foreground mb-1.5 block">Tax (%)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={parseFloat(form.taxPercent) || ""}
                          onChange={(e) => updateField("taxPercent", e.target.value)}
                          placeholder="18"
                          className="mt-1 text-right"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-foreground mb-1.5 block">Discount (%)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          value={form.discountPercent}
                          onChange={(e) => updateField("discountPercent", e.target.value)}
                          placeholder="0.00"
                          className="mt-1 text-right"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-foreground mb-1.5 block">
                          Cost Price (Pre GST) <span className="text-destructive">*</span>
                        </Label>
                        <div className="relative mt-1">
                          <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">₹</span>
                          <Input
                            type="number"
                            step="0.01"
                            value={form.preGst}
                            onChange={(e) => {
                              updateField("preGst", e.target.value);
                              const cost = parseFloat(e.target.value) || 0;
                              let gst = typeof form.taxPercent === 'string' ? parseFloat(form.taxPercent.replace('%', '')) : parseFloat(form.taxPercent);
                              gst = gst || 0;
                              const purchase = cost * (1 + gst / 100);
                              updateField("purchasePrice", purchase.toFixed(2));
                            }}
                            placeholder="0.00"
                            className="pl-7 text-right"
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-foreground mb-1.5 block">
                          Purchase Price (incl. GST)
                        </Label>
                        <div className="relative mt-1">
                          <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">₹</span>
                          <Input
                            type="number"
                            step="0.01"
                            value={form.purchasePrice}
                            onChange={(e) => {
                              updateField("purchasePrice", e.target.value);
                              const purchase = parseFloat(e.target.value) || 0;
                              let gst = typeof form.taxPercent === 'string' ? parseFloat(form.taxPercent.replace('%', '')) : parseFloat(form.taxPercent);
                              gst = gst || 0;
                              const cost = purchase / (1 + gst / 100);
                              updateField("preGst", cost.toFixed(2));
                            }}
                            placeholder="0.00"
                            className="pl-7 text-right"
                          />
                        </div>
                      </div>

                    </div>
                  </section>



                  {/* Section: Media */}
                  <section ref={(el) => (sectionRefs.current.media = el)}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="lg:col-span-2">
                        <Label className="text-sm font-medium text-foreground mb-1.5 block">Product Description</Label>
                        <textarea
                          value={form.description}
                          onChange={(e) => updateField("description", e.target.value)}
                          placeholder="Enter detailed product description..."
                          className="w-full h-24 px-3 py-2 rounded-lg border border-input bg-background text-sm mt-1 resize-none focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground"
                          maxLength={1000}
                        />
                        <p className="text-[11px] text-muted-foreground text-right mt-1">
                          {form.description.length} / 1000 characters
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-foreground mb-1.5 block">Product Image</Label>
                        <ImageUploader
                          value={images}
                          onChange={setImages}
                          purpose="product"
                          multiple
                          maxFiles={5}
                        />
                      </div>
                    </div>
                  </section>
                </>
              )}

              {/* Section: Role-Based Pricing */}
              <section>
                <div className="bg-card rounded-lg border border-border overflow-hidden">
                  <div className="bg-muted/50 px-4 py-3 border-b border-border">
                    <h3 className="text-sm font-semibold text-primary">Role-Based Pricing & Visibility</h3>
                  </div>
                  <div className="p-0">
                    <RolePricingEditor
                      initial={rolePricing}
                      onChange={setRolePricing}
                      roles={[
                        "Dealer",
                        "Wholesaler",
                        "Parlour",
                        "Retailer",
                        "General"
                      ]}
                      inline
                    />
                  </div>
                </div>
              </section>

              {/* Bottom spacer */}
              <div className="h-8" />
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
