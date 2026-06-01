import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { isSlotAvailable } from "@/lib/availability";
import { addMinutes } from "date-fns";
import { parseFields, validateFormAnswers, type FormAnswers } from "@/lib/forms";

interface FormAnswerEntry {
  formTemplateId: string;
  answers: FormAnswers;
}

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
  formAnswers?: FormAnswerEntry[];
}

export async function POST(request: NextRequest) {
  try {
    const body: BookingRequestBody = await request.json();

    const validationError = validateBookingInput(body);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const { clientId, serviceId, startTimeUtc: startTimeStr, customer, formAnswers = [] } = body;
    const startTimeUtc = new Date(startTimeStr);

    if (isNaN(startTimeUtc.getTime())) {
      return NextResponse.json(
        { error: "startTimeUtc must be a valid ISO date string" },
        { status: 400 }
      );
    }

    // Validate form submissions before entering the transaction
    const formError = await validateFormSubmissions(serviceId, formAnswers);
    if (formError) {
      return NextResponse.json({ error: formError }, { status: 400 });
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

      // Generate unique manage token
      const manageToken = crypto.randomUUID();

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
          manageToken,
        },
      });

      // Create form submissions inside the transaction
      for (const entry of formAnswers) {
        await tx.formSubmission.create({
          data: {
            clientId,
            bookingId: booking.id,
            customerId: existingCustomer.id,
            formTemplateId: entry.formTemplateId,
            answers: entry.answers,
          },
        });
      }

      return {
        conflict: false,
        booking,
        service,
        chargeAmount:
          service.paymentType === "DEPOSIT" && service.depositAmount
            ? Number(service.depositAmount)
            : Number(service.price),
        manageToken,
        customerEmail: customer.email,
        customerName: customer.fullName,
      } as const;
    });

    if (result.conflict) {
      return NextResponse.json(
        { error: "Time slot is no longer available" },
        { status: 409 }
      );
    }

    // Create Stripe PaymentIntent outside transaction (Stripe is external)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(result.chargeAmount * 100),
      currency: "usd",
      receipt_email: result.customerEmail,
      metadata: {
        bookingId: result.booking.id,
        clientId,
        customerName: result.customerName,
        serviceName: result.service.name,
      },
    });

    // Store Stripe payment reference on booking
    await prisma.booking.update({
      where: { id: result.booking.id },
      data: {
        paymentProvider: "stripe",
        paymentId: paymentIntent.id,
      },
    });

    // Create payment record
    await prisma.payment.create({
      data: {
        clientId,
        bookingId: result.booking.id,
        provider: "stripe",
        providerPaymentId: paymentIntent.id,
        amount: result.chargeAmount,
        status: "PENDING",
      },
    });

    return NextResponse.json(
      {
        bookingId: result.booking.id,
        clientSecret: paymentIntent.client_secret,
        manageToken: result.manageToken,
      },
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

async function validateFormSubmissions(
  serviceId: string,
  formAnswers: FormAnswerEntry[]
): Promise<string | null> {
  const assignments = await prisma.serviceFormAssignment.findMany({
    where: {
      serviceId,
      required: true,
      formTemplate: { active: true },
    },
    include: {
      formTemplate: { select: { id: true, name: true, fields: true } },
    },
  });

  const answersMap = new Map(formAnswers.map((e) => [e.formTemplateId, e.answers]));

  for (const assignment of assignments) {
    const answers = answersMap.get(assignment.formTemplateId);
    if (!answers) {
      return `Form "${assignment.formTemplate.name}" is required and must be completed`;
    }

    const fields = parseFields(assignment.formTemplate.fields);
    const fieldError = validateFormAnswers(fields, answers);
    if (fieldError) {
      return `${assignment.formTemplate.name}: ${fieldError}`;
    }
  }

  return null;
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
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.customer.email)) {
    return "customer.email must be a valid email address";
  }
  return null;
}
