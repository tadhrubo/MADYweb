import { motion } from 'framer-motion';
import {
  DoodleStar,
  DoodleSparks,
  DoodleUnderline,
  DoodleShawarmaMascot,
  DoodleBurstTicks,
  DoodleDoubleTicks,
} from './Doodles';

export function MenuHero() {
  return (
    <section className="relative w-full pt-20 pb-4 sm:pt-24 sm:pb-6 md:pt-28 md:pb-8 overflow-hidden bg-[var(--bg)] select-none">
      <div className="relative max-w-[1400px] mx-auto px-3 sm:px-6 lg:px-8">
        {/* ========================================================
            LEFT FOOD CUTOUT: Large Shawarma Wrap entering from Left
           ======================================================== */}
        <div className="absolute -left-6 sm:-left-3 md:left-2 lg:left-6 xl:left-8 top-[14%] sm:top-[12%] md:top-[8%] w-36 sm:w-56 md:w-72 lg:w-[380px] xl:w-[440px] pointer-events-none z-10">
          <div className="relative">
            {/* Red 4-point star above shawarma */}
            <div className="absolute top-2 right-8 sm:top-4 sm:right-12 pointer-events-none">
              <DoodleStar className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--red)]" />
            </div>

            {/* Shawarma Wrap Tilted Diagonally at ~ -40deg */}
            <motion.img
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              src="/assets/menu/hero-shawarma.webp"
              alt="Mady Fresh Grilled Shawarma Wrap"
              className="w-full h-auto object-contain filter drop-shadow-[0_16px_28px_rgba(155,27,32,0.22)] transform -rotate-[40deg]"
              loading="eager"
            />

            {/* Hand-drawn red radiating motion dashes under shawarma */}
            <div className="absolute -bottom-3 sm:-bottom-5 left-10 sm:left-16 pointer-events-none transform -rotate-12">
              <DoodleBurstTicks className="w-8 h-6 sm:w-11 sm:h-8 text-[var(--red)]" />
            </div>
          </div>
        </div>

        {/* ========================================================
            RIGHT FOOD CUTOUT: Large Biryani Bowl on Upper Right
           ======================================================== */}
        <div className="absolute -right-8 sm:-right-4 md:right-0 lg:right-2 xl:right-4 top-[6%] sm:top-[8%] md:top-[5%] w-40 sm:w-60 md:w-76 lg:w-[400px] xl:w-[450px] pointer-events-none z-10">
          <div className="relative">
            {/* Two red diagonal tick marks (//) to the upper-left of bowl */}
            <div className="absolute -top-1 left-4 sm:-top-2 sm:left-8 pointer-events-none">
              <DoodleDoubleTicks className="w-5 h-5 sm:w-7 sm:h-7 text-[var(--red)]" />
            </div>

            {/* Biryani Bowl */}
            <motion.img
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
              src="/assets/menu/biryani.webp"
              alt="Mady Fragrant Chicken Biryani Bowl"
              className="w-full h-auto object-contain filter drop-shadow-[0_16px_28px_rgba(155,27,32,0.22)] transform rotate-6"
              loading="eager"
            />
          </div>
        </div>

        {/* ========================================================
            CENTER POSTER TYPOGRAPHY GROUP (Sticker + THE MENU + Subtitle)
           ======================================================== */}
        <div className="relative max-w-5xl mx-auto text-center z-20 pt-4 sm:pt-6 md:pt-8">
          {/* Tilted Yellow Sticker: GOOD FOOD GOOD MOOD */}
          <div className="inline-block relative mb-0 sm:mb-1 -rotate-[9deg] -translate-x-6 sm:-translate-x-12 md:-translate-x-16 pointer-events-none">
            <div className="bg-[var(--yellow)] border-2 border-white/95 text-white font-['Lilita_One'] tracking-wider px-3.5 py-1 sm:px-5 sm:py-1.5 rounded-2xl shadow-[2px_3px_0px_rgba(26,11,11,0.22)] text-xs sm:text-sm md:text-base leading-tight uppercase">
              <span className="drop-shadow-[0_1px_2px_rgba(155,27,32,0.35)]">GOOD FOOD</span>
              <br />
              <span className="drop-shadow-[0_1px_2px_rgba(155,27,32,0.35)]">GOOD MOOD</span>
            </div>
            {/* Small red sparkle near sticker */}
            <div className="absolute -top-3 -right-3 pointer-events-none">
              <DoodleStar className="w-4 h-4 text-[var(--red)]" />
            </div>
          </div>

          {/* Enormous Display Headline: THE MENU with White Outline and -3deg Tilt */}
          <div className="relative transform -rotate-[3deg] my-0 sm:-my-1">
            <h1
              className="font-['Anton'] text-[var(--red)] text-[clamp(76px,17vw,255px)] leading-[0.78] tracking-[0.015em] uppercase inline-block drop-shadow-[0_8px_16px_rgba(228,27,35,0.12)]"
              style={{
                WebkitTextStroke: 'clamp(3.5px, 0.5vw, 8px) #FFFFFF',
                paintOrder: 'stroke fill',
              }}
            >
              THE MENU
            </h1>
          </div>

          {/* Supporting Copy with Hand-drawn Underline */}
          <div className="mt-1 sm:mt-2 md:mt-3 inline-flex flex-col items-center relative">
            <p className="font-['Bebas_Neue'] text-lg sm:text-2xl md:text-3xl lg:text-[34px] tracking-[0.08em] text-[var(--ink)] uppercase">
              EVERYTHING WE MAKE, SERVED MADY.
            </p>
            <DoodleUnderline className="w-44 sm:w-64 md:w-80 h-3 sm:h-4 text-[var(--red)] -mt-1 sm:-mt-1.5" />
          </div>

          {/* Two small red ticks under SERVED MADY */}
          <div className="inline-block relative -mt-1 ml-32 sm:ml-48 pointer-events-none">
            <DoodleDoubleTicks className="w-4 h-4 text-[var(--red)] transform rotate-45 opacity-80" />
          </div>
        </div>

        {/* ========================================================
            RIGHT SHARD: Shawarma Spit Character Doodle + Star
           ======================================================== */}
        <div className="hidden sm:block absolute right-16 md:right-28 lg:right-36 bottom-1 md:bottom-2 pointer-events-none z-20">
          <div className="relative">
            <DoodleShawarmaMascot className="w-14 h-22 lg:w-16 lg:h-26 text-[var(--red)] opacity-95 transform rotate-6" />
            <div className="absolute -right-3 -top-1 pointer-events-none">
              <DoodleStar className="w-4 h-4 text-[var(--red)]" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
