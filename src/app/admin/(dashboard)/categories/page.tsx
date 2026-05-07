"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Category {
  id: string;
  name: string;
  description: string | null;
  displayOrder: number;
  active: boolean;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function fetchCategories() {
    const res = await fetch("/api/admin/categories");
    if (res.ok) {
      setCategories(await res.json());
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchCategories();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setError(null);

    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim(), description: newDescription.trim() || null }),
    });

    if (res.ok) {
      setNewName("");
      setNewDescription("");
      fetchCategories();
    } else {
      const data = await res.json();
      setError(data.error);
    }
  }

  async function handleUpdate(id: string) {
    setError(null);
    const res = await fetch(`/api/admin/categories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName, description: editDescription || null }),
    });

    if (res.ok) {
      setEditingId(null);
      fetchCategories();
    } else {
      const data = await res.json();
      setError(data.error);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this category?")) return;
    setError(null);

    const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    if (res.ok) {
      fetchCategories();
    } else {
      const data = await res.json();
      setError(data.error);
    }
  }

  async function handleReorder(id: string, direction: "up" | "down") {
    const idx = categories.findIndex((c) => c.id === id);
    if (idx === -1) return;
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= categories.length) return;

    const current = categories[idx];
    const swap = categories[swapIdx];

    await Promise.all([
      fetch(`/api/admin/categories/${current.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayOrder: swap.displayOrder }),
      }),
      fetch(`/api/admin/categories/${swap.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayOrder: current.displayOrder }),
      }),
    ]);

    fetchCategories();
  }

  function startEdit(cat: Category) {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditDescription(cat.description ?? "");
  }

  if (loading) {
    return <p className="text-sm text-[var(--color-text-light)]">Loading...</p>;
  }

  return (
    <div>
      <h2 className="mb-6 text-2xl font-semibold text-[var(--color-text)]">
        Categories
      </h2>

      {error && (
        <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </p>
      )}

      {/* Create form */}
      <form
        onSubmit={handleCreate}
        className="mb-8 rounded-xl border border-[var(--color-border)] bg-white p-4"
      >
        <p className="mb-3 text-sm font-medium text-[var(--color-text)]">
          Add Category
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex-1">
            <Label htmlFor="catName" className="sr-only">Name</Label>
            <Input
              id="catName"
              placeholder="Category name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <Label htmlFor="catDesc" className="sr-only">Description</Label>
            <Input
              id="catDesc"
              placeholder="Description (optional)"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
            />
          </div>
          <Button type="submit">Add</Button>
        </div>
      </form>

      {/* Category list */}
      <div className="space-y-2">
        {categories.map((cat, idx) => (
          <div
            key={cat.id}
            className="flex items-center gap-3 rounded-lg border border-[var(--color-border)] bg-white p-4"
          >
            {/* Reorder buttons */}
            <div className="flex flex-col gap-0.5">
              <button
                onClick={() => handleReorder(cat.id, "up")}
                disabled={idx === 0}
                className="text-xs text-[var(--color-text-light)] disabled:opacity-30 hover:text-[var(--color-primary)]"
              >
                &#9650;
              </button>
              <button
                onClick={() => handleReorder(cat.id, "down")}
                disabled={idx === categories.length - 1}
                className="text-xs text-[var(--color-text-light)] disabled:opacity-30 hover:text-[var(--color-primary)]"
              >
                &#9660;
              </button>
            </div>

            {/* Content */}
            <div className="flex-1">
              {editingId === cat.id ? (
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Description"
                    className="flex-1"
                  />
                  <Button size="sm" onClick={() => handleUpdate(cat.id)}>
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditingId(null)}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-medium text-[var(--color-text)]">
                    {cat.name}
                  </p>
                  {cat.description && (
                    <p className="text-xs text-[var(--color-text-light)]">
                      {cat.description}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            {editingId !== cat.id && (
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" onClick={() => startEdit(cat)}>
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(cat.id)}
                >
                  Delete
                </Button>
              </div>
            )}
          </div>
        ))}

        {categories.length === 0 && (
          <p className="text-sm text-[var(--color-text-light)]">
            No categories yet. Create one above.
          </p>
        )}
      </div>
    </div>
  );
}
