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
  });

  return (
    <div>
      <h2 className="mb-6 text-2xl font-semibold text-[var(--color-text)]">
        Select a Category
      </h2>

      {categories.length === 0 ? (
        <p className="text-[var(--color-text-light)]">
          No services available at this time.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/${clientSlug}/services/${category.id}`}
              className="group rounded-xl border border-[var(--color-border)] bg-white p-6 transition-shadow hover:shadow-md"
            >
              <h3 className="text-lg font-medium text-[var(--color-text)] group-hover:text-[var(--color-primary)]">
                {category.name}
              </h3>
              {category.description && (
                <p className="mt-2 text-sm text-[var(--color-text-light)]">
                  {category.description}
                </p>
              )}
              <span className="mt-4 inline-block text-sm font-medium text-[var(--color-primary)]">
                View Services &rarr;
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
