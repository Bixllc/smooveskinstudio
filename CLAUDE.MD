# CLAUDE.md — Custom Booking Platform

## Product Goal

Build a reusable, custom booking platform for service-based businesses.

The system allows customers to:

* Browse categories and services
* Select a time
* Pay using Square
* Receive confirmation and reminders

Admins can:

* Manage services and categories
* Manage bookings
* Update business info and policies

This is a productized service, not a public SaaS platform.

---

## Core Philosophy

* One reusable system across all clients
* Controlled customization only
* Keep logic centralized
* Avoid over-engineering
* Optimize for speed and maintainability

---

## Multi-Client Architecture

Use a shared database with `clientId` on all client-owned tables.

Each client has:

* Unique `clientId`
* Separate data
* Own domain or subdomain
* Own Square account
* Own BusinessSettings

All queries must be scoped by `clientId`.

Never access or mutate data without filtering by `clientId`.

---

## Auth

Use Supabase Auth.

### Admin

* Email/password login
* Each admin belongs to a `clientId`
* Admin routes protected
* Admin only accesses their own data

### Customers

* No accounts
* Guest checkout only

### Route Protection

* Protect `/admin/*` routes via middleware
* Redirect unauthenticated users to login
* Prevent cross-client access

---

## Booking Flow

### Step 1 — Category Selection

* Display categories
* User selects a category

### Step 2 — Service Selection

* Display services filtered by category
* Show name, duration, price, description
* User selects a service

### Step 3 — Date & Time

* Show calendar
* Show available time slots
* Respect:

  * availability rules
  * bookings
  * buffers
  * blocked times

### Step 4 — Customer Info

* fullName
* email
* phone
* notes (optional)

### Step 5 — Payment (Square)

* Deposit or full payment
* Booking is confirmed only after payment success
* Use Square webhooks

### Step 6 — Confirmation

* Show booking details
* Send confirmation email
* Send admin notification

---

## Timezone Handling

* Store all times in UTC
* Store client timezone in `BusinessSettings.timezone`
* Use `date-fns-tz` (preferred)

Rules:

* Convert client-selected times → UTC before saving
* Convert UTC → client timezone for display
* All availability calculations use client timezone
* Emails must show local time

---

## Payment Integration

Use Square.

* Use Square API for checkout
* Use webhooks for confirmation
* Store Square payment IDs
* Do not store card data

Fees are handled by the client.

---

## Email System

Use Resend for transactional emails.

### Emails Sent to Customer

1. Confirmation Email

   * Sent immediately after booking is confirmed
   * Includes:

     * service
     * date/time
     * address
     * payment summary
     * policies

2. Reminder Email

   * Sent 24 hours before appointment
   * Includes:

     * service
     * date/time
     * address
     * policies

3. Cancellation Email

4. Reschedule Email

### Emails Sent to Admin

* New booking
* Cancellation
* Reschedule

---

## Reminder Scheduling

Use a background job.

### Behavior

* Run every 15 minutes

* Find bookings:

  * status = confirmed
  * startTimeUtc between now +23h and +24h
  * reminderEmailSentAt is null

* Send reminder

* Set `reminderEmailSentAt`

---

## Data Models

### Client

```ts
Client {
  id
  name
  slug
  domain
  active
  createdAt
}
```

### BusinessSettings

```ts
BusinessSettings {
  id
  clientId
  businessName
  address
  phone
  email
  timezone

  cancellationPolicy
  latePolicy
  noShowPolicy
  depositPolicy

  updatedAt
}
```

### Category

```ts
Category {
  id
  clientId
  name
  description
  displayOrder
  active
}
```

### Service

```ts
Service {
  id
  clientId
  categoryId
  name
  description
  durationMinutes
  price
  depositAmount
  paymentType
  bufferBeforeMinutes
  bufferAfterMinutes
  active
}
```

### Customer

```ts
Customer {
  id
  clientId
  fullName
  email
  phone
  notes
}
```

### Booking

```ts
Booking {
  id
  clientId
  serviceId
  customerId
  startTimeUtc
  endTimeUtc

  status
  paymentStatus

  paymentProvider
  paymentId

  confirmationEmailSentAt
  reminderEmailSentAt

  notes
  createdAt
  updatedAt
}
```

### Payment

```ts
Payment {
  id
  clientId
  bookingId
  provider
  providerPaymentId
  amount
  status
  paidAt
}
```

