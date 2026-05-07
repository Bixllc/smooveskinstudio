import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Mocks ──────────────────────────────────────────────────────────────────

// Mock prisma
const mockTransaction = vi.fn();
const mockPrisma = {
  service: { findFirstOrThrow: vi.fn(), findFirst: vi.fn() },
  businessSettings: { findFirstOrThrow: vi.fn(), findFirst: vi.fn() },
  availabilityRule: { findMany: vi.fn() },
  booking: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  blockedTime: { findMany: vi.fn(), findFirst: vi.fn() },
  customer: { findFirst: vi.fn(), create: vi.fn(), update: vi.fn() },
  payment: { create: vi.fn(), updateMany: vi.fn() },
  $transaction: mockTransaction,
};

vi.mock("../../lib/prisma", () => ({
  prisma: mockPrisma,
}));

// Mock availability
const mockIsSlotAvailable = vi.fn();
vi.mock("../../lib/availability", () => ({
  getAvailableSlots: vi.fn(),
  isSlotAvailable: mockIsSlotAvailable,
}));

// Mock square
const mockCreateCheckout = vi.fn();
const mockVerifySignature = vi.fn();
vi.mock("../../lib/square", () => ({
  createCheckoutSession: mockCreateCheckout,
  verifyWebhookSignature: mockVerifySignature,
}));

// Mock email
const mockSendConfirmation = vi.fn();
const mockSendAdminNotification = vi.fn();
vi.mock("../../lib/email", () => ({
  sendConfirmationEmail: mockSendConfirmation,
  sendAdminNotificationEmail: mockSendAdminNotification,
}));

// ─── Helpers ────────────────────────────────────────────────────────────────

function makeRequest(body: any, options?: RequestInit): Request {
  return new Request("http://localhost:3000/api/bookings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    ...options,
  });
}

const validBody = {
  clientId: "client-1",
  serviceId: "service-1",
  startTimeUtc: "2026-05-04T14:00:00.000Z",
  customer: {
    fullName: "Jane Doe",
    email: "jane@example.com",
    phone: "555-1234",
  },
};

// ─── POST /api/bookings — Slot Conflict ─────────────────────────────────────

describe("POST /api/bookings — slot conflict (409)", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("returns 409 when slot is no longer available", async () => {
    // Make $transaction execute the callback with a mock tx
    mockTransaction.mockImplementation(async (fn: Function) => {
      return fn(mockPrisma);
    });
    mockIsSlotAvailable.mockResolvedValue(false);

    const { POST } = await import("../../app/api/bookings/route");
    const request = makeRequest(validBody);
    const response = await POST(request as any);

    expect(response.status).toBe(409);
    const json = await response.json();
    expect(json.error).toBe("Time slot is no longer available");
  });

  it("returns 201 with bookingId and checkoutUrl on success", async () => {
    mockTransaction.mockImplementation(async (fn: Function) => {
      return fn(mockPrisma);
    });
    mockIsSlotAvailable.mockResolvedValue(true);

    mockPrisma.service.findFirstOrThrow.mockResolvedValue({
      id: "service-1",
      name: "Waxing",
      durationMinutes: 60,
      price: 75.0,
      depositAmount: null,
      paymentType: "FULL",
      bufferBeforeMinutes: 15,
      bufferAfterMinutes: 15,
    });
    mockPrisma.customer.findFirst.mockResolvedValue(null);
    mockPrisma.customer.create.mockResolvedValue({
      id: "cust-1",
      clientId: "client-1",
      fullName: "Jane Doe",
      email: "jane@example.com",
      phone: "555-1234",
    });
    mockPrisma.booking.create.mockResolvedValue({
      id: "booking-123",
      clientId: "client-1",
      serviceId: "service-1",
      customerId: "cust-1",
    });
    mockPrisma.booking.update.mockResolvedValue({});
    mockCreateCheckout.mockResolvedValue({
      checkoutUrl: "https://square.link/pay/abc",
      paymentId: "order-xyz",
    });
    mockPrisma.payment.create.mockResolvedValue({});

    const { POST } = await import("../../app/api/bookings/route");
    const request = makeRequest(validBody);
    const response = await POST(request as any);

    expect(response.status).toBe(201);
    const json = await response.json();
    expect(json.bookingId).toBe("booking-123");
    expect(json.checkoutUrl).toBe("https://square.link/pay/abc");
  });

  it("returns 400 for missing customer email", async () => {
    const { POST } = await import("../../app/api/bookings/route");
    const body = {
      ...validBody,
      customer: { fullName: "Jane", phone: "555" },
    };
    const request = makeRequest(body);
    const response = await POST(request as any);

    expect(response.status).toBe(400);
  });

  it("returns 400 for invalid email format", async () => {
    const { POST } = await import("../../app/api/bookings/route");
    const body = {
      ...validBody,
      customer: { ...validBody.customer, email: "not-an-email" },
    };
    const request = makeRequest(body);
    const response = await POST(request as any);

    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toContain("email");
  });
});

