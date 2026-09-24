import React from 'react';
import { motion } from 'framer-motion';
import { WavyDivider } from './WavyDivider';
import { DoodleShawarmaMascot } from './Doodles';

export function MenuCta() {
  return (
    <section className="relative w-full overflow-hidden bg-[var(--bg)] mt-8">
      {/* Top Wave Edge transitioning into Red */}
      <WavyDivider fill="var(--red)" position="top" variant="red-cta" />

      {/* Main Red Body */}
      <div className="bg-[var(--red)] py-12 sm:py-16 md:py-20 relative overflow-hidden text-white -my-px">
        {/* Subtle background radial glow */}
        <div
          className="absolute -right-20 top-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#FF3840] rounded-full blur-3xl pointer-events-none opacity-40"
          aria-hidden="true"
        />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Side: Mascot + Headlines + CTA Button */}
            <div className="lg:col-span-7 flex items-center gap-5 sm:gap-8">
              {/* Left Cute Hand-drawn Shawarma Mascot */}
              <div className="hidden sm:block flex-shrink-0">
                <DoodleShawarmaMascot className="w-16 h-24 sm:w-20 sm:h-32 text-white opacity-95 transform -rotate-6" />
              </div>

              <div className="space-y-3 sm:space-y-4">
                {/* Yellow Sticker: FRESHLY MADE */}
                <div className="inline-block transform -rotate-3 select-none">
                  <div className="bg-[var(--yellow)] border-2 border-[var(--ink)] text-[var(--ink)] font-['Lilita_One'] text-sm sm:text-base tracking-wider px-4 py-1 rounded-2xl shadow-[3px_3px_0px_#1A0B0B] uppercase">
                    FRESHLY MADE
                  </div>
                </div>

                {/* Massive Headline: REAL SHAWARMA */}
                <h2 className="font-['Anton'] text-5xl sm:text-7xl md:text-8xl lg:text-[96px] text-white leading-[0.88] tracking-tight uppercase drop-shadow-[0_4px_0_rgba(155,27,32,0.4)]">
                  REAL SHAWARMA
                </h2>

                {/* Subtitle */}
                <p className="font-['Bebas_Neue'] text-lg sm:text-2xl md:text-3xl text-white/95 tracking-widest uppercase">
                  SLOW-GRILLED. FRESH. FULL OF FLAVOR.
                </p>

                {/* ORDER NOW Yellow Pill Button */}
                <div className="pt-2">
                  <a
                    href="https://www.foodpanda.com.bd/restaurant/sjiu/mady-sjiu"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center bg-[var(--yellow)] text-[var(--red)] border-2 border-[var(--ink)] font-['Bebas_Neue'] text-xl sm:text-2xl tracking-widest px-8 py-2.5 sm:py-3 rounded-full shadow-[4px_4px_0px_#1A0B0B] hover:scale-105 active:scale-95 transition-all duration-200 uppercase select-none group cursor-pointer"
                  >
                    <span>ORDER NOW</span>
                    <span className="ml-2 transform group-hover:translate-x-1 transition-transform">
                      &rarr;
                    </span>
                  </a>
                </div>
              </div>
            </div>

            {/* Right Side: Giant Shawarma Wrap Cutout + BOLD FLAVOR Badge */}
            <div className="lg:col-span-5 relative mt-6 lg:mt-0 flex justify-center lg:justify-end">
              <div className="relative w-64 sm:w-80 md:w-96 lg:w-[420px]">
                {/* White radiant doodle rays behind wrap */}
                <svg
                  className="absolute -inset-8 w-[calc(100%+4rem)] h-[calc(100%+4rem)] pointer-events-none opacity-50 text-white"
                  viewBox="0 0 100 100"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <line x1="12" y1="28" x2="3" y2="22" />
                  <line x1="8" y1="50" x2="0" y2="50" />
                  <line x1="14" y1="72" x2="5" y2="78" />
                  <line x1="90" y1="20" x2="98" y2="15" />
                  <line x1="92" y1="45" x2="100" y2="44" />
                </svg>

                {/* Shawarma Cutout */}
                <motion.img
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  src="/assets/menu/cta-shawarma.webp"
                  alt="Mady Real Shawarma"
                  className="w-full h-auto object-contain filter drop-shadow-[0_20px_35px_rgba(0,0,0,0.35)] transform rotate-8 select-none relative z-10"
                  loading="lazy"
                />

                {/* Tilted Yellow Sticker: BOLD FLAVOR */}
                <div className="absolute bottom-2 right-4 sm:bottom-4 sm:right-6 z-30 pointer-events-none select-none">
                  <div className="bg-[var(--yellow)] border-2 border-[var(--ink)] text-[var(--ink)] font-['Lilita_One'] text-base sm:text-lg md:text-xl tracking-wide px-4 py-1.5 rounded-2xl shadow-[3px_3px_0px_#1A0B0B] transform rotate-6 uppercase leading-tight">
                    BOLD
                    <br />
                    FLAVOR
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Wave Edge transitioning back to Cream */}
      <WavyDivider fill="var(--red)" position="bottom" variant="red-cta" />
    </section>
  );
}