### AvailabilityRule

```ts
AvailabilityRule {
  id
  clientId
  dayOfWeek
  startTime
  endTime
  active
}
```

### BlockedTime

```ts
BlockedTime {
  id
  clientId
  startTimeUtc
  endTimeUtc
  reason
}
```

---

## Business Settings (Editable)

Clients can update:

* businessName
* address
* phone
* email
* timezone
* cancellationPolicy
* latePolicy
* noShowPolicy
* depositPolicy

Policies are text-only.

---

## Client Restrictions

Clients cannot modify:

* booking logic
* payment logic
* availability engine
* UI layout
* system workflows

---

## Availability Rules

A slot is valid if:

* within availability hours
* no overlap with bookings
* no overlap with blocked times
* includes buffer time

### Overlap Rule

```ts
existing.startTimeUtc < requested.endTimeUtc &&
existing.endTimeUtc > requested.startTimeUtc
```

---

## Buffer Logic

```ts
totalTime = duration + bufferBefore + bufferAfter
```

---

## Booking Status

```ts
pending_payment
confirmed
cancelled
rescheduled
completed
no_show
```

---

## Payment Status

```ts
unpaid
pending
paid
failed
refunded
```

---

## Admin Dashboard

### Categories

* create/edit/delete
* reorder

### Services

* create/edit/delete
* assign category
* set price/duration/buffer

### Bookings

* view/filter
* cancel
* reschedule
* mark complete/no-show

### Settings

* update business info
* update policies

---

## MVP Scope

Build only:

1. Category selection
2. Service selection
3. Availability system
4. Booking form
5. Square payments
6. Confirmation flow
7. Email notifications
8. Admin auth
9. Admin dashboard
10. Business settings

---

## Do Not Build

* memberships
* subscriptions
* coupons
* staff support
* multi-location
* SMS
* customer accounts

---

## Engineering Principles

* Scope all queries by clientId
* Prevent double booking at DB level
* Use transactions for booking creation
* Verify webhooks
* Keep logic out of UI
* Keep system simple and reusable

---

## Final Goal

A fast, clean, branded booking system that:

* increases bookings
* reduces no-shows
* is easy for clients to manage
* is easy for developers to maintain

---

---

## Homepage Rebuild — Smoove Skin Studio

This section governs the homepage (`/`) redesign only.
It does not affect the booking flow, admin portal, or any other pages.

### Ground Rules

* Work section by section. Do not proceed to the next section until instructed.
* Do not write any code until you confirm your plan and I approve it.
* Do not modify any existing booking flow, admin routes, or backend logic.
* Do not touch `/admin/*` routes or any API routes.
* All animations must be disabled or simplified on mobile unless specified.
* Use placeholder images where real images are not yet provided. Note every placeholder with a comment: `{/* TODO: Replace with real image */}`
* Pull service data from the existing data source — do not hardcode new service content.
* All copy below is final unless I explicitly say otherwise.

---

### Brand Tokens (Smoove Skin Studio)

These tokens must be used consistently across all homepage sections.
Do not invent new colors or fonts.

Current homepage components (`Hero.tsx`, etc.) mostly hardcode these as literal
hex values rather than CSS custom properties — unlike the admin/booking surfaces,
which were folded onto `--color-*` tokens in `src/app/globals.css`. The table below
is the canonical source of truth either way; wiring the homepage onto actual CSS
vars is a separate follow-up, not done yet.

#### Colors

##### Surfaces
| Token | Value | Usage |
|---|---|---|
| `surface/page` | `#F4EDE2` | page background |
| `surface/raised` | `#FBF7F0` | navbar (@ 82% opacity), cards |
| `surface/sunken-band` | `#E5D9C8` | about band, testimonial section |
| `surface/inverse` | `#2E1F17` | TikTok + contact-form panels |

##### Brand
| Token | Value | Usage |
|---|---|---|
| `brand/espresso` | `#3A281E` | primary buttons |
| `brand/espresso-deep` | `#2E1F17` | button hover, darkest text, dark surfaces |
| `brand/gold` | `#C8A56B` | stars, accents, submit button |
| `brand/gold-hover` | `#B8945A` | — |

##### Text
| Token | Value | Usage |
|---|---|---|
| `text/heading` | `#2E1F17` | — |
| `text/body` | `#5A463A` | — |
| `text/body-alt` | `#6A5447` | card/secondary copy |
| `text/muted` | `#8A7363` | — |
| `text/on-dark` | `#F4EDE2` | — |
| `text/on-dark-muted` | `rgba(244,237,226,0.72)` | — |

