"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin/bookings", label: "Bookings" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/services", label: "Services" },
  { href: "/admin/forms", label: "Forms" },
  { href: "/admin/settings", label: "Settings" },
];

export function AdminSidebar({ businessName }: { businessName: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <aside className="flex w-64 flex-col border-r border-[var(--color-border)] bg-white">
      <div className="border-b border-[var(--color-border)] px-6 py-4">
        <h1 className="text-lg font-semibold text-[var(--color-text)]">
          {businessName}
        </h1>
        <p className="text-xs text-[var(--color-text-light)]">Admin Dashboard</p>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "block rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  pathname.startsWith(item.href)
                    ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                    : "text-[var(--color-text-light)] hover:bg-gray-50 hover:text-[var(--color-text)]"
                )}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-[var(--color-border)] p-4">
        <button
          onClick={handleLogout}
          className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-[var(--color-text-light)] transition-colors hover:bg-gray-50 hover:text-red-600"
        >
          Log Out
        </button>
      </div>
    </aside>
  );
}
