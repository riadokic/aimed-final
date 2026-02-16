import Navbar from "@/components/landing/navbar";
import Hero from "@/components/landing/hero";
import ScrollReveal from "@/components/landing/scroll-reveal";
import BentoGrid from "@/components/landing/bento-grid";
import AboutUs from "@/components/landing/about-us";
import PostAnywhere from "@/components/landing/post-anywhere";
import Testimonials from "@/components/landing/testimonials";
import FAQ from "@/components/landing/faq";
import Pricing from "@/components/landing/pricing";
import AppFooter from "@/components/landing/footer";

export default function LandingPage() {
  return (
    <div className="relative min-h-dvh selection:bg-zinc-100 selection:text-zinc-900 bg-white overflow-y-auto">
      {/* Background Dot Grid */}
      <div className="fixed inset-0 bg-dot-grid pointer-events-none z-0 opacity-100" />

      <div className="relative z-10">
        <Navbar />
        <main>
          <Hero />
          <ScrollReveal />
          <BentoGrid />
          <AboutUs />
          <PostAnywhere />
          {/* <Testimonials /> */}
          <FAQ />
          <Pricing />
        </main>
        <AppFooter />
      </div>
    </div>
  );
}