##### Accents
| Token | Value | Usage |
|---|---|---|
| `accent/mauve` | `#9A6A4E` | "refined", links hover, eyebrows |
| `accent/pink-blob` | `#F4C9D0` | radial glow, ~0.55 alpha |

##### Borders / dividers
| Token | Value | Usage |
|---|---|---|
| `border/hairline` | `rgba(154,106,78,0.18)` | — |
| `divider` | `rgba(154,106,78,0.22)` | — |
| `border/on-dark` | `rgba(244,237,226,0.22)` | — |

#### Typography

| Token | Family | Usage |
|---|---|---|
| `family/serif` | Cormorant Garamond | display headlines (500) and bold serif labels/titles (600) — same family, weight-differentiated |
| `family/sans` | DM Sans | body, nav, eyebrows, form |
| `family/mono` | Courier New | placeholder tags only (`LOGO 01` / `VIDEO 01`) |

Weights: serif 400, 500, 600 (+ italic 400/500); sans 300, 400, 500.

There's no separate third serif — headline and label share Cormorant Garamond.
Jost is preloaded in the font link but unused; Courier New is the only other
family, for placeholder chips.

##### Type scale
| Role | Spec |
|---|---|
| headline | Cormorant Garamond 500, `clamp(44px,4vw,60px)`, lh 1.02, ls -0.5px |
| subhead | Cormorant Garamond 500, `clamp(38px,3.6vw,54px)`, lh 1.04, ls -0.5px |
| label | Cormorant Garamond 600, 27px (card titles), 22px (stats), lh 1.1 |
| eyebrow | DM Sans 500, 11px, lh 1, ls 2px (uppercase) |
| body | DM Sans 300, 16.5px, lh 1.65 |
| body-lg | DM Sans 300, 17.5px, lh 1.65 (hero intro) |
| nav/small | DM Sans 300, 14px, ls 0.5px |

---

### Homepage Section Order

The homepage must render sections in this exact order:

1. Navbar (floating, fixed)
2. Hero
3. Rounded Reveal Panel + Marquee
4. About / Philosophy
5. Services (with category filter tabs)
6. Meet Anisha
7. Reserve CTA
8. Testimonials (with "Smoove" wordplay heading)
9. FAQ Accordion
10. Community + Partner Offers
11. Life at Smoove (TikTok)
12. Footer

---

### Animation System

All scroll-triggered animations follow these rules:

* Use `IntersectionObserver` or a lightweight animation library already in the stack (do not install new packages without asking).
* Default entrance: `opacity: 0 → 1`, `translateY: 20px → 0`, duration `0.5s`, easing `ease-out`.
* Stagger children by `0.08s` unless specified otherwise.
* Animations must only fire once (not replay on scroll up).
* On mobile (`< 768px`): disable parallax. Keep fade-in animations.
* Never use `animation-fill-mode: none` — elements must stay visible after animating in.

---

### Section 0 — Navbar

**This is a global component, not a homepage section.** It renders on all pages.
Check if a Navbar component already exists in the codebase before building.
If it exists, update it to match this spec. If it doesn't, create `src/components/Navbar.tsx`.

**Layout:** Floating pill/capsule — not full-width. Centered horizontally near the top of the viewport.

**Structure:**
- `position: fixed`, `top: 24px`, `left: 50%`, `transform: translateX(-50%)`, `z-index: 50`
- Container: `border-radius: 9999px` (full pill), `padding: 12px 24px`
- Background: `rgba(20, 20, 20, 0.55)` with `backdrop-filter: blur(16px)`
- Thin border: `1px solid rgba(255,255,255,0.10)`
- Width: `fit-content`, max-width `900px`, never full-width

**Three-zone layout (flex, space-between):**
- **Left:** Nav links — `Home`, `About`, `Services`, `Contact` — white text, small font, spaced evenly
- **Center:** Logo — `Smoove Skin Studio` wordmark or logo image
- **Right:** Phone number (icon + number) + `Book Your Session` CTA button

**CTA Button (right side):**
- Pill shaped: `border-radius: 9999px`
- Light/white fill with dark text (inverse of navbar background)
- Arrow `›` after the label
- On hover: slight brightness increase

