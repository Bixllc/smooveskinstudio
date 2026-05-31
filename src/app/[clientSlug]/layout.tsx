import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

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
    <>
      <Navbar />
      <div className="min-h-screen bg-[var(--color-background)] pt-20">
        <main className="mx-auto max-w-5xl">{children}</main>
      </div>
      <Footer />
    </>
  );
}
