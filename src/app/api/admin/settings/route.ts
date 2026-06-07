import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const settings = await prisma.businessSettings.findUnique({
    where: { clientId: session.clientId },
  });

  if (!settings) {
    return NextResponse.json({ error: "Settings not found" }, { status: 404 });
  }

  return NextResponse.json(settings);
}

export async function PATCH(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

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
    "reminderLeadHours",
  ];

  const data: Record<string, unknown> = {};
  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      data[field] = body[field];
    }
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json(
      { error: "No valid fields to update" },
      { status: 400 }
    );
  }

  const updated = await prisma.businessSettings.update({
    where: { clientId: session.clientId },
    data,
  });

  return NextResponse.json(updated);
}
