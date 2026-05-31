import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; formId: string }> }
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: serviceId, formId: formTemplateId } = await params;

  const service = await prisma.service.findFirst({
    where: { id: serviceId, clientId: session.clientId },
  });
  if (!service) return NextResponse.json({ error: "Service not found" }, { status: 404 });

  await prisma.serviceFormAssignment.deleteMany({
    where: { serviceId, formTemplateId },
  });

  return NextResponse.json({ success: true });
}