**Behavior:**
- Fixed — stays at top on scroll
- On mobile (`< 768px`): collapse nav links into a hamburger menu icon. Keep logo center, keep CTA button visible.
- Links scroll to page sections or route to pages as appropriate

**Do NOT build a full-width sticky header.** It must be the floating pill style only.

---

### Section 1 — Hero

**Layout:** Full viewport height (`100vh`). Background photo, dark overlay.
Centered or left-aligned text block.

**Content:**
- Eyebrow: `Watauga, TX · Solo Esthetician Studio`
- Headline: `Your Skin Deserves Intentional Care.`
- Subtext: `Personalized facials and skin treatments by Anisha — in a calm, private studio built just for you.`
- CTA Button: `Book Your Session` → links to booking flow

**Animations:**
- Eyebrow fades in first (delay 0.1s)
- Headline fades up (delay 0.3s)
- Subtext fades up (delay 0.5s)
- CTA button fades up (delay 0.7s)
- Background image: slow Ken Burns zoom (scale 1.0 → 1.06 over 8s, no repeat)

**Image:** `/public/images/hero.jpg` — placeholder until replaced.

---

### Section 2 — Rounded Reveal Panel + Marquee

**Layout:** White panel that overlaps the Hero section.
- `border-radius: 32px 32px 0 0` on top corners
- `margin-top: -40px` to lift over the hero
- `z-index` above the hero section
- No shadow needed — the radius itself creates the separation

**Inside the panel:** A full-width horizontally scrolling marquee (infinite loop).

**Marquee behavior:**
- Pure CSS `@keyframes` animation — no JS library
- Items duplicated to make the loop seamless
- Speed: approximately 40s per full cycle
- No pause on hover

**Marquee items** (separated by `✦`):
```
✦ As Seen On TikTok  ✦ Watauga's Favorite Studio  ✦ Organic Products Only  ✦ Private 1-on-1 Sessions  ✦ Trusted by 200+ Clients  ✦ Licensed & Certified Esthetician  ✦ Clean Beauty Always
```

**Text style:** Small caps, muted brand color (not full black), brand font, `font-size: 0.8rem`.

---

### Section 3 — About / Philosophy

**Layout:** Two-column on desktop (image left, text right). Stacked on mobile (image on top).

**Content:**
- Eyebrow: `About Anisha`
- Headline: `Skin Care That Actually Listens.`
- Body: `Smoove Skin Studio isn't a chain. It's a private, one-on-one experience with an esthetician who takes the time to understand your skin — not just your appointment slot. Every treatment is customized, every visit is intentional.`
- Three trust points (icon + label):
  - `Licensed & Certified`
  - `Organic & Clean Products`
  - `Private Studio — No Distractions`
- Link: `Learn More About the Studio →`

**Animations:**
- Image fades in from left on scroll entry
- Text block fades in from right on scroll entry
- Trust bullet points stagger in at 0.1s each after text

**Do NOT include:** counter animations, number count-ups, stat blocks, or "years of experience" style metrics.

**Image:** `/public/images/anisha.jpg` — placeholder until replaced.

---

### Section 4 — Services

**Layout:** 3-column grid on desktop, horizontal scroll on mobile.

**Content:**
- Eyebrow: `Treatments`
- Headline: `Every Service, Tailored to You.`
- Subtext: `From clarifying facials to targeted skin treatments — each session is customized on the day.`
- CTA link below grid: `View All Services →`

**Category Filter Tabs:**
- Render filter tabs above the service cards
- Tabs are derived from the existing service categories in the codebase — do not hardcode category names
- Default: first tab selected / all services shown
- On tab click: filter the visible cards to that category with a smooth fade transition (opacity 0→1, 0.2s)
- Active tab style: filled background using brand primary color, white text
- Inactive tab style: outlined or muted, brand font

**Cards:** Pull from existing services data in the codebase. Each card displays:
- Service name
- Short description
- Duration
- Price (starting from)
- `Book This` button → links to booking flow with that service pre-selected if possible

**Hover state:** `translateY(-4px)` + increased box-shadow (use the shadow token above).

**Animations:** Cards fade up on scroll entry with 0.08s stagger between each. Re-stagger on tab filter change.

**Do NOT hardcode new services or categories.** Use only what already exists in the data layer.

---

### Section 5 — Meet Anisha

**Layout:** Full-width section. Two-column on desktop (text left, photo right). Stacked on mobile.

