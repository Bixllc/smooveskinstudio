# Admin Mobile Optimization — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every admin page fully usable on mobile by adding card-list layouts for all data tables, fixing topbar responsiveness, adjusting padding, and making the appointment drawer full-width on mobile.

**Architecture:** Pure CSS/Tailwind changes using `md:` breakpoint. Tables stay on desktop (`hidden md:block`), card lists show on mobile (`md:hidden`). No logic, API, or data changes.

**Tech Stack:** Tailwind CSS, Next.js App Router, React

---

## Files to Modify

- `src/app/admin/(dashboard)/appointments/page.tsx` — add mobile card list, fix topbar/padding
- `src/app/admin/(dashboard)/clients/page.tsx` — add mobile card list, fix topbar/padding
- `src/app/admin/(dashboard)/coupons/page.tsx` — add mobile card list, fix topbar/padding
- `src/app/admin/(dashboard)/invoices/page.tsx` — add mobile card list, fix topbar/padding
- `src/components/admin/appointment-drawer.tsx` — full width on mobile

---

## Chunk 1: Appointments Page

### Task 1: Appointments — mobile cards + topbar fix

**Files:**
- Modify: `src/app/admin/(dashboard)/appointments/page.tsx`

- [ ] **Step 1: Fix topbar**

In the `<header>` element, change:
```tsx
// Before
<header className="flex h-[80px] flex-shrink-0 items-center justify-between border-b border-black/[0.07] bg-white px-8">
  <h1 className="text-[24px] font-semibold text-[#1b1814]">Appointments</h1>
  <div className="flex items-center gap-2 bg-white border border-black/[0.07] rounded-[9px] px-3 h-9">
    <IconSearch size={15} className="text-[#a8a39c] flex-shrink-0" strokeWidth={1.8} />
    <input
      ...
      className="border-none outline-none bg-transparent text-[13px] text-[#1b1814] placeholder:text-[#a8a39c] w-[180px]"
    />
  </div>
</header>
```

```tsx
// After
<header className="flex h-[80px] flex-shrink-0 items-center justify-between border-b border-black/[0.07] bg-white px-4 md:px-8">
  <h1 className="text-[18px] md:text-[24px] font-semibold text-[#1b1814]">Appointments</h1>
  <div className="hidden md:flex items-center gap-2 bg-white border border-black/[0.07] rounded-[9px] px-3 h-9">
    <IconSearch size={15} className="text-[#a8a39c] flex-shrink-0" strokeWidth={1.8} />
    <input
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      placeholder="Search clients…"
      className="border-none outline-none bg-transparent text-[13px] text-[#1b1814] placeholder:text-[#a8a39c] w-[180px]"
    />
  </div>
</header>
```

- [ ] **Step 2: Fix tab nav and table area padding**

Change:
```tsx
// Before
<div className="flex border-b border-black/[0.07] bg-white px-8">
// After
<div className="flex border-b border-black/[0.07] bg-white px-4 md:px-8">
```

Change:
```tsx
// Before
<div className="flex-1 overflow-auto px-8 py-8 pb-20 md:pb-8">
// After
<div className="flex-1 overflow-auto px-4 md:px-8 py-6 md:py-8 pb-20 md:pb-8">
```

- [ ] **Step 3: Wrap existing table in desktop-only div**

Wrap the entire `<div className="bg-white border border-black/[0.07] rounded-[14px] overflow-hidden">` that contains the table header and rows:

```tsx
{/* Desktop table */}
<div className="hidden md:block bg-white border border-black/[0.07] rounded-[14px] overflow-hidden">
  {/* Table header */}
  <div className="grid bg-[#edeae5] ..."
  ...
  {/* Data rows */}
  ...
</div>
```

- [ ] **Step 4: Add mobile card list**

After the desktop table div, add:

```tsx
{/* Mobile cards */}
<div className="md:hidden space-y-2">
  {bookings.map((b) => {
    const local = toZonedTime(new Date(b.startTimeUtc), tz);
    const paid = (b.payments?.reduce((sum: number, p: any) => sum + Number(p.amount), 0) ?? 0);
    return (
      <div
        key={b.id}
        onClick={() => setDrawer(b)}
        className="bg-white border border-black/[0.07] rounded-[14px] px-4 py-4 cursor-pointer active:bg-[#f8f6f3] transition-colors"
      >
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <span className="text-[15px] font-semibold text-[#1b1814] leading-tight">{b.customer.fullName}</span>
          <StatusBadge status={b.status} />
        </div>
        <p className="text-[13px] text-[#7a756e] mb-1">{b.service.name} · {b.service.durationMinutes} min</p>
        <div className="flex items-center justify-between">
          <span className="text-[12px] text-[#a8a39c]">{format(local, "EEE MMM d · h:mm a")}</span>
          {paid > 0 && <span className="text-[13px] font-semibold text-[#b8892a]">${paid.toFixed(0)} paid</span>}
        </div>
      </div>
    );
  })}
</div>
```

