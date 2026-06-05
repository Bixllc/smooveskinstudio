"use client";

import { useEffect, useState } from "react";
import { IconPlus, IconChevronUp, IconChevronDown } from "@tabler/icons-react";

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
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function fetchCategories() {
    const res = await fetch("/api/admin/categories");
    if (res.ok) setCategories(await res.json());
    setLoading(false);
  }

  useEffect(() => { fetchCategories(); }, []);

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
      setShowForm(false);
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
    if (!confirm("Delete this category?")) return;
    setError(null);
    const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    if (res.ok) fetchCategories();
    else {
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

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      {/* Topbar */}
      <header className="h-[60px] bg-white border-b border-black/[0.07] px-8 flex items-center justify-between flex-shrink-0">
        <h1 className="text-[20px] font-semibold text-[#1b1814]">Categories</h1>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-[#c9a96e] text-[#1b1814] rounded-[9px] px-[18px] py-[9px] text-[13px] font-semibold inline-flex items-center gap-1.5 hover:opacity-85 transition-opacity cursor-pointer border-none"
          >
            <IconPlus size={14} /> Add Category
          </button>
        )}
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-8 py-7 pb-20 md:pb-7">
        {error && (
          <div className="mb-4 rounded-[9px] bg-[#fdecea] border border-[#f5c6c2] px-4 py-3 text-[13px] text-[#b53a2e]">
            {error}
          </div>
        )}

        {/* Create form */}
        {showForm && (
          <div className="bg-white border border-black/[0.07] rounded-[14px] p-6 max-w-[560px] mb-6">
            <p className="text-[15px] font-semibold text-[#1b1814] mb-5">New Category</p>
            <form onSubmit={handleCreate}>
              <div className="grid gap-4 sm:grid-cols-2 mb-5">
                <div>
                  <label className="block text-[11px] font-medium uppercase tracking-[0.06em] text-[#7a756e] mb-1.5">
                    Name *
                  </label>
                  <input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Brow Services"
                    required
                    className="w-full px-3 py-[9px] rounded-[8px] border border-black/[0.12] bg-white text-[13.5px] text-[#1b1814] outline-none focus:border-[#c9a96e] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium uppercase tracking-[0.06em] text-[#7a756e] mb-1.5">
                    Description
                  </label>
                  <input
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Optional description"
                    className="w-full px-3 py-[9px] rounded-[8px] border border-black/[0.12] bg-white text-[13.5px] text-[#1b1814] outline-none focus:border-[#c9a96e] transition-colors"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-[#c9a96e] text-[#1b1814] rounded-[9px] px-[18px] py-[9px] text-[13px] font-semibold hover:opacity-85 transition-opacity cursor-pointer border-none"
                >
                  Create Category
                </button>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setNewName(""); setNewDescription(""); }}
                  className="bg-white text-[#7a756e] border border-black/[0.12] rounded-[9px] px-[18px] py-2 text-[13px] font-medium hover:bg-[#f8f6f3] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* List */}
        {loading ? (
          <div className="space-y-2 max-w-[560px]">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded-[14px] bg-[#f5f4f2]" />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-[14px] text-[#a8a39c]">No categories yet. Create one above.</p>
          </div>
        ) : (
          <div className="bg-white border border-black/[0.07] rounded-[14px] overflow-hidden max-w-[560px]">
            {/* Header */}
            <div className="grid bg-[#edeae5] border-b border-black/[0.07] px-5 py-[11px]" style={{ gridTemplateColumns: "32px 1fr 1.2fr auto" }}>
              {["", "Name", "Description", ""].map((h, i) => (
                <div key={i} className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#a8a39c]">{h}</div>
              ))}
            </div>

            {categories.map((cat, idx) => (
              <div
                key={cat.id}
                className="grid px-5 py-[13px] border-b border-black/[0.07] last:border-0 hover:bg-[#f8f6f3] items-center transition-colors"
                style={{ gridTemplateColumns: "32px 1fr 1.2fr auto" }}
              >
                {/* Reorder */}
                <div className="flex flex-col gap-0.5">
                  <button
                    onClick={() => handleReorder(cat.id, "up")}
                    disabled={idx === 0}
                    className="text-[#a8a39c] disabled:opacity-20 hover:text-[#c9a96e] transition-colors"
                  >
                    <IconChevronUp size={13} />
                  </button>
                  <button
                    onClick={() => handleReorder(cat.id, "down")}
                    disabled={idx === categories.length - 1}
                    className="text-[#a8a39c] disabled:opacity-20 hover:text-[#c9a96e] transition-colors"
                  >
                    <IconChevronDown size={13} />
                  </button>
                </div>

                {/* Name / edit */}
                {editingId === cat.id ? (
                  <>
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="px-2 py-1.5 rounded-[7px] border border-black/[0.12] text-[13px] text-[#1b1814] outline-none focus:border-[#c9a96e] mr-2"
                    />
                    <input
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      placeholder="Description"
                      className="px-2 py-1.5 rounded-[7px] border border-black/[0.12] text-[13px] text-[#1b1814] outline-none focus:border-[#c9a96e]"
                    />
                    <div className="flex items-center gap-1 pl-3">
                      <button
                        onClick={() => handleUpdate(cat.id)}
                        className="bg-[#c9a96e] text-[#1b1814] rounded-[7px] px-3 py-1.5 text-[12px] font-semibold border-none cursor-pointer hover:opacity-85"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="bg-white text-[#7a756e] border border-black/[0.12] rounded-[7px] px-3 py-1.5 text-[12px] font-medium hover:bg-[#f8f6f3] cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <span className="text-[14px] font-medium text-[#1b1814] truncate pr-2">{cat.name}</span>
                    <span className="text-[13px] text-[#7a756e] truncate pr-2">{cat.description ?? "—"}</span>
                    <div className="flex items-center gap-1 pl-3">
                      <button
                        onClick={() => startEdit(cat)}
                        className="bg-white text-[#7a756e] border border-black/[0.12] rounded-[7px] px-3 py-1.5 text-[12px] font-medium hover:bg-[#f8f6f3] transition-colors cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id)}
                        className="bg-white text-[#b53a2e] border border-black/[0.12] rounded-[7px] px-3 py-1.5 text-[12px] font-medium hover:bg-[#fdecea] transition-colors cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
