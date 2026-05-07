import { describe, it, expect, vi, beforeEach } from "vitest";
import { fromZonedTime } from "date-fns-tz";

// Mock prisma before importing availability module
vi.mock("../prisma", () => ({
  prisma: {
    service: { findFirstOrThrow: vi.fn(), findFirst: vi.fn() },
    businessSettings: { findFirstOrThrow: vi.fn(), findFirst: vi.fn() },
    availabilityRule: { findMany: vi.fn() },
    booking: { findMany: vi.fn(), findFirst: vi.fn() },
    blockedTime: { findMany: vi.fn(), findFirst: vi.fn() },
  },
}));

import { getAvailableSlots, isSlotAvailable } from "../availability";
import { prisma } from "../prisma";

const CLIENT_ID = "client-1";
const SERVICE_ID = "service-1";
const TIMEZONE = "America/New_York";

const mockService = {
  id: SERVICE_ID,
  clientId: CLIENT_ID,
  durationMinutes: 60,
  bufferBeforeMinutes: 15,
  bufferAfterMinutes: 15,
  active: true,
};

const mockSettings = {
  clientId: CLIENT_ID,
  timezone: TIMEZONE,
};

// Monday availability: 9:00 - 17:00
const mockRule = {
  id: "rule-1",
  clientId: CLIENT_ID,
  dayOfWeek: 1, // Monday
  startTime: "09:00",
  endTime: "17:00",
  active: true,
};

function setupMocks(overrides: {
  rules?: typeof mockRule[];
  bookings?: { startTimeUtc: Date; endTimeUtc: Date }[];
  blockedTimes?: { startTimeUtc: Date; endTimeUtc: Date }[];
} = {}) {
  const { rules = [mockRule], bookings = [], blockedTimes = [] } = overrides;

  vi.mocked(prisma.service.findFirstOrThrow).mockResolvedValue(mockService as any);
  vi.mocked(prisma.service.findFirst).mockResolvedValue(mockService as any);
  vi.mocked(prisma.businessSettings.findFirstOrThrow).mockResolvedValue(mockSettings as any);
  vi.mocked(prisma.businessSettings.findFirst).mockResolvedValue(mockSettings as any);
  vi.mocked(prisma.availabilityRule.findMany).mockResolvedValue(rules as any);
  vi.mocked(prisma.booking.findMany).mockResolvedValue(bookings as any);
  vi.mocked(prisma.booking.findFirst).mockResolvedValue(null as any);
  vi.mocked(prisma.blockedTime.findMany).mockResolvedValue(blockedTimes as any);
  vi.mocked(prisma.blockedTime.findFirst).mockResolvedValue(null as any);
}

