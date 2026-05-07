import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  const service = await prisma.service.findFirst({
    where: { id, clientId: session.clientId },
  });

  if (!service) {
    return NextResponse.json({ error: "Service not found" }, { status: 404 });
  }

  // If changing category, verify it belongs to this client
  if (body.categoryId) {
    const category = await prisma.category.findFirst({
      where: { id: body.categoryId, clientId: session.clientId },
    });
    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 400 }
      );
    }
  }

  const data: Record<string, unknown> = {};
  if (body.name !== undefined) data.name = body.name;
  if (body.description !== undefined) data.description = body.description;
  if (body.categoryId !== undefined) data.categoryId = body.categoryId;
  if (body.durationMinutes !== undefined)
    data.durationMinutes = Number(body.durationMinutes);
  if (body.price !== undefined) data.price = Number(body.price);
  if (body.depositAmount !== undefined)
    data.depositAmount = body.depositAmount ? Number(body.depositAmount) : null;
  if (body.paymentType !== undefined)
    data.paymentType = body.paymentType === "DEPOSIT" ? "DEPOSIT" : "FULL";
  if (body.bufferBeforeMinutes !== undefined)
    data.bufferBeforeMinutes = Number(body.bufferBeforeMinutes);
  if (body.bufferAfterMinutes !== undefined)
    data.bufferAfterMinutes = Number(body.bufferAfterMinutes);
  if (body.active !== undefined) data.active = body.active;

  const updated = await prisma.service.update({
    where: { id },
    data,
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const service = await prisma.service.findFirst({
    where: { id, clientId: session.clientId },
  });

  if (!service) {
    return NextResponse.json({ error: "Service not found" }, { status: 404 });
  }

  // Check for existing bookings
  const bookingCount = await prisma.booking.count({
    where: { serviceId: id, clientId: session.clientId },
  });

  if (bookingCount > 0) {
    // Soft delete — deactivate instead
    await prisma.service.update({
      where: { id },
      data: { active: false },
    });
    return NextResponse.json({ success: true, deactivated: true });
  }

  await prisma.service.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
