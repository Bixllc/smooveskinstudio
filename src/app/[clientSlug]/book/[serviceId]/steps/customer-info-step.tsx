"use client";

import { useState } from "react";

interface CustomerInfo {
  fullName: string;
  email: string;
  phone: string;
  notes: string;
}

interface CustomerInfoStepProps {
  initialValues: CustomerInfo | null;
  onSubmit: (info: CustomerInfo) => void;
}

export function CustomerInfoStep({
  initialValues,
  onSubmit,
}: CustomerInfoStepProps) {
  const [fullName, setFullName] = useState(initialValues?.fullName ?? "");
  const [email, setEmail] = useState(initialValues?.email ?? "");
  const [phone, setPhone] = useState(initialValues?.phone ?? "");
  const [notes, setNotes] = useState(initialValues?.notes ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) newErrors.fullName = "Name is required";
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Enter a valid email";
    }
    if (!phone.trim()) {
      newErrors.phone = "Phone is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({ fullName: fullName.trim(), email: email.trim(), phone: phone.trim(), notes: notes.trim() });
  }

  return (
    <div>
      <h3 className="mb-4 text-lg font-medium text-[var(--color-text)]">
        Your Information
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="fullName"
            className="mb-1 block text-sm font-medium text-[var(--color-text)]"
          >
            Full Name *
          </label>
          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full rounded-lg border border-[var(--color-border)] px-4 py-3 text-sm outline-none focus:border-[var(--color-primary)]"
          />
          {errors.fullName && (
            <p className="mt-1 text-xs text-red-600">{errors.fullName}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="email"
            className="mb-1 block text-sm font-medium text-[var(--color-text)]"
          >
            Email *
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-[var(--color-border)] px-4 py-3 text-sm outline-none focus:border-[var(--color-primary)]"
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-600">{errors.email}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="phone"
            className="mb-1 block text-sm font-medium text-[var(--color-text)]"
          >
            Phone *
          </label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-lg border border-[var(--color-border)] px-4 py-3 text-sm outline-none focus:border-[var(--color-primary)]"
          />
          {errors.phone && (
            <p className="mt-1 text-xs text-red-600">{errors.phone}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="notes"
            className="mb-1 block text-sm font-medium text-[var(--color-text)]"
          >
            Notes (optional)
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-[var(--color-border)] px-4 py-3 text-sm outline-none focus:border-[var(--color-primary)]"
            placeholder="Any special requests or notes..."
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-lg bg-[var(--color-primary)] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[var(--color-primary-dark)]"
        >
          Continue to Review
        </button>
      </form>
    </div>
  );
}
