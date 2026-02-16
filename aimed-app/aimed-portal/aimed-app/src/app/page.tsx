import Navbar from "@/components/landing/navbar";
import Hero from "@/components/landing/hero";
import ScrollReveal from "@/components/landing/scroll-reveal";
import BentoGrid from "@/components/landing/bento-grid";
import PostAnywhere from "@/components/landing/post-anywhere";
import Testimonials from "@/components/landing/testimonials";
import FAQ from "@/components/landing/faq";
import Pricing from "@/components/landing/pricing";
import AppFooter from "@/components/landing/footer";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen selection:bg-zinc-100 selection:text-zinc-900 bg-white">
      {/* Background Dot Grid */}
      <div className="fixed inset-0 bg-dot-grid pointer-events-none z-0 opacity-100" />

      <div className="relative z-10">
        <Navbar />
        <main>
          <Hero />
          <ScrollReveal />
          <BentoGrid />
          <PostAnywhere />
          <Testimonials />
          <FAQ />
          <Pricing />
        </main>
        <AppFooter />
      </div>
    </div>
  );
}