describe("getAvailableSlots", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("returns available slots within business hours", async () => {
    // 2026-05-04 is a Monday
    setupMocks();

    const slots = await getAvailableSlots({
      clientId: CLIENT_ID,
      serviceId: SERVICE_ID,
      date: "2026-05-04",
    });

    expect(slots.length).toBeGreaterThan(0);

    // All returned slots should be valid UTC ISO strings
    for (const slot of slots) {
      expect(new Date(slot).toISOString()).toBe(slot);
    }

    // First slot should be 09:15 ET (buffer before pushes earliest start to 09:15)
    // Actually: block starts at 09:00 (bufferBefore=15 from 09:15 start means block starts at 09:00)
    // So first valid candidate is 09:00 local → slot start at 09:00, block starts at 08:45 → outside window
    // First valid: 09:30 local → block 09:15-10:45 — 09:15 >= 09:00 ✓, but wait...
    // Let me re-check: candidate=09:00, blockStart=08:45, that's before window 09:00. Invalid.
    // candidate=09:30, blockStart=09:15, blockEnd=10:45 — 09:15 >= 09:00 ✓, 10:45 <= 17:00 ✓
    // Actually candidate=09:00 with bufferBefore=15 → blockStart = 09:00 - 15min = 08:45 < 09:00 ❌
    // So with 15min buffer before, first valid slot is 09:30 (blockStart=09:15... still < 09:00? No: 09:30-15=09:15 >= 09:00 ✓)
    // Wait: 09:15 >= 09:00 ✓. blockEnd = 09:30 + 60 + 15 = 11:15 <= 17:00 ✓
    // Actually: first candidate is 09:00. blockStart = 09:00 - 15 = 08:45. 08:45 < 09:00 ❌
    // So first valid is 09:30. blockStart = 09:30 - 15 = 09:15. 09:15 >= 09:00 ✓
    const firstSlotLocal = new Date(slots[0]);
    expect(slots[0]).toBe(fromZonedTime(new Date("2026-05-04T09:30:00"), TIMEZONE).toISOString());
  });

  it("excludes slots blocked by existing bookings", async () => {
    // Booking from 10:00 - 11:00 ET
    const bookingStart = fromZonedTime(new Date("2026-05-04T10:00:00"), TIMEZONE);
    const bookingEnd = fromZonedTime(new Date("2026-05-04T11:00:00"), TIMEZONE);

    setupMocks({
      bookings: [{ startTimeUtc: bookingStart, endTimeUtc: bookingEnd }],
    });

    const slots = await getAvailableSlots({
      clientId: CLIENT_ID,
      serviceId: SERVICE_ID,
      date: "2026-05-04",
    });

    // The 10:00 slot should NOT be present (booking occupies 10:00-11:00, slot block would be 09:45-11:15)
    const tenAmUtc = fromZonedTime(new Date("2026-05-04T10:00:00"), TIMEZONE).toISOString();
    expect(slots).not.toContain(tenAmUtc);

    // 09:30 slot block = 09:15 - 10:45 → overlaps booking 10:00-11:00 → excluded
    const nineThirtyUtc = fromZonedTime(new Date("2026-05-04T09:30:00"), TIMEZONE).toISOString();
    expect(slots).not.toContain(nineThirtyUtc);
  });

  it("excludes slots where buffer overlaps an existing booking", async () => {
    // Booking from 11:00 - 12:00 ET
    const bookingStart = fromZonedTime(new Date("2026-05-04T11:00:00"), TIMEZONE);
    const bookingEnd = fromZonedTime(new Date("2026-05-04T12:00:00"), TIMEZONE);

    setupMocks({
      bookings: [{ startTimeUtc: bookingStart, endTimeUtc: bookingEnd }],
    });

    const slots = await getAvailableSlots({
      clientId: CLIENT_ID,
      serviceId: SERVICE_ID,
      date: "2026-05-04",
    });

    // 10:00 slot: block = 09:45 - 11:15. Overlaps booking 11:00-12:00 → excluded
    const tenAmUtc = fromZonedTime(new Date("2026-05-04T10:00:00"), TIMEZONE).toISOString();
    expect(slots).not.toContain(tenAmUtc);

    // 10:30 slot: block = 10:15 - 11:45. Overlaps booking 11:00-12:00 → excluded
    const tenThirtyUtc = fromZonedTime(new Date("2026-05-04T10:30:00"), TIMEZONE).toISOString();
    expect(slots).not.toContain(tenThirtyUtc);
  });

  it("returns empty array when no availability rules exist", async () => {
    setupMocks({ rules: [] });

    const slots = await getAvailableSlots({
      clientId: CLIENT_ID,
      serviceId: SERVICE_ID,
      date: "2026-05-04",
    });

    expect(slots).toEqual([]);
  });

  it("excludes slots blocked by BlockedTime", async () => {
    // Block from 13:00 - 14:00 ET
    const blockStart = fromZonedTime(new Date("2026-05-04T13:00:00"), TIMEZONE);
    const blockEnd = fromZonedTime(new Date("2026-05-04T14:00:00"), TIMEZONE);

    setupMocks({
      blockedTimes: [{ startTimeUtc: blockStart, endTimeUtc: blockEnd }],
    });

    const slots = await getAvailableSlots({
      clientId: CLIENT_ID,
      serviceId: SERVICE_ID,
      date: "2026-05-04",
    });

    // 13:00 slot: block = 12:45 - 14:15. Overlaps blocked 13:00-14:00 → excluded
    const onepmUtc = fromZonedTime(new Date("2026-05-04T13:00:00"), TIMEZONE).toISOString();
    expect(slots).not.toContain(onepmUtc);

    // 12:30 slot: block = 12:15 - 13:45. Overlaps blocked 13:00-14:00 → excluded
    const twelveThirtyUtc = fromZonedTime(new Date("2026-05-04T12:30:00"), TIMEZONE).toISOString();
    expect(slots).not.toContain(twelveThirtyUtc);
  });
});

describe("isSlotAvailable", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("returns true for a valid available slot", async () => {
    setupMocks();

    const slotUtc = fromZonedTime(new Date("2026-05-04T10:00:00"), TIMEZONE);

    const result = await isSlotAvailable({
      clientId: CLIENT_ID,
      serviceId: SERVICE_ID,
      startTimeUtc: slotUtc,
    });

    expect(result).toBe(true);
  });

  it("returns false when slot overlaps existing booking", async () => {
    setupMocks();

    const slotUtc = fromZonedTime(new Date("2026-05-04T10:00:00"), TIMEZONE);
    // Mock findFirst to return an overlapping booking
    vi.mocked(prisma.booking.findFirst).mockResolvedValue({ id: "booking-1" } as any);

    const result = await isSlotAvailable({
      clientId: CLIENT_ID,
      serviceId: SERVICE_ID,
      startTimeUtc: slotUtc,
    });

    expect(result).toBe(false);
  });

  it("returns false when slot overlaps blocked time", async () => {
    setupMocks();

    const slotUtc = fromZonedTime(new Date("2026-05-04T10:00:00"), TIMEZONE);
    vi.mocked(prisma.booking.findFirst).mockResolvedValue(null as any);
    vi.mocked(prisma.blockedTime.findFirst).mockResolvedValue({ id: "block-1" } as any);

    const result = await isSlotAvailable({
      clientId: CLIENT_ID,
      serviceId: SERVICE_ID,
      startTimeUtc: slotUtc,
    });

    expect(result).toBe(false);
  });

  it("returns false when slot is outside business hours", async () => {
    setupMocks({ rules: [] }); // No rules for that day

    const slotUtc = fromZonedTime(new Date("2026-05-04T08:00:00"), TIMEZONE);

    const result = await isSlotAvailable({
      clientId: CLIENT_ID,
      serviceId: SERVICE_ID,
      startTimeUtc: slotUtc,
    });

    expect(result).toBe(false);
  });

  it("returns false when service not found", async () => {
    setupMocks();
    vi.mocked(prisma.service.findFirst).mockResolvedValue(null as any);

    const slotUtc = fromZonedTime(new Date("2026-05-04T10:00:00"), TIMEZONE);

    const result = await isSlotAvailable({
      clientId: CLIENT_ID,
      serviceId: "nonexistent",
      startTimeUtc: slotUtc,
    });

    expect(result).toBe(false);
  });
});
