"use client";

import { useState } from "react";
import Link from "next/link";

interface Service {
  id: string;
  name: string;
  description: string | null;
  durationMinutes: number;
  price: number;
}

interface Category {
  id: string;
  name: string;
  description: string | null;
  services: Service[];
}

interface BookSelectionProps {
  clientSlug: string;
  categories: Category[];
}

function formatDuration(minutes: number): string {
  if (minutes >= 60) {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hrs} hr ${mins} min` : `${hrs} hr`;
  }
  return `${minutes} min`;
}

const BOOKING_STEPS = [
  { n: 1, label: "Select Service", sub: "Choose your treatment" },
  { n: 2, label: "Select Date & Time", sub: "Pick your preferred slot" },
  { n: 3, label: "Your Details", sub: "Tell us about yourself" },
  { n: 4, label: "Review Booking", sub: "Confirm your appointment" },
  { n: 5, label: "Confirmation", sub: "You're all set!" },
];

const FEATURES = [
  {
    title: "Easy Online Booking",
    sub: "Book in minutes, anytime",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    title: "Instant Confirmation",
    sub: "Receive confirmation immediately",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
  },
  {
    title: "Flexible Rescheduling",
    sub: "Change your appointment easily",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    title: "24/7 Support",
    sub: "We're here to help you anytime",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.5a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.73h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 10.4a16 16 0 0 0 5.7 5.7l.94-.94a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.07 17.5l-.15-.58z" />
      </svg>
    ),
  },
];

export function BookSelection({ clientSlug, categories }: BookSelectionProps) {
  const [expandedCategoryId, setExpandedCategoryId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Service | null>(null);
  const [search, setSearch] = useState("");

  const allServices = categories.flatMap((c) => c.services);
  const isSearching = search.trim().length > 0;

  const searchResults = isSearching
    ? allServices.filter((s) =>
        s.name.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  return (
    <div>
      {/* ── Hero ── */}
      <div
        className="relative overflow-hidden"
        style={{ background: "linear-gradient(120deg, #EDE3D4 0%, #E8DBC8 60%, #DFD0B8 100%)" }}
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 40% 80% at 95% 50%, rgba(196,168,130,0.18) 0%, transparent 70%)",
          }}
        />
        <div className="relative mx-auto max-w-5xl px-4 py-12">
          <h1
            className="text-4xl font-bold leading-tight text-[var(--color-text)]"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Book Your
            <br />
            Appointment
          </h1>
          <p className="mt-3 text-[var(--color-text-light)]">
            Professional care. Beautiful results.
          </p>

          <div className="mt-8 flex flex-wrap gap-x-10 gap-y-4">
            <div className="flex items-start gap-3">
              <div className="text-[var(--color-primary)]">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--color-text)]">Expert Therapists</p>
                <p className="text-xs text-[var(--color-text-light)]">Skilled &amp; certified professionals</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="text-[var(--color-primary)]">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2v-4M9 21H5a2 2 0 0 1-2-2v-4m0 0h18" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--color-text)]">Premium Products</p>
                <p className="text-xs text-[var(--color-text-light)]">High-quality, gentle products</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="text-[var(--color-primary)]">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--color-text)]">Hygienic Environment</p>
                <p className="text-xs text-[var(--color-text-light)]">Your safety &amp; comfort is our priority</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3-column layout ── */}
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="grid grid-cols-4 gap-6 items-start">

          {/* Left: Steps sidebar */}
          <div className="col-span-1">
            <div className="space-y-0">
              {BOOKING_STEPS.map((step, i) => (
                <div key={step.n} className="relative flex items-start gap-3 py-3">
                  {i < BOOKING_STEPS.length - 1 && (
                    <div className="absolute left-4 top-11 h-full w-px -translate-x-1/2 bg-[var(--color-border)]" />
                  )}
                  <div
                    className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                      step.n === 1
                        ? "bg-[var(--color-text)] text-white"
                        : "border-2 border-[var(--color-border)] bg-white text-[var(--color-text-light)]"
                    }`}
                  >
                    {step.n}
                  </div>
                  <div className="pt-0.5">
                    <p
                      className={`text-sm font-medium ${
                        step.n === 1 ? "text-[var(--color-text)]" : "text-[var(--color-text-light)]"
                      }`}
                    >
                      {step.label}
                    </p>
                    <p className="text-xs text-[var(--color-text-light)]">{step.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Center: Category accordions */}
          <div className="col-span-2">
            <h2
              className="text-xl font-bold text-[var(--color-text)] mb-1"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Select a Service
            </h2>
            <p className="mb-5 text-sm text-[var(--color-text-light)]">
              Choose a category and pick your treatment
            </p>

            {/* Search */}
            <div className="relative mb-5">
              <input
                type="text"
                placeholder="Search services..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-[var(--color-border)] bg-white px-4 py-2.5 pr-10 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
              />
              <svg
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-light)]"
                width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </div>

            {/* Search results */}
            {isSearching ? (
              <div className="space-y-3">
                {searchResults.length === 0 ? (
                  <p className="text-sm text-[var(--color-text-light)]">No services match your search.</p>
                ) : (
                  searchResults.map((service) => (
                    <ServiceCard
                      key={service.id}
                      service={service}
                      selected={selected}
                      onSelect={setSelected}
                    />
                  ))
                )}
              </div>
            ) : (
              /* Category accordions */
              <div className="space-y-3">
                {categories.map((category) => {
                  const isOpen = expandedCategoryId === category.id;
                  return (
                    <div
                      key={category.id}
                      className="rounded-xl border border-[var(--color-border)] bg-white overflow-hidden"
                    >
                      {/* Accordion header */}
                      <button
                        onClick={() =>
                          setExpandedCategoryId(isOpen ? null : category.id)
                        }
                        className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-[var(--color-bg-light)] transition-colors"
                      >
                        <div>
                          <p
                            className="font-semibold text-[var(--color-text)]"
                            style={{ fontFamily: "var(--font-heading)" }}
                          >
                            {category.name}
                          </p>
                          <p className="text-xs text-[var(--color-text-light)] mt-0.5">
                            {category.services.length} service{category.services.length !== 1 ? "s" : ""}
                            {category.description ? ` — ${category.description}` : ""}
                          </p>
                        </div>
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className={`shrink-0 text-[var(--color-primary)] transition-transform duration-200 ${
                            isOpen ? "rotate-180" : ""
                          }`}
                        >
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </button>

                      {/* Accordion body */}
                      {isOpen && (
                        <div className="border-t border-[var(--color-border)] px-4 py-4 space-y-3">
                          {category.services.map((service) => (
                            <ServiceCard
                              key={service.id}
                              service={service}
                              selected={selected}
                              onSelect={setSelected}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right: Booking summary */}
          <div className="col-span-1">
            <div className="rounded-xl border border-[var(--color-border)] bg-white p-5">
              <h3
                className="font-semibold text-[var(--color-text)]"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Booking Summary
              </h3>

              {selected ? (
                <div className="mt-4 space-y-3">
                  <div>
                    <p className="text-xs text-[var(--color-text-light)]">Service</p>
                    <p className="text-sm font-medium text-[var(--color-text)]">{selected.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--color-text-light)]">Duration</p>
                    <p className="text-sm font-medium text-[var(--color-text)]">
                      {formatDuration(selected.durationMinutes)}
                    </p>
                  </div>
                  <div className="border-t border-dashed border-[var(--color-border)] pt-3">
                    <p className="text-xs text-[var(--color-text-light)]">Starting from</p>
                    <p className="text-lg font-bold text-[var(--color-primary)]">
                      ${selected.price.toFixed(2)}
                    </p>
                  </div>
                  <Link
                    href={`/${clientSlug}/book/${selected.id}`}
                    className="block w-full rounded-lg bg-[var(--color-primary)] py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-[var(--color-primary-dark)]"
                  >
                    Continue
                  </Link>
                </div>
              ) : (
                <div className="mt-6 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-bg-light)]">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-text-light)]">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                  </div>
                  <p className="text-sm text-[var(--color-text-light)]">
                    Your appointment summary will appear here
                  </p>
                  <p className="mt-1 text-xs text-[var(--color-text-light)]">
                    Select a service to get started
                  </p>
                  <button
                    disabled
                    className="mt-4 w-full rounded-lg bg-[var(--color-border)] py-2.5 text-sm font-semibold text-[var(--color-text-light)] cursor-not-allowed"
                  >
                    Continue
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer features strip ── */}
      <div className="border-t border-[var(--color-border)] bg-white">
        <div className="mx-auto max-w-5xl px-4 py-8">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {FEATURES.map((feat) => (
              <div key={feat.title} className="flex items-start gap-3">
                <div className="shrink-0 text-[var(--color-primary)]">{feat.icon}</div>
                <div>
                  <p className="text-sm font-semibold text-[var(--color-text)]">{feat.title}</p>
                  <p className="text-xs text-[var(--color-text-light)]">{feat.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ServiceCard({
  service,
  selected,
  onSelect,
}: {
  service: Service;
  selected: Service | null;
  onSelect: (s: Service) => void;
}) {
  const isSelected = selected?.id === service.id;
  return (
    <div
      className={`flex items-center gap-4 rounded-xl border bg-white px-5 py-4 transition-all ${
        isSelected
          ? "border-[var(--color-primary)] shadow-md"
          : "border-[var(--color-border)] hover:shadow-sm"
      }`}
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[var(--color-bg-light)]">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-primary)]">
          <path d="M12 2c-1.5 3-5 4.5-5 8a5 5 0 0 0 10 0c0-3.5-3.5-5-5-8z" />
          <path d="M12 22v-3" />
          <path d="M9 17h6" />
        </svg>
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-[var(--color-text)]">{service.name}</p>
        <p className="text-sm font-medium text-[var(--color-primary)]">
          From ${service.price.toFixed(2)}
        </p>
        {service.description && (
          <p className="mt-0.5 text-xs text-[var(--color-text-light)] line-clamp-2">
            {service.description}
          </p>
        )}
      </div>

      <button
        onClick={() => onSelect(service)}
        className={`shrink-0 rounded-lg px-5 py-2 text-sm font-semibold transition-colors ${
          isSelected
            ? "bg-[var(--color-primary)] text-white"
            : "bg-[var(--color-text)] text-white hover:bg-[var(--color-primary-dark)]"
        }`}
      >
        {isSelected ? "Selected" : "Select"}
      </button>
    </div>
  );
}
