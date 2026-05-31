import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BookingFlow } from "./booking-flow";

export default async function BookingPage({
  params,
}: {
  params: Promise<{ clientSlug: string; serviceId: string }>;
}) {
  const { clientSlug, serviceId } = await params;

  const client = await prisma.client.findUnique({
    where: { slug: clientSlug, active: true },
    include: { businessSettings: true },
  });

  if (!client) notFound();

  const service = await prisma.service.findFirst({
    where: { id: serviceId, clientId: client.id, active: true },
    include: {
      category: { select: { name: true } },
      formAssignments: {
        where: { formTemplate: { active: true } },
        include: {
          formTemplate: {
            select: { id: true, name: true, description: true, type: true, fields: true },
          },
        },
        orderBy: { displayOrder: "asc" },
      },
    },
  });

  if (!service) notFound();

  return (
    <div className="px-4 py-10">
      <BookingFlow
        clientSlug={clientSlug}
        clientId={client.id}
        timezone={client.businessSettings?.timezone ?? "America/New_York"}
        service={{
          id: service.id,
          name: service.name,
          description: service.description,
          durationMinutes: service.durationMinutes,
          price: Number(service.price),
          depositAmount: service.depositAmount
            ? Number(service.depositAmount)
            : null,
          paymentType: service.paymentType,
          categoryName: service.category.name,
        }}
        forms={service.formAssignments.map((a) => ({
          id: a.formTemplate.id,
          name: a.formTemplate.name,
          description: a.formTemplate.description,
          type: a.formTemplate.type,
          fields: a.formTemplate.fields as any,
          required: a.required,
        }))}
      />
    </div>
  );
}
