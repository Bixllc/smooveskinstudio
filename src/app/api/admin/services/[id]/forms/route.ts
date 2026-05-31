import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: serviceId } = await params;

  const service = await prisma.service.findFirst({
    where: { id: serviceId, clientId: session.clientId },
  });
  if (!service) return NextResponse.json({ error: "Service not found" }, { status: 404 });

  const assignments = await prisma.serviceFormAssignment.findMany({
    where: { serviceId },
    include: {
      formTemplate: {
        select: { id: true, name: true, type: true, active: true },
      },
    },
    orderBy: { displayOrder: "asc" },
  });

  return NextResponse.json(assignments);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: serviceId } = await params;
  const body = await request.json();
  const { formTemplateId, displayOrder } = body;

  if (!formTemplateId) {
    return NextResponse.json({ error: "formTemplateId is required" }, { status: 400 });
  }

  // Verify both belong to this client
  const [service, form] = await Promise.all([
    prisma.service.findFirst({ where: { id: serviceId, clientId: session.clientId } }),
    prisma.formTemplate.findFirst({ where: { id: formTemplateId, clientId: session.clientId } }),
  ]);

  if (!service) return NextResponse.json({ error: "Service not found" }, { status: 404 });
  if (!form) return NextResponse.json({ error: "Form not found" }, { status: 404 });

  const assignment = await prisma.serviceFormAssignment.upsert({
    where: { serviceId_formTemplateId: { serviceId, formTemplateId } },
    update: { displayOrder: displayOrder ?? 0 },
    create: { serviceId, formTemplateId, displayOrder: displayOrder ?? 0 },
  });

  return NextResponse.json(assignment, { status: 201 });
}
