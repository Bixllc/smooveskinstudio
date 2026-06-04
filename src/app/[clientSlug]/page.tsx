import { redirect } from "next/navigation";

export default async function ClientSlugRootPage({
  params,
}: {
  params: Promise<{ clientSlug: string }>;
}) {
  const { clientSlug } = await params;
  redirect(`/${clientSlug}/book`);
}
