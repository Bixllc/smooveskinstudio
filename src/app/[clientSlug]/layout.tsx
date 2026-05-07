import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

async function getClient(slug: string) {
  const client = await prisma.client.findUnique({
    where: { slug },
    include: { businessSettings: true },
  });

  if (!client || !client.active) return null;
  return client;
}

export default async function ClientLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ clientSlug: string }>;
}) {
  const { clientSlug } = await params;
  const client = await getClient(clientSlug);

  if (!client) notFound();

  const businessName =
    client.businessSettings?.businessName ?? client.name;

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <header className="border-b border-[var(--color-border)] bg-white">
        <div className="mx-auto max-w-4xl px-4 py-4">
          <h1 className="text-xl font-semibold text-[var(--color-text)]">
            {businessName}
          </h1>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-8">{children}</main>
    </div>
  );
}
