"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  IconLayoutDashboard,
  IconCalendar,
  IconClipboardList,
  IconUsers,
  IconSparkles,
  IconChartBar,
  IconSettings,
  IconLogout,
  IconClock,
  IconReportAnalytics,
  IconBell,
  IconTag,
  IconFileInvoice,
  IconAdjustmentsHorizontal,
  IconForms,
  IconDotsVertical,
} from "@tabler/icons-react";

const navSections = [
  {
    label: "Main",
    items: [
      { href: "/admin", label: "Dashboard", icon: IconLayoutDashboard, exact: true },
      { href: "/admin/calendar", label: "Calendar", icon: IconCalendar },
      { href: "/admin/appointments", label: "Appointments", icon: IconClipboardList },
      { href: "/admin/clients", label: "Clients", icon: IconUsers },
      { href: "/admin/services", label: "Services", icon: IconSparkles },
      { href: "/admin/coupons", label: "Coupons", icon: IconTag },
    ],
  },
  {
    label: "Insights",
    items: [
      { href: "/admin/analytics", label: "Analytics", icon: IconChartBar },
      { href: "/admin/reports", label: "Reports", icon: IconReportAnalytics },
    ],
  },
  {
    label: "Configure",
    items: [
      { href: "/admin/availability", label: "Availability", icon: IconClock },
      { href: "/admin/notifications", label: "Notifications", icon: IconBell },
      { href: "/admin/settings", label: "Settings", icon: IconSettings, exact: true },
      { href: "/admin/invoices", label: "Invoices", icon: IconFileInvoice },
      { href: "/admin/settings/scheduling", label: "Sched. Limits", icon: IconAdjustmentsHorizontal },
      { href: "/admin/forms", label: "Intake Forms", icon: IconForms },
    ],
  },
];

const allNavItems = navSections.flatMap((s) => s.items);

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-[232px] flex-shrink-0 flex-col bg-[#1b1814]" style={{ minHeight: "100vh" }}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 pt-5 pb-4 border-b border-white/[0.07]">
          <div className="flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-[9px] bg-[#C9A96E]">
            <span className="text-[15px] font-semibold text-[#1b1814]">S</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[15px] font-semibold text-white leading-tight">Smoove</span>
            <span className="text-[11px] text-white/30 mt-0.5">Skin Studio</span>
          </div>
        </div>

        {/* Nav sections */}
        <nav className="flex-1 overflow-y-auto px-[10px] py-3">
          {navSections.map((section, si) => (
            <div key={section.label} className={si > 0 ? "mt-4" : ""}>
              <p className="px-2 py-2.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-white/[0.22] first:pt-0.5">
                {section.label}
              </p>
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href, item.exact);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`mb-0.5 flex items-center gap-[10px] rounded-[8px] px-[10px] py-[9px] text-[13.5px] font-normal transition-colors ${
                      active
                        ? "bg-[rgba(201,169,110,0.14)] text-[#C9A96E]"
                        : "text-white/50 hover:bg-white/[0.06] hover:text-white/[0.82]"
                    }`}
                  >
                    <Icon size={18} stroke={1.6} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}

          {/* Log out inside configure section */}
          <button
            onClick={handleLogout}
            className="mb-0.5 flex w-full items-center gap-[10px] rounded-[8px] px-[10px] py-[9px] text-[13.5px] font-normal text-white/50 transition-colors hover:bg-white/[0.06] hover:text-white/[0.82]"
          >
            <IconLogout size={18} stroke={1.6} />
            <span>Log out</span>
          </button>
        </nav>

        {/* User footer */}
        <div className="border-t border-white/[0.07] px-[10px] py-3">
          <div className="flex items-center gap-[10px] rounded-[8px] px-[10px] py-2 cursor-pointer hover:bg-white/[0.05]">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#C9A96E]">
              <span className="text-[13px] font-semibold text-[#1b1814]">A</span>
            </div>
            <div className="flex flex-1 flex-col min-w-0">
              <span className="text-[13px] font-medium text-white/[0.82] leading-tight">Anisha</span>
              <span className="text-[11px] text-white/[0.28]">Admin</span>
            </div>
            <IconDotsVertical size={15} stroke={1.8} className="text-white/25 flex-shrink-0" />
          </div>
        </div>
      </aside>

      {/* Mobile bottom tab bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex border-t border-[#2d2b26] bg-[#1a1814] md:hidden">
        {allNavItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 flex-col items-center justify-center py-2 gap-0.5 transition-colors ${
                active ? "text-[#C9A96E]" : "text-[#7a786e]"
              }`}
            >
              <Icon size={20} stroke={1.5} />
              <span className="text-[9px]">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
