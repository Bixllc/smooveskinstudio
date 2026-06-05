import { toZonedTime, fromZonedTime } from "date-fns-tz";
import { addMinutes, addDays, startOfDay, setHours, setMinutes, isBefore, isAfter, isEqual } from "date-fns";
import { prisma } from "./prisma";

export interface GetAvailableSlotsParams {
  clientId: string;
  serviceId: string;
  date: string; // YYYY-MM-DD in client timezone
  addOnDurationMinutes?: number;
}

export interface IsSlotAvailableParams {
  clientId: string;
  serviceId: string;
  startTimeUtc: Date;
  addOnDurationMinutes?: number;
}

interface TimeBlock {
  start: Date;
  end: Date;
}

/**
 * Returns available start times (as UTC ISO strings) for a given date.
 */
export async function getAvailableSlots(
  params: GetAvailableSlotsParams
): Promise<string[]> {
  const { clientId, serviceId, date } = params;

  const [service, settings] = await Promise.all([
    prisma.service.findFirstOrThrow({
      where: { id: serviceId, clientId, active: true },
    }),
    prisma.businessSettings.findFirstOrThrow({
      where: { clientId },
    }),
  ]);

  const timezone = settings.timezone;
  const dayDate = new Date(`${date}T00:00:00`);
  const dayOfWeek = getLocalDayOfWeek(date, timezone);

  const rules = await prisma.availabilityRule.findMany({
    where: { clientId, dayOfWeek, active: true },
  });

  if (rules.length === 0) return [];

  // Day boundaries in UTC for querying
  const dayStartUtc = fromZonedTime(new Date(`${date}T00:00:00`), timezone);
  const dayEndUtc = fromZonedTime(new Date(`${date}T23:59:59`), timezone);

  const [bookings, blockedTimes] = await Promise.all([
    prisma.booking.findMany({
      where: {
        clientId,
        status: { notIn: ["CANCELLED", "RESCHEDULED"] },
        startTimeUtc: { lt: dayEndUtc },
        endTimeUtc: { gt: dayStartUtc },
      },
    }),
    prisma.blockedTime.findMany({
      where: {
        clientId,
        startTimeUtc: { lt: dayEndUtc },
        endTimeUtc: { gt: dayStartUtc },
      },
    }),
  ]);

  const occupiedBlocks: TimeBlock[] = [
    ...bookings.map((b) => ({ start: b.startTimeUtc, end: b.endTimeUtc })),
    ...blockedTimes.map((bt) => ({ start: bt.startTimeUtc, end: bt.endTimeUtc })),
  ];

  const totalMinutes =
    service.bufferBeforeMinutes + service.durationMinutes + service.bufferAfterMinutes;

  const now = new Date();
  const minLeadMs = (settings.minBookingLeadHours ?? 2) * 60 * 60 * 1000;
  const maxDaysOut = settings.maxBookingDaysOut ?? 100;
  const maxFutureUtc = addDays(now, maxDaysOut);

  // Parse latestBookingTime ("HH:MM") into a UTC cutoff for this date
  let latestCutoffUtc: Date | null = null;
  if (settings.latestBookingTime) {
    latestCutoffUtc = fromZonedTime(
      new Date(`${date}T${settings.latestBookingTime}:00`),
      timezone
    );
  }

  const slots: string[] = [];

  const extraMinutes = params.addOnDurationMinutes ?? 0;

  for (const rule of rules) {
    const candidates = generateCandidateSlots(date, rule.startTime, rule.endTime, timezone);

    for (const candidateUtc of candidates) {
      // Filter: must be far enough in the future (minBookingLeadHours)
      if (candidateUtc.getTime() - now.getTime() < minLeadMs) continue;
      // Filter: must not exceed maxBookingDaysOut
      if (isAfter(candidateUtc, maxFutureUtc)) continue;
      // Filter: must not be after latestBookingTime
      if (latestCutoffUtc && isAfter(candidateUtc, latestCutoffUtc)) continue;

      const blockStart = addMinutes(candidateUtc, -service.bufferBeforeMinutes);
      const blockEnd = addMinutes(candidateUtc, service.durationMinutes + extraMinutes + service.bufferAfterMinutes);

      if (!hasOverlap(blockStart, blockEnd, occupiedBlocks)) {
        // Ensure entire block fits within the availability window
        const windowStart = fromZonedTime(parseTimeOnDate(date, rule.startTime), timezone);
        const windowEnd = fromZonedTime(parseTimeOnDate(date, rule.endTime), timezone);

        if (
          (isEqual(blockStart, windowStart) || isBefore(windowStart, blockStart)) &&
          (isEqual(blockEnd, windowEnd) || isBefore(blockEnd, windowEnd))
        ) {
          slots.push(candidateUtc.toISOString());
        }
      }
    }
  }

  return slots;
}

