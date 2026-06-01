# Smoove Skin Studio Admin Portal Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the generic white admin UI with a premium Smoove-branded portal (dark sidebar, gold accents) and add Calendar, Clients, Analytics, and Availability pages.

**Architecture:** Keep existing Supabase auth + Prisma + API routes. Redesign the admin layout/sidebar. Add new pages alongside existing ones. Use React Query for interactive client pages. Recharts for analytics charts. Sonner for toasts.

**Tech Stack:** Next.js 14 App Router, TypeScript, Tailwind CSS, shadcn/ui, @tabler/icons-react, @tanstack/react-query, recharts, sonner, Prisma, Supabase Auth

---

## Chunk 1: Foundation

### Task 1: Install new packages

- [ ] **Step 1: Install dependencies**
```bash
cd /Users/sheneskawilliams/smooveskinstudio
npm install @tabler/icons-react @tanstack/react-query recharts sonner
```
Expected: packages added to node_modules, no peer dependency errors.

- [ ] **Step 2: Commit**
```bash
git add package.json package-lock.json
git commit -m "chore: add tabler icons, react-query, recharts, sonner"
```

---

### Task 2: Schema additions

**Files:**
- Modify: `prisma/schema.prisma` — add `isVip` and `adminNotes` to Customer, add Vajacial category in seed

- [ ] **Step 1: Add fields to Customer model in schema.prisma**

Add after `notes String?` in the Customer model:
```prisma
isVip           Boolean   @default(false)
adminNotes      String?
```

- [ ] **Step 2: Push schema changes**
```bash
npx prisma db push
npx prisma generate
```
Expected: Schema updated, client regenerated.

- [ ] **Step 3: Commit**
```bash
git add prisma/schema.prisma src/generated/
git commit -m "feat: add isVip and adminNotes to Customer"
```

---

### Task 3: New admin layout + sidebar

**Files:**
- Modify: `src/app/admin/(dashboard)/layout.tsx`
- Modify: `src/app/admin/(dashboard)/sidebar.tsx`
- Create: `src/components/admin/topbar.tsx`

- [ ] **Step 1: Replace layout.tsx**

```tsx
// src/app/admin/(dashboard)/layout.tsx
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";
import { AdminSidebar } from "./sidebar";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  return (
    <div className="flex min-h-screen bg-[#f5f4f2]">
      <AdminSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Replace sidebar.tsx**

```tsx
// src/app/admin/(dashboard)/sidebar.tsx
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
} from "@tabler/icons-react";
import Image from "next/image";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: IconLayoutDashboard, exact: true },
  { href: "/admin/calendar", label: "Calendar", icon: IconCalendar },
  { href: "/admin/appointments", label: "Appointments", icon: IconClipboardList },
  { href: "/admin/clients", label: "Clients", icon: IconUsers },
  { href: "/admin/services", label: "Services", icon: IconSparkles },
  { href: "/admin/analytics", label: "Analytics", icon: IconChartBar },
];

