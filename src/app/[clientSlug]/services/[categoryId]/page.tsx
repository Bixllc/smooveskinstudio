import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ServiceSelection } from "./service-selection";

export default async function ServiceSelectionPage({
  params,
}: {
  params: Promise<{ clientSlug: string; categoryId: string }>;
}) {
  const { clientSlug, categoryId } = await params;

  const client = await prisma.client.findUnique({
    where: { slug: clientSlug, active: true },
  });

  if (!client) notFound();

  const category = await prisma.category.findFirst({
    where: { id: categoryId, clientId: client.id, active: true },
  });

  if (!category) notFound();

  const services = await prisma.service.findMany({
    where: { categoryId, clientId: client.id, active: true },
    orderBy: { name: "asc" },
  });

  return (
    <ServiceSelection
      clientSlug={clientSlug}
      categoryName={category.name}
      services={services.map((s) => ({
        id: s.id,
        name: s.name,
        description: s.description,
        durationMinutes: s.durationMinutes,
        price: Number(s.price),
      }))}
    />
  );
}
