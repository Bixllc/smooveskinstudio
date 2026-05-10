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
        className="mb-3 inline-flex items-center gap-1 text-sm text-[var(--color-text-light)] hover:text-[var(--color-primary)] transition-colors"
      >
        &larr; Back to Categories
      </Link>

      <h2 className="mb-4 text-xl font-semibold uppercase tracking-wide text-[var(--color-text)]">
        {category.name}
      </h2>

      {services.length === 0 ? (
        <p className="text-[var(--color-text-light)]">
          No services available in this category.
        </p>
      ) : (
        <div className="divide-y divide-[var(--color-border)] rounded-xl border border-[var(--color-border)] bg-white overflow-hidden">
          {services.map((service) => (
            <div
              key={service.id}
              className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-[var(--color-background-light)] transition-colors"
            >
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-[var(--color-text)]">
                  {service.name}
                </h3>
                <p className="text-sm text-[var(--color-text-light)]">
                  {service.durationMinutes >= 60
                    ? `${Math.floor(service.durationMinutes / 60)} hr${service.durationMinutes % 60 > 0 ? ` ${service.durationMinutes % 60} min` : ""}`
                    : `${service.durationMinutes} min`}
                  {" "}@ ${Number(service.price).toFixed(2)}
                </p>
                {service.description && (
                  <p className="mt-1 text-sm text-[var(--color-text-light)]">
                    {service.description}
                  </p>
                )}
              </div>
              <Link
                href={`/${clientSlug}/book/${service.id}`}
                className="shrink-0 rounded-md bg-[var(--color-text)] px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--color-primary-dark)]"
              >
                SELECT
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
