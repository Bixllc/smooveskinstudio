import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";

const VALID_STATUSES = ["CONFIRMED", "CANCELLED", "COMPLETED", "NO_SHOW"];

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { bookingId } = await params;
  const body = await request.json();
  const { status } = body;

  if (!status || !VALID_STATUSES.includes(status)) {
    return NextResponse.json(
      { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}` },
      { status: 400 }
    );
  }

  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, clientId: session.clientId },
  });

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  const updated = await prisma.booking.update({
    where: { id: bookingId },
    data: { status },
  });

  return NextResponse.json({ id: updated.id, status: updated.status });
}