- [ ] **Step 5: Commit**

```bash
git add src/app/admin/(dashboard)/appointments/page.tsx
git commit -m "feat: mobile card list + responsive topbar for appointments page"
```

---

## Chunk 2: Clients Page

### Task 2: Clients — mobile cards + topbar fix

**Files:**
- Modify: `src/app/admin/(dashboard)/clients/page.tsx`

- [ ] **Step 1: Fix topbar padding and title size**

```tsx
// Before
<header className="h-[80px] bg-white border-b border-black/[0.07] px-8 flex items-center justify-between flex-shrink-0">
  <h1 className="text-[24px] font-semibold text-[#1b1814]">Clients</h1>
  <div className="flex items-center gap-2">
    <div className="flex items-center gap-2 bg-white border border-black/[0.07] rounded-[9px] px-3 h-9">
      ...search input...
    </div>
    <button ...>Add client</button>
  </div>
```

```tsx
// After
<header className="h-[80px] bg-white border-b border-black/[0.07] px-4 md:px-8 flex items-center justify-between flex-shrink-0">
  <h1 className="text-[18px] md:text-[24px] font-semibold text-[#1b1814]">Clients</h1>
  <div className="flex items-center gap-2">
    <div className="hidden md:flex items-center gap-2 bg-white border border-black/[0.07] rounded-[9px] px-3 h-9">
      ...search input (unchanged)...
    </div>
    <button ...>Add client</button>
  </div>
```

- [ ] **Step 2: Fix content area padding**

```tsx
// Before
<div className="flex-1 overflow-y-auto p-8">
// After
<div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 md:py-8 pb-20 md:pb-8">
```

- [ ] **Step 3: Wrap existing table in desktop-only div**

Add `hidden md:block` to the outer `<div className="bg-white border border-black/[0.07] rounded-[14px] overflow-hidden">`:

```tsx
<div className="hidden md:block bg-white border border-black/[0.07] rounded-[14px] overflow-hidden">
  {/* existing header row + data rows unchanged */}
</div>
```

- [ ] **Step 4: Add mobile card list**

After the desktop table, add:

```tsx
{/* Mobile cards */}
<div className="md:hidden space-y-2">
  {clients.map((c: any, idx: number) => (
    <Link
      key={c.id}
      href={`/admin/clients/${c.id}`}
      className="flex items-center gap-3 bg-white border border-black/[0.07] rounded-[14px] px-4 py-4 active:bg-[#f8f6f3] transition-colors"
    >
      <span
        className={`w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-semibold flex-shrink-0 ${
          AVATAR_COLORS[idx % AVATAR_COLORS.length]
        }`}
      >
        {initials(c.fullName)}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-[15px] font-semibold text-[#1b1814] truncate">{c.fullName}</span>
          {c.isVip && <IconStar size={12} className="text-[#c9a96e] fill-[#c9a96e] flex-shrink-0" fill="#c9a96e" />}
        </div>
        <p className="text-[12px] text-[#a8a39c]">
          {c.totalVisits} visit{c.totalVisits !== 1 ? "s" : ""}
          {c.lastVisit ? ` · Last ${format(new Date(c.lastVisit), "MMM d")}` : ""}
        </p>
      </div>
      <span className="text-[14px] font-semibold text-[#b8892a] flex-shrink-0">${c.totalSpend.toFixed(0)}</span>
    </Link>
  ))}
</div>
```

- [ ] **Step 5: Commit**

```bash
git add src/app/admin/(dashboard)/clients/page.tsx
git commit -m "feat: mobile card list + responsive topbar for clients page"
```

---

## Chunk 3: Coupons Page

### Task 3: Coupons — mobile cards + topbar fix

**Files:**
- Modify: `src/app/admin/(dashboard)/coupons/page.tsx`

- [ ] **Step 1: Fix topbar padding and title size (both topbar instances)**

