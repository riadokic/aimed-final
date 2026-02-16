
import React, { useEffect, useRef, useState } from 'react';

const ScrollReveal: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const totalHeight = rect.height;

      // Calculate progress based on how far the container has scrolled through the viewport
      // 0 when top enters, 1 when bottom exits
      const progress = Math.max(0, Math.min(1, -rect.top / (totalHeight - windowHeight)));
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const firstSection = [
    "Znamo kako izgleda vaš dan u praksi:",
    "i kad pacijenti odlaze,",
    "vi ostajete za tastaturom."
  ];

  const secondSection = [
    "Svaki minut proveden kucajući nalaz",
    "je minut ukraden od vaše porodice,",
    "vašeg odmora ili drugog pacijenta."
  ];

  const allLines = [...firstSection, ...secondSection];

  return (
    <section ref={containerRef} className="h-[250vh] bg-white relative">
      <div className="sticky top-0 h-screen w-full flex items-center justify-center px-6 overflow-hidden">
        <div className="max-w-[90vw] w-full text-left">
          <div className="space-y-6 md:space-y-8">
            {allLines.map((line, i) => {
              // Each line activates at a different scroll point
              const lineStart = i * (1 / allLines.length);
              const lineEnd = (i + 1) * (1 / allLines.length);

              // Map overall progress to 0-1 for this specific line
              const lineProgress = Math.max(0.1, Math.min(1, (scrollProgress - lineStart) / (lineEnd - lineStart)));

              return (
                <h2
                  key={i}
                  style={{ opacity: lineProgress }}
                  className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight text-black leading-[1.3] transition-opacity duration-150"
                >
                  {line}
                </h2>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ScrollReveal;
