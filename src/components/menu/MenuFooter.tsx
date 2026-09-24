import React from 'react';
import { DoodleSparks, DoodleStar } from './Doodles';
import { WavyDivider } from './WavyDivider';

export function MenuFooter() {
  return (
    <footer className="relative w-full bg-[var(--bg)] pt-14 pb-0 overflow-hidden text-[var(--ink)]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        {/* Navigation Links */}
        <nav
          aria-label="Footer Navigation"
          className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 md:gap-14 mb-8"
        >
          <a
            href="/"
            className="font-['Bebas_Neue'] text-lg sm:text-xl md:text-2xl tracking-widest text-[var(--ink)] hover:text-[var(--red)] transition-colors uppercase"
          >
            HOME
          </a>
          <a
            href="/#wrap"
            className="font-['Bebas_Neue'] text-lg sm:text-xl md:text-2xl tracking-widest text-[var(--ink)] hover:text-[var(--red)] transition-colors uppercase"
          >
            SHAWARMA
          </a>
          <a
            href="/#feel-good"
            className="font-['Bebas_Neue'] text-lg sm:text-xl md:text-2xl tracking-widest text-[var(--ink)] hover:text-[var(--red)] transition-colors uppercase"
          >
            EXPERIENCE
          </a>
          <a
            href="/#find-us"
            className="font-['Bebas_Neue'] text-lg sm:text-xl md:text-2xl tracking-widest text-[var(--ink)] hover:text-[var(--red)] transition-colors uppercase"
          >
            ABOUT
          </a>
          <a
            href="/#find-us"
            className="font-['Bebas_Neue'] text-lg sm:text-xl md:text-2xl tracking-widest text-[var(--ink)] hover:text-[var(--red)] transition-colors uppercase"
          >
            CONTACT
          </a>
        </nav>

        {/* Centerpiece: MADY Logo Flanked by Fresh Cutout Ingredients */}
        <div className="relative inline-flex items-center justify-center my-6 py-2">
          {/* Left doodle spark */}
          <div className="absolute -left-10 sm:-left-16 top-1/2 -translate-y-1/2 pointer-events-none">
            <DoodleSparks className="w-6 h-6 text-[var(--red)]" />
          </div>

          {/* Left Ingredients: Fresh Lettuce & Red Onion */}
          <div className="relative -mr-4 sm:-mr-8 flex items-center z-10">
            <img
              src="/assets/ingredients/lettuce.webp"
              alt="Fresh Crisp Lettuce"
              className="w-16 sm:w-22 md:w-26 h-auto object-contain filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.15)] transform -rotate-12"
              loading="lazy"
            />
            <img
              src="/assets/ingredients/red-onion.webp"
              alt="Crisp Red Onion Slice"
              className="w-14 sm:w-18 md:w-20 h-auto object-contain filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.15)] -ml-5 sm:-ml-7 transform rotate-6"
              loading="lazy"
            />
          </div>

          {/* Central Red MADY Logo */}
          <div className="relative z-20 mx-1 sm:mx-3">
            <img
              src="/assets/madySolo.png"
              alt="MADY"
              className="w-40 sm:w-56 md:w-68 h-auto object-contain filter drop-shadow-[3px_4px_0px_var(--maroon)]"
            />
          </div>

          {/* Right Ingredients: Fresh Lemon & Garlic + Grilled Flatbread */}
          <div className="relative -ml-4 sm:-ml-8 flex items-center z-10">
            <img
              src="/assets/ingredients/lemon-garlic.webp"
              alt="Fresh Lemon & Garlic"
              className="w-16 sm:w-22 md:w-26 h-auto object-contain filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.15)] transform -rotate-6"
              loading="lazy"
            />
            <img
              src="/assets/ingredients/flatbread.webp"
              alt="Fresh Grilled Flatbread"
              className="w-14 sm:w-18 md:w-20 h-auto object-contain filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.15)] -ml-5 sm:-ml-7 transform rotate-12"
              loading="lazy"
            />
          </div>

          {/* Right doodle spark */}
          <div className="absolute -right-10 sm:-right-16 top-1/2 -translate-y-1/2 pointer-events-none">
            <DoodleStar className="w-5 h-5 text-[var(--red)]" />
          </div>
        </div>

        {/* Tagline */}
        <p className="font-['Bebas_Neue'] text-base sm:text-lg md:text-xl tracking-widest text-[var(--ink)]/85 uppercase mt-3">
          GRILLED SHAWARMA &bull; FRESH INGREDIENTS &bull; BOLD FLAVOR
        </p>

        {/* Copyright */}
        <p className="font-['DM_Sans'] text-xs sm:text-sm text-[var(--ink)]/65 tracking-wide mt-2 mb-10">
          &copy; {new Date().getFullYear()} MADY &mdash; ALL RIGHTS RESERVED
        </p>
      </div>

      {/* Red Wave Accent at the very bottom */}
      <WavyDivider fill="var(--red)" position="top" variant="footer" className="mt-4" />
    </footer>
  );
}
