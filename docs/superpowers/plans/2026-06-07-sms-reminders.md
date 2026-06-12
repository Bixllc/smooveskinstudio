# SMS Reminders — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Send SMS reminders to clients before their appointments using Twilio, with admin-configurable lead time.

**Architecture:** Schema adds `reminderLeadHours` to BusinessSettings and `reminderSmsSentAt` to Booking. A Vercel cron endpoint fires every 15 min, finds confirmed bookings within the lead window, and sends email + SMS reminders independently. A new `src/lib/sms.ts` wraps Twilio.

**Tech Stack:** Twilio SDK (`twilio` npm), Vercel Cron, Prisma migrations, Next.js API routes, date-fns

---

## Files

| Action | Path |
|--------|------|
| Modify | `prisma/schema.prisma` |
| Create | `src/lib/sms.ts` |
| Create | `src/app/api/cron/reminders/route.ts` |
| Create | `vercel.json` |
| Modify | `src/app/api/admin/settings/route.ts` |
| Modify | `src/app/admin/(dashboard)/settings/scheduling/page.tsx` |

---

## Task 1: Schema — add reminderLeadHours + reminderSmsSentAt

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: Add fields to schema**

In `BusinessSettings`, after `summaryEmailFrequency`:
```prisma
reminderLeadHours           Int      @default(24)
```

In `Booking`, after `reminderEmailSentAt`:
```prisma
reminderSmsSentAt       DateTime?
```

- [ ] **Step 2: Run migration**

```bash
npx prisma migrate dev --name add_sms_reminder_fields
```

Expected: Migration created and applied successfully. Prisma client regenerated.

- [ ] **Step 3: Verify**

```bash
npx prisma studio
```

Open BusinessSettings and Booking tables — confirm new fields exist.

- [ ] **Step 4: Commit**

```bash
git add prisma/schema.prisma prisma/migrations/
git commit -m "feat: add reminderLeadHours to BusinessSettings and reminderSmsSentAt to Booking"
```

---

## Task 2: Twilio SMS wrapper

**Files:**
- Create: `src/lib/sms.ts`

- [ ] **Step 1: Install Twilio**

```bash
npm install twilio
```

- [ ] **Step 2: Create `src/lib/sms.ts`**

```ts
import twilio from "twilio";

interface SmsReminderData {
  to: string;
  customerName: string;
  serviceName: string;
  dateTime: string;
  businessPhone?: string | null;
}

function getClient() {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token) return null;
  return twilio(sid, token);
}

export async function sendSmsReminder(data: SmsReminderData): Promise<void> {
  const client = getClient();
  const from = process.env.TWILIO_PHONE_NUMBER;
  if (!client || !from) return;

  const firstName = data.customerName.split(" ")[0];
  const contactLine = data.businessPhone
    ? ` Questions? Call us at ${data.businessPhone}.`
    : "";

  const body = `Hi ${firstName}, just a reminder that your ${data.serviceName} appointment is tomorrow at ${data.dateTime}.${contactLine} Reply STOP to opt out.`;

  await client.messages.create({ body, from, to: data.to });
}
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/sms.ts package.json package-lock.json
git commit -m "feat: add Twilio SMS wrapper"
```

---

## Task 3: Cron endpoint

**Files:**
- Create: `src/app/api/cron/reminders/route.ts`

