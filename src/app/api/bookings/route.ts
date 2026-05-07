import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isSlotAvailable } from "@/lib/availability";
import { createCheckoutSession } from "@/lib/square";
import { addMinutes } from "date-fns";

interface BookingRequestBody {
  clientId: string;
  serviceId: string;
  startTimeUtc: string;
  customer: {
    fullName: string;
    email: string;
    phone: string;
    notes?: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: BookingRequestBody = await request.json();

    const validationError = validateBookingInput(body);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const { clientId, serviceId, startTimeUtc: startTimeStr, customer } = body;
    const startTimeUtc = new Date(startTimeStr);

    if (isNaN(startTimeUtc.getTime())) {
      return NextResponse.json(
        { error: "startTimeUtc must be a valid ISO date string" },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx: any) => {
      // Check slot availability inside transaction
      const available = await isSlotAvailable(
        { clientId, serviceId, startTimeUtc },
        tx
      );

      if (!available) {
        return { conflict: true } as const;
      }

      // Fetch service for duration and pricing
      const service = await tx.service.findFirstOrThrow({
        where: { id: serviceId, clientId, active: true },
      });

      const endTimeUtc = addMinutes(startTimeUtc, service.durationMinutes);

      // Upsert customer by email + clientId
      let existingCustomer = await tx.customer.findFirst({
        where: { clientId, email: customer.email },
      });

      if (existingCustomer) {
        existingCustomer = await tx.customer.update({
          where: { id: existingCustomer.id },
          data: {
            fullName: customer.fullName,
            phone: customer.phone,
            notes: customer.notes,
          },
        });
      } else {
        existingCustomer = await tx.customer.create({
          data: {
            clientId,
            fullName: customer.fullName,
            email: customer.email,
            phone: customer.phone,
            notes: customer.notes,
          },
        });
      }

      // Create booking
      const booking = await tx.booking.create({
        data: {
          clientId,
          serviceId,
          customerId: existingCustomer.id,
          startTimeUtc,
          endTimeUtc,
          status: "PENDING_PAYMENT",
          paymentStatus: "UNPAID",
        },
      });

      // Create Square checkout
      const depositAmount = service.depositAmount
        ? Number(service.depositAmount)
        : null;
      const chargeAmount =
        service.paymentType === "DEPOSIT" && depositAmount
          ? depositAmount
          : Number(service.price);

      const checkout = await createCheckoutSession({
        bookingId: booking.id,
        serviceName: service.name,
        amount: Math.round(chargeAmount * 100), // convert to cents
        customerEmail: customer.email,
      });

      // Store the payment reference on booking
      await tx.booking.update({
        where: { id: booking.id },
        data: {
          paymentProvider: "square",
          paymentId: checkout.paymentId,
        },
      });

      // Create payment record
      await tx.payment.create({
        data: {
          clientId,
          bookingId: booking.id,
          provider: "square",
          providerPaymentId: checkout.paymentId,
          amount: chargeAmount,
          status: "PENDING",
        },
      });

      return {
        conflict: false,
        bookingId: booking.id,
        checkoutUrl: checkout.checkoutUrl,
      } as const;
    });

    if (result.conflict) {
      return NextResponse.json(
        { error: "Time slot is no longer available" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { bookingId: result.bookingId, checkoutUrl: result.checkoutUrl },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating booking:", error);
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    );
  }
}

function validateBookingInput(body: any): string | null {
  if (!body.clientId || typeof body.clientId !== "string") {
    return "clientId is required";
  }
  if (!body.serviceId || typeof body.serviceId !== "string") {
    return "serviceId is required";
  }
  if (!body.startTimeUtc || typeof body.startTimeUtc !== "string") {
    return "startTimeUtc is required";
  }
  if (!body.customer || typeof body.customer !== "object") {
    return "customer is required";
  }
  if (!body.customer.fullName || typeof body.customer.fullName !== "string") {
    return "customer.fullName is required";
  }
  if (!body.customer.email || typeof body.customer.email !== "string") {
    return "customer.email is required";
  }
  if (!body.customer.phone || typeof body.customer.phone !== "string") {
    return "customer.phone is required";
  }
  // Basic email check
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.customer.email)) {
    return "customer.email must be a valid email address";
  }
  return null;
}
