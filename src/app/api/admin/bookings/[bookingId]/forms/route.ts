import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { bookingId } = await params;

  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, clientId: session.clientId },
  });
  if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });

  const submissions = await prisma.formSubmission.findMany({
    where: { bookingId },
    include: {
      formTemplate: {
        select: { id: true, name: true, type: true, fields: true },
      },
    },
    orderBy: { submittedAt: "asc" },
  });

  return NextResponse.json(submissions);
}
