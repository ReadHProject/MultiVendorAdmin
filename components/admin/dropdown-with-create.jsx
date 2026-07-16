"use client";
import React, { useState, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export function DropdownWithCreate({
  label,
  value,
  onChange,
  options,
  placeholder = "Select...",
  createEndpoint,
  createMutation,
  createLabel = "Name",
  createFields = [{ name: "name", label: "Name", type: "text", required: true }],
  disabled = false,
  required = false,
  className,
}) {
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState(() => {
    const initial = {};
    createFields.forEach((f) => { initial[f.name] = ""; });
    return initial;
  });
  const [creating, setCreating] = useState(false);

  const handleCreate = useCallback(async () => {
    if (!createMutation) {
      toast.error("Create mutation not provided");
      return;
    }
    const missingRequired = createFields.filter(f => f.required && !createForm[f.name]?.trim());
    if (missingRequired.length > 0) {
      toast.error(`Please fill in: ${missingRequired.map(f => f.label).join(", ")}`);
      return;
    }
    setCreating(true);
    try {
      const result = await createMutation(createForm).unwrap();
      toast.success(`${label} created successfully`);
      setCreateOpen(false);
      setCreateForm(() => {
        const initial = {};
        createFields.forEach((f) => { initial[f.name] = ""; });
        return initial;
      });
      if (result && result.data && result.data.id && onChange) {
        onChange(result.data.id);
      }
    } catch (err) {
      toast.error(err?.data?.error?.message || `Failed to create ${label}`);
    } finally {
      setCreating(false);
    }
  }, [createMutation, createForm, createFields, label, onChange]);

  function handleKeyDown(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      handleCreate();
    }
  }

  return (
    <div className={className}>
      <Label className="text-[10px] font-black uppercase text-muted-foreground">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <div className="flex gap-2 mt-1 items-center">
        <div className="flex-1">
          <Select value={value} onValueChange={onChange} disabled={disabled}>
            <SelectTrigger>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((opt) => (
                <SelectItem key={opt.id} value={opt.id} label={opt.name || opt.label}>
                  {opt.name || opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          disabled={disabled}
          aria-label={`Create new ${label}`}
          className="inline-flex items-center justify-center h-9 w-9 rounded-md border border-input bg-background text-sm font-medium hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50 shrink-0"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      <Dialog controlledOpen={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New {label}</DialogTitle>
            <DialogDescription>Fill in the details to create a new {label.toLowerCase()}.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4" onKeyDown={handleKeyDown}>
            {createFields.map((field) => (
              <div key={field.name} className="space-y-1.5">
                <Label htmlFor={`create-${field.name}`} className="text-sm font-medium">
                  {field.label} {field.required && <span className="text-destructive">*</span>}
                </Label>
                {field.type === "textarea" ? (
                  <textarea
                    id={`create-${field.name}`}
                    className="flex h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={createForm[field.name]}
                    onChange={(e) => setCreateForm({ ...createForm, [field.name]: e.target.value })}
                    placeholder={field.placeholder}
                    required={field.required}
                  />
                ) : (
                  <Input
                    id={`create-${field.name}`}
                    type={field.type}
                    value={createForm[field.name]}
                    onChange={(e) => setCreateForm({ ...createForm, [field.name]: e.target.value })}
                    placeholder={field.placeholder}
                    required={field.required}
                  />
                )}
              </div>
            ))}
          </div>
          <DialogFooter>
            <button
              type="button"
              onClick={() => setCreateOpen(false)}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCreate}
              disabled={creating}
              className="inline-flex items-center justify-center rounded-lg text-sm font-bold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 disabled:pointer-events-none disabled:opacity-50"
            >
              {creating ? "Creating..." : `Create ${label}`}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