The coupons page renders its topbar in two places (loading state and main state). Fix both:

```tsx
// Both instances: before
<header className="h-[80px] bg-white border-b border-black/[0.07] px-8 flex items-center justify-between flex-shrink-0">
  <h1 className="text-[24px] font-semibold text-[#1b1814]">Coupons</h1>

// Both instances: after
<header className="h-[80px] bg-white border-b border-black/[0.07] px-4 md:px-8 flex items-center justify-between flex-shrink-0">
  <h1 className="text-[18px] md:text-[24px] font-semibold text-[#1b1814]">Coupons</h1>
```

- [ ] **Step 2: Fix content area padding**

```tsx
// Before
<div className="flex-1 overflow-y-auto p-8">
// After
<div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 md:py-8 pb-20 md:pb-8">
```

- [ ] **Step 3: Wrap existing table in desktop-only div**

```tsx
{/* Desktop table */}
<div className="hidden md:block bg-white border border-black/[0.07] rounded-[14px] overflow-hidden">
  {/* existing header + rows unchanged */}
</div>
```

- [ ] **Step 4: Add mobile card list**

After the desktop table div:

```tsx
{/* Mobile cards */}
<div className="md:hidden space-y-2">
  {coupons.length === 0 ? (
    <div className="text-center py-10 text-[14px] text-[#a8a39c]">No coupons yet.</div>
  ) : coupons.map((coupon) => (
    <div key={coupon.id} className="bg-white border border-black/[0.07] rounded-[14px] px-4 py-4">
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <span className="font-mono font-semibold text-[16px] text-[#1b1814]">{coupon.code}</span>
        {coupon.active ? (
          <span className="bg-[#e8f7ee] text-[#2e7d50] inline-flex px-[10px] py-[3px] rounded-full text-[11px] font-semibold flex-shrink-0">Active</span>
        ) : (
          <span className="bg-[#fdecea] text-[#b53a2e] inline-flex px-[10px] py-[3px] rounded-full text-[11px] font-semibold flex-shrink-0">Disabled</span>
        )}
      </div>
      <p className="text-[13px] text-[#7a756e] mb-2">{coupon.name} · {Number(coupon.discountPercent).toFixed(0)}% off</p>
      <div className="flex items-center justify-between">
        <span className="text-[12px] text-[#a8a39c]">
          {coupon.usageCount}/{coupon.usageLimit ?? "∞"} uses
          {coupon.expiresAt ? ` · Expires ${format(new Date(coupon.expiresAt), "MMM d, yyyy")}` : ""}
        </span>
        <div className="flex gap-1">
          <button
            onClick={() => startEdit(coupon)}
            className="bg-white text-[#7a756e] border border-black/[0.12] rounded-[8px] px-3 py-1 text-[12px] font-medium"
          >
            Edit
          </button>
          <button
            onClick={() => handleToggleActive(coupon)}
            className="bg-white text-[#7a756e] border border-black/[0.12] rounded-[8px] px-3 py-1 text-[12px] font-medium"
          >
            {coupon.active ? "Disable" : "Enable"}
          </button>
        </div>
      </div>
    </div>
  ))}
</div>
```

- [ ] **Step 5: Commit**

```bash
git add src/app/admin/(dashboard)/coupons/page.tsx
git commit -m "feat: mobile card list + responsive topbar for coupons page"
```

---

## Chunk 4: Invoices Page

### Task 4: Invoices — mobile cards + topbar fix

**Files:**
- Modify: `src/app/admin/(dashboard)/invoices/page.tsx`

- [ ] **Step 1: Fix topbar padding and title size**

```tsx
// Before
<header className="flex h-[80px] flex-shrink-0 items-center justify-between border-b border-black/[0.07] bg-white px-8">
  <h1 className="text-[24px] font-semibold text-[#1b1814]">Invoices</h1>

// After
<header className="flex h-[80px] flex-shrink-0 items-center justify-between border-b border-black/[0.07] bg-white px-4 md:px-8">
  <h1 className="text-[18px] md:text-[24px] font-semibold text-[#1b1814]">Invoices</h1>
```

- [ ] **Step 2: Fix content area padding**

```tsx
// Before
<div className="flex-1 overflow-y-auto px-8 py-8 pb-20 md:pb-8 space-y-6">
// After
<div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 md:py-8 pb-20 md:pb-8 space-y-6">
```

- [ ] **Step 3: Wrap existing invoice table in desktop-only div**