const bottomItems = [
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

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-[52px] flex-col items-center bg-[#1a1814] py-3 gap-1.5 flex-shrink-0">
        {/* Logo */}
        <div className="mb-2.5 flex h-7 w-7 items-center justify-center rounded-lg bg-[#C9A96E]">
          <span className="text-[11px] font-semibold text-[#1a1814]">S</span>
        </div>

        {/* Nav items */}
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
        {[...navItems.slice(0, 5)].map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 flex-col items-center justify-center py-2 text-[9px] gap-0.5 transition-colors ${
                active ? "text-[#C9A96E]" : "text-[#7a786e]"
              }`}
            >
              <Icon size={20} stroke={1.5} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
```

- [ ] **Step 3: Update dashboard page.tsx to not redirect, add a real page (placeholder for now)**

```tsx
// src/app/admin/(dashboard)/page.tsx — temporary placeholder until Task 6
export default function AdminHome() {
  return (
    <div className="p-6">
      <p className="text-sm text-gray-500">Dashboard coming in next task.</p>
    </div>
  );
}
```

- [ ] **Step 4: Add redirect from /admin/bookings to /admin/appointments**

Create `src/app/admin/(dashboard)/bookings/redirect.tsx` — actually just update the sidebar. The existing `/admin/bookings` routes keep working. The new appointments page will be separate. Add a redirect:

Create `src/app/admin/(dashboard)/appointments/page.tsx` with a note that it comes in Chunk 3.
```tsx
export default function AppointmentsPlaceholder() {
  return <div className="p-6 text-sm text-gray-500">Coming soon</div>;
}
```

- [ ] **Step 5: Verify the layout loads without errors**
```bash
npm run dev
```
Navigate to http://localhost:3000/admin — should show dark sidebar.

- [ ] **Step 6: Commit**
```bash
git add src/app/admin/ src/components/admin/
git commit -m "feat: redesign admin layout with dark sidebar + Tabler icons"
```

---

### Task 4: Seed additions (Vajacial category + mock clients/bookings)

**Files:**
- Modify: `prisma/seed.ts`

- [ ] **Step 1: Update seed.ts** — add Vajacial category, 10 mock customers, 2 weeks of bookings

Replace the `main()` function additions (keep existing client/settings/availability/categories/services logic, add after the existing code):

```ts
// After existing service seeding, add:

// Vajacial & Hydrojelly Masks category
const vajacial = await prisma.category.upsert({
  where: { id: "cat-vajacial" },
  update: { name: "Vajacial & Hydrojelly Masks" },
  create: {
    id: "cat-vajacial",
    clientId: client.id,
    name: "Vajacial & Hydrojelly Masks",
    displayOrder: 2,
  },
});

const vajacialServices = [
  { id: "svc-vajacial", name: "Vajacial", durationMinutes: 45, price: 75 },
  { id: "svc-hydrojelly", name: "Hydrojelly Mask", durationMinutes: 30, price: 55 },
  { id: "svc-vajacial-hydrojelly", name: "Vajacial + Hydrojelly Combo", durationMinutes: 60, price: 115 },
];
for (const svc of vajacialServices) {
  await upsertService(svc, client.id, vajacial.id);
}

// Mock customers
const mockCustomers = [
  { id: "cust-001", fullName: "Khloe Langston", email: "khloe@example.com", phone: "214-555-0101", isVip: true },
  { id: "cust-002", fullName: "Nakeisha Sealey", email: "nakeisha@example.com", phone: "817-555-0102", isVip: true },
  { id: "cust-003", fullName: "Tammy Rhodes", email: "tammy@example.com", phone: "214-555-0103", isVip: false },
  { id: "cust-004", fullName: "Lyndsey Barnes", email: "lyndsey@example.com", phone: "972-555-0104", isVip: false },
  { id: "cust-005", fullName: "Sarah Mitchell", email: "sarah@example.com", phone: "817-555-0105", isVip: false },
  { id: "cust-006", fullName: "Mikala Johnson", email: "mikala@example.com", phone: "214-555-0106", isVip: false },
  { id: "cust-007", fullName: "Ebony Pierce", email: "ebony@example.com", phone: "972-555-0107", isVip: false },
  { id: "cust-008", fullName: "Phylicia Davis", email: "phylicia@example.com", phone: "817-555-0108", isVip: false },
  { id: "cust-009", fullName: "Lashonda Turner", email: "lashonda@example.com", phone: "214-555-0109", isVip: false },
  { id: "cust-010", fullName: "Briana Wells", email: "briana@example.com", phone: "972-555-0110", isVip: false },
];

for (const c of mockCustomers) {
  await prisma.customer.upsert({
    where: { id: c.id },
    update: { isVip: c.isVip },
    create: { id: c.id, clientId: client.id, ...c },
  });
}

// Past bookings (last 2 weeks)
const now = new Date();
function daysAgo(d: number, hour: number) {
  const dt = new Date(now);
  dt.setDate(dt.getDate() - d);
  dt.setHours(hour, 0, 0, 0);
  return dt;
}
function daysAhead(d: number, hour: number) {
  const dt = new Date(now);
  dt.setDate(dt.getDate() + d);
  dt.setHours(hour, 0, 0, 0);
  return dt;
}

const mockBookings = [
  // Past confirmed
  { id: "bk-001", customerId: "cust-001", serviceId: "svc-brazilian-butt", start: daysAgo(14, 10), status: "CONFIRMED", paymentStatus: "PAID" },
  { id: "bk-002", customerId: "cust-002", serviceId: "svc-full-leg", start: daysAgo(13, 11), status: "CONFIRMED", paymentStatus: "PAID" },
  { id: "bk-003", customerId: "cust-003", serviceId: "svc-brow-combo", start: daysAgo(12, 14), status: "CONFIRMED", paymentStatus: "PAID" },
  { id: "bk-004", customerId: "cust-004", serviceId: "svc-vajacial", start: daysAgo(10, 9), status: "CONFIRMED", paymentStatus: "PAID" },
  { id: "bk-005", customerId: "cust-005", serviceId: "svc-underarm", start: daysAgo(9, 15), status: "NO_SHOW", paymentStatus: "UNPAID" },
  { id: "bk-006", customerId: "cust-001", serviceId: "svc-brazilian-butt", start: daysAgo(7, 10), status: "CONFIRMED", paymentStatus: "PAID" },
  { id: "bk-007", customerId: "cust-006", serviceId: "svc-hydrojelly", start: daysAgo(7, 13), status: "CANCELLED", paymentStatus: "REFUNDED" },
  { id: "bk-008", customerId: "cust-007", serviceId: "svc-brow-wax", start: daysAgo(5, 11), status: "CONFIRMED", paymentStatus: "PAID" },
  { id: "bk-009", customerId: "cust-008", serviceId: "svc-half-leg-lower", start: daysAgo(4, 14), status: "CONFIRMED", paymentStatus: "PAID" },
  { id: "bk-010", customerId: "cust-002", serviceId: "svc-brazilian-butt", start: daysAgo(3, 10), status: "CONFIRMED", paymentStatus: "PAID" },
  { id: "bk-011", customerId: "cust-009", serviceId: "svc-full-face", start: daysAgo(2, 15), status: "CANCELLED", paymentStatus: "UNPAID" },
  { id: "bk-012", customerId: "cust-003", serviceId: "svc-brow-tint", start: daysAgo(1, 11), status: "CONFIRMED", paymentStatus: "PAID" },
  // Upcoming
  { id: "bk-013", customerId: "cust-001", serviceId: "svc-brazilian-butt", start: daysAhead(1, 10), status: "CONFIRMED", paymentStatus: "PAID" },
  { id: "bk-014", customerId: "cust-004", serviceId: "svc-vajacial-hydrojelly", start: daysAhead(1, 13), status: "CONFIRMED", paymentStatus: "PAID" },
  { id: "bk-015", customerId: "cust-005", serviceId: "svc-full-leg", start: daysAhead(2, 11), status: "CONFIRMED", paymentStatus: "PAID" },
  { id: "bk-016", customerId: "cust-010", serviceId: "svc-brow-combo", start: daysAhead(3, 14), status: "CONFIRMED", paymentStatus: "PAID" },
  { id: "bk-017", customerId: "cust-006", serviceId: "svc-hydrojelly", start: daysAhead(4, 9), status: "CONFIRMED", paymentStatus: "PAID" },
  { id: "bk-018", customerId: "cust-002", serviceId: "svc-underarm", start: daysAhead(5, 15), status: "CONFIRMED", paymentStatus: "PAID" },
];

for (const bk of mockBookings) {
  const svc = await prisma.service.findUnique({ where: { id: bk.serviceId } });
  if (!svc) continue;
  const end = new Date(bk.start.getTime() + svc.durationMinutes * 60000);
  await prisma.booking.upsert({
    where: { id: bk.id },
    update: {},
    create: {
      id: bk.id,
      clientId: client.id,
      serviceId: bk.serviceId,
      customerId: bk.customerId,
      startTimeUtc: bk.start,
      endTimeUtc: end,
      status: bk.status as any,
      paymentStatus: bk.paymentStatus as any,
    },
  });
}
console.log("Mock customers + bookings seeded.");
```

- [ ] **Step 2: Run seed**
```bash
npx prisma db seed
```
Expected: "Mock customers + bookings seeded." with no errors.

- [ ] **Step 3: Commit**
```bash
git add prisma/seed.ts
git commit -m "feat: add vajacial category + mock clients and bookings to seed"
```

---

### Task 5: Create Smoove admin account

**Files:**
- Create: `scripts/create-smoove-admin.ts`

- [ ] **Step 1: Create the script**

```ts
// scripts/create-smoove-admin.ts
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // needs service role key
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

async function main() {
  // Get Smoove client ID
  const client = await prisma.client.findUnique({
    where: { slug: "smooveskinstudio" },
  });
  if (!client) throw new Error("Smoove client not found. Run seed first.");

  const email = process.argv[2];
  const password = process.argv[3];
  if (!email || !password) {
    throw new Error("Usage: npx tsx scripts/create-smoove-admin.ts <email> <password>");
  }

  // Create Supabase auth user with clientId in metadata
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { clientId: client.id },
  });

  if (error) throw error;
  console.log("Admin created:", data.user?.id, "→ clientId:", client.id);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

- [ ] **Step 2: Add SUPABASE_SERVICE_ROLE_KEY to .env.local**

The user must add this from their Supabase project → Settings → API → service_role key.

- [ ] **Step 3: Run the script**
```bash
npx tsx scripts/create-smoove-admin.ts anisha@smooveskinstudio.com <your-password>
```
Expected: "Admin created: <uuid> → clientId: <smoove-id>"

- [ ] **Step 4: Commit**
```bash
git add scripts/create-smoove-admin.ts
git commit -m "feat: add admin account creation script"
```

---

## Chunk 2: Dashboard + Calendar

### Task 6: Dashboard API + page

**Files:**
- Create: `src/app/api/admin/dashboard/route.ts`
- Modify: `src/app/admin/(dashboard)/page.tsx`

- [ ] **Step 1: Create dashboard API route**

```ts
// src/app/api/admin/dashboard/route.ts
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { startOfDay, endOfDay, startOfMonth, endOfMonth, subDays } from "date-fns";
import { toZonedTime, fromZonedTime } from "date-fns-tz";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const settings = await prisma.businessSettings.findUnique({
    where: { clientId: session.clientId },
    select: { timezone: true },
  });
  const tz = settings?.timezone ?? "America/Chicago";

  const nowUtc = new Date();
  const nowLocal = toZonedTime(nowUtc, tz);
  const todayStart = fromZonedTime(startOfDay(nowLocal), tz);
  const todayEnd = fromZonedTime(endOfDay(nowLocal), tz);
  const monthStart = fromZonedTime(startOfMonth(nowLocal), tz);
  const monthEnd = fromZonedTime(endOfMonth(nowLocal), tz);

  const [todayBookings, monthBookings, nextAppt, last30Days] = await Promise.all([
    // Today's confirmed bookings
    prisma.booking.findMany({
      where: {
        clientId: session.clientId,
        startTimeUtc: { gte: todayStart, lte: todayEnd },
        status: { in: ["CONFIRMED", "COMPLETED"] },
      },
      include: {
        customer: { select: { fullName: true } },
        service: { select: { name: true, price: true, category: { select: { name: true } } } },
      },
      orderBy: { startTimeUtc: "asc" },
    }),

    // This month's bookings for revenue + stats
    prisma.booking.findMany({
      where: {
        clientId: session.clientId,
        startTimeUtc: { gte: monthStart, lte: monthEnd },
        status: { in: ["CONFIRMED", "COMPLETED"] },
      },
      include: { service: { select: { price: true } } },
    }),

    // Next upcoming appointment (after now)
    prisma.booking.findFirst({
      where: {
        clientId: session.clientId,
        startTimeUtc: { gt: nowUtc },
        status: "CONFIRMED",
      },
      include: {
        customer: { select: { fullName: true } },
        service: { select: { name: true, category: { select: { name: true } } } },
      },
      orderBy: { startTimeUtc: "asc" },
    }),

    // Last 30 days daily revenue (for sparkline)
    prisma.booking.findMany({
      where: {
        clientId: session.clientId,
        startTimeUtc: { gte: subDays(nowUtc, 30) },
        status: { in: ["CONFIRMED", "COMPLETED"] },
      },
      select: { startTimeUtc: true, service: { select: { price: true } } },
    }),
  ]);

  const todayRevenue = todayBookings.reduce((s, b) => s + Number(b.service.price), 0);
  const mtdRevenue = monthBookings.reduce((s, b) => s + Number(b.service.price), 0);

  const cancellations = await prisma.booking.count({
    where: { clientId: session.clientId, startTimeUtc: { gte: monthStart }, status: "CANCELLED" },
  });
  const noShows = await prisma.booking.count({
    where: { clientId: session.clientId, startTimeUtc: { gte: monthStart }, status: "NO_SHOW" },
  });

  // Build daily sparkline
  const dailyMap: Record<string, number> = {};
  for (const b of last30Days) {
    const day = toZonedTime(b.startTimeUtc, tz).toISOString().slice(0, 10);
    dailyMap[day] = (dailyMap[day] ?? 0) + Number(b.service.price);
  }
  const sparkline = Array.from({ length: 30 }, (_, i) => {
    const d = subDays(nowUtc, 29 - i);
    const key = toZonedTime(d, tz).toISOString().slice(0, 10);
    return { date: key, revenue: dailyMap[key] ?? 0 };
  });

  return NextResponse.json({
    todayBookings,
    todayRevenue,
    mtdRevenue,
    monthBookingCount: monthBookings.length,
    cancellations,
    noShows,
    nextAppt,
    sparkline,
    timezone: tz,
  });
}
```

- [ ] **Step 2: Replace dashboard page.tsx**

```tsx
// src/app/admin/(dashboard)/page.tsx
import { getAdminSession } from "@/lib/admin-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { DashboardClient } from "./dashboard-client";

export default async function AdminDashboard() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const [settings, data] = await Promise.all([
    prisma.businessSettings.findUnique({
      where: { clientId: session.clientId },
      select: { timezone: true, businessName: true },
    }),
    fetch(`${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/admin/dashboard`, {
      cache: "no-store",
      headers: { cookie: "" }, // server-side fetch won't carry cookies
    }).then(r => r.json()).catch(() => null),
  ]);

  // Better: do DB queries directly in the server component
  const tz = settings?.timezone ?? "America/Chicago";
  const nowUtc = new Date();
  const nowLocal = toZonedTime(nowUtc, tz);
  const greeting = nowLocal.getHours() < 12 ? "Good morning" : nowLocal.getHours() < 17 ? "Good afternoon" : "Good evening";
  const dateLabel = format(nowLocal, "EEEE, MMM d");

  return <DashboardClient greeting={greeting} dateLabel={dateLabel} tz={tz} />;
}
```

- [ ] **Step 3: Create dashboard-client.tsx**

```tsx
// src/app/admin/(dashboard)/dashboard-client.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { IconPlus } from "@tabler/icons-react";
import { SkeletonCard } from "@/components/admin/skeleton-card";

// Category → color mapping
function getCategoryColor(name: string): { dot: string; badge: string; text: string } {
  const n = name.toLowerCase();
  if (n.includes("brow")) return { dot: "bg-[#C9A96E]", badge: "bg-[#f0e8d4]", text: "text-[#7a5c1a]" };
  if (n.includes("vajacial") || n.includes("hydrojelly") || n.includes("mask")) return { dot: "bg-[#6ea07c]", badge: "bg-[#d4e8d8]", text: "text-[#2a5c38]" };
  return { dot: "bg-[#c97c6e]", badge: "bg-[#f0d4cf]", text: "text-[#7a2f22]" };
}

export function DashboardClient({ greeting, dateLabel, tz }: { greeting: string; dateLabel: string; tz: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => fetch("/api/admin/dashboard").then(r => r.json()),
    refetchInterval: 60_000,
  });

  const todayCount = data?.todayBookings?.length ?? 0;

  return (
    <div className="flex flex-col overflow-hidden">
      {/* Topbar */}
      <div className="flex h-11 flex-shrink-0 items-center border-b border-[#e8e6e1] bg-white px-4 gap-3">
        <div className="flex-1">
          <p className="text-sm font-medium text-[#1a1814]">{greeting}, Anisha ✨</p>
          <p className="text-xs text-[#9a9890]">{dateLabel} · {todayCount} appointment{todayCount !== 1 ? "s" : ""} today</p>
        </div>
        <button className="flex h-[26px] items-center gap-1 rounded-full bg-[#C9A96E] px-2.5 text-[11px] font-medium text-[#1a1814]">
          <IconPlus size={11} /> New booking
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-3.5 space-y-3 pb-20 md:pb-3.5">
        {/* Stats row */}
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          ) : (
            <>
              <StatCard label="Today's revenue" value={`$${(data?.todayRevenue ?? 0).toFixed(0)}`} gold />
              <StatCard label="Bookings this month" value={String(data?.monthBookingCount ?? 0)} />
              <StatCard label="Cancellations" value={String(data?.cancellations ?? 0)} />
              <StatCard label="MTD revenue" value={`$${(data?.mtdRevenue ?? 0).toFixed(0)}`} gold />
            </>
          )}
        </div>

        {/* Next appointment */}
        {isLoading ? (
          <SkeletonCard tall />
        ) : data?.nextAppt ? (
          <NextApptCard appt={data.nextAppt} tz={tz} />
        ) : (
          <div className="rounded-lg border border-[#e8e6e1] bg-white p-4 text-center text-sm text-[#9a9890]">
            No upcoming appointments — enjoy the break ✨
          </div>
        )}

        {/* Rest of today */}
        {!isLoading && data?.todayBookings?.length > 0 && (
          <div>
            <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-[#9a9890]">Today's schedule</p>
            <div className="space-y-1">
              {data.todayBookings.map((b: any) => {
                const colors = getCategoryColor(b.service.category.name);
                const time = format(toZonedTime(new Date(b.startTimeUtc), tz), "h:mm a");
                return (
                  <div key={b.id} className="flex items-center gap-2 rounded-lg border border-[#e8e6e1] bg-white px-2 py-1.5">
                    <span className={`h-[7px] w-[7px] flex-shrink-0 rounded-full ${colors.dot}`} />
                    <span className="w-[52px] text-[11px] text-[#9a9890]">{time}</span>
                    <span className="flex-1 text-[12px] font-medium text-[#1a1814]">{b.customer.fullName}</span>
                    <span className="text-[11px] text-[#9a9890]">{b.service.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, gold }: { label: string; value: string; gold?: boolean }) {
  return (
    <div className="rounded-lg border border-[#e8e6e1] bg-white p-3">
      <p className="mb-1 text-[11px] text-[#9a9890]">{label}</p>
      <p className={`text-xl font-medium leading-none ${gold ? "text-[#C9A96E]" : "text-[#1a1814]"}`}>{value}</p>
    </div>
  );
}

function NextApptCard({ appt, tz }: { appt: any; tz: string }) {
  const local = toZonedTime(new Date(appt.startTimeUtc), tz);
  const colors = getCategoryColor(appt.service.category.name);
  return (
    <div className="flex items-center gap-3 rounded-lg border border-[#e8e6e1] bg-white p-3">
      <div className="flex min-w-[48px] flex-col items-center justify-center rounded-lg border border-[#C9A96E44] bg-[#C9A96E18] p-1.5">
        <span className="text-base font-medium leading-none text-[#C9A96E]">{format(local, "h")}</span>
        <span className="text-[10px] text-[#C9A96E99]">{format(local, ":mm a")}</span>
      </div>
      <div className="flex-1">
        <p className="text-[13px] font-medium text-[#1a1814]">{appt.customer.fullName}</p>
        <p className="text-[11px] text-[#9a9890]">{appt.service.name}</p>
      </div>
      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${colors.badge} ${colors.text}`}>
        {appt.service.category.name}
      </span>
    </div>
  );
}
```

- [ ] **Step 4: Create skeleton component**

```tsx
// src/components/admin/skeleton-card.tsx
export function SkeletonCard({ tall }: { tall?: boolean }) {
  return (
    <div className={`animate-pulse rounded-lg border border-[#e8e6e1] bg-white p-3 ${tall ? "h-20" : "h-16"}`}>
      <div className="mb-2 h-2 w-1/2 rounded bg-[#f0ede8]" />
      <div className="h-6 w-1/3 rounded bg-[#f0ede8]" />
    </div>
  );
}
```

- [ ] **Step 5: Wrap admin layout with QueryClientProvider**

```tsx
// src/app/admin/providers.tsx
"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { Toaster } from "sonner";

export function AdminProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster position="bottom-right" duration={3000} />
    </QueryClientProvider>
  );
}
```

Update `src/app/admin/(dashboard)/layout.tsx` to wrap with AdminProviders:
```tsx
import { AdminProviders } from "../providers";
// wrap: <AdminProviders>{children}</AdminProviders>
```

- [ ] **Step 6: Verify dashboard loads with real data**

Run `npm run dev`, navigate to /admin. Should see stats cards and next appointment.

- [ ] **Step 7: Commit**
```bash
git add src/app/admin/ src/components/admin/ src/app/api/admin/dashboard/
git commit -m "feat: add dashboard page with real stats and next appointment card"
```

---

### Task 7: Calendar API + page

**Files:**
- Create: `src/app/api/admin/calendar/route.ts`
- Create: `src/app/admin/(dashboard)/calendar/page.tsx`

- [ ] **Step 1: Calendar API route**

```ts
// src/app/api/admin/calendar/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { startOfWeek, endOfWeek, addDays } from "date-fns";
import { fromZonedTime, toZonedTime } from "date-fns-tz";

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const dateParam = searchParams.get("date") ?? new Date().toISOString();

  const settings = await prisma.businessSettings.findUnique({
    where: { clientId: session.clientId },
    select: { timezone: true },
  });
  const tz = settings?.timezone ?? "America/Chicago";

  const localDate = toZonedTime(new Date(dateParam), tz);
  const weekStart = startOfWeek(localDate, { weekStartsOn: 1 }); // Mon
  const weekEnd = endOfWeek(localDate, { weekStartsOn: 1 });

  const bookings = await prisma.booking.findMany({
    where: {
      clientId: session.clientId,
      startTimeUtc: {
        gte: fromZonedTime(weekStart, tz),
        lte: fromZonedTime(weekEnd, tz),
      },
      status: { notIn: ["CANCELLED"] },
    },
    include: {
      customer: { select: { fullName: true } },
      service: { select: { name: true, durationMinutes: true, category: { select: { name: true } } } },
    },
    orderBy: { startTimeUtc: "asc" },
  });

  const blockedTimes = await prisma.blockedTime.findMany({
    where: {
      clientId: session.clientId,
      startTimeUtc: { gte: fromZonedTime(weekStart, tz) },
      endTimeUtc: { lte: fromZonedTime(weekEnd, tz) },
    },
  });

  return NextResponse.json({ bookings, blockedTimes, timezone: tz });
}
```

- [ ] **Step 2: Calendar page**

```tsx
// src/app/admin/(dashboard)/calendar/page.tsx
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, addDays, startOfWeek, addWeeks, subWeeks, isSameDay } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { AppointmentDrawer } from "@/components/admin/appointment-drawer";

// 9 AM to 7 PM = 20 half-hour slots
const HOUR_START = 9;
const HOUR_END = 19;
const SLOTS = (HOUR_END - HOUR_START) * 2; // 20 slots, each 30 min
const SLOT_H = 36; // px per 30 min

function getCategoryStyle(name: string) {
  const n = name.toLowerCase();
  if (n.includes("brow")) return "bg-[#f0e8d4] text-[#7a5c1a] border-l-[#C9A96E]";
  if (n.includes("vajacial") || n.includes("mask")) return "bg-[#d4e8d8] text-[#2a5c38] border-l-[#6ea07c]";
  return "bg-[#f0d4cf] text-[#7a2f22] border-l-[#c97c6e]";
}

export default function CalendarPage() {
  const [weekOf, setWeekOf] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [drawerBooking, setDrawerBooking] = useState<any>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["calendar", weekOf.toISOString()],
    queryFn: () => fetch(`/api/admin/calendar?date=${weekOf.toISOString()}`).then(r => r.json()),
  });

  const tz = data?.timezone ?? "America/Chicago";
  const days = Array.from({ length: 6 }, (_, i) => addDays(weekOf, i)); // Mon–Sat

  // Group bookings by local day
  function bookingsForDay(day: Date) {
    return (data?.bookings ?? []).filter((b: any) => {
      const local = toZonedTime(new Date(b.startTimeUtc), tz);
      return isSameDay(local, day);
    });
  }

  function topPx(b: any) {
    const local = toZonedTime(new Date(b.startTimeUtc), tz);
    const minutesFromStart = (local.getHours() - HOUR_START) * 60 + local.getMinutes();
    return Math.max(0, (minutesFromStart / 30) * SLOT_H);
  }

  function heightPx(b: any) {
    return Math.max(SLOT_H, (b.service.durationMinutes / 30) * SLOT_H);
  }

  const today = new Date();

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      {/* Topbar */}
      <div className="flex h-11 flex-shrink-0 items-center gap-3 border-b border-[#e8e6e1] bg-white px-4">
        <span className="text-sm font-medium text-[#1a1814]">Calendar</span>
        <div className="flex-1" />
        <button onClick={() => setWeekOf(w => subWeeks(w, 1))} className="flex h-[26px] w-[26px] items-center justify-center rounded-full border border-[#e8e6e1] text-[#9a9890] hover:border-[#C9A96E] hover:text-[#C9A96E]">
          <IconChevronLeft size={14} />
        </button>
        <span className="text-[11px] font-medium text-[#1a1814]">
          {format(weekOf, "MMM d")} – {format(addDays(weekOf, 5), "MMM d, yyyy")}
        </span>
        <button onClick={() => setWeekOf(w => addWeeks(w, 1))} className="flex h-[26px] w-[26px] items-center justify-center rounded-full border border-[#e8e6e1] text-[#9a9890] hover:border-[#C9A96E] hover:text-[#C9A96E]">
          <IconChevronRight size={14} />
        </button>
        <button onClick={() => setWeekOf(startOfWeek(new Date(), { weekStartsOn: 1 }))} className="h-[26px] rounded-full border border-[#e8e6e1] px-2.5 text-[11px] text-[#9a9890] hover:border-[#C9A96E] hover:text-[#C9A96E]">
          Today
        </button>
      </div>

      {/* Calendar grid */}
      <div className="flex flex-1 overflow-hidden">
        {/* Time column */}
        <div className="w-11 flex-shrink-0 border-r border-[#e8e6e1] bg-white">
          <div className="h-8 border-b border-[#e8e6e1]" /> {/* header spacer */}
          {Array.from({ length: SLOTS }, (_, i) => {
            const hour = HOUR_START + Math.floor(i / 2);
            const isHour = i % 2 === 0;
            const label = isHour ? format(new Date().setHours(hour, 0), "h a") : "";
            return (
              <div key={i} className="flex items-start justify-end pr-1.5 text-[9px] text-[#b0ae a8]" style={{ height: SLOT_H }}>
                {label}
              </div>
            );
          })}
        </div>

        {/* Day columns */}
        <div className="flex flex-1 overflow-x-auto">
          {days.map((day) => {
            const isToday = isSameDay(day, today);
            const dayBookings = bookingsForDay(day);
            return (
              <div key={day.toISOString()} className="flex min-w-0 flex-1 flex-col border-r border-[#e8e6e1] last:border-r-0">
                {/* Day header */}
                <div className={`flex h-8 flex-shrink-0 flex-col items-center justify-center border-b border-[#e8e6e1] ${isToday ? "bg-[#C9A96E08]" : "bg-white"}`}>
                  <span className={`text-[10px] font-medium ${isToday ? "text-[#C9A96E]" : "text-[#9a9890]"}`}>
                    {format(day, "EEE d")}
                  </span>
                </div>

                {/* Slots */}
                <div className={`relative flex-1 ${isToday ? "bg-[#C9A96E05]" : ""}`}>
                  {Array.from({ length: SLOTS }, (_, i) => (
                    <div key={i} className="border-t border-[#e8e6e1]" style={{ height: SLOT_H }} />
                  ))}

                  {/* Appointment events */}
                  {dayBookings.map((b: any) => (
                    <button
                      key={b.id}
                      onClick={() => setDrawerBooking(b)}
                      className={`absolute left-0.5 right-0.5 rounded overflow-hidden text-left px-1 py-0.5 text-[9px] font-medium leading-tight border-l-2 ${getCategoryStyle(b.service.category.name)}`}
                      style={{ top: topPx(b), height: heightPx(b) - 2 }}
                    >
                      <div className="truncate">{b.customer.fullName}</div>
                      <div className="truncate opacity-80">{b.service.name}</div>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Appointment drawer */}
      {drawerBooking && (
        <AppointmentDrawer
          booking={drawerBooking}
          timezone={tz}
          onClose={() => setDrawerBooking(null)}
          onAction={refetch}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 3: Create AppointmentDrawer component**

```tsx
// src/components/admin/appointment-drawer.tsx
"use client";

import { useState } from "react";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { IconX } from "@tabler/icons-react";
import { toast } from "sonner";

export function AppointmentDrawer({
  booking,
  timezone,
  onClose,
  onAction,
}: {
  booking: any;
  timezone: string;
  onClose: () => void;
  onAction: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const local = toZonedTime(new Date(booking.startTimeUtc), timezone);

  async function updateStatus(status: string) {
    setLoading(true);
    const res = await fetch(`/api/admin/bookings/${booking.id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      toast.success(`Appointment marked as ${status.toLowerCase().replace("_", " ")}`);
      onAction();
      onClose();
    } else {
      toast.error("Failed to update status");
    }
    setLoading(false);
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/20" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed right-0 top-0 z-50 flex h-full w-[280px] flex-col bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-[#e8e6e1] px-4 py-3">
          <p className="text-[13px] font-medium text-[#1a1814]">{booking.customer.fullName}</p>
          <button onClick={onClose} className="text-[#9a9890] hover:text-[#1a1814]">
            <IconX size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-4 space-y-3">
          <DrawerRow label="Service" value={booking.service.name} />
          <DrawerRow label="Time" value={`${format(local, "h:mm a")} · ${booking.service.durationMinutes} min`} />
          <DrawerRow label="Date" value={format(local, "EEEE, MMM d")} />
          <DrawerRow label="Status" value={booking.status.replace("_", " ")} />
          {booking.customer.email && (
            <DrawerRow label="Email" value={booking.customer.email} />
          )}
          {booking.customer.phone && (
            <DrawerRow label="Phone" value={booking.customer.phone} />
          )}
        </div>

        <div className="border-t border-[#e8e6e1] p-4 space-y-2">
          <button
            onClick={() => updateStatus("CONFIRMED")}
            disabled={loading || booking.status === "CONFIRMED"}
            className="w-full rounded-lg border border-[#C9A96E55] bg-[#C9A96E18] py-2 text-[12px] font-medium text-[#7a5c1a] disabled:opacity-50"
          >
            Confirm
          </button>
          <button
            onClick={() => updateStatus("COMPLETED")}
            disabled={loading || booking.status === "COMPLETED"}
            className="w-full rounded-lg border border-[#e8e6e1] py-2 text-[12px] font-medium text-[#1a1814] disabled:opacity-50"
          >
            Mark Complete
          </button>
          <button
            onClick={() => updateStatus("NO_SHOW")}
            disabled={loading}
            className="w-full rounded-lg border border-[#e8e6e1] py-2 text-[12px] font-medium text-[#9a9890] disabled:opacity-50"
          >
            Mark No-Show
          </button>
          <button
            onClick={() => updateStatus("CANCELLED")}
            disabled={loading}
            className="w-full rounded-lg border border-[#f0c0c0] bg-[#fce8e8] py-2 text-[12px] font-medium text-[#8c2020] disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </>
  );
}

function DrawerRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-[#e8e6e1] py-1.5">
      <span className="text-[10px] text-[#9a9890]">{label}</span>
      <span className="text-[11px] text-[#1a1814]">{value}</span>
    </div>
  );
}
```

- [ ] **Step 4: Verify calendar renders with bookings**

Navigate to /admin/calendar — should see week grid with color-coded appointment blocks.

- [ ] **Step 5: Commit**
```bash
git add src/app/admin/(dashboard)/calendar/ src/app/api/admin/calendar/ src/components/admin/
git commit -m "feat: add calendar page with week view and appointment drawer"
```

---

## Chunk 3: Appointments + Clients

### Task 8: Appointments page

**Files:**
- Create: `src/app/admin/(dashboard)/appointments/page.tsx`
- Create: `src/app/api/admin/appointments/route.ts`

- [ ] **Step 1: Appointments API route**

```ts
// src/app/api/admin/appointments/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const tab = searchParams.get("tab") ?? "upcoming"; // upcoming | past | cancelled
  const search = searchParams.get("search") ?? "";

  const now = new Date();
  const where: any = { clientId: session.clientId };

  if (tab === "upcoming") {
    where.startTimeUtc = { gte: now };
    where.status = { in: ["CONFIRMED", "PENDING_PAYMENT"] };
  } else if (tab === "past") {
    where.startTimeUtc = { lt: now };
    where.status = { in: ["CONFIRMED", "COMPLETED", "NO_SHOW"] };
  } else if (tab === "cancelled") {
    where.status = "CANCELLED";
  }

  if (search) {
    where.customer = {
      OR: [
        { fullName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ],
    };
  }

  const bookings = await prisma.booking.findMany({
    where,
    include: {
      customer: { select: { fullName: true, email: true, phone: true } },
      service: { select: { name: true, durationMinutes: true, price: true, category: { select: { name: true } } } },
    },
    orderBy: { startTimeUtc: tab === "upcoming" ? "asc" : "desc" },
    take: 100,
  });

  const settings = await prisma.businessSettings.findUnique({
    where: { clientId: session.clientId },
    select: { timezone: true },
  });

  return NextResponse.json({ bookings, timezone: settings?.timezone ?? "America/Chicago" });
}
```

- [ ] **Step 2: Appointments page**

```tsx
// src/app/admin/(dashboard)/appointments/page.tsx
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { IconSearch } from "@tabler/icons-react";
import { AppointmentDrawer } from "@/components/admin/appointment-drawer";

type Tab = "upcoming" | "past" | "cancelled";

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    CONFIRMED: "bg-[#eaf3de] text-[#3B6D11]",
    COMPLETED: "bg-[#eaf3de] text-[#3B6D11]",
    CANCELLED: "bg-[#fce8e8] text-[#8c2020]",
    NO_SHOW: "bg-[#f0e8d4] text-[#7a5c1a]",
    PENDING_PAYMENT: "bg-[#f5f4f2] text-[#9a9890] border border-[#e8e6e1]",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${map[status] ?? ""}`}>
      {status.replace("_", " ")}
    </span>
  );
}

export default function AppointmentsPage() {
  const [tab, setTab] = useState<Tab>("upcoming");
  const [search, setSearch] = useState("");
  const [drawer, setDrawer] = useState<any>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["appointments", tab, search],
    queryFn: () => fetch(`/api/admin/appointments?tab=${tab}&search=${encodeURIComponent(search)}`).then(r => r.json()),
  });

  const tz = data?.timezone ?? "America/Chicago";

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      {/* Topbar */}
      <div className="flex h-11 flex-shrink-0 items-center gap-3 border-b border-[#e8e6e1] bg-white px-4">
        <span className="text-sm font-medium text-[#1a1814]">Appointments</span>
        <div className="flex flex-1 items-center gap-1.5 rounded-lg border border-[#e8e6e1] px-2.5 max-w-[200px]">
          <IconSearch size={12} className="text-[#9a9890]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search clients…"
            className="flex-1 bg-transparent text-[12px] text-[#1a1814] outline-none placeholder:text-[#b0aea8]"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-[#e8e6e1] bg-white px-4">
        {(["upcoming", "past", "cancelled"] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`h-[30px] border-b-2 px-3.5 text-[11px] font-medium capitalize transition-colors ${
              tab === t ? "border-[#C9A96E] text-[#C9A96E]" : "border-transparent text-[#9a9890]"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto pb-20 md:pb-0">
        {isLoading ? (
          <div className="p-4 space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-10 animate-pulse rounded-lg bg-[#f5f4f2]" />
            ))}
          </div>
        ) : data?.bookings?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-sm text-[#9a9890]">No {tab} appointments</p>
            {tab === "upcoming" && <p className="mt-1 text-xs text-[#b0aea8]">Enjoy the break ✨</p>}
          </div>
        ) : (
          <table className="w-full border-collapse text-[11px]">
            <thead>
              <tr>
                {["Client", "Service", "Date & Time", "Duration", "Price", "Status"].map(h => (
                  <th key={h} className="border-b border-[#e8e6e1] bg-white px-3 py-2 text-left text-[10px] font-medium text-[#9a9890]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data?.bookings?.map((b: any) => {
                const local = toZonedTime(new Date(b.startTimeUtc), tz);
                return (
                  <tr
                    key={b.id}
                    onClick={() => setDrawer(b)}
                    className="cursor-pointer border-b border-[#e8e6e1] bg-white hover:bg-[#f5f4f2]"
                  >
                    <td className="px-3 py-2 font-medium text-[#1a1814]">{b.customer.fullName}</td>
                    <td className="px-3 py-2 text-[#9a9890]">{b.service.name}</td>
                    <td className="px-3 py-2 text-[#9a9890]">{format(local, "MMM d · h:mm a")}</td>
                    <td className="px-3 py-2 text-[#9a9890]">{b.service.durationMinutes} min</td>
                    <td className="px-3 py-2 font-medium text-[#C9A96E]">${Number(b.service.price).toFixed(0)}</td>
                    <td className="px-3 py-2"><StatusBadge status={b.status} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {drawer && (
        <AppointmentDrawer
          booking={drawer}
          timezone={tz}
          onClose={() => setDrawer(null)}
          onAction={() => { refetch(); setDrawer(null); }}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 3: Commit**
```bash
git add src/app/admin/(dashboard)/appointments/ src/app/api/admin/appointments/
git commit -m "feat: add appointments page with tabs, search, and drawer"
```

---

### Task 9: Clients API + pages

**Files:**
- Create: `src/app/api/admin/clients/route.ts`
- Create: `src/app/api/admin/clients/[clientId]/route.ts`
- Create: `src/app/admin/(dashboard)/clients/page.tsx`
- Create: `src/app/admin/(dashboard)/clients/[clientId]/page.tsx`

- [ ] **Step 1: Clients list API**

```ts
// src/app/api/admin/clients/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") ?? "";

  const customers = await prisma.customer.findMany({
    where: {
      clientId: session.clientId,
      ...(search ? {
        OR: [
          { fullName: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      } : {}),
    },
    include: {
      bookings: {
        where: { status: { in: ["CONFIRMED", "COMPLETED"] } },
        include: { service: { select: { price: true, name: true } } },
        orderBy: { startTimeUtc: "desc" },
      },
    },
    orderBy: [{ isVip: "desc" }, { fullName: "asc" }],
  });

  const result = customers.map(c => ({
    id: c.id,
    fullName: c.fullName,
    email: c.email,
    phone: c.phone,
    isVip: c.isVip,
    totalVisits: c.bookings.length,
    totalSpend: c.bookings.reduce((s, b) => s + Number(b.service.price), 0),
    lastVisit: c.bookings[0]?.startTimeUtc ?? null,
    favService: (() => {
      const counts: Record<string, number> = {};
      for (const b of c.bookings) counts[b.service.name] = (counts[b.service.name] ?? 0) + 1;
      return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
    })(),
  }));

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const customer = await prisma.customer.create({
    data: {
      clientId: session.clientId,
      fullName: body.fullName,
      email: body.email,
      phone: body.phone ?? null,
    },
  });
  return NextResponse.json(customer, { status: 201 });
}
```

- [ ] **Step 2: Client detail API**

```ts
// src/app/api/admin/clients/[clientId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ clientId: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { clientId } = await params;
  const customer = await prisma.customer.findFirst({
    where: { id: clientId, clientId: session.clientId },
    include: {
      bookings: {
        include: { service: { select: { name: true, price: true, durationMinutes: true, category: { select: { name: true } } } } },
        orderBy: { startTimeUtc: "desc" },
      },
    },
  });

  if (!customer) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const settings = await prisma.businessSettings.findUnique({
    where: { clientId: session.clientId },
    select: { timezone: true },
  });

  return NextResponse.json({ ...customer, timezone: settings?.timezone ?? "America/Chicago" });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ clientId: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { clientId } = await params;
  const body = await req.json();

  const customer = await prisma.customer.updateMany({
    where: { id: clientId, clientId: session.clientId },
    data: {
      ...(body.adminNotes !== undefined ? { adminNotes: body.adminNotes } : {}),
      ...(body.isVip !== undefined ? { isVip: body.isVip } : {}),
    },
  });

  return NextResponse.json({ updated: customer.count });
}
```

- [ ] **Step 3: Clients list page**

```tsx
// src/app/admin/(dashboard)/clients/page.tsx
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { IconSearch, IconUserPlus, IconStar } from "@tabler/icons-react";
import Link from "next/link";

const AVATAR_COLORS = ["bg-[#f0d4cf] text-[#7a2f22]","bg-[#d4e8d8] text-[#2a5c38]","bg-[#f0e8d4] text-[#7a5c1a]","bg-[#d4d8f0] text-[#2a2c7a]","bg-[#e8d4f0] text-[#5a2a7a]"];

function initials(name: string) {
  return name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
}

export default function ClientsPage() {
  const [search, setSearch] = useState("");

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ["clients", search],
    queryFn: () => fetch(`/api/admin/clients?search=${encodeURIComponent(search)}`).then(r => r.json()),
  });

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      {/* Topbar */}
      <div className="flex h-11 flex-shrink-0 items-center gap-3 border-b border-[#e8e6e1] bg-white px-4">
        <span className="text-sm font-medium text-[#1a1814]">Clients</span>
        <div className="flex flex-1 items-center gap-1.5 rounded-lg border border-[#e8e6e1] px-2.5 max-w-[220px]">
          <IconSearch size={12} className="text-[#9a9890]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search clients…"
            className="flex-1 bg-transparent text-[12px] text-[#1a1814] outline-none placeholder:text-[#b0aea8]"
          />
        </div>
        <div className="flex-1" />
        <button className="flex h-[26px] items-center gap-1 rounded-full bg-[#C9A96E] px-2.5 text-[11px] font-medium text-[#1a1814]">
          <IconUserPlus size={11} /> Add client
        </button>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto pb-20 md:pb-0">
        {isLoading ? (
          <div className="p-4 space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-10 animate-pulse rounded-lg bg-[#f5f4f2]" />
            ))}
          </div>
        ) : clients.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-sm text-[#9a9890]">No clients found</p>
          </div>
        ) : (
          <table className="w-full border-collapse text-[11px]">
            <thead>
              <tr>
                {["Client","Last visit","Visits","Total spend","Fav service",""].map(h => (
                  <th key={h} className="border-b border-[#e8e6e1] bg-white px-3 py-2 text-left text-[10px] font-medium text-[#9a9890]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {clients.map((c: any, idx: number) => (
                <tr key={c.id} className="border-b border-[#e8e6e1] bg-white hover:bg-[#f5f4f2]">
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex h-[22px] w-[22px] items-center justify-center rounded-full text-[9px] font-medium ${AVATAR_COLORS[idx % AVATAR_COLORS.length]}`}>
                        {initials(c.fullName)}
                      </span>
                      <Link href={`/admin/clients/${c.id}`} className="font-medium text-[#1a1814] hover:text-[#C9A96E]">
                        {c.fullName}
                      </Link>
                      {c.isVip && <IconStar size={10} className="text-[#C9A96E] fill-[#C9A96E]" />}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-[#9a9890]">
                    {c.lastVisit ? format(new Date(c.lastVisit), "MMM d") : "—"}
                  </td>
                  <td className="px-3 py-2 text-[#1a1814]">{c.totalVisits}</td>
                  <td className="px-3 py-2 font-medium text-[#C9A96E]">${c.totalSpend.toFixed(0)}</td>
                  <td className="px-3 py-2 text-[#9a9890]">{c.favService ?? "—"}</td>
                  <td className="px-3 py-2 text-right">
                    <Link href={`/admin/clients/${c.id}`} className="text-[10px] text-[#9a9890] hover:text-[#C9A96E]">
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Client profile page**

```tsx
// src/app/admin/(dashboard)/clients/[clientId]/page.tsx
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { IconArrowLeft, IconStar, IconStarFilled } from "@tabler/icons-react";
import Link from "next/link";
import { toast } from "sonner";
import { use } from "react";

export default function ClientProfilePage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = use(params);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["client", clientId],
    queryFn: () => fetch(`/api/admin/clients/${clientId}`).then(r => r.json()),
  });

  const [notes, setNotes] = useState("");
  const [notesSaved, setNotesSaved] = useState(false);

  const toggleVip = useMutation({
    mutationFn: (isVip: boolean) =>
      fetch(`/api/admin/clients/${clientId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isVip }),
      }),
    onSuccess: () => {
      toast.success("Client updated");
      qc.invalidateQueries({ queryKey: ["client", clientId] });
    },
  });

  async function saveNotes() {
    await fetch(`/api/admin/clients/${clientId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adminNotes: notes }),
    });
    toast.success("Notes saved");
    setNotesSaved(true);
    qc.invalidateQueries({ queryKey: ["client", clientId] });
  }

  if (isLoading) return <div className="p-6 text-sm text-[#9a9890]">Loading…</div>;
  if (!data || data.error) return <div className="p-6 text-sm text-red-500">Client not found</div>;

  const tz = data.timezone ?? "America/Chicago";
  const totalSpend = data.bookings
    .filter((b: any) => ["CONFIRMED","COMPLETED"].includes(b.status))
    .reduce((s: number, b: any) => s + Number(b.service.price), 0);

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <div className="flex h-11 items-center gap-3 border-b border-[#e8e6e1] bg-white px-4">
        <Link href="/admin/clients" className="text-[#9a9890] hover:text-[#C9A96E]">
          <IconArrowLeft size={16} />
        </Link>
        <span className="text-sm font-medium text-[#1a1814]">{data.fullName}</span>
        <button
          onClick={() => toggleVip.mutate(!data.isVip)}
          className="ml-1 text-[#C9A96E]"
          title={data.isVip ? "Remove VIP" : "Mark as VIP"}
        >
          {data.isVip ? <IconStarFilled size={14} /> : <IconStar size={14} />}
        </button>
      </div>

      <div className="flex-1 overflow-auto p-4 pb-20 md:pb-4 space-y-4 max-w-2xl">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          <StatCard label="Total visits" value={String(data.bookings.filter((b: any) => ["CONFIRMED","COMPLETED"].includes(b.status)).length)} />
          <StatCard label="Total spend" value={`$${totalSpend.toFixed(0)}`} gold />
          <StatCard label="Phone" value={data.phone ?? "—"} />
        </div>

        {/* Admin notes */}
        <div className="rounded-lg border border-[#e8e6e1] bg-white p-4">
          <p className="mb-2 text-[11px] font-medium text-[#9a9890] uppercase tracking-wide">Private Notes</p>
          <textarea
            defaultValue={data.adminNotes ?? ""}
            onChange={e => { setNotes(e.target.value); setNotesSaved(false); }}
            placeholder="Notes visible only to Anisha…"
            rows={3}
            className="w-full resize-none rounded-lg border border-[#e8e6e1] p-2 text-[12px] text-[#1a1814] outline-none focus:border-[#C9A96E]"
          />
          <button
            onClick={saveNotes}
            className="mt-2 rounded-lg bg-[#C9A96E] px-3 py-1.5 text-[11px] font-medium text-[#1a1814]"
          >
            {notesSaved ? "Saved ✓" : "Save notes"}
          </button>
        </div>

        {/* Booking history */}
        <div>
          <p className="mb-2 text-[11px] font-medium text-[#9a9890] uppercase tracking-wide">Appointment history</p>
          <div className="space-y-1">
            {data.bookings.map((b: any) => {
              const local = toZonedTime(new Date(b.startTimeUtc), tz);
              return (
                <div key={b.id} className="flex items-center gap-3 rounded-lg border border-[#e8e6e1] bg-white px-3 py-2">
                  <span className="w-24 text-[11px] text-[#9a9890]">{format(local, "MMM d, yyyy")}</span>
                  <span className="flex-1 text-[12px] text-[#1a1814]">{b.service.name}</span>
                  <span className="text-[11px] font-medium text-[#C9A96E]">${Number(b.service.price).toFixed(0)}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${b.status === "CONFIRMED" || b.status === "COMPLETED" ? "bg-[#eaf3de] text-[#3B6D11]" : "bg-[#fce8e8] text-[#8c2020]"}`}>
                    {b.status.replace("_"," ")}
                  </span>
                </div>
              );
            })}
            {data.bookings.length === 0 && (
              <p className="text-sm text-[#9a9890]">No appointments yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, gold }: { label: string; value: string; gold?: boolean }) {
  return (
    <div className="rounded-lg border border-[#e8e6e1] bg-white p-3">
      <p className="mb-1 text-[10px] text-[#9a9890]">{label}</p>
      <p className={`text-lg font-medium ${gold ? "text-[#C9A96E]" : "text-[#1a1814]"}`}>{value}</p>
    </div>
  );
}
```

- [ ] **Step 5: Commit**
```bash
git add src/app/admin/(dashboard)/clients/ src/app/api/admin/clients/
git commit -m "feat: add clients list and profile pages"
```

---

## Chunk 4: Analytics + Availability + Settings

### Task 10: Analytics page

**Files:**
- Create: `src/app/api/admin/analytics/route.ts`
- Create: `src/app/admin/(dashboard)/analytics/page.tsx`

- [ ] **Step 1: Analytics API**

```ts
// src/app/api/admin/analytics/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { subDays, startOfMonth, format } from "date-fns";
import { toZonedTime } from "date-fns-tz";

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const days = Number(searchParams.get("days") ?? "30");

  const settings = await prisma.businessSettings.findUnique({
    where: { clientId: session.clientId },
    select: { timezone: true },
  });
  const tz = settings?.timezone ?? "America/Chicago";

  const since = subDays(new Date(), days);

  const bookings = await prisma.booking.findMany({
    where: {
      clientId: session.clientId,
      startTimeUtc: { gte: since },
      status: { notIn: ["PENDING_PAYMENT"] },
    },
    include: {
      service: { select: { name: true, price: true, category: { select: { name: true } } } },
      customer: { select: { id: true } },
    },
  });

  // Revenue by month
  const revenueByMonth: Record<string, number> = {};
  const serviceCount: Record<string, number> = {};
  const dayCount: Record<string, number> = {};
  const hourCount: Record<string, number> = {};
  let confirmedCount = 0, cancelledCount = 0, noShowCount = 0;
  const customerIds = new Set<string>();
  const returningIds = new Set<string>();

  for (const b of bookings) {
    const local = toZonedTime(b.startTimeUtc, tz);
    const month = format(local, "MMM yyyy");
    const dayOfWeek = format(local, "EEE");
    const hour = `${local.getHours()}:00`;

    if (["CONFIRMED","COMPLETED"].includes(b.status)) {
      revenueByMonth[month] = (revenueByMonth[month] ?? 0) + Number(b.service.price);
      serviceCount[b.service.name] = (serviceCount[b.service.name] ?? 0) + 1;
      dayCount[dayOfWeek] = (dayCount[dayOfWeek] ?? 0) + 1;
      hourCount[hour] = (hourCount[hour] ?? 0) + 1;
      confirmedCount++;
      if (customerIds.has(b.customer.id)) returningIds.add(b.customer.id);
      customerIds.add(b.customer.id);
    }
    if (b.status === "CANCELLED") cancelledCount++;
    if (b.status === "NO_SHOW") noShowCount++;
  }

  const total = confirmedCount + cancelledCount + noShowCount;

  return NextResponse.json({
    revenueByMonth: Object.entries(revenueByMonth).map(([month, revenue]) => ({ month, revenue })).slice(-6),
    topServices: Object.entries(serviceCount).sort((a,b) => b[1]-a[1]).slice(0, 8).map(([name, count]) => ({ name, count })),
    byDay: ["Mon","Tue","Wed","Thu","Fri","Sat"].map(d => ({ day: d, count: dayCount[d] ?? 0 })),
    noShowRate: total > 0 ? Math.round((noShowCount / total) * 100) : 0,
    cancellationRate: total > 0 ? Math.round((cancelledCount / total) * 100) : 0,
    newClients: customerIds.size - returningIds.size,
    returningClients: returningIds.size,
  });
}
```

- [ ] **Step 2: Analytics page**

```tsx
// src/app/admin/(dashboard)/analytics/page.tsx
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const DAYS_OPTIONS = [30, 90, 365] as const;
const COLORS = ["#C9A96E","#c97c6e","#6ea07c","#9a9890","#d4b4a0","#8e9a6e"];

export default function AnalyticsPage() {
  const [days, setDays] = useState<30 | 90 | 365>(30);

  const { data, isLoading } = useQuery({
    queryKey: ["analytics", days],
    queryFn: () => fetch(`/api/admin/analytics?days=${days}`).then(r => r.json()),
  });

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <div className="flex h-11 items-center gap-3 border-b border-[#e8e6e1] bg-white px-4">
        <span className="text-sm font-medium text-[#1a1814]">Analytics</span>
        <div className="flex-1" />
        <div className="flex gap-0.5 rounded-lg border border-[#e8e6e1] bg-[#f5f4f2] p-0.5">
          {DAYS_OPTIONS.map(d => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors ${
                days === d ? "bg-white text-[#1a1814] shadow-sm border border-[#e8e6e1]" : "text-[#9a9890]"
              }`}
            >
              {d === 365 ? "1 year" : `${d} days`}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 pb-20 md:pb-4 space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-48 animate-pulse rounded-xl bg-[#f5f4f2]" />
            ))}
          </div>
        ) : (
          <>
            {/* Stats row */}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <MetricCard label="No-show rate" value={`${data?.noShowRate ?? 0}%`} />
              <MetricCard label="Cancellation rate" value={`${data?.cancellationRate ?? 0}%`} />
              <MetricCard label="New clients" value={String(data?.newClients ?? 0)} gold />
              <MetricCard label="Returning" value={String(data?.returningClients ?? 0)} gold />
            </div>

            {/* Revenue by month */}
            <div className="rounded-xl border border-[#e8e6e1] bg-white p-4">
              <p className="mb-3 text-[12px] font-medium text-[#1a1814]">Revenue by month</p>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={data?.revenueByMonth ?? []}>
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#9a9890" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#9a9890" }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
                  <Tooltip formatter={(v: number) => [`$${v.toFixed(0)}`, "Revenue"]} contentStyle={{ fontSize: 11, borderRadius: 8, border: "0.5px solid #e8e6e1" }} />
                  <Bar dataKey="revenue" fill="#C9A96E" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Top services + busiest days */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-[#e8e6e1] bg-white p-4">
                <p className="mb-3 text-[12px] font-medium text-[#1a1814]">Top services</p>
                <div className="space-y-1.5">
                  {(data?.topServices ?? []).map((s: any, i: number) => (
                    <div key={s.name} className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="flex-1 text-[11px] text-[#1a1814] truncate">{s.name}</span>
                      <span className="text-[11px] font-medium text-[#C9A96E]">{s.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-[#e8e6e1] bg-white p-4">
                <p className="mb-3 text-[12px] font-medium text-[#1a1814]">Busiest days</p>
                <ResponsiveContainer width="100%" height={140}>
                  <BarChart data={data?.byDay ?? []}>
                    <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#9a9890" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "#9a9890" }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: "0.5px solid #e8e6e1" }} />
                    <Bar dataKey="count" fill="#6ea07c" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function MetricCard({ label, value, gold }: { label: string; value: string; gold?: boolean }) {
  return (
    <div className="rounded-lg border border-[#e8e6e1] bg-white p-3">
      <p className="mb-1 text-[10px] text-[#9a9890]">{label}</p>
      <p className={`text-xl font-medium ${gold ? "text-[#C9A96E]" : "text-[#1a1814]"}`}>{value}</p>
    </div>
  );
}
```

- [ ] **Step 3: Commit**
```bash
git add src/app/admin/(dashboard)/analytics/ src/app/api/admin/analytics/
git commit -m "feat: add analytics page with revenue chart and top services"
```

---

### Task 11: Availability page

**Files:**
- Create: `src/app/api/admin/availability/route.ts`
- Create: `src/app/admin/(dashboard)/availability/page.tsx`

- [ ] **Step 1: Availability API (GET + PUT)**

```ts
// src/app/api/admin/availability/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

const DAY_NAMES = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rules = await prisma.availabilityRule.findMany({
    where: { clientId: session.clientId },
    orderBy: { dayOfWeek: "asc" },
  });

  // Return all 7 days, filling in defaults for missing ones
  const result = Array.from({ length: 7 }, (_, i) => {
    const rule = rules.find(r => r.dayOfWeek === i);
    return {
      dayOfWeek: i,
      dayName: DAY_NAMES[i],
      active: rule?.active ?? false,
      startTime: rule?.startTime ?? "09:00",
      endTime: rule?.endTime ?? "17:00",
    };
  });

  return NextResponse.json(result);
}

export async function PUT(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body: Array<{ dayOfWeek: number; active: boolean; startTime: string; endTime: string }> = await req.json();

  for (const day of body) {
    await prisma.availabilityRule.upsert({
      where: { id: `avail-day-${day.dayOfWeek}` },
      update: { active: day.active, startTime: day.startTime, endTime: day.endTime },
      create: {
        id: `avail-day-${day.dayOfWeek}`,
        clientId: session.clientId,
        dayOfWeek: day.dayOfWeek,
        startTime: day.startTime,
        endTime: day.endTime,
        active: day.active,
      },
    });
  }

  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 2: Availability page**

```tsx
// src/app/admin/(dashboard)/availability/page.tsx
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { toast } from "sonner";

const HOURS = Array.from({ length: 24 }, (_, i) => {
  const h = i.toString().padStart(2, "0");
  return { value: `${h}:00`, label: `${i === 0 ? 12 : i > 12 ? i - 12 : i}:00 ${i < 12 ? "AM" : "PM"}` };
});

export default function AvailabilityPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["availability"],
    queryFn: () => fetch("/api/admin/availability").then(r => r.json()),
  });

  const [schedule, setSchedule] = useState<any[]>([]);

  useEffect(() => {
    if (data) setSchedule(data);
  }, [data]);

  const save = useMutation({
    mutationFn: () => fetch("/api/admin/availability", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(schedule),
    }),
    onSuccess: () => {
      toast.success("Availability saved");
      qc.invalidateQueries({ queryKey: ["availability"] });
    },
    onError: () => toast.error("Failed to save"),
  });

  function updateDay(dayOfWeek: number, field: string, value: any) {
    setSchedule(prev => prev.map(d => d.dayOfWeek === dayOfWeek ? { ...d, [field]: value } : d));
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <div className="flex h-11 items-center gap-3 border-b border-[#e8e6e1] bg-white px-4">
        <span className="text-sm font-medium text-[#1a1814]">Availability</span>
        <div className="flex-1" />
        <button
          onClick={() => save.mutate()}
          disabled={save.isPending}
          className="flex h-[26px] items-center rounded-full bg-[#C9A96E] px-3 text-[11px] font-medium text-[#1a1814] disabled:opacity-60"
        >
          {save.isPending ? "Saving…" : "Save changes"}
        </button>
      </div>

      <div className="flex-1 overflow-auto p-4 pb-20 md:pb-4">
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded-lg bg-[#f5f4f2]" />
            ))}
          </div>
        ) : (
          <div className="max-w-xl space-y-2">
            <p className="mb-4 text-[12px] text-[#9a9890]">Set your weekly working hours. These control which time slots appear when clients book online.</p>
            {schedule.map((day: any) => (
              <div key={day.dayOfWeek} className="flex items-center gap-3 rounded-lg border border-[#e8e6e1] bg-white px-4 py-3">
                <input
                  type="checkbox"
                  checked={day.active}
                  onChange={e => updateDay(day.dayOfWeek, "active", e.target.checked)}
                  className="h-4 w-4 rounded border-[#e8e6e1] accent-[#C9A96E]"
                />
                <span className="w-10 text-[12px] font-medium text-[#1a1814]">{day.dayName}</span>
                {day.active ? (
                  <>
                    <select
                      value={day.startTime}
                      onChange={e => updateDay(day.dayOfWeek, "startTime", e.target.value)}
                      className="rounded-lg border border-[#e8e6e1] px-2 py-1 text-[11px] text-[#1a1814] outline-none focus:border-[#C9A96E]"
                    >
                      {HOURS.map(h => <option key={h.value} value={h.value}>{h.label}</option>)}
                    </select>
                    <span className="text-[11px] text-[#9a9890]">to</span>
                    <select
                      value={day.endTime}
                      onChange={e => updateDay(day.dayOfWeek, "endTime", e.target.value)}
                      className="rounded-lg border border-[#e8e6e1] px-2 py-1 text-[11px] text-[#1a1814] outline-none focus:border-[#C9A96E]"
                    >
                      {HOURS.map(h => <option key={h.value} value={h.value}>{h.label}</option>)}
                    </select>
                  </>
                ) : (
                  <span className="text-[11px] text-[#b0aea8]">Closed</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**
```bash
git add src/app/admin/(dashboard)/availability/ src/app/api/admin/availability/
git commit -m "feat: add availability page with weekly schedule editor"
```

---

### Task 12: Redesign settings page + final nav wiring

**Files:**
- Modify: `src/app/admin/(dashboard)/settings/page.tsx`
- Modify: `src/app/admin/(dashboard)/sidebar.tsx` (add Availability link)

- [ ] **Step 1: Add availability to sidebar nav items**

In `sidebar.tsx`, add to navItems after Analytics:
```ts
{ href: "/admin/availability", label: "Availability", icon: IconClock },
```
Import `IconClock` from `@tabler/icons-react`.

- [ ] **Step 2: Redesign settings page with new styles**

Replace all CSS variable references (`var(--color-border)`, etc.) with hardcoded Smoove colors:
- `border-[var(--color-border)]` → `border-[#e8e6e1]`
- `text-[var(--color-text)]` → `text-[#1a1814]`  
- `text-[var(--color-text-light)]` → `text-[#9a9890]`
- `focus:border-[var(--color-primary)]` → `focus:border-[#C9A96E]`

Replace the `<Button type="submit">` with the gold-styled button:
```tsx
<button type="submit" disabled={saving} className="rounded-lg bg-[#C9A96E] px-4 py-2 text-[12px] font-medium text-[#1a1814] disabled:opacity-60">
  {saving ? "Saving…" : "Save settings"}
</button>
```

Replace success/error inline messages with `toast.success()` / `toast.error()` from sonner.

- [ ] **Step 3: Add topbar to settings + other pages that are missing it**

Each page should have the standard topbar (44px, white, border-bottom). The layout.tsx doesn't add one globally — each page manages its own topbar. This is already done for Calendar/Appointments/Clients. Do the same for Settings and Availability.

- [ ] **Step 4: Verify all nav items work**

Navigate through: Dashboard → Calendar → Appointments → Clients → Analytics → Availability → Settings. All should load without errors.

- [ ] **Step 5: Final commit**
```bash
git add src/app/admin/
git commit -m "feat: wire availability nav + redesign settings page"
```

---

### Task 13: Run seed + create admin + verify

- [ ] **Step 1: Add SUPABASE_SERVICE_ROLE_KEY to .env.local**

Get from Supabase Dashboard → Project Settings → API → service_role key.

- [ ] **Step 2: Run seed**
```bash
npx prisma db seed
```

- [ ] **Step 3: Create Smoove admin account**
```bash
npx tsx scripts/create-smoove-admin.ts anisha@smooveskinstudio.com <PASSWORD>
```

- [ ] **Step 4: Test login**

Navigate to http://localhost:3000/admin/login, enter credentials. Should redirect to dashboard with real data.

- [ ] **Step 5: Smoke test all pages**

- [ ] Dashboard loads with stats
- [ ] Calendar shows appointment blocks
- [ ] Appointments tabs work (upcoming/past/cancelled)
- [ ] Clients list shows mock data, VIP stars show
- [ ] Client profile loads with history
- [ ] Analytics shows charts
- [ ] Availability shows 7-day schedule
- [ ] Settings saves without error

- [ ] **Step 6: Final commit**
```bash
git add .
git commit -m "feat: complete Smoove admin portal — all pages live"
```
