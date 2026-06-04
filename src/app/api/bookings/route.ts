import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
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
  selectedAddOnIds?: string[];
  couponCode?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: BookingRequestBody = await request.json();

    const validationError = validateBookingInput(body);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const {
      clientId,
      serviceId,
      startTimeUtc: startTimeStr,
      customer,
      formAnswers = [],
      selectedAddOnIds = [],
      couponCode,
    } = body;

    const startTimeUtc = new Date(startTimeStr);
    if (isNaN(startTimeUtc.getTime())) {
      return NextResponse.json({ error: "startTimeUtc must be a valid ISO date string" }, { status: 400 });
    }

    const formError = await validateFormSubmissions(serviceId, formAnswers);
    if (formError) {
      return NextResponse.json({ error: formError }, { status: 400 });
    }

    // Fetch add-ons (outside transaction — read-only pre-check)
    const selectedAddOns = selectedAddOnIds.length > 0
      ? await prisma.addOn.findMany({
          where: { id: { in: selectedAddOnIds }, clientId, active: true },
        })
      : [];

    if (selectedAddOns.length !== selectedAddOnIds.length) {
      return NextResponse.json({ error: "One or more add-ons are unavailable" }, { status: 400 });
    }

    const addOnDurationMinutes = selectedAddOns.reduce((sum, a) => sum + a.durationMinutes, 0);

    const result = await prisma.$transaction(async (tx: any) => {
      const available = await isSlotAvailable(
        { clientId, serviceId, startTimeUtc, addOnDurationMinutes },
        tx
      );
      if (!available) return { conflict: true } as const;

      const service = await tx.service.findFirstOrThrow({
        where: { id: serviceId, clientId, active: true },
      });

      // Validate and lock coupon inside transaction
      let coupon: any = null;
      if (couponCode) {
        const upperCode = String(couponCode).trim().toUpperCase();
        coupon = await tx.coupon.findFirst({
          where: { clientId, code: upperCode, active: true },
        });
        if (!coupon) return { conflict: false, couponInvalid: true } as const;
        if (coupon.expiresAt && coupon.expiresAt < new Date()) {
          return { conflict: false, couponInvalid: true } as const;
        }
        if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) {
          return { conflict: false, couponInvalid: true } as const;
        }
      }

      // Compute pricing
      const servicePrice = Number(service.price);
      const addOnsTotal = selectedAddOns.reduce((sum, a) => sum + Number(a.price), 0);
      const subtotal = servicePrice + addOnsTotal;
      const discountAmount = coupon
        ? parseFloat((subtotal * (Number(coupon.discountPercent) / 100)).toFixed(2))
        : 0;
      const totalAmount = parseFloat((subtotal - discountAmount).toFixed(2));

      // endTimeUtc: no buffers (buffers are only for availability checks, not stored)
      const endTimeUtc = addMinutes(
        startTimeUtc,
        service.durationMinutes + addOnDurationMinutes
      );

      // Upsert customer
      let existingCustomer = await tx.customer.findFirst({
        where: { clientId, email: customer.email },
      });
      if (existingCustomer) {
        existingCustomer = await tx.customer.update({
          where: { id: existingCustomer.id },
          data: { fullName: customer.fullName, phone: customer.phone, notes: customer.notes },
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

      const manageToken = crypto.randomUUID();

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
          couponId: coupon?.id ?? null,
          discountAmount: discountAmount > 0 ? discountAmount : null,
          addOnsTotalAmount: addOnsTotal > 0 ? addOnsTotal : null,
          totalAmount,
        },
      });

      // Snapshot add-ons
      for (const addOn of selectedAddOns) {
        await tx.bookingAddOn.create({
          data: {
            clientId,
            bookingId: booking.id,
            addOnId: addOn.id,
            name: addOn.name,
            price: Number(addOn.price),
            durationMinutes: addOn.durationMinutes,
          },
        });
      }

      // Form submissions
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

      // Increment coupon usage
      if (coupon) {
        await tx.coupon.update({
          where: { id: coupon.id },
          data: { usageCount: { increment: 1 } },
        });
      }

      return {
        conflict: false,
        couponInvalid: false,
        bookingId: booking.id,
        manageToken,
        servicePrice,
        serviceDepositAmount: service.depositAmount ? Number(service.depositAmount) : null,
        paymentType: service.paymentType,
        totalAmount,
      } as const;
    });

    if (result.conflict) {
      return NextResponse.json({ error: "Time slot is no longer available" }, { status: 409 });
    }
    if ("couponInvalid" in result && result.couponInvalid) {
      return NextResponse.json({ error: "Promo code is no longer valid" }, { status: 400 });
    }

    // chargeAmount: for DEPOSIT, always service.depositAmount; for FULL, totalAmount
    const chargeAmount =
      result.paymentType === "DEPOSIT" && result.serviceDepositAmount
        ? result.serviceDepositAmount
        : result.totalAmount;

    return NextResponse.json(
      { bookingId: result.bookingId, manageToken: result.manageToken, chargeAmount },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating booking:", error);
    const msg = error?.message ?? String(error);
    return NextResponse.json({ error: `Failed to create booking: ${msg}` }, { status: 500 });
  }
}

async function validateFormSubmissions(
  serviceId: string,
  formAnswers: FormAnswerEntry[]
): Promise<string | null> {
  const assignments = await prisma.serviceFormAssignment.findMany({
    where: { serviceId, required: true, formTemplate: { active: true } },
    include: { formTemplate: { select: { id: true, name: true, fields: true } } },
  });

  const answersMap = new Map(formAnswers.map((e) => [e.formTemplateId, e.answers]));

  for (const assignment of assignments) {
    const answers = answersMap.get(assignment.formTemplateId);
    if (!answers) return `Form "${assignment.formTemplate.name}" is required and must be completed`;
    const fields = parseFields(assignment.formTemplate.fields);
    const fieldError = validateFormAnswers(fields, answers);
    if (fieldError) return `${assignment.formTemplate.name}: ${fieldError}`;
  }

  return null;
}

function validateBookingInput(body: any): string | null {
  if (!body.clientId || typeof body.clientId !== "string") return "clientId is required";
  if (!body.serviceId || typeof body.serviceId !== "string") return "serviceId is required";
  if (!body.startTimeUtc || typeof body.startTimeUtc !== "string") return "startTimeUtc is required";
  if (!body.customer || typeof body.customer !== "object") return "customer is required";
  if (!body.customer.fullName || typeof body.customer.fullName !== "string") return "customer.fullName is required";
  if (!body.customer.email || typeof body.customer.email !== "string") return "customer.email is required";
  if (!body.customer.phone || typeof body.customer.phone !== "string") return "customer.phone is required";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.customer.email)) return "customer.email must be a valid email address";
  return null;
}