The cron runs every 15 minutes. For each client it finds confirmed bookings whose `startTimeUtc` falls within the 1-hour window ending at `now + reminderLeadHours`, and where `reminderEmailSentAt IS NULL`. Email and SMS are sent independently (one failing doesn't block the other).

- [ ] **Step 1: Create `src/app/api/cron/reminders/route.ts`**

```ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendReminderEmail } from "@/lib/email";
import { sendSmsReminder } from "@/lib/sms";
import { addHours, format } from "date-fns";
import { toZonedTime } from "date-fns-tz";

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  // Fetch all clients with settings
  const clients = await prisma.client.findMany({
    where: { active: true },
    include: { businessSettings: true },
  });

  let totalSent = 0;

  for (const client of clients) {
    const settings = client.businessSettings;
    if (!settings) continue;

    const leadHours = settings.reminderLeadHours ?? 24;
    const windowStart = addHours(now, leadHours - 1);
    const windowEnd = addHours(now, leadHours);

    const bookings = await prisma.booking.findMany({
      where: {
        clientId: client.id,
        status: "CONFIRMED",
        startTimeUtc: { gte: windowStart, lt: windowEnd },
        reminderEmailSentAt: null,
      },
      include: {
        customer: true,
        service: true,
      },
    });

    for (const booking of bookings) {
      const local = toZonedTime(booking.startTimeUtc, settings.timezone);
      const dateTime = format(local, "MMM d 'at' h:mm a");

      const manageUrl = booking.manageToken
        ? `${process.env.NEXT_PUBLIC_APP_URL}/${client.slug}/manage/${booking.manageToken}`
        : undefined;

      // Send email (always)
      try {
        await sendReminderEmail({
          customerName: booking.customer.fullName,
          customerEmail: booking.customer.email,
          serviceName: booking.service.name,
          dateTime,
          duration: booking.service.durationMinutes,
          address: settings.address ?? undefined,
          manageUrl,
        });
        await prisma.booking.update({
          where: { id: booking.id },
          data: { reminderEmailSentAt: now },
        });
      } catch (err) {
        console.error(`Email reminder failed for booking ${booking.id}:`, err);
      }

      // Send SMS if customer has phone
      if (booking.customer.phone) {
        try {
          await sendSmsReminder({
            to: booking.customer.phone,
            customerName: booking.customer.fullName,
            serviceName: booking.service.name,
            dateTime,
            businessPhone: settings.phone,
          });
          await prisma.booking.update({
            where: { id: booking.id },
            data: { reminderSmsSentAt: now },
          });
        } catch (err) {
          console.error(`SMS reminder failed for booking ${booking.id}:`, err);
        }
      }

      totalSent++;
    }
  }

  return NextResponse.json({ ok: true, sent: totalSent });
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/cron/reminders/route.ts
git commit -m "feat: reminder cron endpoint with email + SMS"
```

---

## Task 4: Vercel cron config

**Files:**
- Create: `vercel.json`

- [ ] **Step 1: Create `vercel.json`**

```json
{
  "crons": [
    {
      "path": "/api/cron/reminders",
      "schedule": "*/15 * * * *"
    }
  ]
}
```

- [ ] **Step 2: Commit**

```bash
git add vercel.json
git commit -m "feat: Vercel cron schedule for reminder job"
```

---

## Task 5: Settings — expose reminderLeadHours

**Files:**
- Modify: `src/app/api/admin/settings/route.ts`
- Modify: `src/app/admin/(dashboard)/settings/scheduling/page.tsx`

### Step 1: Allow reminderLeadHours in settings API

In `src/app/api/admin/settings/route.ts`, add `"reminderLeadHours"` to the `allowedFields` array:

```ts
const allowedFields = [
  "businessName",
  "address",
  "phone",
  "email",
  "timezone",
  "cancellationPolicy",
  "latePolicy",
  "noShowPolicy",
  "depositPolicy",
  "minBookingLeadHours",
  "maxBookingDaysOut",
  "cancelRescheduleWindowHours",
  "allowClientCancel",
  "allowClientReschedule",
  "latestBookingTime",
  "alertNewBooking",
  "alertCancellation",
  "alertReschedule",
  "summaryEmailEnabled",
  "summaryEmailTime",
  "summaryEmailFrequency",
  "emailTemplateSettings",
  "reminderLeadHours",   // ← add this
];
```

### Step 2: Add field to scheduling page

In `src/app/admin/(dashboard)/settings/scheduling/page.tsx`:

**Add to `SchedulingForm` interface:**
```ts
interface SchedulingForm {
  minBookingLeadHours: number;
  maxBookingDaysOut: number;
  cancelRescheduleWindowHours: number;
  allowClientCancel: boolean;
  allowClientReschedule: boolean;
  latestBookingTime: string;
  reminderLeadHours: number;   // ← add
}
```

**Add to initial state:**
```ts
const [form, setForm] = useState<SchedulingForm>({
  minBookingLeadHours: 2,
  maxBookingDaysOut: 100,
  cancelRescheduleWindowHours: 24,
  allowClientCancel: true,
  allowClientReschedule: true,
  latestBookingTime: "",
  reminderLeadHours: 24,   // ← add
});
```

**Add to fetch mapping (inside `.then((data) => { setForm({...}) })`):**
```ts
reminderLeadHours: data.reminderLeadHours ?? 24,
```

**Add UI field** — inside the "Cancel & Reschedule" card, after the `cancelRescheduleWindowHours` field, add a new card for reminders:

```tsx
<div className="rounded-xl border border-[#e8e6e1] bg-white p-6 space-y-4">
  <p className="text-[15px] font-semibold text-[#1a1814]">Reminders</p>

  <Field label="Reminder lead time (hours)" hint="How many hours before the appointment to send the reminder SMS & email">
    <NumberInput
      value={form.reminderLeadHours}
      onChange={(v) => setForm((f) => ({ ...f, reminderLeadHours: v }))}
      min={1}
      max={168}
    />
  </Field>
</div>
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/admin/settings/route.ts \
        src/app/admin/(dashboard)/settings/scheduling/page.tsx
git commit -m "feat: add reminder lead time setting to scheduling limits"
```

---

## Post-deploy Setup

After deploying, add these to Vercel environment variables:
```
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=   # E.164 format e.g. +14155552671
CRON_SECRET=           # Auto-set by Vercel for cron routes
```

Vercel automatically sets `CRON_SECRET` — no manual action needed for that one.
