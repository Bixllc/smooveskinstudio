import Navbar from "@/components/Navbar";
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
