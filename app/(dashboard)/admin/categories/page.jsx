"use client";

import React, { useState, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/toaster";
import { Icon } from "@/components/ui/icon";
import { Plus } from "lucide-react";
import { MobileFooter, MobileHeader } from "@/components/admin/mobile/mobile-layout";

function CategoryRow({ category, depth = 0, onEdit, onDelete, onAddChild, refreshKey }) {
  const [hovered, setHovered] = useState(false);
  const hasChildren = category.children && category.children.length > 0;

  return (
    <div>
      <div
        className={cn(
          "group flex items-center justify-between px-4 py-3 transition-colors",
          depth === 0 && "border-b border-outline-variant/20 hover:bg-surface-container-low/30",
          depth === 1 && "border-t border-outline-variant/10 hover:bg-surface-container-low/50",
          depth >= 2 && "border-t border-outline-variant/10 hover:bg-surface-container-low/70"
        )}
        style={{ paddingLeft: `${16 + depth * 48}px` }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {depth === 0 ? (
            <span className="material-symbols-outlined text-amber-600 shrink-0">folder</span>
          ) : (
            <span className="material-symbols-outlined text-muted-foreground text-[18px] shrink-0">
              subdirectory_arrow_right
            </span>
          )}
          <span
            className={cn(
              "truncate",
              depth === 0 && "text-sm font-semibold text-foreground",
              depth === 1 && "text-sm font-medium text-muted-foreground",
              depth >= 2 && "text-xs text-muted-foreground"
            )}
          >
            {category.name}
          </span>
          {category._count?.products > 0 && (
            <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full shrink-0">
              {category._count.products}
            </span>
          )}
        </div>
        <div
          className={cn(
            "flex items-center gap-1.5 transition-opacity shrink-0",
            hovered ? "opacity-100" : "opacity-0"
          )}
        >
          <button
            onClick={() => onAddChild(category)}
            className="text-[11px] bg-surface border border-outline-variant text-muted-foreground px-2 py-1 rounded hover:bg-surface-container hover:text-primary transition-colors"
          >
            + Sub
          </button>
          <button
            onClick={() => onEdit(category)}
            className="text-[11px] bg-surface border border-outline-variant text-muted-foreground px-2 py-1 rounded hover:bg-surface-container transition-colors"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(category)}
            className="text-[11px] bg-error-container text-on-error-container px-2 py-1 rounded hover:bg-destructive hover:text-white transition-colors"
          >
            Del
          </button>
        </div>
      </div>
      {hasChildren &&
        category.children.map((child) => (
          <CategoryRow
            key={child.id}
            category={child}
            depth={depth + 1}
            onEdit={onEdit}
            onDelete={onDelete}
            onAddChild={onAddChild}
            refreshKey={refreshKey}
          />
        ))}
    </div>
  );
}

function CategoryFormModal({ open, onOpenChange, category, parent, onSave }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const isEdit = !!category;
  const title = isEdit ? "Edit Category" : parent ? `New Sub-Category under "${parent.name}"` : "New Category";

  useEffect(() => {
    if (open) {
      if (category) {
        setName(category.name || "");
        setDescription(category.description || "");
      } else {
        setName("");
        setDescription("");
      }
    }
  }, [open, category]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      const body = {
        name: name.trim(),
        description: description.trim() || undefined,
        parentId: parent?.id || category?.parentId || null,
      };
      if (isEdit) {
        await api.put(`/categories/${category.id}`, body);
        toast.success("Category updated");
      } else {
        await api.post("/categories", body);
        toast.success("Category created");
      }
      onSave();
      onOpenChange(false);
    } catch (err) {
      toast.error(err.message || "Failed to save category");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog controlledOpen={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Electronics"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional category description..."
              rows={3}
            />
          </div>
          <DialogFooter>
            <DialogClose
              type="button"
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-bold transition-all h-9 px-3 border border-outline-variant bg-transparent text-on-surface hover:bg-surface-container active:scale-95"
            >
              Cancel
            </DialogClose>
            <Button type="submit" size="sm" disabled={saving || !name.trim()}>
              {saving ? "Saving..." : isEdit ? "Save Changes" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function CategoriesPage() {
  const [tree, setTree] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editCategory, setEditCategory] = useState(null);
  const [parentCategory, setParentCategory] = useState(null);

  const fetchTree = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.get("/categories");
      setTree(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTree();
  }, [fetchTree, refreshKey]);

  const refresh = () => setRefreshKey((k) => k + 1);

  function filterTree(nodes, query) {
    if (!query) return nodes;
    const q = query.toLowerCase();
    return nodes
      .map((node) => {
        const filteredChildren = filterTree(node.children || [], query);
        const nameMatch = node.name.toLowerCase().includes(q);
        if (nameMatch || filteredChildren.length > 0) {
          return { ...node, children: filteredChildren };
        }
        return null;
      })
      .filter(Boolean);
  }

  const filteredTree = filterTree(tree, searchQuery);

  function handleAddRoot() {
    setEditCategory(null);
    setParentCategory(null);
    setModalOpen(true);
  }

  function handleAddChild(cat) {
    setEditCategory(null);
    setParentCategory(cat);
    setModalOpen(true);
  }

  function handleEdit(cat) {
    setEditCategory(cat);
    setParentCategory(null);
    setModalOpen(true);
  }

  async function handleDelete(cat) {
    if (!window.confirm(`Delete "${cat.name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/categories/${cat.id}`);
      toast.success("Category deleted");
      refresh();
    } catch (err) {
      toast.error(err.message || "Failed to delete category");
    }
  }

  const MobileCategoryRow = ({ category, depth = 0 }) => (
    <div className="flex flex-col">
      <div 
        className={cn(
          "flex justify-between items-center p-3 border-b border-slate-800",
          depth === 0 ? "bg-slate-900" : "bg-slate-900/50"
        )}
        style={{ paddingLeft: `${16 + depth * 16}px` }}
      >
        <div className="flex items-center gap-2">
          {depth === 0 ? (
            <Icon name="folder" size={16} className="text-amber-500" />
          ) : (
            <Icon name="subdirectory-arrow-right" size={16} className="text-slate-500" />
          )}
          <span className={cn("text-sm", depth === 0 ? "font-semibold text-white" : "text-slate-300")}>{category.name}</span>
          {category._count?.products > 0 && (
            <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded-full">{category._count.products}</span>
          )}
        </div>
        <div className="flex gap-2">
           <button onClick={() => handleEdit(category)} className="p-1.5 text-slate-400 active:text-white"><Icon name="edit" size={14}/></button>
           <button onClick={() => handleAddChild(category)} className="p-1.5 text-slate-400 active:text-white"><Icon name="plus" size={14}/></button>
           <button onClick={() => handleDelete(category)} className="p-1.5 text-red-400 active:text-red-300"><Icon name="trash" size={14}/></button>
        </div>
      </div>
      {category.children && category.children.map(child => (
        <MobileCategoryRow key={child.id} category={child} depth={depth + 1} />
      ))}
    </div>
  );

  return (
    <>
    <div className="hidden md:block">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Category Management</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Organize your product hierarchy and catalog structure.
          </p>
        </div>
        <Button onClick={handleAddRoot} className="gap-2">
          <span className="material-symbols-outlined text-[18px]">add</span>
          Add Root Category
        </Button>
      </div>

      <div className="bg-card rounded-xl shadow-sm border border-border p-6 overflow-x-auto">
        <div className="min-w-[600px]">
          <div className="flex items-center px-4 py-3 bg-muted/50 rounded-t-lg border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <div className="flex-1 pl-2">Category Structure</div>
            <div className="w-32 text-right pr-4">Actions</div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-muted-foreground text-sm">Loading categories...</div>
          ) : error ? (
            <div className="py-12 text-center">
              <p className="text-sm text-destructive mb-2">{error}</p>
              <button onClick={fetchTree} className="text-xs text-primary hover:underline">
                Retry
              </button>
            </div>
          ) : filteredTree.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm">
              {searchQuery ? "No categories match your search." : "No categories yet. Create your first root category."}
            </div>
          ) : (
            <div>
              {filteredTree.map((cat) => (
                <CategoryRow
                  key={cat.id}
                  category={cat}
                  depth={0}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onAddChild={handleAddChild}
                  refreshKey={refreshKey}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>

      {/* Mobile UI */}
      <div className="block md:hidden pb-24 min-h-screen bg-slate-950 text-slate-200">
        <MobileHeader title="Categories" showMenu={true} />
        
        <div className="p-4 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-semibold text-lg">Categories</h2>
            <Button onClick={handleAddRoot} className="bg-accent hover:bg-accent/90 text-white h-9 px-4 text-xs font-semibold rounded-custom shadow-lg shadow-accent/20">
              <Plus className="h-4 w-4 mr-1" /> Add Root
            </Button>
          </div>
          
          <Input
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-slate-900 border-slate-800 text-slate-200 focus:ring-accent focus:border-accent w-full rounded-custom"
          />

          {loading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-12 bg-slate-900 animate-pulse rounded-custom" />
              ))}
            </div>
          ) : error ? (
            <div className="bg-red-500/10 border border-red-500/20 rounded-custom p-4 text-sm text-red-400">
              {error}
              <button onClick={fetchTree} className="ml-2 underline hover:no-underline">Retry</button>
            </div>
          ) : filteredTree.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-sm">
              {searchQuery ? "No categories match your search." : "No categories found"}
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-custom overflow-hidden">
              {filteredTree.map((cat) => (
                <MobileCategoryRow key={cat.id} category={cat} depth={0} />
              ))}
            </div>
          )}
        </div>

        <MobileFooter />
      </div>

      <CategoryFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        category={editCategory}
        parent={parentCategory}
        onSave={refresh}
      />
    </>
  );
}