**Content:**
- Eyebrow: `Your Esthetician`
- Headline: `Meet Anisha.`
- Body: `Anisha is a licensed esthetician and the sole practitioner at Smoove Skin Studio. Every client gets her full attention — no handoffs, no rushing. Just skilled, personalized care in a space she built with you in mind.`
- Credential pills (3 small pill/badge elements):
  - `Licensed Esthetician`
  - `Clean Beauty Specialist`
  - `Private Studio Owner`
- CTA link: `Book With Anisha →` → links to booking flow

**Photo treatment:**
- Portrait format (tall, roughly 3:4 ratio)
- `border-radius: 24px` on the image
- Subtle warm shadow beneath
- Image path: `/public/images/anisha-portrait.jpg` — placeholder until replaced

**Animations:**
- Text block fades in from left on scroll entry
- Photo fades in from right with a slight delay (0.15s)
- Credential pills stagger in after text (0.08s each)

**Do NOT include** certifications lists, year counts, or stat numbers.

---

### Section 6 — Reserve CTA

**Layout:** Full-width banner. Background image with a dark overlay (~50% opacity). Centered content.

**Content:**
- Eyebrow: `Reserve Your Session`
- Headline: `The Best Skin Day Starts Here.`
- Subtext: `Your room is private. Your session is personalized. Book in under 2 minutes.`
- CTA Button: `Begin Your Ritual` → links to booking flow

**Animations:**
- Background image: subtle parallax (moves at 60% speed of scroll) on desktop only
- On mobile: `background-attachment: scroll`, no parallax
- Headline fades in on scroll entry

**Image:** `/public/images/studio.jpg` — placeholder until replaced.

---

### Section 7 — Testimonials

**Heading (exact implementation required):**

The section heading reads: **What Leaving Smoo~~the~~ ve Skin Studio Feels Like**

Implement as follows:
- The full visible text reads: `What Leaving Smoove Skin Studio Feels Like`
- The word `the` is visually struck through using an **inline SVG brush stroke** (not CSS `text-decoration`)
- The SVG is positioned absolutely over the word `the`, layered on top
- The brush stroke should look hand-drawn, irregular — not a straight line
- Color: warm brand accent or gold tone
- The wordplay: `Smoo` + `~~the~~` + `ve` = `Smoove` — this is intentional and should be preserved exactly

**Layout:** Large quote format or card layout. Left-aligned or centered.

**Cards display:**
- Quote text
- Client name
- Service received

Use existing testimonials data if present in the codebase. If none exists, use 3 placeholder testimonials.

**Navigation:** Left/right arrow buttons or dot indicators if more than 3 testimonials exist.

**Animations:** Cards fade in on scroll entry.

---

### Section 8 — FAQ Accordion

**Layout:** Single-column, centered, max-width ~800px. Standard accordion pattern.

**Content:**
- Eyebrow: `Questions`
- Headline: `We've Got You Covered.`
- Subtext: `Everything you'd want to know before your first visit.`

**FAQ Items (use these exactly):**
1. `Do I need to book in advance?` — Yes, booking at least 48 hours ahead is recommended to secure your preferred time. Same-day appointments are occasionally available — check availability online.
2. `What should I expect during my first visit?` — Your first session starts with a quick skin consultation so Anisha can customize your treatment on the day. Plan to arrive a few minutes early.
3. `What products are used?` — Only clean, organic products are used in the studio. No harsh chemicals, no synthetic fragrances.
4. `What is your cancellation policy?` — Pull from the existing cancellation policy in `BusinessSettings` if available. Otherwise use: Cancellations must be made at least 24 hours in advance to avoid a late cancellation fee.
5. `How long are sessions?` — Session lengths vary by service. Check the Services section or your booking confirmation for exact durations.

**Accordion behavior:**
- One item open at a time
- Smooth height expand/collapse using CSS `max-height` transition (not JS height calculation)
- `max-height: 0 → max-height: 200px`, `overflow: hidden`, `transition: max-height 0.35s ease`
- Open indicator: a `+` that rotates to `×` on open, or a chevron that rotates 180°
- Active item: question text uses brand accent color

**Animations:** Accordion container fades up on scroll entry.

---

### Section 9 — Community + Partner Offers

This section has two parts rendered within the same section block.

**Part A — Community / Email Signup**

