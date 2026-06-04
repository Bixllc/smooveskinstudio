import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ serviceId: string }> }
) {
  const { serviceId } = await params;

  // Resolve clientId from the service to satisfy the "scope all queries by clientId" rule
  const service = await prisma.service.findUnique({
    where: { id: serviceId },
    select: { clientId: true },
  });
  if (!service) return NextResponse.json([]);

  const serviceAddOns = await prisma.serviceAddOn.findMany({
    where: {
      serviceId,
      clientId: service.clientId,
      addOn: { active: true },
    },
    include: {
      addOn: {
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          durationMinutes: true,
        },
      },
    },
    orderBy: { displayOrder: "asc" },
  });

  const addOns = serviceAddOns.map((sa) => ({
    id: sa.addOn.id,
    name: sa.addOn.name,
    description: sa.addOn.description,
    price: Number(sa.addOn.price),
    durationMinutes: sa.addOn.durationMinutes,
  }));

  return NextResponse.json(addOns);
}
