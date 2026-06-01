import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BookSelection } from "./book-selection";

export default async function BookPage({
  params,
}: {
  params: Promise<{ clientSlug: string }>;
}) {
  const { clientSlug } = await params;

  const client = await prisma.client.findUnique({
    where: { slug: clientSlug, active: true },
    include: { businessSettings: true },
  });

  if (!client) notFound();

  const categories = await prisma.category.findMany({
    where: { clientId: client.id, active: true },
    orderBy: { displayOrder: "asc" },
    include: {
      services: {
        where: { clientId: client.id, active: true },
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          description: true,
          durationMinutes: true,
          price: true,
        },
      },
    },
  });

  const data = categories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    description: cat.description,
    services: cat.services.map((s) => ({
      id: s.id,
      name: s.name,
      description: s.description,
      durationMinutes: s.durationMinutes,
      price: Number(s.price),
    })),
  }));

  return (
    <BookSelection
      clientSlug={clientSlug}
      clientId={client.id}
      categories={data}
      businessSettings={{
        phone: client.businessSettings?.phone ?? null,
        address: client.businessSettings?.address ?? null,
        timezone: client.businessSettings?.timezone ?? "America/Chicago",
        cancellationPolicy: client.businessSettings?.cancellationPolicy ?? null,
        latePolicy: client.businessSettings?.latePolicy ?? null,
        noShowPolicy: client.businessSettings?.noShowPolicy ?? null,
        depositPolicy: client.businessSettings?.depositPolicy ?? null,
      }}
    />
  );
}
