
import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ScrollReveal from './components/ScrollReveal';
import BentoGrid from './components/BentoGrid';
import PostAnywhere from './components/PostAnywhere';
import Testimonials from './components/Testimonials';
import FAQ from './components/FAQ';
import Pricing from './components/Pricing';
import AppFooter from './components/Footer';
import Login from './components/Login';
import Portal from './components/Portal';
import { AppView, UserSettings } from './types';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('landing');
  const [userSettings, setUserSettings] = useState<UserSettings>({
    doctorName: 'Dr. Edin Hodžić',
    clinicName: 'Poliklinika Medico',
    stampUrl: 'https://placehold.co/100x100?text=PECAT'
  });

  const handleLogin = (success: boolean) => {
    if (success) setView('portal');
  };

  if (view === 'login') {
    return <Login onLogin={handleLogin} onBack={() => setView('landing')} />;
  }

  if (view === 'portal') {
    return <Portal settings={userSettings} onUpdateSettings={setUserSettings} onLogout={() => setView('landing')} />;
  }

  return (
    <div className="relative min-h-screen selection:bg-zinc-100 selection:text-zinc-900 bg-white">
      {/* Background Textures */}
      <div className="fixed inset-0 bg-dot-grid pointer-events-none z-0 opacity-100" />
      
      <div className="relative z-10">
        <Navbar onDemoClick={() => setView('login')} />
        <main>
          <Hero onDemoClick={() => setView('login')} />
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
};

export default App;