```tsx
{/* Desktop table */}
<div className="hidden md:block bg-white border border-black/[0.07] rounded-[14px] overflow-hidden">
  {/* Header */}
  <div className="grid bg-[#edeae5] ..." ...>
    ...
  </div>
  {invoices.map((inv) => (
    ...
  ))}
</div>
```

- [ ] **Step 4: Add mobile card list**

After the desktop table div:

```tsx
{/* Mobile cards */}
<div className="md:hidden space-y-2">
  {invoices.map((inv) => (
    <div key={inv.id} className="bg-white border border-black/[0.07] rounded-[14px] px-4 py-4">
      <div className="flex items-start justify-between gap-2 mb-1">
        <span className="text-[15px] font-semibold text-[#1b1814] leading-tight">{inv.customerName}</span>
        <span className={`inline-flex items-center whitespace-nowrap px-[10px] py-[3px] rounded-full text-[11px] font-semibold flex-shrink-0 ${STATUS_STYLES[inv.status] ?? ""}`}>
          {inv.status}
        </span>
      </div>
      <p className="text-[12px] text-[#a8a39c] mb-2">
        {inv.customerEmail}
        {inv.dueDate ? ` · Due ${format(new Date(inv.dueDate), "MMM d")}` : ""}
      </p>
      <div className="flex items-center justify-between">
        <span className="text-[16px] font-semibold text-[#b8892a]">${Number(inv.total).toFixed(2)}</span>
        <div className="flex items-center gap-1">
          {inv.status === "DRAFT" && (
            <button
              onClick={() => updateStatus(inv.id, "SENT")}
              className="bg-[#1b1814] text-white rounded-[7px] px-3 py-1.5 text-[11px] font-semibold border-none cursor-pointer"
            >
              Send
            </button>
          )}
          {inv.status === "SENT" && (
            <button
              onClick={() => updateStatus(inv.id, "PAID")}
              className="bg-[#e8f7ee] text-[#2e7d50] border border-[#2e7d5030] rounded-[7px] px-3 py-1.5 text-[11px] font-semibold cursor-pointer"
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
    </div>
  ))}
</div>
```

- [ ] **Step 5: Commit**

```bash
git add src/app/admin/(dashboard)/invoices/page.tsx
git commit -m "feat: mobile card list + responsive topbar for invoices page"
```

---

## Chunk 5: Appointment Drawer + Remaining Pages

### Task 5: Appointment drawer full-width on mobile

**Files:**
- Modify: `src/components/admin/appointment-drawer.tsx`

- [ ] **Step 1: Make drawer full-width on mobile**

Find the drawer container (the right-side panel div). It will look something like:
```tsx
<div className="... w-[280px] ...">
```

Change `w-[280px]` to `w-full md:w-[280px]`. Also ensure the backdrop covers full screen on mobile — the overlay div should remain `fixed inset-0`.

- [ ] **Step 2: Commit**

```bash
git add src/components/admin/appointment-drawer.tsx
git commit -m "feat: full-width appointment drawer on mobile"
```

### Task 6: Fix remaining page topbars and padding

**Files:**
- Modify: `src/app/admin/(dashboard)/settings/page.tsx`
- Modify: `src/app/admin/(dashboard)/services/page.tsx`
- Modify: `src/app/admin/(dashboard)/categories/page.tsx`
- Modify: `src/app/admin/(dashboard)/availability/page.tsx`
- Modify: `src/app/admin/(dashboard)/forms/page.tsx`

For each file, apply:
1. Topbar: `px-4 md:px-8`, title `text-[18px] md:text-[24px]`, hide search if present with `hidden md:flex`
2. Content area: `px-4 md:px-8 py-6 md:py-8 pb-20 md:pb-8`

Pattern to search and update in each file:
```tsx
// headers: px-8 → px-4 md:px-8
// titles: text-[24px] → text-[18px] md:text-[24px]
// content divs: p-8 or px-8 → px-4 md:px-8, py-6 md:py-8 pb-20 md:pb-8
```

- [ ] **Step 3: Commit**

```bash
git add src/app/admin/(dashboard)/settings/page.tsx \
        src/app/admin/(dashboard)/services/page.tsx \
        src/app/admin/(dashboard)/categories/page.tsx \
        src/app/admin/(dashboard)/availability/page.tsx \
        src/app/admin/(dashboard)/forms/page.tsx
git commit -m "feat: responsive topbar and padding across remaining admin pages"
```
