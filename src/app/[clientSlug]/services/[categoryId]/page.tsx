import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

function formatDuration(minutes: number): string {
  if (minutes >= 60) {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hrs} hr ${mins} min` : `${hrs} hr`;
  }
  return `${minutes} min`;
}

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
        className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] transition-colors"
      >
        &lsaquo; Back to Categories
      </Link>

      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold uppercase tracking-wide text-[var(--color-text)]">
          {category.name}
        </h2>
        <p className="mt-1 text-sm text-[var(--color-text-light)]">
          Select the service that fits your needs
        </p>
      </div>

      {services.length === 0 ? (
        <p className="text-center text-[var(--color-text-light)]">
          No services available in this category.
        </p>
      ) : (
        <div className="space-y-4">
          {services.map((service) => (
            <div
              key={service.id}
              className="flex items-center justify-between gap-4 rounded-2xl bg-white px-6 py-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-[var(--color-text)]">
                  {service.name}
                </h3>
                <p className="mt-0.5 text-sm text-[var(--color-text-light)]">
                  {formatDuration(service.durationMinutes)} &nbsp;&middot;&nbsp;{" "}
                  <span className="font-semibold text-[var(--color-primary)]">
                    ${Number(service.price).toFixed(2)}
                  </span>
                </p>
                {service.description && (
                  <p className="mt-1.5 text-sm italic text-[var(--color-text-light)]">
                    {service.description}
                  </p>
                )}
              </div>
              <Link
                href={`/${clientSlug}/book/${service.id}`}
                className="shrink-0 rounded-xl bg-[var(--color-primary)] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-primary-dark)]"
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
