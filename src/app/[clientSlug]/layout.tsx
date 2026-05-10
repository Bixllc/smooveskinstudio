import Image from "next/image";
import Link from "next/link";
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

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <header className="border-b border-[var(--color-border)] bg-white">
        <div className="mx-auto max-w-4xl px-4 py-3 flex items-center justify-between">
          <Link href={`/${clientSlug}`}>
            <Image
              src="/images/logo.avif"
              alt="Smoove Skin Studio"
              width={120}
              height={48}
              className="h-10 w-auto"
              priority
            />
          </Link>
          <Link
            href="/"
            className="text-xs text-[var(--color-text-light)] hover:text-[var(--color-primary)] transition-colors"
          >
            Back to Main Site
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-6">{children}</main>
    </div>
  );
}
