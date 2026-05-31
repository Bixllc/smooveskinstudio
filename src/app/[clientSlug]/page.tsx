import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

const ACCENT_COLORS = [
  "border-t-[var(--color-primary)]",
  "border-t-[var(--color-primary-dark)]",
  "border-t-[#D4B896]",
  "border-t-[#8B7355]",
];

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
    <div className="px-4 py-10 text-center">
      {/* Hero */}
      <div className="mb-10">
        <Image
          src="/images/logo.avif"
          alt="Smoove Skin Studio"
          width={180}
          height={72}
          className="mx-auto h-16 w-auto"
          priority
        />
        <p className="mt-3 text-[var(--color-text-light)]">
          Luxury Waxing & Skin Care
        </p>
        <p className="text-sm text-[var(--color-text-light)]">
          Book your perfect appointment in minutes
        </p>
      </div>

      {/* Category heading */}
      <h2 className="mb-2 text-2xl font-semibold text-[var(--color-text)]">
        Select a Service Category
      </h2>
      <p className="mb-8 text-sm text-[var(--color-text-light)]">
        Choose from our premium services
      </p>

      {categories.length === 0 ? (
        <p className="text-[var(--color-text-light)]">
          No services available at this time.
        </p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2">
          {categories.map((category, i) => (
            <Link
              key={category.id}
              href={`/${clientSlug}/services/${category.id}`}
              className={`group rounded-2xl border-t-4 ${ACCENT_COLORS[i % ACCENT_COLORS.length]} bg-white px-6 py-6 text-left shadow-sm transition-all hover:shadow-lg`}
            >
              <h3 className="text-lg font-bold uppercase tracking-wide text-[var(--color-text)]">
                {category.name}
              </h3>
              <p className="mt-1 text-sm text-[var(--color-text-light)]">
                {category._count.services} service{category._count.services !== 1 ? "s" : ""} available
              </p>
              {category.description && (
                <p className="mt-2 text-sm text-[var(--color-text-light)]">
                  {category.description}
                </p>
              )}
              <span className="mt-4 inline-block text-sm font-semibold text-[var(--color-primary)]">
                View Services
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