- Eyebrow: `Join the Community`
- Headline: `Skin Tips, Studio Updates & Exclusive Deals.`
- Subtext: `Join 500+ clients who get early access to new services, seasonal offers, and Anisha's personal skin care advice.`
- Email input field + `Join Now` button
- No backend required yet — `console.log` the email value on submit
- Background: soft warm neutral (not white, not the primary color — use a tinted surface)

**Part B — Partner Offers**

- Eyebrow: `Exclusive Partner Offers`
- Headline: `Brands We Trust, Deals Just for You.`
- Display 3 partner offer cards. Each card:
  - Brand logo placeholder (gray box with brand name text)
  - Offer description (placeholder copy is fine)
  - `Claim Offer` button (non-functional for now)

**Divider:** Use a subtle horizontal rule or spacing to separate Part A and Part B visually.

**Animations:** Both parts fade up on scroll entry with stagger.

---

### Section 10 — Life at Smoove (TikTok)

**Layout:** Mirrors the "Life at Lumiera" Instagram section structure — centered heading, handle/platform line, content grid below, CTA link.

**Content:**
- Eyebrow: `Life at Smoove`
- Headline: `Follow the Journey.`
- Handle line: `Find us @smooveskinstudio on TikTok`
- CTA link: `Follow on TikTok` → `https://www.tiktok.com/@smooveskinstudio`

**Embed strategy:**
- Attempt a TikTok oEmbed iframe for one featured video
- If oEmbed is not viable in the current stack, render a placeholder grid of 6 cards:
  - Dark background card
  - Centered white play icon (SVG)
  - Placeholder thumbnail image
  - On hover: slight scale up (1.03)
  - Each card links to `https://www.tiktok.com/@smooveskinstudio`
- Note in a code comment: `{/* TODO: Replace with live TikTok embeds */}`

**Grid:** 3 columns desktop, 2 columns tablet, 1 column mobile.

**Animations:** Cards fade up on scroll entry with 0.08s stagger.

### Section 11 — Footer

**Layout:** Full-width dark footer. Multi-column on desktop, stacked on mobile.

**Background:** Dark — use the darkest brand color or `#0f0f0f`.

**Structure (4 zones):**

**Zone 1 — Brand (left column):**
- Smoove Skin Studio logo or wordmark (light/white version)
- Tagline: `Private. Intentional. Yours.`
- Social link: TikTok icon → `https://www.tiktok.com/@smooveskinstudio`

**Zone 2 — Navigate:**
- Label: `Navigate`
- Links: `Home`, `About`, `Services`, `Contact`

**Zone 3 — Services:**
- Label: `Treatments`
- Links: pull from existing service categories in the codebase — do not hardcode

**Zone 4 — Contact:**
- Label: `Contact`
- Studio location (pull from `BusinessSettings.address`)
- Hours (pull from `BusinessSettings` if available, otherwise placeholder: `Tue–Sat, 10am–6pm`)
- Phone (pull from `BusinessSettings.phone`)
- Email (pull from `BusinessSettings.email`)
- `Book Your Session →` link → booking flow

**Bottom bar:**
- Full-width divider above
- Left: `© 2025 Smoove Skin Studio. All Rights Reserved.`
- Right: `Privacy Policy` · `Terms & Conditions` (non-functional links for now)

**Typography:** All text white or light gray. Labels use brand accent color or slightly muted white.

**Do NOT pull live data for the footer.** Use `BusinessSettings` values from the codebase if they exist. If they don't, use clearly marked placeholder text with `{/* TODO: Pull from BusinessSettings */}` comments.

---

Every placeholder image must:
1. Render a visible light gray box at the correct aspect ratio
2. Include centered placeholder text (e.g. "Hero Image", "Anisha Photo")
3. Have a code comment directly above: `{/* TODO: Replace with real image — [description] */}`

---

### What Not To Do (Homepage)

* Do not modify the booking flow
* Do not modify admin routes or dashboard
* Do not install new npm packages without asking first
* Do not add number count-up animations or stat counters
* Do not use `text-decoration: line-through` for the Smoove wordplay — SVG only
* Do not hardcode service data or category names — always pull from the existing data layer
* Do not add parallax on mobile
* Do not auto-play any video or embed
* Do not remove or rename any existing components used outside the homepage
* Do not build a full-width sticky header — the navbar must be the floating pill style
* Do not use `text-decoration: line-through` on the FAQ accordion toggle — use rotation only
* Do not hardcode footer contact info — use `BusinessSettings` values or clearly marked placeholders
