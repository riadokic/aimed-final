
import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ScrollReveal from './components/ScrollReveal';
import BentoGrid from './components/BentoGrid';
import AboutUs from './components/AboutUs';
import PostAnywhere from './components/PostAnywhere';
import Testimonials from './components/Testimonials';
import FAQ from './components/FAQ';
import Pricing from './components/Pricing';
import AppFooter from './components/Footer';

const App: React.FC = () => {
  return (
    <div className="relative min-h-screen selection:bg-zinc-100 selection:text-zinc-900 bg-white">
      {/* Background Textures */}
      <div className="fixed inset-0 bg-dot-grid pointer-events-none z-0 opacity-100" />

      <div className="relative z-10">
        <Navbar />
        <main>
          <Hero />
          <ScrollReveal />
          <BentoGrid />
          <AboutUs />
          <PostAnywhere />
          <Testimonials />
          <FAQ />
          <Pricing />
        </main>
        <AppFooter />
      </div>
    </div>
  );
};

export default App;
