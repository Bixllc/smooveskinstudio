import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

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
    <div>
      <Link
        href={`/${clientSlug}`}
        className="mb-4 inline-block text-sm text-[var(--color-text-light)] hover:text-[var(--color-primary)]"
      >
        &larr; Back to Categories
      </Link>

      <h2 className="mb-6 text-2xl font-semibold text-[var(--color-text)]">
        {category.name}
      </h2>

      {services.length === 0 ? (
        <p className="text-[var(--color-text-light)]">
          No services available in this category.
        </p>
      ) : (
        <div className="grid gap-4">
          {services.map((service) => (
            <Link
              key={service.id}
              href={`/${clientSlug}/book/${service.id}`}
              className="group rounded-xl border border-[var(--color-border)] bg-white p-6 transition-shadow hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-[var(--color-text)] group-hover:text-[var(--color-primary)]">
                    {service.name}
                  </h3>
                  {service.description && (
                    <p className="mt-1 text-sm text-[var(--color-text-light)]">
                      {service.description}
                    </p>
                  )}
                  <p className="mt-2 text-sm text-[var(--color-text-light)]">
                    {service.durationMinutes} min
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-[var(--color-text)]">
                    ${Number(service.price).toFixed(2)}
                  </p>
                  {service.paymentType === "DEPOSIT" && service.depositAmount && (
                    <p className="text-xs text-[var(--color-text-light)]">
                      ${Number(service.depositAmount).toFixed(2)} deposit
                    </p>
                  )}
                </div>
              </div>
              <span className="mt-4 inline-block text-sm font-medium text-[var(--color-primary)]">
                Book Now &rarr;
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
