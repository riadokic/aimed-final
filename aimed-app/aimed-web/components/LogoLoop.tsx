
import React from 'react';

interface LogoItem {
  node?: React.ReactNode;
  src?: string;
  alt?: string;
  title: string;
  href?: string;
}

interface LogoLoopProps {
  logos: LogoItem[];
  speed?: number; // Duration in seconds
  direction?: 'left' | 'right';
  logoHeight?: number;
  gap?: number;
  hoverSpeed?: number;
  scaleOnHover?: boolean;
  fadeOut?: boolean;
  fadeOutColor?: string;
  ariaLabel?: string;
}

const LogoLoop: React.FC<LogoLoopProps> = ({
  logos,
  speed = 40,
  direction = 'left',
  gap = 60,
  scaleOnHover = true,
  fadeOut = true,
  fadeOutColor = '#ffffff',
  ariaLabel = "Partners"
}) => {
  // Multi-duplication to ensure smooth flow on larger screens
  const duplicatedLogos = [...logos, ...logos, ...logos, ...logos];

  return (
    <div 
      className="relative overflow-hidden w-full select-none"
      aria-label={ariaLabel}
    >
      {/* Fade Gradients */}
      {fadeOut && (
        <>
          <div 
            className="absolute left-0 top-0 bottom-0 w-48 z-10 pointer-events-none"
            style={{ background: `linear-gradient(to right, ${fadeOutColor}, transparent)` }}
          />
          <div 
            className="absolute right-0 top-0 bottom-0 w-48 z-10 pointer-events-none"
            style={{ background: `linear-gradient(to left, ${fadeOutColor}, transparent)` }}
          />
        </>
      )}

      <div className="flex w-full">
        <div 
          className="flex whitespace-nowrap animate-marquee group"
          style={{ 
            gap: `${gap}px`,
            animationDuration: `${speed}s`,
            animationDirection: direction === 'left' ? 'normal' : 'reverse'
          }}
        >
          {duplicatedLogos.map((logo, idx) => {
            // If the item provides a node but no title, it's likely a complex component like a card.
            // In that case, we render the node directly to avoid double-wrapping.
            if (logo.node && !logo.title) {
              return (
                <div 
                  key={idx} 
                  className={`flex-shrink-0 transition-transform duration-300 ${scaleOnHover ? 'hover:scale-[1.02]' : ''}`}
                >
                  {logo.node}
                </div>
              );
            }

            return (
              <div
                key={idx}
                className={`flex-shrink-0 flex items-center gap-3 px-8 py-4 rounded-2xl border border-zinc-100 bg-white/50 backdrop-blur-sm transition-all duration-300 ${
                  scaleOnHover ? 'hover:scale-105 hover:border-zinc-300 hover:bg-white hover:shadow-xl hover:shadow-zinc-200/50' : ''
                }`}
              >
                {logo.node && <div className="text-black">{logo.node}</div>}
                {logo.src && <img src={logo.src} alt={logo.alt} className="h-6 w-auto grayscale group-hover:grayscale-0 transition-all" />}
                {logo.title && <span className="text-sm font-bold tracking-tighter text-black uppercase">{logo.title}</span>}
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-25%); }
        }
        .animate-marquee {
          animation: marquee linear infinite;
        }
        .group:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};

export default LogoLoop;
