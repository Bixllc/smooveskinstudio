import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ serviceId: string }> }
) {
  const { serviceId } = await params;

  const assignments = await prisma.serviceFormAssignment.findMany({
    where: {
      serviceId,
      formTemplate: { active: true },
    },
    include: {
      formTemplate: {
        select: { id: true, name: true, description: true, type: true, fields: true },
      },
    },
    orderBy: { displayOrder: "asc" },
  });

  const forms = assignments.map((a) => ({
    ...a.formTemplate,
    required: a.required,
    displayOrder: a.displayOrder,
  }));

  return NextResponse.json(forms);
}