/**
 * Checks if a specific slot is still available. Use inside a transaction to prevent races.
 * Pass excludeBookingId to ignore the current booking (used when rescheduling).
 */
export async function isSlotAvailable(
  params: IsSlotAvailableParams,
  tx?: typeof prisma,
  excludeBookingId?: string
): Promise<boolean> {
  const db = tx || prisma;
  const { clientId, serviceId, startTimeUtc } = params;

  const service = await db.service.findFirst({
    where: { id: serviceId, clientId, active: true },
  });

  if (!service) return false;

  const extraMinutes = params.addOnDurationMinutes ?? 0;
  const blockStart = addMinutes(startTimeUtc, -service.bufferBeforeMinutes);
  const blockEnd = addMinutes(startTimeUtc, service.durationMinutes + extraMinutes + service.bufferAfterMinutes);

  // Check for overlapping bookings
  const overlappingBooking = await db.booking.findFirst({
    where: {
      clientId,
      ...(excludeBookingId ? { id: { not: excludeBookingId } } : {}),
      status: { notIn: ["CANCELLED", "RESCHEDULED"] },
      startTimeUtc: { lt: blockEnd },
      endTimeUtc: { gt: blockStart },
    },
  });

  if (overlappingBooking) return false;

  // Check for overlapping blocked times
  const overlappingBlock = await db.blockedTime.findFirst({
    where: {
      clientId,
      startTimeUtc: { lt: blockEnd },
      endTimeUtc: { gt: blockStart },
    },
  });

  if (overlappingBlock) return false;

  // Verify the slot is within availability hours
  const settings = await db.businessSettings.findFirst({
    where: { clientId },
  });

  if (!settings) return false;

  // Check minBookingLeadHours
  const minLeadHours = settings.minBookingLeadHours ?? 2;
  const minLeadMs = minLeadHours * 60 * 60 * 1000;
  if (startTimeUtc.getTime() - Date.now() < minLeadMs) return false;

  // Check maxBookingDaysOut
  const maxDaysOut = settings.maxBookingDaysOut ?? 100;
  const maxFuture = addDays(new Date(), maxDaysOut);
  if (isAfter(startTimeUtc, maxFuture)) return false;

  const timezone = settings.timezone;
  const zonedStart = toZonedTime(startTimeUtc, timezone);
  const dateStr = `${zonedStart.getFullYear()}-${String(zonedStart.getMonth() + 1).padStart(2, "0")}-${String(zonedStart.getDate()).padStart(2, "0")}`;
  const dayOfWeek = getLocalDayOfWeek(dateStr, timezone);

  const rules = await db.availabilityRule.findMany({
    where: { clientId, dayOfWeek, active: true },
  });

  if (rules.length === 0) return false;

  const isWithinAnyRule = rules.some((rule) => {
    const windowStart = fromZonedTime(parseTimeOnDate(dateStr, rule.startTime), timezone);
    const windowEnd = fromZonedTime(parseTimeOnDate(dateStr, rule.endTime), timezone);
    return (
      (isEqual(blockStart, windowStart) || isBefore(windowStart, blockStart)) &&
      (isEqual(blockEnd, windowEnd) || isBefore(blockEnd, windowEnd))
    );
  });

  return isWithinAnyRule;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function getLocalDayOfWeek(dateStr: string, timezone: string): number {
  const localDate = new Date(`${dateStr}T12:00:00`);
  return localDate.getDay();
}

function parseTimeOnDate(dateStr: string, time: string): Date {
  const [hours, minutes] = time.split(":").map(Number);
  return new Date(`${dateStr}T${time}:00`);
}

function generateCandidateSlots(
  dateStr: string,
  startTime: string,
  endTime: string,
  timezone: string
): Date[] {
  const [startH, startM] = startTime.split(":").map(Number);
  const [endH, endM] = endTime.split(":").map(Number);

  const slots: Date[] = [];
  let currentMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  while (currentMinutes < endMinutes) {
    const h = Math.floor(currentMinutes / 60);
    const m = currentMinutes % 60;
    const timeStr = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    const localDate = parseTimeOnDate(dateStr, timeStr);
    const utcDate = fromZonedTime(localDate, timezone);
    slots.push(utcDate);
    currentMinutes += 30;
  }

  return slots;
}

function hasOverlap(start: Date, end: Date, blocks: TimeBlock[]): boolean {
  return blocks.some(
    (block) => block.start < end && block.end > start
  );
}
