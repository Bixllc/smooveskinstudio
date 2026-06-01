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
} from "@tabler/icons-react";

const navItems = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: IconLayoutDashboard,
    exact: true,
  },
  { href: "/admin/calendar", label: "Calendar", icon: IconCalendar },
  {
    href: "/admin/appointments",
    label: "Appointments",
    icon: IconClipboardList,
  },
  { href: "/admin/clients", label: "Clients", icon: IconUsers },
  { href: "/admin/services", label: "Services", icon: IconSparkles },
  { href: "/admin/analytics", label: "Analytics", icon: IconChartBar },
];

const bottomItems = [
  { href: "/admin/availability", label: "Availability", icon: IconClock },
  { href: "/admin/settings", label: "Settings", icon: IconSettings },
];

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

  const allNavItems = [...navItems, ...bottomItems];

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-[52px] flex-shrink-0 flex-col items-center bg-[#1a1814] py-3 gap-1.5">
        {/* Logo mark */}
        <div className="mb-2.5 flex h-7 w-7 items-center justify-center rounded-lg bg-[#C9A96E]">
          <span className="text-[11px] font-semibold text-[#1a1814]">S</span>
        </div>

        {/* Main nav */}
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
                active
                  ? "bg-[#2d2b26] text-[#C9A96E]"
                  : "text-[#7a786e] hover:bg-[#242220] hover:text-[#C9A96E]"
              }`}
            >
              <Icon size={18} stroke={1.6} />
            </Link>
          );
        })}

        {/* Bottom items */}
        <div className="mt-auto flex flex-col items-center gap-1.5">
          {bottomItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
                  active
                    ? "bg-[#2d2b26] text-[#C9A96E]"
                    : "text-[#7a786e] hover:bg-[#242220] hover:text-[#C9A96E]"
                }`}
              >
                <Icon size={18} stroke={1.6} />
              </Link>
            );
          })}
          <button
            onClick={handleLogout}
            title="Log out"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-[#7a786e] transition-colors hover:bg-[#242220] hover:text-red-400"
          >
            <IconLogout size={18} stroke={1.6} />
          </button>
          {/* Avatar */}
          <div className="flex h-7 w-7 items-center justify-center rounded-full border border-[#C9A96E55] bg-[#C9A96E22] text-[10px] font-semibold text-[#C9A96E]">
            A
          </div>
        </div>
      </aside>

      {/* Mobile bottom tab bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex border-t border-[#2d2b26] bg-[#1a1814] md:hidden">
        {allNavItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href, (item as any).exact);
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
