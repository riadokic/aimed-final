"use client";

import type { ReactNode } from "react";

interface LogoItem {
  node?: ReactNode;
  src?: string;
  alt?: string;
  title: string;
  href?: string;
}

interface LogoLoopProps {
  logos: LogoItem[];
  speed?: number;
  direction?: "left" | "right";
  gap?: number;
  scaleOnHover?: boolean;
  fadeOut?: boolean;
  fadeOutColor?: string;
  ariaLabel?: string;
}

export default function LogoLoop({
  logos,
  speed = 40,
  direction = "left",
  gap = 60,
  scaleOnHover = true,
  fadeOut = true,
  fadeOutColor = "#ffffff",
  ariaLabel = "Partners",
}: LogoLoopProps) {
  const duplicatedLogos = [...logos, ...logos, ...logos, ...logos];

  return (
    <div
      className="relative overflow-hidden w-full select-none"
      aria-label={ariaLabel}
    >
      {fadeOut && (
        <>
          <div
            className="absolute left-0 top-0 bottom-0 w-48 z-10 pointer-events-none"
            style={{
              background: `linear-gradient(to right, ${fadeOutColor}, transparent)`,
            }}
          />
          <div
            className="absolute right-0 top-0 bottom-0 w-48 z-10 pointer-events-none"
            style={{
              background: `linear-gradient(to left, ${fadeOutColor}, transparent)`,
            }}
          />
        </>
      )}

      <div className="flex w-full">
        <div
          className="flex whitespace-nowrap animate-marquee"
          style={{
            gap: `${gap}px`,
            animationDuration: `${speed}s`,
            animationDirection: direction === "left" ? "normal" : "reverse",
          }}
        >
          {duplicatedLogos.map((logo, idx) => {
            if (logo.node && !logo.title) {
              return (
                <div
                  key={idx}
                  className={`flex-shrink-0 transition-transform duration-300 ${scaleOnHover ? "hover:scale-[1.02]" : ""}`}
                >
                  {logo.node}
                </div>
              );
            }

            return (
              <div
                key={idx}
                className={`flex-shrink-0 flex items-center gap-3 px-8 py-4 rounded-2xl border border-zinc-100 bg-white/50 backdrop-blur-sm transition-all duration-300 ${scaleOnHover
                    ? "hover:scale-105 hover:border-zinc-300 hover:bg-white hover:shadow-xl hover:shadow-zinc-200/50"
                    : ""
                  }`}
              >
                {logo.node && (
                  <div className="text-black">{logo.node}</div>
                )}
                {logo.src && (
                  <img
                    src={logo.src}
                    alt={logo.alt}
                    className="h-6 w-auto grayscale group-hover:grayscale-0 transition-all"
                  />
                )}
                {logo.title && (
                  <span className="text-sm font-bold tracking-tighter text-black uppercase">
                    {logo.title}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
