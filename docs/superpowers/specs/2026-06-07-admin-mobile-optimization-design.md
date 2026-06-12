# Admin Portal Mobile Optimization — Design Spec

**Goal:** Make the admin portal fully usable on mobile by converting data tables to card lists, fixing the topbar, and adjusting layout padding.

**Architecture:** Tailwind responsive prefixes (`md:`) to swap between card lists (mobile) and tables (desktop). No logic changes — display only.

**Tech Stack:** Tailwind CSS, Next.js, React

---

## Scope

### 1. Data Tables → Card Lists

All four data pages get a dual-layout: table on `md+`, card list on mobile.

**Pattern:**
```tsx
{/* Desktop table */}
<div className="hidden md:block">
  {/* existing table markup */}
</div>

{/* Mobile cards */}
<div className="md:hidden space-y-2">
  {items.map(item => <MobileCard key={item.id} item={item} />)}
</div>
```

**Pages affected:**
- `src/app/admin/(dashboard)/appointments/page.tsx`
  - Card: customer name + status badge | service + date/time | paid amount
- `src/app/admin/(dashboard)/clients/page.tsx` (if exists)
  - Card: name | last visit date + visit count
- `src/app/admin/(dashboard)/coupons/page.tsx` (if exists)
  - Card: code + discount % | usage count + expiry | status badge
- `src/app/admin/(dashboard)/invoices/page.tsx`
  - Card: customer name | total | due date | status badge

### 2. Topbar

All admin topbars:
- Padding: `px-4 md:px-8`
- Title font: `text-[18px] md:text-[24px]`
- Search bar (where present): `hidden md:flex`
- Back button + title layout: already flex, no changes needed

### 3. Page Content Padding

All inner pages:
- `px-4 md:px-8` instead of hardcoded `px-8`
- `py-6 md:py-8` where applicable

### 4. Appointment Drawer

- Width: `w-full md:w-[280px]`
- On mobile: full-width panel slides in from the right, content scrollable

### 5. Modals

- `New Invoice`, `Add Appointment`, and other modals: already use `max-w-sm` — add `mx-4 md:mx-auto` to prevent edge clipping on small screens

---

## What Does NOT Change

- Bottom tab nav (already mobile-ready)
- `pb-20 md:pb-8` bottom padding pattern (already correct)
- Settings forms (already use `sm:grid-cols-2`)
- All business logic, API routes, data fetching
