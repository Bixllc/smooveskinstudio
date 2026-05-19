import type { Metadata } from "next";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Smoove Skin Studio | Brazilian Wax Specialist | DFW",
  description:
    "Smoove Skin Studio — award-winning waxing & skin care in Watauga, TX. Serving Fort Worth, Dallas, Keller, Haltom City & the DFW metroplex. Brazilian wax, full-body wax, brow shaping & vajacial. Book online now.",
  alternates: {
    canonical: "https://smooveskinstudio.com",
  },
};
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import About from "@/components/About";
import WhyChooseUs from "@/components/WhyChooseUs";
import Testimonials from "@/components/Testimonials";
import Community from "@/components/Community";
import Partners from "@/components/Partners";
import PartnerOffers from "@/components/PartnerOffers";
import CTABanners from "@/components/CTABanners";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <Services />
      <About />
      <WhyChooseUs />
      <Testimonials />
      <Community />
      <Partners />
      <PartnerOffers />
      <CTABanners />
      <Contact />
      <Footer />
    </>
  );
}
