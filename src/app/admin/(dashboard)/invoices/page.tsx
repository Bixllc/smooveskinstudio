"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { IconPlus, IconTrash, IconX } from "@tabler/icons-react";
import { toast } from "sonner";

interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

interface Invoice {
  id: string;
  customerName: string;
  customerEmail: string;
  lineItems: LineItem[];
  subtotal: number;
  total: number;
  status: "DRAFT" | "SENT" | "PAID" | "CANCELLED";
  notes: string | null;
  dueDate: string | null;
  createdAt: string;
}

const STATUS_STYLES: Record<string, string> = {
  DRAFT: "bg-[#f5f4f2] text-[#7a756e]",
  SENT: "bg-[#e8f0fe] text-[#2a56c6]",
  PAID: "bg-[#e8f7ee] text-[#2e7d50]",
  CANCELLED: "bg-[#fdecea] text-[#b53a2e]",
};

function emptyItem(): LineItem {
  return { description: "", quantity: 1, unitPrice: 0 };
}

export default function InvoicesPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [lineItems, setLineItems] = useState<LineItem[]>([emptyItem()]);
  const [notes, setNotes] = useState("");
  const [dueDate, setDueDate] = useState("");

  const { data: invoices = [], isLoading } = useQuery<Invoice[]>({
    queryKey: ["invoices"],
    queryFn: () => fetch("/api/admin/invoices").then((r) => r.json()),
  });

  function resetForm() {
    setCustomerName("");
    setCustomerEmail("");
    setLineItems([emptyItem()]);
    setNotes("");
    setDueDate("");
    setShowForm(false);
  }

  function updateItem(i: number, field: keyof LineItem, value: string | number) {
    setLineItems((prev) => prev.map((item, idx) => idx === i ? { ...item, [field]: value } : item));
  }

  function addItem() {
    setLineItems((prev) => [...prev, emptyItem()]);
  }

  function removeItem(i: number) {
    setLineItems((prev) => prev.filter((_, idx) => idx !== i));
  }

  const subtotal = lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/admin/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerName, customerEmail, lineItems, notes, dueDate: dueDate || null }),
    });
    if (res.ok) {
      toast.success("Invoice created");
      qc.invalidateQueries({ queryKey: ["invoices"] });
      resetForm();
    } else {
      const data = await res.json();
      toast.error(data.error ?? "Failed to create invoice");
    }
    setSaving(false);
  }

  async function updateStatus(id: string, status: string) {
    const res = await fetch(`/api/admin/invoices/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      toast.success(`Invoice marked as ${status.toLowerCase()}`);
      qc.invalidateQueries({ queryKey: ["invoices"] });
    } else {
      toast.error("Failed to update invoice");
    }
  }

  async function deleteInvoice(id: string) {
    if (!confirm("Delete this invoice?")) return;
    const res = await fetch(`/api/admin/invoices/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Invoice deleted");
      qc.invalidateQueries({ queryKey: ["invoices"] });
    } else {
      toast.error("Failed to delete invoice");
    }
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      {/* Topbar */}
      <header className="flex h-[80px] flex-shrink-0 items-center justify-between border-b border-black/[0.07] bg-white px-8">
        <h1 className="text-[24px] font-semibold text-[#1b1814]">Invoices</h1>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-1.5 rounded-[9px] bg-[#c9a96e] px-[18px] py-[9px] text-[13px] font-semibold text-[#1b1814] hover:opacity-85 transition-opacity border-none cursor-pointer"
          >
            <IconPlus size={14} /> New Invoice
          </button>
        )}
      </header>

      <div className="flex-1 overflow-y-auto px-8 py-8 pb-20 md:pb-8 space-y-6">

        {/* Create form */}
        {showForm && (
          <div className="bg-white border border-black/[0.07] rounded-[14px] p-6 max-w-2xl">
            <div className="flex items-center justify-between mb-5">
              <p className="text-[16px] font-semibold text-[#1b1814]">New Invoice</p>
              <button onClick={resetForm} className="text-[#a8a39c] hover:text-[#1b1814]">
                <IconX size={16} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-5">
              {/* Customer */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[11px] font-medium uppercase tracking-[0.06em] text-[#7a756e] mb-1.5">
                    Customer Name *
                  </label>
                  <input
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Jane Smith"
                    className="w-full px-3 py-[9px] rounded-[8px] border border-black/[0.12] bg-white text-[13.5px] text-[#1b1814] outline-none focus:border-[#c9a96e] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium uppercase tracking-[0.06em] text-[#7a756e] mb-1.5">
                    Customer Email *
                  </label>
                  <input
                    required
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="jane@example.com"
                    className="w-full px-3 py-[9px] rounded-[8px] border border-black/[0.12] bg-white text-[13.5px] text-[#1b1814] outline-none focus:border-[#c9a96e] transition-colors"
                  />
                </div>
              </div>

              {/* Line items */}
              <div>
                <label className="block text-[11px] font-medium uppercase tracking-[0.06em] text-[#7a756e] mb-2">
                  Line Items *
                </label>
                <div className="space-y-2">
                  {/* Header */}
                  <div className="grid gap-2 text-[10px] font-semibold uppercase tracking-[0.06em] text-[#a8a39c] px-1"
                    style={{ gridTemplateColumns: "1fr 72px 96px 32px" }}>
                    <span>Description</span>
                    <span>Qty</span>
                    <span>Unit Price</span>
                    <span />
                  </div>
                  {lineItems.map((item, i) => (
                    <div key={i} className="grid gap-2 items-center" style={{ gridTemplateColumns: "1fr 72px 96px 32px" }}>
                      <input
                        required
                        value={item.description}
                        onChange={(e) => updateItem(i, "description", e.target.value)}
                        placeholder="e.g. Brow wax"
                        className="px-3 py-[8px] rounded-[8px] border border-black/[0.12] bg-white text-[13px] text-[#1b1814] outline-none focus:border-[#c9a96e] transition-colors"
                      />
                      <input
                        required
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) => updateItem(i, "quantity", Number(e.target.value))}
                        className="px-3 py-[8px] rounded-[8px] border border-black/[0.12] bg-white text-[13px] text-[#1b1814] outline-none focus:border-[#c9a96e] transition-colors text-center"
                      />
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a8a39c] text-[13px]">$</span>
                        <input
                          required
                          type="number"
                          min={0}
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(i, "unitPrice", Number(e.target.value))}
                          className="w-full pl-6 pr-3 py-[8px] rounded-[8px] border border-black/[0.12] bg-white text-[13px] text-[#1b1814] outline-none focus:border-[#c9a96e] transition-colors"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(i)}
                        disabled={lineItems.length === 1}
                        className="flex items-center justify-center h-[36px] w-[32px] text-[#a8a39c] hover:text-[#b53a2e] disabled:opacity-30 transition-colors"
                      >
                        <IconTrash size={14} />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addItem}
                  className="mt-2 text-[12px] font-medium text-[#c9a96e] hover:text-[#b8892a] transition-colors"
                >
                  + Add line item
                </button>
              </div>

              {/* Subtotal */}
              <div className="flex justify-end border-t border-black/[0.07] pt-3">
                <div className="text-right">
                  <p className="text-[12px] text-[#7a756e]">Total</p>
                  <p className="text-[20px] font-semibold text-[#1b1814]">${subtotal.toFixed(2)}</p>
                </div>
              </div>

              {/* Notes + due date */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[11px] font-medium uppercase tracking-[0.06em] text-[#7a756e] mb-1.5">
                    Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Payment instructions, thank you note…"
                    rows={3}
                    className="w-full resize-none px-3 py-[9px] rounded-[8px] border border-black/[0.12] bg-white text-[13.5px] text-[#1b1814] outline-none focus:border-[#c9a96e] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium uppercase tracking-[0.06em] text-[#7a756e] mb-1.5">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-[9px] rounded-[8px] border border-black/[0.12] bg-white text-[13.5px] text-[#1b1814] outline-none focus:border-[#c9a96e] transition-colors"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-[#c9a96e] text-[#1b1814] rounded-[9px] px-[18px] py-[9px] text-[13px] font-semibold hover:opacity-85 transition-opacity cursor-pointer border-none disabled:opacity-60"
                >
                  {saving ? "Creating…" : "Create Invoice"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-white text-[#7a756e] border border-black/[0.12] rounded-[9px] px-[18px] py-[9px] text-[13px] font-medium hover:bg-[#f8f6f3] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Invoice list */}
        {isLoading ? (
          <div className="space-y-3 max-w-2xl">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded-[14px] bg-[#f5f4f2]" />
            ))}
          </div>
        ) : invoices.length === 0 && !showForm ? (
          <div className="flex flex-col items-center justify-center py-20 gap-2">
            <p className="text-[15px] font-medium text-[#7a756e]">No invoices yet</p>
            <p className="text-[13px] text-[#a8a39c]">Create one to get started.</p>
          </div>
        ) : invoices.length > 0 ? (
          <div className="bg-white border border-black/[0.07] rounded-[14px] overflow-hidden">
            {/* Header */}
            <div className="grid bg-[#edeae5] border-b border-black/[0.07] px-6 py-[14px]"
              style={{ gridTemplateColumns: "1.5fr 1.5fr 90px 80px 100px 120px" }}>
              {["Customer", "Email", "Total", "Due", "Status", ""].map((h) => (
                <div key={h} className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#a8a39c]">{h}</div>
              ))}
            </div>
            {invoices.map((inv) => (
              <div
                key={inv.id}
                className="grid px-6 py-[16px] border-b border-black/[0.07] last:border-0 hover:bg-[#f8f6f3] items-center transition-colors"
                style={{ gridTemplateColumns: "1.5fr 1.5fr 90px 80px 100px 120px" }}
              >
                <div className="text-[15px] font-medium text-[#1b1814] truncate pr-2">{inv.customerName}</div>
                <div className="text-[14px] text-[#7a756e] truncate pr-2">{inv.customerEmail}</div>
                <div className="text-[15px] font-semibold text-[#b8892a]">${Number(inv.total).toFixed(2)}</div>
                <div className="text-[13px] text-[#7a756e]">
                  {inv.dueDate ? format(new Date(inv.dueDate), "MMM d") : "—"}
                </div>
                <div>
                  <span className={`inline-flex items-center whitespace-nowrap px-[10px] py-[3px] rounded-full text-[11px] font-semibold ${STATUS_STYLES[inv.status] ?? ""}`}>
                    {inv.status}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {inv.status === "DRAFT" && (
                    <button
                      onClick={() => updateStatus(inv.id, "SENT")}
                      className="bg-[#1b1814] text-white rounded-[7px] px-3 py-1.5 text-[11px] font-semibold hover:opacity-80 transition-opacity cursor-pointer border-none"
                    >
                      Send
                    </button>
                  )}
                  {inv.status === "SENT" && (
                    <button
                      onClick={() => updateStatus(inv.id, "PAID")}
                      className="bg-[#e8f7ee] text-[#2e7d50] border border-[#2e7d5030] rounded-[7px] px-3 py-1.5 text-[11px] font-semibold hover:opacity-80 transition-opacity cursor-pointer"
                    >
                      Mark Paid
                    </button>
                  )}
                  <button
                    onClick={() => deleteInvoice(inv.id)}
                    className="flex items-center justify-center h-[30px] w-[30px] text-[#a8a39c] hover:text-[#b53a2e] transition-colors"
                  >
                    <IconTrash size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
