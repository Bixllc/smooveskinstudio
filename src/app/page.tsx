import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import RevealMarquee from "@/components/RevealMarquee";
import About from "@/components/About";
import Services from "@/components/Services";
import MeetAnisha from "@/components/MeetAnisha";
import ReserveCTA from "@/components/ReserveCTA";
import Testimonials from "@/components/Testimonials";
import FAQAccordion from "@/components/FAQAccordion";
import CommunityPartners from "@/components/CommunityPartners";
import TikTokSection from "@/components/TikTokSection";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Smoove Skin Studio | Brazilian Wax Specialist | DFW",
  description:
    "Smoove Skin Studio — award-winning waxing & skin care in Watauga, TX. Serving Fort Worth, Dallas, Keller, Haltom City & the DFW metroplex. Brazilian wax, full-body wax, brow shaping & vajacial. Book online now.",
  alternates: {
    canonical: "https://smooveskinstudio.com",
  },
};

// Configure via CLIENT_SLUG env var; defaults to smooveskinstudio
const CLIENT_SLUG = process.env.CLIENT_SLUG ?? "smooveskinstudio";

export default async function Home() {
  const client = await prisma.client.findUnique({
    where: { slug: CLIENT_SLUG, active: true },
  });

  const [services, categories] = client
    ? await Promise.all([
        prisma.service.findMany({
          where: { clientId: client.id, active: true },
          orderBy: { name: "asc" },
          select: {
            id: true,
            name: true,
            description: true,
            durationMinutes: true,
            price: true,
            categoryId: true,
            category: { select: { name: true } },
          },
        }),
        prisma.category.findMany({
          where: { clientId: client.id, active: true },
          orderBy: { displayOrder: "asc" },
          select: { id: true, name: true },
        }),
      ])
    : [[], []];

  const mappedServices = services.map((s) => ({
    id: s.id,
    name: s.name,
    description: s.description,
    durationMinutes: s.durationMinutes,
    price: Number(s.price),
    categoryId: s.categoryId,
    categoryName: s.category.name,
  }));

  return (
    <>
      <Navbar />
      <Hero />
      <RevealMarquee />
      <About />
      <Services
        services={mappedServices}
        categories={categories}
        clientSlug={CLIENT_SLUG}
      />
      <MeetAnisha clientSlug={CLIENT_SLUG} />
      <ReserveCTA clientSlug={CLIENT_SLUG} />
      <Testimonials />
      <FAQAccordion />
      <CommunityPartners />
      <TikTokSection />
      <Footer categories={categories} clientSlug={CLIENT_SLUG} />
    </>
  );
}