// ─── POST /api/webhooks/square ──────────────────────────────────────────────

describe("POST /api/webhooks/square", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    // Set env vars for the webhook handler
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3000");
    vi.stubEnv("SQUARE_WEBHOOK_SIGNATURE_KEY", "test-key");
  });

  function makeWebhookRequest(body: any, signature?: string): Request {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (signature) {
      headers["x-square-hmacsha256-signature"] = signature;
    }
    return new Request("http://localhost:3000/api/webhooks/square", {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
  }

  it("returns 401 when signature is missing", async () => {
    const { POST } = await import("../../app/api/webhooks/square/route");
    const request = makeWebhookRequest({ type: "payment.completed" });
    const response = await POST(request as any);

    expect(response.status).toBe(401);
  });

  it("returns 401 when signature is invalid", async () => {
    mockVerifySignature.mockReturnValue(false);

    const { POST } = await import("../../app/api/webhooks/square/route");
    const request = makeWebhookRequest(
      { type: "payment.completed" },
      "bad-signature"
    );
    const response = await POST(request as any);

    expect(response.status).toBe(401);
  });

  it("returns 200 and processes payment.completed event", async () => {
    mockVerifySignature.mockReturnValue(true);

    const webhookEvent = {
      type: "payment.completed",
      data: {
        object: {
          payment: {
            order_id: "order-xyz",
            id: "payment-abc",
          },
        },
      },
    };

    const bookingData = {
      id: "booking-123",
      paymentId: "order-xyz",
      clientId: "client-1",
      startTimeUtc: new Date("2026-05-04T14:00:00Z"),
      service: {
        name: "Waxing",
        durationMinutes: 60,
        price: 75.0,
      },
      customer: {
        fullName: "Jane Doe",
        email: "jane@example.com",
        phone: "555-1234",
      },
      client: {
        businessSettings: {
          timezone: "America/New_York",
          address: "123 Main St",
          email: "admin@salon.com",
          cancellationPolicy: "24h notice required",
          latePolicy: null,
          noShowPolicy: null,
          depositPolicy: null,
        },
      },
    };

    mockPrisma.booking.findFirst.mockResolvedValue(bookingData);
    mockPrisma.booking.update.mockResolvedValue({});
    mockPrisma.payment.updateMany.mockResolvedValue({});
    mockSendConfirmation.mockResolvedValue(undefined);
    mockSendAdminNotification.mockResolvedValue(undefined);

    const { POST } = await import("../../app/api/webhooks/square/route");
    const request = makeWebhookRequest(webhookEvent, "valid-sig");
    const response = await POST(request as any);

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.received).toBe(true);

    // Let the async processing finish
    await new Promise((r) => setTimeout(r, 50));

    // Verify booking was updated to confirmed
    expect(mockPrisma.booking.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "booking-123" },
        data: expect.objectContaining({
          status: "CONFIRMED",
          paymentStatus: "PAID",
        }),
      })
    );

    // Verify confirmation email was sent
    expect(mockSendConfirmation).toHaveBeenCalledWith(
      expect.objectContaining({
        customerEmail: "jane@example.com",
        serviceName: "Waxing",
      })
    );

    // Verify admin notification was sent
    expect(mockSendAdminNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        adminEmail: "admin@salon.com",
        customerName: "Jane Doe",
      })
    );
  });

  it("handles payment.failed by cancelling booking", async () => {
    mockVerifySignature.mockReturnValue(true);

    const webhookEvent = {
      type: "payment.failed",
      data: {
        object: {
          payment: {
            order_id: "order-fail",
            id: "payment-fail",
          },
        },
      },
    };

    mockPrisma.booking.findFirst.mockResolvedValue({
      id: "booking-456",
      paymentId: "order-fail",
    });
    mockPrisma.booking.update.mockResolvedValue({});
    mockPrisma.payment.updateMany.mockResolvedValue({});

    const { POST } = await import("../../app/api/webhooks/square/route");
    const request = makeWebhookRequest(webhookEvent, "valid-sig");
    const response = await POST(request as any);

    expect(response.status).toBe(200);

    // Let async processing finish
    await new Promise((r) => setTimeout(r, 50));

    expect(mockPrisma.booking.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "booking-456" },
        data: expect.objectContaining({
          status: "CANCELLED",
          paymentStatus: "FAILED",
        }),
      })
    );
  });
});
