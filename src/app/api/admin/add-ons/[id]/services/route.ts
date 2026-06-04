import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: addOnId } = await params;
  const body = await request.json();
  const { serviceIds } = body; // string[]

  // Verify add-on belongs to this client
  const addOn = await prisma.addOn.findFirst({
    where: { id: addOnId, clientId: session.clientId },
  });
  if (!addOn) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Verify all services belong to this client
  if (Array.isArray(serviceIds) && serviceIds.length > 0) {
    const services = await prisma.service.findMany({
      where: { id: { in: serviceIds }, clientId: session.clientId },
      select: { id: true },
    });
    if (services.length !== serviceIds.length) {
      return NextResponse.json({ error: "One or more services not found" }, { status: 400 });
    }
  }

  // Replace all assignments: delete existing, create new
  await prisma.$transaction([
    prisma.serviceAddOn.deleteMany({ where: { addOnId, clientId: session.clientId } }),
    ...(Array.isArray(serviceIds)
      ? serviceIds.map((serviceId: string, i: number) =>
          prisma.serviceAddOn.create({
            data: {
              clientId: session.clientId,
              addOnId,
              serviceId,
              displayOrder: i,
            },
          })
        )
      : []),
  ]);

  return NextResponse.json({ ok: true });
}
