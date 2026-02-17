import React from 'react';
import { motion } from 'framer-motion';
import { AiMedLogo } from '../components/AiMedLogo';
const section = (delay: number) => ({
  initial: {
    opacity: 0,
    y: 16
  },
  animate: {
    opacity: 1,
    y: 0
  },
  transition: {
    duration: 0.7,
    ease: [0.22, 1, 0.36, 1],
    delay
  }
});
function SectionLabel({ children }: {children: React.ReactNode;}) {
  return (
    <span className="text-[10px] font-medium tracking-[0.2em] text-gray-400 uppercase select-none">
      {children}
    </span>);

}
export function BrandShowcase() {
  const sizes = [
  {
    label: '480px',
    width: 'w-[480px]'
  },
  {
    label: '320px',
    width: 'w-[320px]'
  },
  {
    label: '200px',
    width: 'w-[200px]'
  },
  {
    label: '120px',
    width: 'w-[120px]'
  },
  {
    label: '64px',
    width: 'w-[64px]'
  }];

  return (
    <div
      className="min-h-screen bg-white"
      style={{
        fontFamily: "'Inter', sans-serif"
      }}>

      <div className="max-w-[1120px] mx-auto px-8 md:px-16">
        {/* Page Header */}
        <motion.header
          {...section(0)}
          className="pt-16 pb-12 flex justify-between items-baseline border-b border-gray-100">

          <div>
            <h1 className="text-[11px] font-medium tracking-[0.25em] text-gray-400 uppercase">
              Brand Identity Guidelines
            </h1>
            <p className="text-[11px] text-gray-300 mt-1.5 tracking-wide">
              AiMED — v1.0
            </p>
          </div>
          <span className="text-[10px] text-gray-300 font-mono tracking-wider">
            01
          </span>
        </motion.header>

        {/* ─── HERO: Primary Logo ─── */}
        <motion.section
          {...section(0.15)}
          className="py-32 flex flex-col items-center">

          <div className="mb-20">
            <SectionLabel>Primary Lockup</SectionLabel>
          </div>
          <div className="w-full max-w-[520px]">
            <AiMedLogo variant="full" mode="light" />
          </div>
        </motion.section>

        <div className="border-t border-gray-100" />

        {/* ─── REVERSED ─── */}
        <motion.section {...section(0.3)} className="py-8">
          <div className="mb-8">
            <SectionLabel>Reversed</SectionLabel>
          </div>
          <div className="bg-black rounded-2xl py-28 flex items-center justify-center">
            <div className="w-full max-w-[480px] px-8">
              <AiMedLogo variant="full" mode="dark" />
            </div>
          </div>
        </motion.section>

        <div className="border-t border-gray-100 mt-8" />

        {/* ─── MONOGRAM ─── */}
        <motion.section {...section(0.45)} className="py-20">
          <div className="mb-12">
            <SectionLabel>Monogram</SectionLabel>
          </div>
          <div className="flex items-start gap-16">
            <div className="flex items-end gap-8">
              {/* Light monograms */}
              <div className="flex flex-col items-center gap-3">
                <div className="w-20 h-20 bg-gray-50 rounded-xl flex items-center justify-center">
                  <div className="w-12 h-12">
                    <AiMedLogo variant="monogram" mode="light" />
                  </div>
                </div>
                <span className="text-[10px] text-gray-300">80px</span>
              </div>
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="w-8 h-8">
                    <AiMedLogo variant="monogram" mode="light" />
                  </div>
                </div>
                <span className="text-[10px] text-gray-300">48px</span>
              </div>
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 bg-gray-50 rounded-md flex items-center justify-center">
                  <div className="w-5 h-5">
                    <AiMedLogo variant="monogram" mode="light" />
                  </div>
                </div>
                <span className="text-[10px] text-gray-300">32px</span>
              </div>
            </div>

            <div className="w-px h-20 bg-gray-100" />

            {/* Dark monograms */}
            <div className="flex items-end gap-8">
              <div className="flex flex-col items-center gap-3">
                <div className="w-20 h-20 bg-black rounded-xl flex items-center justify-center">
                  <div className="w-12 h-12">
                    <AiMedLogo variant="monogram" mode="dark" />
                  </div>
                </div>
                <span className="text-[10px] text-gray-300">80px</span>
              </div>
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
                  <div className="w-8 h-8">
                    <AiMedLogo variant="monogram" mode="dark" />
                  </div>
                </div>
                <span className="text-[10px] text-gray-300">48px</span>
              </div>
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 bg-black rounded-md flex items-center justify-center">
                  <div className="w-5 h-5">
                    <AiMedLogo variant="monogram" mode="dark" />
                  </div>
                </div>
                <span className="text-[10px] text-gray-300">32px</span>
              </div>
            </div>
          </div>
          <p className="text-[11px] text-gray-400 mt-10 max-w-xs leading-relaxed">
            Reduced mark for favicons, app icons, avatars, and compact UI
            contexts where the full lockup cannot be legibly rendered.
          </p>
        </motion.section>

        <div className="border-t border-gray-100" />

        {/* ─── SCALE ─── */}
        <motion.section {...section(0.6)} className="py-20">
          <div className="mb-12">
            <SectionLabel>Scale</SectionLabel>
          </div>
          <div className="space-y-10">
            {sizes.map(({ label, width }) =>
            <div key={label} className="flex items-center gap-8">
                <span className="text-[10px] text-gray-300 font-mono w-12 text-right shrink-0">
                  {label}
                </span>
                <div className={width}>
                  <AiMedLogo variant="full" mode="light" />
                </div>
              </div>
            )}
          </div>
        </motion.section>

        <div className="border-t border-gray-100" />

        {/* ─── CLEAR SPACE ─── */}
        <motion.section {...section(0.75)} className="py-20">
          <div className="mb-12">
            <SectionLabel>Clear Space</SectionLabel>
          </div>
          <div className="flex items-start gap-16">
            <div className="relative inline-block">
              {/* Dashed boundary */}
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-12 relative">
                {/* Corner markers */}
                <div className="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 border-gray-300" />
                <div className="absolute -top-1 -right-1 w-2 h-2 border-t-2 border-r-2 border-gray-300" />
                <div className="absolute -bottom-1 -left-1 w-2 h-2 border-b-2 border-l-2 border-gray-300" />
                <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 border-gray-300" />

                {/* Dimension arrows */}
                <div className="absolute -left-8 top-0 h-full flex items-center">
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-px h-3 bg-gray-300" />
                    <span className="text-[9px] text-gray-400 font-mono -rotate-90 whitespace-nowrap">
                      x
                    </span>
                    <div className="w-px h-3 bg-gray-300" />
                  </div>
                </div>
                <div className="absolute top-0 -top-7 left-0 w-full flex justify-center">
                  <div className="flex items-center gap-1">
                    <div className="h-px w-3 bg-gray-300" />
                    <span className="text-[9px] text-gray-400 font-mono">
                      x
                    </span>
                    <div className="h-px w-3 bg-gray-300" />
                  </div>
                </div>

                <div className="w-[280px]">
                  <AiMedLogo variant="full" mode="light" />
                </div>
              </div>
            </div>
            <div className="pt-4 max-w-[240px]">
              <p className="text-[11px] text-gray-400 leading-relaxed">
                Maintain a minimum clear space equal to the cap-height of the
                'A' character on all sides. No other graphic elements, text, or
                visual noise should enter this boundary.
              </p>
              <p className="text-[11px] text-gray-300 mt-3 leading-relaxed">
                Where <span className="font-mono">x</span> = cap-height of 'A'
              </p>
            </div>
          </div>
        </motion.section>

        <div className="border-t border-gray-100" />

        {/* ─── SPECS FOOTER ─── */}
        <motion.footer
          {...section(0.9)}
          className="py-12 flex flex-wrap gap-x-16 gap-y-6">

          <div>
            <span className="block text-[9px] text-gray-400 uppercase tracking-[0.15em] mb-1.5">
              Typeface
            </span>
            <span className="text-[13px] font-medium text-gray-900">Inter</span>
          </div>
          <div>
            <span className="block text-[9px] text-gray-400 uppercase tracking-[0.15em] mb-1.5">
              Weights
            </span>
            <span className="text-[13px] text-gray-900">
              <span className="font-black">Black 900</span>
              {' / '}
              <span className="font-light">Light 300</span>
            </span>
          </div>
          <div>
            <span className="block text-[9px] text-gray-400 uppercase tracking-[0.15em] mb-1.5">
              Palette
            </span>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 bg-black rounded-sm" />
                <span className="text-[11px] font-mono text-gray-500">
                  #000
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 bg-white border border-gray-200 rounded-sm" />
                <span className="text-[11px] font-mono text-gray-500">
                  #FFF
                </span>
              </div>
            </div>
          </div>
        </motion.footer>

        <div className="h-16" />
      </div>
    </div>);

}