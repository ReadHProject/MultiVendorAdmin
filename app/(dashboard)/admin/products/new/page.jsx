"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useCreateProductMutation } from "@/store/api/slices/productsApi";
import { useGetCustomerTypesQuery, useCreateCustomerTypeMutation } from "@/store/api/slices/customerTypesApi";
import { useGetProductTypesQuery, useCreateProductTypeMutation } from "@/store/api/slices/productTypesApi";
import { useGetCategoriesQuery, useCreateCategoryMutation } from "@/store/api/slices/categoriesApi";
import { useGetBrandsQuery, useCreateBrandMutation } from "@/store/api/slices/brandsApi";
import { useGetRolesQuery } from "@/store/api/slices/rolesApi";
import { toast } from "sonner";
import { ArrowLeft, Save, Loader2, Plus } from "lucide-react";
import { DropdownWithCreate } from "@/components/admin/dropdown-with-create";
import { BarcodeGenerator } from "@/components/admin/barcode-generator";
import { RolePricingEditor } from "@/components/admin/role-pricing-editor";
import { ImageUploader } from "@/components/admin/image-uploader";
import { MobilePageLayout, MobileHeader, MobileTabs, MobileFooter } from "@/components/admin/mobile/mobile-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

const TAX_OPTIONS = ["0%", "5%", "12%", "18%", "28%"];
const VARIANT_TYPES = ["Simple Product", "Variable Product"];

