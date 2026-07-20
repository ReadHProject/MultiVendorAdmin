"use client";
import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { formatMoney } from "@/lib/utils";

const DEFAULT_ROLES = ["Dealer", "Wholesaler", "Parlour", "Retailer", "General"];

function buildRows(roles, initial) {
  const m = {};
  roles.forEach((role) => {
    const existing = initial.find((r) => {
      const rName = r.role?.name || r.role;
      return typeof rName === 'string' && rName.toUpperCase() === role.toUpperCase();
    });
    m[role] = existing || {
      role,
      price: 0,
      mrp: 0,
      discountPercent: 0,
      minQty: 1,
      commissionPercent: 0,
      visible: true,
    };
  });
  return m;
}

export function RolePricingEditor({ productId, initial = [], roles = DEFAULT_ROLES, onSaved, inline = false, onChange }) {
  const [rows, setRows] = useState(() => buildRows(roles, initial));
  const [saving, setSaving] = useState(null);
  const dirty = useRef(false);

  useEffect(() => {
    setRows(buildRows(roles, initial));
    dirty.current = false;
  }, [initial, roles]);

  useEffect(() => {
    if (dirty.current && inline && onChange) {
      const parsedRows = Object.values(rows).map(r => ({
        ...r,
        price: Number(r.price) || 0,
        mrp: Number(r.mrp) || 0,
        discountPercent: Number(r.discountPercent) || 0,
        minQty: Number(r.minQty) || 1,
        commissionPercent: Number(r.commissionPercent) || 0,
        visible: r.visible !== false
      }));
      onChange(parsedRows);
    }
  }, [rows, inline, onChange]);

  async function save(role) {
    const r = rows[role];
    if (!r) return;
    setSaving(role);
    try {
      const res = await fetch(`/api/products/${productId}/role-prices`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role,
          price: Number(r.price),
          mrp: Number(r.mrp),
          discountPercent: Number(r.discountPercent || 0),
          minQty: Number(r.minQty || 1),
          commissionPercent: Number(r.commissionPercent || 0),
          visible: r.visible !== false,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || "Save failed");
      toast.success(`Saved ${role}`);
      onSaved?.();
    } catch (e) {
      toast.error(e.message || "Save failed");
    } finally {
      setSaving(null);
    }
  }

  function updateField(role, field, value) {
    dirty.current = true;
    setRows((prev) => ({ ...prev, [role]: { ...prev[role], [field]: value } }));
  }

  // Inline mode: Just render a table-like header + rows (used in the new product page)
  if (inline) {
    return (
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
              <div className="text-center">Visible</div>
            </div>
            {roles.map((role) => {
              const r = rows[role] || { role, price: 0, mrp: 0, discountPercent: 0, minQty: 1, commissionPercent: 0, visible: true };
              return (
                <div key={role} className="grid grid-cols-2 md:grid-cols-6 gap-3 items-center border-b pb-3">
                  <div className="font-medium text-sm">{role}</div>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Selling Price"
                    value={r.price || ""}
                    onChange={(e) => updateField(role, "price", Number(e.target.value))}
                  />
                  <Input
                    type="number"
                    min="1"
                    placeholder="Min Qty"
                    value={r.minQty || 1}
                    onChange={(e) => updateField(role, "minQty", Number(e.target.value))}
                  />
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    placeholder="Commission (%)"
                    value={r.commissionPercent || ""}
                    onChange={(e) => updateField(role, "commissionPercent", Number(e.target.value))}
                  />
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    placeholder="Discount (%)"
                    value={r.discountPercent || ""}
                    onChange={(e) => updateField(role, "discountPercent", Number(e.target.value))}
                  />
                  <div className="flex justify-center">
                    <input
                      type="checkbox"
                      checked={r.visible !== false}
                      onChange={(e) => updateField(role, "visible", e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Card mode: Each role in its own card with Save button (used in edit mode)
  return (
    <Card>
      <CardHeader>
        <CardTitle>Role-Based Pricing & Visibility</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {roles.map((role) => {
            const r = rows[role] || { role, price: 0, mrp: 0, discountPercent: 0, minQty: 1, commissionPercent: 0, visible: true };
            return (
              <div key={role} className="border rounded-lg p-4 space-y-3 bg-muted/30">
                <div className="flex items-center justify-between">
                  <div className="font-medium text-sm">{role}</div>
                  <Label className="text-xs cursor-pointer flex items-center gap-2">
                    <Checkbox
                      checked={r.visible !== false}
                      onCheckedChange={(checked) => updateField(role, "visible", checked)}
                    />
                    Visible
                  </Label>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">MRP</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={r.mrp}
                      onChange={(e) => updateField(role, "mrp", Number(e.target.value))}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Selling Price</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={r.price}
                      onChange={(e) => updateField(role, "price", Number(e.target.value))}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Discount (%)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={r.discountPercent || 0}
                      onChange={(e) => updateField(role, "discountPercent", Number(e.target.value))}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Commission (%)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={r.commissionPercent || 0}
                      onChange={(e) => updateField(role, "commissionPercent", Number(e.target.value))}
                      placeholder="0"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Min Qty</Label>
                    <Input
                      type="number"
                      min="1"
                      value={r.minQty || 1}
                      onChange={(e) => updateField(role, "minQty", Number(e.target.value))}
                      placeholder="1"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <div className="text-xs text-muted-foreground">
                      Sale price:{" "}
                      <span className="font-semibold text-slate-700">
                        {formatMoney(r.price)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 pt-2 border-t">
                  <Button
                    size="sm"
                    onClick={() => save(role)}
                    disabled={saving === role}
                  >
                    {saving === role ? "Saving..." : "Save"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}