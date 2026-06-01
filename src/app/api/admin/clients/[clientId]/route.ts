import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  const session = await getAdminSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { clientId } = await params;

  const customer = await prisma.customer.findFirst({
    where: { id: clientId, clientId: session.clientId },
    include: {
      bookings: {
        include: {
          service: {
            select: {
              name: true,
              price: true,
              durationMinutes: true,
              category: { select: { name: true } },
            },
          },
        },
        orderBy: { startTimeUtc: "desc" },
      },
    },
  });

  if (!customer)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const settings = await prisma.businessSettings.findUnique({
    where: { clientId: session.clientId },
    select: { timezone: true },
  });

  return NextResponse.json({
    ...customer,
    timezone: settings?.timezone ?? "America/Chicago",
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  const session = await getAdminSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { clientId } = await params;
  const body = await req.json();

  const data: any = {};
  if (body.adminNotes !== undefined) data.adminNotes = body.adminNotes;
  if (body.isVip !== undefined) data.isVip = body.isVip;

  const result = await prisma.customer.updateMany({
    where: { id: clientId, clientId: session.clientId },
    data,
  });

  return NextResponse.json({ updated: result.count });
}
