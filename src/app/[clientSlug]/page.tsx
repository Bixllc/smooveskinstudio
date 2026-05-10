import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function CategorySelectionPage({
  params,
}: {
  params: Promise<{ clientSlug: string }>;
}) {
  const { clientSlug } = await params;

  const client = await prisma.client.findUnique({
    where: { slug: clientSlug, active: true },
  });

  if (!client) notFound();

  const categories = await prisma.category.findMany({
    where: { clientId: client.id, active: true },
    orderBy: { displayOrder: "asc" },
    include: {
      _count: { select: { services: { where: { active: true } } } },
    },
  });

  return (
    <div>
      <h2 className="mb-1 text-2xl font-semibold text-[var(--color-text)]">
        Book an Appointment
      </h2>
      <p className="mb-5 text-sm text-[var(--color-text-light)]">
        Select a category to get started
      </p>

      {categories.length === 0 ? (
        <p className="text-[var(--color-text-light)]">
          No services available at this time.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/${clientSlug}/services/${category.id}`}
              className="group rounded-xl border border-[var(--color-border)] bg-white px-5 py-4 transition-all hover:shadow-md hover:border-[var(--color-primary)]"
            >
              <h3 className="text-base font-semibold text-[var(--color-text)] group-hover:text-[var(--color-primary)]">
                {category.name}
              </h3>
              {category.description && (
                <p className="mt-1 text-sm text-[var(--color-text-light)]">
                  {category.description}
                </p>
              )}
              <span className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-[var(--color-primary)]">
                {category._count.services} service{category._count.services !== 1 ? "s" : ""} &rarr;
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