export default function ProductNewPage() {
  const router = useRouter();
  const [createProduct, { isLoading: saving }] = useCreateProductMutation();

  // Fetch dropdown data
  const { data: customerTypesData } = useGetCustomerTypesQuery();
  const { data: productTypesData } = useGetProductTypesQuery();
  const { data: categoriesData } = useGetCategoriesQuery();
  const { data: brandsData } = useGetBrandsQuery();
  const { data: rolesData } = useGetRolesQuery();

  const [createCustomerType] = useCreateCustomerTypeMutation();
  const [createProductType] = useCreateProductTypeMutation();
  const [createCategory] = useCreateCategoryMutation();
  const [createBrand] = useCreateBrandMutation();

  // Subcategory dialog state
  const [subCatOpen, setSubCatOpen] = useState(false);
  const [subCatName, setSubCatName] = useState("");
  const [creatingSubCat, setCreatingSubCat] = useState(false);
  const [mobileTab, setMobileTab] = useState("general");

  // Form state
  const [form, setForm] = useState({
    name: "",
    description: "",
    type: "SIMPLE",
    status: "ACTIVE",
    productTypeId: "",
    customerTypeId: "",
    categoryId: "",
    subCategoryId: "",
    brandId: "",
    barcode: "",
    purchasePrice: "",
    mrp: "",
    discountPercent: "",
    unit: "",
    measurement: "",
    taxPercent: "18%",
    variantType: "Simple Product",
    minOrderQty: "1",
    maxOrderQty: "",
    initialStock: "0",
    customSku: "",
    preGst: "",
  });

  const [rolePricing, setRolePricing] = useState([]);
  const [images, setImages] = useState([]);

  // Process dropdown data
  const customerTypes = customerTypesData?.data || customerTypesData || [];
  const categories = categoriesData?.data || categoriesData || [];
  const brands = brandsData?.data || brandsData || [];
  const roles =
    rolesData?.data?.map((r) => r.name) || [
      "Wholesaler",
      "Dealer",
      "Retailer",
      "Parlour",
      "General",
    ];

  // Get flat categories for dropdown
  const flatCategories = Array.isArray(categories)
    ? categories.reduce((acc, cat) => {
        acc.push({ id: cat.id, name: cat.name });
        if (cat.children) {
          cat.children.forEach((child) =>
            acc.push({ id: child.id, name: child.name })
          );
        }
        return acc;
      }, [])
    : [];

  // Get subcategories based on selected parent category
  const subCategories = Array.isArray(categories)
    ? categories
        .filter((c) => c.parentId === form.categoryId)
        .map((c) => ({ id: c.id, name: c.name }))
    : [];

  const selectedProductTypeName = (productTypesData?.data || productTypesData || [])
    .find((pt) => pt.id === form.productTypeId)?.name?.toLowerCase();
    
  const isJewelry = selectedProductTypeName === "jewelry" || selectedProductTypeName === "jewellery";
  const isStandard = selectedProductTypeName === "cosmetics" || selectedProductTypeName === "cutlery";

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

  const handleCreateSubCategory = useCallback(
    async (e) => {
      e.preventDefault();
      if (!subCatName.trim() || !form.categoryId) {
        toast.error("Please fill in the sub category name");
        return;
      }
      setCreatingSubCat(true);
      try {
        const result = await createCategory({
          name: subCatName,
          parentId: form.categoryId,
        }).unwrap();
        toast.success("Sub category created");
        updateField("subCategoryId", result.id);
        setSubCatOpen(false);
        setSubCatName("");
      } catch (err) {
        toast.error(err?.data?.error?.message || "Failed to create sub category");
      } finally {
        setCreatingSubCat(false);
      }
    },
    [subCatName, form.categoryId, createCategory]
  );

  async function handleSave() {
    if (!form.name.trim()) {
      toast.error("Product name is required");
      return;
    }

    try {
      const payload = {
        name: form.name,
        description: form.description,
        type: form.type,
        status: form.status,
        productTypeId: form.productTypeId || null,
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
        taxPercent: parseFloat(form.taxPercent) || 18,
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

      await createProduct(payload).unwrap();
      toast.success("Product created successfully");
      router.push("/admin/products");
    } catch (err) {
      toast.error(err?.data?.error?.message || "Failed to create product");
    }
  }

  return (
    <>
    <div className="max-w-6xl space-y-6 hidden md:block">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-8 h-8 rounded-md border border-border flex items-center justify-center hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h1 className="text-lg font-black">Add Product</h1>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => router.back()}>
            Discard
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-destructive hover:bg-destructive/90 text-white"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {saving ? "Saving..." : "Save Product"}
          </Button>
        </div>
      </div>

      {/* Main Form Card */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Row 1: Product Type & Customer Type */}
            <div className="md:col-span-2">
              <DropdownWithCreate
                label="Product Type"
                value={form.productTypeId}
                onChange={(val) => updateField("productTypeId", val)}
                options={(productTypesData?.data || productTypesData || []).map((pt) => ({ id: pt.id, name: pt.name }))}
                placeholder="Select Type..."
                createMutation={createProductType}
                createLabel="Name"
                createFields={[
                  { name: "name", label: "Type Name", type: "text", required: true },
                ]}
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                Select Cosmetics, Jewellery, or Cutlery to display the specific
                form.
              </p>
            </div>
            
            {isStandard && (
              <>


            {/* Row 2: Category, Sub Category, Brand */}
            <div>
              <DropdownWithCreate
                label="Category *"
                value={form.categoryId}
                onChange={(val) => updateField("categoryId", val)}
                options={flatCategories}
                placeholder="Select Category..."
                createMutation={createCategory}
                createLabel="Name"
                createFields={[
                  { name: "name", label: "Category Name", type: "text", required: true },
                ]}
              />
            </div>

            <div>
              <Label className="text-[10px] font-black uppercase text-muted-foreground">
                Sub Category
              </Label>
              <div className="flex gap-2 mt-1">
                <Select
                  value={form.subCategoryId}
                  onValueChange={(val) => updateField("subCategoryId", val)}
                  className="flex-1"
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Sub Category..." />
                  </SelectTrigger>
                  <SelectContent>
                    {subCategories.map((sc) => (
                      <SelectItem key={sc.id} value={sc.id}>
                        {sc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Dialog open={subCatOpen} onOpenChange={setSubCatOpen}>
                  <DialogTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      aria-label="Create Sub Category"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Sub Category</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateSubCategory}>
                      <div className="grid gap-4 py-4">
                        <div className="space-y-1.5">
                          <Label>Parent Category *</Label>
                          <Select value={form.categoryId} disabled>
                            <SelectTrigger>
                              <SelectValue placeholder="Selected Category" />
                            </SelectTrigger>
                            <SelectContent>
                              {flatCategories.map((c) => (
                                <SelectItem key={c.id} value={c.id}>
                                  {c.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5">
                          <Label>
                            Sub Category Name <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            value={subCatName}
                            onChange={(e) => setSubCatName(e.target.value)}
                            placeholder="Enter sub category name"
                            required
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button type="button" variant="secondary">
                            Cancel
                          </Button>
                        </DialogClose>
                        <Button type="submit" disabled={creatingSubCat}>
                          {creatingSubCat ? "Creating..." : "Create"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <div>
              <DropdownWithCreate
                label="Brand"
                value={form.brandId}
                onChange={(val) => updateField("brandId", val)}
                options={brands.map((b) => ({ id: b.id, name: b.name }))}
                placeholder="Select Brand..."
                createMutation={createBrand}
                createLabel="Name"
                createFields={[
                  { name: "name", label: "Brand Name", type: "text", required: true },
                ]}
              />
            </div>

            {/* Row 3: Product Name, Barcode, Min Stock */}
            <div className="md:col-span-2">
              <Label className="text-[10px] font-black uppercase text-muted-foreground">
                Product Name <span className="text-destructive">*</span>
              </Label>
              <Input
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="Cosmetics Item Name"
                className="mt-1"
                autoFocus
                required
              />
            </div>
            <div>
              <Label className="text-[10px] font-black uppercase text-muted-foreground">
                Barcode (12-Digit Numeric)
              </Label>
              <BarcodeGenerator
                value={form.barcode}
                onChange={(val) => updateField("barcode", val)}
                variant="EAN13"
              />
            </div>
            <div>
              <Label className="text-[10px] font-black uppercase text-muted-foreground">
                Min Stock (Remainder Limit)
              </Label>
              <Input
                type="number"
                min="0"
                value={form.minOrderQty}
                onChange={(e) => updateField("minOrderQty", e.target.value)}
                placeholder="0"
                className="mt-1"
              />
            </div>

            {/* Row 4: MRP, GST Rate, Discount, Cost Price, Purchase Price, Max Stock */}
            <div className="md:col-span-4 grid grid-cols-2 md:grid-cols-6 gap-6">
              <div>
                <Label className="text-[10px] font-black uppercase text-muted-foreground">
                  MRP (Piece) <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.mrp}
                  onChange={(e) => updateField("mrp", e.target.value)}
                  placeholder="0.00"
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label className="text-[10px] font-black uppercase text-muted-foreground">
                  GST Rate (%)
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  value={parseFloat(form.taxPercent) || ""}
                  onChange={(e) => updateField("taxPercent", e.target.value)}
                  placeholder="18"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-[10px] font-black uppercase text-muted-foreground">
                  Discount (%)
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={form.discountPercent}
                  onChange={(e) => updateField("discountPercent", e.target.value)}
                  placeholder="0"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-[10px] font-black uppercase text-muted-foreground">
                  Cost Price (Pre GST) <span className="text-destructive">*</span>
                </Label>
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
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label className="text-[10px] font-black uppercase text-muted-foreground">
                  Purchase Price (incl. GST)
                </Label>
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
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-[10px] font-black uppercase text-muted-foreground">
                  Max Stock (Initial Supply)
                </Label>
                <Input
                  type="number"
                  min="0"
                  value={form.initialStock}
                  onChange={(e) => updateField("initialStock", e.target.value)}
                  placeholder="0"
                  className="mt-1"
                />
              </div>
            </div>

            {/* Row 5: Product Image, Product Description */}
            <div className="md:col-span-1">
              <Label className="text-[10px] font-black uppercase text-muted-foreground text-left block mb-1.5">
                Product Image
              </Label>
              <ImageUploader
                value={images}
                onChange={setImages}
                purpose="product"
                multiple={false}
                maxFiles={1}
              />
            </div>
            <div className="md:col-span-3">
              <Label className="text-[10px] font-black uppercase text-muted-foreground">
                Product Description
              </Label>
              <textarea
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
                placeholder="Enter detailed product description..."
                className="w-full h-32 px-3 py-2 rounded-md border border-input bg-background text-sm mt-1 resize-none"
                maxLength={1000}
              />
              <p className="text-xs text-muted-foreground text-right mt-1">
                {form.description.length} / 1000 characters
              </p>
            </div>
            </>
            )}

            {isJewelry && (
              <>
                <div className="md:col-span-2">
                  <DropdownWithCreate
                    label="Category *"
                    value={form.categoryId}
                    onChange={(val) => updateField("categoryId", val)}
                    options={flatCategories}
                    placeholder="Select Category..."
                    createMutation={createCategory}
                    createLabel="Name"
                    createFields={[
                      { name: "name", label: "Category Name", type: "text", required: true },
                    ]}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label className="text-[10px] font-black uppercase text-muted-foreground">
                    Actual Product Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    value={form.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    placeholder="Actual Product Name"
                    className="mt-1"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <Label className="text-[10px] font-black uppercase text-muted-foreground">
                    Barcode (12-Digit Numeric)
                  </Label>
                  <BarcodeGenerator
                    value={form.barcode}
                    onChange={(val) => updateField("barcode", val)}
                    variant="EAN13"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label className="text-[10px] font-black uppercase text-muted-foreground">
                    Min Stock (Remainder Limit)
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    value={form.minOrderQty}
                    onChange={(e) => updateField("minOrderQty", e.target.value)}
                    placeholder="0"
                    className="mt-1"
                  />
                </div>
                <div className="md:col-span-4 flex flex-col items-start">
                  <Label className="text-[10px] font-black uppercase text-muted-foreground mb-2">
                    Display Jewellery (Image) <span className="text-destructive">*</span>
                  </Label>
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
        </CardContent>
      </Card>

      {/* Role-Based Pricing & Visibility */}
      {isStandard && (
      <Card>
        <CardHeader>
          <CardTitle>Role-Based Pricing & Visibility</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3 text-xs font-semibold text-muted-foreground border-b pb-2">
              <div>Consumer Role</div>
              <div>Selling Price</div>
              <div>Min Qty</div>
              <div>Commission (%)</div>
              <div>Discount (%)</div>
              <div>Visible</div>
            </div>
            {roles.map((role) => {
              const existing = rolePricing.find((r) => r.role === role);
              const idx = rolePricing.findIndex((r) => r.role === role);
              return (
                <div
                  key={role}
                  className="grid grid-cols-2 md:grid-cols-6 gap-3 items-center border-b pb-3"
                >
                  <div className="font-medium text-sm">{role}</div>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Selling Price"
                    value={existing?.price || ""}
                    onChange={(e) => {
                      const updated = [...rolePricing];
                      if (idx === -1) {
                        updated.push({
                          role,
                          price: Number(e.target.value),
                          mrp: 0,
                          discountPercent: 0,
                          minQty: 1,
                          commissionPercent: 0,
                          visible: true,
                        });
                      } else {
                        updated[idx] = { ...updated[idx], price: Number(e.target.value) };
                      }
                      setRolePricing(updated);
                    }}
                  />
                  <Input
                    type="number"
                    min="1"
                    placeholder="Min Qty"
                    value={existing?.minQty || "1"}
                    onChange={(e) => {
                      const updated = [...rolePricing];
                      if (idx === -1) {
                        updated.push({
                          role,
                          price: 0,
                          mrp: 0,
                          discountPercent: 0,
                          minQty: Number(e.target.value),
                          commissionPercent: 0,
                          visible: true,
                        });
                      } else {
                        updated[idx] = { ...updated[idx], minQty: Number(e.target.value) };
                      }
                      setRolePricing(updated);
                    }}
                  />
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    placeholder="Commission (%)"
                    value={existing?.commissionPercent || ""}
                    onChange={(e) => {
                      const updated = [...rolePricing];
                      if (idx === -1) {
                        updated.push({
                          role,
                          price: 0,
                          mrp: 0,
                          discountPercent: 0,
                          minQty: 1,
                          commissionPercent: Number(e.target.value),
                          visible: true,
                        });
                      } else {
                        updated[idx] = {
                          ...updated[idx],
                          commissionPercent: Number(e.target.value),
                        };
                      }
                      setRolePricing(updated);
                    }}
                  />
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    placeholder="Discount (%)"
                    value={existing?.discountPercent || ""}
                    onChange={(e) => {
                      const updated = [...rolePricing];
                      if (idx === -1) {
                        updated.push({
                          role,
                          price: 0,
                          mrp: 0,
                          discountPercent: Number(e.target.value),
                          minQty: 1,
                          commissionPercent: 0,
                          visible: true,
                        });
                      } else {
                        updated[idx] = {
                          ...updated[idx],
                          discountPercent: Number(e.target.value),
                        };
                      }
                      setRolePricing(updated);
                    }}
                  />
                  <div className="flex justify-center">
                    <input
                      type="checkbox"
                      checked={existing?.visible !== false}
                      onChange={(e) => {
                        const updated = [...rolePricing];
                        if (idx === -1) {
                          updated.push({
                            role,
                            price: 0,
                            mrp: 0,
                            discountPercent: 0,
                            minQty: 1,
                            commissionPercent: 0,
                            visible: e.target.checked,
                          });
                        } else {
                          updated[idx] = {
                            ...updated[idx],
                            visible: e.target.checked,
                          };
                        }
                        setRolePricing(updated);
                      }}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
      )}
    </div>

    {/* Mobile UI */}
    <MobilePageLayout>
      <MobileHeader 
        title="Add New Product"
        onSave={handleSave}
        saving={saving}
        onDiscard={() => router.back()}
      />
      {isStandard && (
        <MobileTabs 
          tabs={[
            { id: "general", label: "General Info" },
            { id: "inventory", label: "Inventory" },
            { id: "pricing", label: "Pricing Rules" },
            { id: "media", label: "Media" }
          ]}
          activeTab={mobileTab}
          onChange={setMobileTab}
        />
      )}
      
      <main className="p-4 space-y-6">
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-custom">
          <DropdownWithCreate
            label="Product Type *"
            value={form.productTypeId}
            onChange={(val) => updateField("productTypeId", val)}
            options={(productTypesData?.data || productTypesData || []).map((pt) => ({ id: pt.id, name: pt.name }))}
            placeholder="Select Type..."
            createMutation={createProductType}
            createLabel="Name"
            createFields={[{ name: "name", label: "Type Name", type: "text", required: true }]}
          />
        </div>

        {isStandard && mobileTab === "general" && (
          <section className="space-y-4">
            <div>
              <Label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Product Name <span className="text-red-500">*</span></Label>
              <Input
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="PRODUCT NAME"
                className="w-full bg-slate-900 border-slate-800 rounded-custom focus:ring-accent focus:border-accent text-slate-200"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-3 rounded-custom">
                <DropdownWithCreate
                  label="Customer Type"
                  value={form.customerTypeId}
                  onChange={(val) => updateField("customerTypeId", val)}
                  options={customerTypes.map((ct) => ({ id: ct.id, name: ct.name }))}
                  placeholder="Select Type..."
                  createMutation={createCustomerType}
                  createLabel="Name"
                  createFields={[{ name: "name", label: "Type Name", type: "text", required: true }]}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-3 rounded-custom">
                <DropdownWithCreate
                  label="Category"
                  value={form.categoryId}
                  onChange={(val) => updateField("categoryId", val)}
                  options={flatCategories}
                  placeholder="Select Category..."
                  createMutation={createCategory}
                  createLabel="Name"
                  createFields={[{ name: "name", label: "Category Name", type: "text", required: true }]}
                />
              </div>
              
              <div className="bg-slate-900 border border-slate-800 p-3 rounded-custom">
                <Label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">
                  Sub Category
                </Label>
                <div className="flex gap-2">
                  <Select
                    value={form.subCategoryId}
                    onValueChange={(val) => updateField("subCategoryId", val)}
                  >
                    <SelectTrigger className="flex-1 bg-slate-950 border-slate-800 rounded-custom">
                      <SelectValue placeholder="Select Sub Category..." />
                    </SelectTrigger>
                    <SelectContent>
                      {subCategories.map((sc) => (
                        <SelectItem key={sc.id} value={sc.id}>{sc.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Dialog open={subCatOpen} onOpenChange={setSubCatOpen}>
                    <DialogTrigger asChild>
                      <Button type="button" variant="outline" size="icon" className="bg-slate-950 border-slate-800">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    {/* SubCat Dialog content same as desktop, rendered globally */}
                  </Dialog>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-3 rounded-custom">
                <DropdownWithCreate
                  label="Brand"
                  value={form.brandId}
                  onChange={(val) => updateField("brandId", val)}
                  options={brands.map((b) => ({ id: b.id, name: b.name }))}
                  placeholder="Select Brand..."
                  createMutation={createBrand}
                  createLabel="Name"
                  createFields={[{ name: "name", label: "Brand Name", type: "text", required: true }]}
                />
              </div>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-3 rounded-custom">
               <Label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">
                Variant Type
              </Label>
              <Select
                value={form.variantType}
                onValueChange={(val) => updateField("variantType", val)}
              >
                <SelectTrigger className="bg-slate-950 border-slate-800 rounded-custom">
                  <SelectValue placeholder="Simple Product" />
                </SelectTrigger>
                <SelectContent>
                  {VARIANT_TYPES.map((vt) => (
                    <SelectItem key={vt} value={vt}>{vt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </section>
        )}

        {isStandard && mobileTab === "inventory" && (
          <section className="space-y-4">
            <div className="flex flex-col gap-4">
              <div>
                <Label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Custom SKU</Label>
                <Input
                  value={form.customSku}
                  onChange={(e) => updateField("customSku", e.target.value)}
                  placeholder="Auto/Manual"
                  className="w-full bg-slate-900 border-slate-800 rounded-custom focus:ring-accent focus:border-accent text-slate-200"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Barcode Serial Number</Label>
                <BarcodeGenerator
                  value={form.barcode}
                  onChange={(val) => updateField("barcode", val)}
                  variant="EAN13"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Initial Stock</Label>
                <Input
                  type="number"
                  min="0"
                  value={form.initialStock}
                  onChange={(e) => updateField("initialStock", e.target.value)}
                  placeholder="0"
                  className="w-full bg-slate-900 border-slate-800 rounded-custom focus:ring-accent focus:border-accent text-slate-200"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Unit</Label>
                <Select value={form.unit} onValueChange={(val) => updateField("unit", val)}>
                  <SelectTrigger className="w-full bg-slate-900 border-slate-800 rounded-custom focus:ring-accent focus:border-accent text-slate-200">
                    <SelectValue placeholder="Pcs" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pcs">Pcs</SelectItem>
                    <SelectItem value="Kg">Kg</SelectItem>
                    <SelectItem value="Litre">Litre</SelectItem>
                    <SelectItem value="Box">Box</SelectItem>
                    <SelectItem value="Pack">Pack</SelectItem>
                    <SelectItem value="Pair">Pair</SelectItem>
                    <SelectItem value="Set">Set</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Measurement</Label>
                <Input
                  value={form.measurement}
                  onChange={(e) => updateField("measurement", e.target.value)}
                  placeholder="e.g. 10g"
                  className="w-full bg-slate-900 border-slate-800 rounded-custom focus:ring-accent focus:border-accent text-slate-200"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Min Order Qty</Label>
                <Input
                  type="number"
                  min="1"
                  value={form.minOrderQty}
                  onChange={(e) => updateField("minOrderQty", e.target.value)}
                  placeholder="1"
                  className="w-full bg-slate-900 border-slate-800 rounded-custom focus:ring-accent focus:border-accent text-slate-200"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Max Order Qty</Label>
                <Input
                  type="number"
                  min="0"
                  value={form.maxOrderQty}
                  onChange={(e) => updateField("maxOrderQty", e.target.value)}
                  placeholder="Unlimited"
                  className="w-full bg-slate-900 border-slate-800 rounded-custom focus:ring-accent focus:border-accent text-slate-200"
                />
              </div>
            </div>
          </section>
        )}

        {isStandard && mobileTab === "pricing" && (
          <section className="space-y-6">
            <div className="bg-slate-900/50 rounded-custom border border-slate-800 p-4 space-y-4">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <span className="text-accent">₹</span> Base Pricing
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Purchase Price *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={form.purchasePrice}
                    onChange={(e) => updateField("purchasePrice", e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-slate-900 border-slate-800 rounded-custom text-sm focus:ring-accent focus:border-accent text-slate-200"
                  />
                </div>
                <div>
                  <Label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1 block">MRP *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={form.mrp}
                    onChange={(e) => updateField("mrp", e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-slate-900 border-slate-800 rounded-custom text-sm focus:ring-accent focus:border-accent text-slate-200"
                  />
                </div>
                <div>
                  <Label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Discount (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={form.discountPercent}
                    onChange={(e) => updateField("discountPercent", e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-slate-900 border-slate-800 rounded-custom text-sm focus:ring-accent focus:border-accent text-slate-200"
                  />
                </div>
                <div>
                  <Label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Tax (%)</Label>
                  <Select
                    value={form.taxPercent}
                    onValueChange={(val) => updateField("taxPercent", val)}
                  >
                    <SelectTrigger className="w-full bg-slate-900 border-slate-800 rounded-custom text-sm focus:ring-accent focus:border-accent text-slate-200">
                      <SelectValue placeholder="18%" />
                    </SelectTrigger>
                    <SelectContent>
                      {TAX_OPTIONS.map((tax) => (
                        <SelectItem key={tax} value={tax}>{tax}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-400">Role-Based Pricing & Visibility</h3>
              <RolePricingEditor
                initial={rolePricing}
                onChange={setRolePricing}
                roles={roles}
                inline
              />
            </div>
          </section>
        )}

        {isStandard && mobileTab === "media" && (
          <section className="space-y-6">
            <div>
              <Label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Product Description</Label>
              <textarea
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
                placeholder="Enter detailed product description..."
                className="w-full bg-slate-900 border-slate-800 rounded-custom focus:ring-accent focus:border-accent text-slate-200 px-3 py-2 text-sm resize-none h-32"
                maxLength={1000}
              />
              <div className="text-[10px] text-slate-500 text-right mt-1">
                {form.description.length} / 1000 characters
              </div>
            </div>
            <div>
              <Label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 block">Product Images</Label>
              <div className="bg-slate-900 p-4 border border-slate-800 rounded-custom flex justify-center">
                <ImageUploader
                  value={images}
                  onChange={setImages}
                  purpose="product"
                  multiple
                  maxFiles={10}
                />
              </div>
            </div>
          </section>
        )}
        {isJewelry && (
          <section className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 p-3 rounded-custom">
              <DropdownWithCreate
                label="Category *"
                value={form.categoryId}
                onChange={(val) => updateField("categoryId", val)}
                options={flatCategories}
                placeholder="Select Category..."
                createMutation={createCategory}
                createLabel="Name"
                createFields={[{ name: "name", label: "Category Name", type: "text", required: true }]}
              />
            </div>
            <div>
              <Label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Actual Product Name <span className="text-red-500">*</span></Label>
              <Input
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="Actual Product Name"
                className="w-full bg-slate-900 border-slate-800 rounded-custom focus:ring-accent focus:border-accent text-slate-200"
                required
              />
            </div>
            <div>
              <Label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Barcode (12-Digit Numeric)</Label>
              <BarcodeGenerator
                value={form.barcode}
                onChange={(val) => updateField("barcode", val)}
                variant="EAN13"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Min Stock (Remainder Limit)</Label>
              <Input
                type="number"
                min="0"
                value={form.minOrderQty}
                onChange={(e) => updateField("minOrderQty", e.target.value)}
                placeholder="0"
                className="w-full bg-slate-900 border-slate-800 rounded-custom focus:ring-accent focus:border-accent text-slate-200"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 block">Display Jewellery (Image) <span className="text-red-500">*</span></Label>
              <div className="bg-slate-900 p-4 border border-slate-800 rounded-custom flex justify-center">
                <ImageUploader
                  value={images}
                  onChange={setImages}
                  purpose="product"
                  multiple={false}
                  maxFiles={1}
                />
              </div>
            </div>
          </section>
        )}
      </main>
      <MobileFooter />
    </MobilePageLayout>
    </>
  );
}