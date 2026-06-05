"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { IconChevronDown, IconChevronUp } from "@tabler/icons-react";

interface TemplateConfig {
  enabled: boolean;
  subjectOverride: string;
  bodyNotes: string;
}

interface EmailTemplateSettings {
  confirmation?: TemplateConfig;
  reminder?: TemplateConfig;
  cancellation?: TemplateConfig;
  reschedule?: TemplateConfig;
}

const TEMPLATE_TYPES = [
  {
    key: "confirmation" as const,
    name: "Booking Confirmation",
    sentFor: "After payment is confirmed",
    defaultSubject: "You're booked — {service}",
  },
  {
    key: "reminder" as const,
    name: "Appointment Reminder",
    sentFor: "24 hours before appointment",
    defaultSubject: "Reminder: Your appointment tomorrow — {service}",
  },
  {
    key: "cancellation" as const,
    name: "Cancellation Confirmation",
    sentFor: "When a booking is cancelled",
    defaultSubject: "Your appointment has been cancelled",
  },
  {
    key: "reschedule" as const,
    name: "Reschedule Confirmation",
    sentFor: "When a booking is rescheduled",
    defaultSubject: "Your appointment has been rescheduled",
  },
];

function defaultTemplate(): TemplateConfig {
  return { enabled: true, subjectOverride: "", bodyNotes: "" };
}

export default function NotificationsPage() {
  const [settings, setSettings] = useState<EmailTemplateSettings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data) => {
        setSettings((data.emailTemplateSettings as EmailTemplateSettings) ?? {});
      })
      .finally(() => setLoading(false));
  }, []);

  function getTemplate(key: keyof EmailTemplateSettings): TemplateConfig {
    return settings[key] ?? defaultTemplate();
  }

  function updateTemplate(
    key: keyof EmailTemplateSettings,
    field: keyof TemplateConfig,
    value: string | boolean
  ) {
    setSettings((prev) => ({
      ...prev,
      [key]: {
        ...(prev[key] ?? defaultTemplate()),
        [field]: value,
      },
    }));
  }

  async function saveAll() {
    setSaving("all");
    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emailTemplateSettings: settings }),
    });
    if (res.ok) {
      toast.success("Notification settings saved");
    } else {
      const data = await res.json();
      toast.error(data.error ?? "Failed to save");
    }
    setSaving(null);
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <div className="flex h-[60px] flex-shrink-0 items-center gap-3 border-b border-black/[0.07] bg-white px-8">
        <h1 className="text-[20px] font-semibold text-[#1b1814]">Notifications</h1>
        <div className="flex-1" />
        <button
          onClick={saveAll}
          disabled={saving === "all" || loading}
          className="inline-flex items-center rounded-[9px] bg-[#c9a96e] px-[18px] py-[9px] text-[13px] font-semibold text-[#1b1814] hover:opacity-85 transition-opacity disabled:opacity-60 border-none cursor-pointer"
        >
          {saving === "all" ? "Saving…" : "Save changes"}
        </button>
      </div>

      <div className="flex-1 overflow-auto px-8 py-7 pb-20 md:pb-7 space-y-3">
        <p className="text-[13px] text-[#7a756e]">
          Control which emails are sent to customers and customize their subject lines.
        </p>

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-[#f5f4f2]" />
            ))}
          </div>
        ) : (
          <div className="max-w-2xl space-y-2">
            {TEMPLATE_TYPES.map((tmpl) => {
              const config = getTemplate(tmpl.key);
              const isExpanded = expanded === tmpl.key;

              return (
                <div
                  key={tmpl.key}
                  className="rounded-xl border border-[#e8e6e1] bg-white overflow-hidden"
                >
                  {/* Row */}
                  <div className="flex items-center gap-3 px-4 py-3">
                    {/* Toggle */}
                    <button
                      type="button"
                      onClick={() =>
                        updateTemplate(tmpl.key, "enabled", !config.enabled)
                      }
                      className={`relative h-5 w-9 flex-shrink-0 rounded-full transition-colors ${
                        config.enabled ? "bg-[#C9A96E]" : "bg-[#e8e6e1]"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                          config.enabled ? "translate-x-4" : "translate-x-0.5"
                        }`}
                      />
                    </button>

                    {/* Name + sent for */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-medium text-[#1a1814]">
                        {tmpl.name}
                      </p>
                      <p className="text-[10px] text-[#9a9890]">{tmpl.sentFor}</p>
                    </div>

                    {/* Status badge */}
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        config.enabled
                          ? "bg-[#d4e8d8] text-[#2a5c38]"
                          : "bg-[#f5f4f2] text-[#9a9890]"
                      }`}
                    >
                      {config.enabled ? "On" : "Off"}
                    </span>

                    {/* Expand button */}
                    <button
                      type="button"
                      onClick={() =>
                        setExpanded((prev) =>
                          prev === tmpl.key ? null : tmpl.key
                        )
                      }
                      className="flex h-6 w-6 items-center justify-center rounded text-[#9a9890] hover:text-[#1a1814]"
                    >
                      {isExpanded ? (
                        <IconChevronUp size={14} />
                      ) : (
                        <IconChevronDown size={14} />
                      )}
                    </button>
                  </div>

                  {/* Expanded edit */}
                  {isExpanded && (
                    <div className="border-t border-[#e8e6e1] px-4 py-3 space-y-3 bg-[#faf9f7]">
                      <div>
                        <label className="mb-1 block text-[11px] font-medium text-[#9a9890]">
                          Subject override
                        </label>
                        <input
                          type="text"
                          value={config.subjectOverride}
                          onChange={(e) =>
                            updateTemplate(
                              tmpl.key,
                              "subjectOverride",
                              e.target.value
                            )
                          }
                          placeholder={tmpl.defaultSubject}
                          className="w-full rounded-lg border border-[#e8e6e1] px-3 py-2 text-[12px] text-[#1a1814] outline-none focus:border-[#C9A96E] bg-white"
                        />
                        <p className="mt-0.5 text-[10px] text-[#b0aea8]">
                          Leave blank to use the default subject
                        </p>
                      </div>
                      <div>
                        <label className="mb-1 block text-[11px] font-medium text-[#9a9890]">
                          Additional notes
                        </label>
                        <textarea
                          value={config.bodyNotes}
                          onChange={(e) =>
                            updateTemplate(tmpl.key, "bodyNotes", e.target.value)
                          }
                          placeholder="Any extra text to append to the email…"
                          rows={3}
                          className="w-full resize-none rounded-lg border border-[#e8e6e1] px-3 py-2 text-[12px] text-[#1a1814] outline-none focus:border-[#C9A96E] bg-white"
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
