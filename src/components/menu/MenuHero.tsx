import { motion } from 'framer-motion';
import {
  DoodleStar,
  DoodleSparks,
  DoodleMotion,
  DoodleUnderline,
  DoodleShawarmaMascot,
} from './Doodles';

export function MenuHero() {
  return (
    <section className="relative w-full pt-28 pb-14 sm:pt-36 sm:pb-20 md:pt-40 md:pb-24 overflow-hidden bg-[var(--bg)]">
      {/* Background warm radial glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[550px] bg-[#FCECD6] rounded-full blur-3xl pointer-events-none opacity-80"
        aria-hidden="true"
      />

      {/* LEFT FOOD CUTOUT: Shawarma Wrap on Left Flank */}
      <div className="absolute left-0 sm:left-2 md:left-4 lg:left-8 xl:left-12 top-10 sm:top-14 md:top-12 w-28 sm:w-44 md:w-56 lg:w-68 xl:w-80 pointer-events-none select-none z-10">
        <div className="relative group">
          <motion.img
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
            src="/assets/menu/hero-shawarma.webp"
            alt="Mady Grilled Shawarma Wrap"
            className="w-full h-auto object-contain filter drop-shadow-[0_18px_28px_rgba(155,27,32,0.22)] transform -rotate-15 hover:scale-105 transition-transform"
            loading="eager"
          />
          {/* Hand-drawn red motion strokes */}
          <div className="absolute -bottom-2 right-2 pointer-events-none">
            <DoodleMotion className="w-6 h-6 md:w-8 md:h-8 text-[var(--red)]" />
          </div>
          <div className="absolute -top-2 left-4 pointer-events-none">
            <DoodleStar className="w-4 h-4 text-[var(--red)]" />
          </div>
        </div>
      </div>

      {/* RIGHT FOOD CUTOUT: Biryani Bowl on Right Flank */}
      <div className="absolute right-0 sm:right-2 md:right-4 lg:right-8 xl:right-12 top-8 sm:top-10 md:top-8 w-32 sm:w-48 md:w-60 lg:w-72 xl:w-84 pointer-events-none select-none z-10">
        <div className="relative group">
          <motion.img
            animate={{ y: [0, -7, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
            src="/assets/menu/biryani.webp"
            alt="Mady Chicken Biryani Platter"
            className="w-full h-auto object-contain filter drop-shadow-[0_18px_30px_rgba(155,27,32,0.22)] transform rotate-8 hover:scale-105 transition-transform"
            loading="eager"
          />
          {/* Hand-drawn red sparks */}
          <div className="absolute top-2 left-2 pointer-events-none">
            <DoodleSparks className="w-6 h-6 md:w-7 md:h-7 text-[var(--red)]" />
          </div>
        </div>
      </div>

      {/* CENTER HEADLINE & SUBTITLE CONTAINER */}
      <div className="relative max-w-4xl lg:max-w-5xl mx-auto px-4 text-center z-10">
        {/* Tilted Sticker: GOOD FOOD GOOD MOOD */}
        <div className="inline-block mb-1 sm:mb-2 md:mb-3 transform -rotate-6 select-none">
          <div className="bg-[var(--yellow)] border-2 border-[var(--ink)] text-[var(--ink)] font-['Lilita_One'] tracking-wide px-4 py-1 sm:px-5 sm:py-1.5 rounded-2xl shadow-[3px_3px_0px_#1A0B0B] text-xs sm:text-sm md:text-base leading-tight uppercase">
            <span>GOOD FOOD</span>
            <br />
            <span>GOOD MOOD</span>
          </div>
        </div>

        {/* Small sparks near sticker */}
        <div className="hidden sm:block absolute left-[22%] top-[14%] pointer-events-none">
          <DoodleStar className="w-4 h-4 text-[var(--red)] animate-pulse" />
        </div>
        <div className="hidden md:block absolute right-[22%] top-[10%] pointer-events-none">
          <DoodleSparks className="w-6 h-6 text-[var(--red)]" />
        </div>

        {/* Enormous Headline: THE MENU */}
        <div className="relative px-2">
          <h1 className="font-['Anton'] text-[var(--red)] text-[clamp(60px,13vw,175px)] leading-[0.84] tracking-tight uppercase select-none inline-block">
            THE MENU
          </h1>
        </div>

        {/* Supporting Copy with Hand-drawn Underline */}
        <div className="mt-2 sm:mt-4 md:mt-5 inline-flex flex-col items-center relative">
          <p className="font-['Bebas_Neue'] text-lg sm:text-2xl md:text-3xl lg:text-4xl tracking-wider text-[var(--ink)] uppercase">
            EVERYTHING WE MAKE, SERVED MADY.
          </p>
          <DoodleUnderline className="w-40 sm:w-60 md:w-72 h-3 sm:h-4 text-[var(--red)] -mt-1 sm:-mt-2" />
        </div>

        {/* Red Spit Mascot Doodle positioned on the right */}
        <div className="hidden md:block absolute right-4 lg:right-12 bottom-0 pointer-events-none z-10">
          <div className="relative">
            <DoodleShawarmaMascot className="w-14 h-22 lg:w-16 lg:h-24 text-[var(--red)] opacity-90 transform rotate-8" />
            <div className="absolute -right-2 top-2 pointer-events-none">
              <DoodleStar className="w-4 h-4 text-[var(--red)]" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
