import React from 'react';
import { MENU_CATEGORIES } from '../../data/menuData';
import {
  DoodleStar,
  DoodleSparks,
  DoodleMotion,
  DoodleSkewerFlames,
  DoodleSwirl,
} from './Doodles';

interface MenuSectionsProps {
  filterCategory?: string;
}

export function MenuSections({ filterCategory = 'all' }: MenuSectionsProps) {
  const gravyCat = MENU_CATEGORIES.find((c) => c.id === 'gravy')!;
  const riceCat = MENU_CATEGORIES.find((c) => c.id === 'rice-platters')!;
  const addOnsCat = MENU_CATEGORIES.find((c) => c.id === 'add-ons')!;
  const snacksCat = MENU_CATEGORIES.find((c) => c.id === 'snacks')!;
  const kababCat = MENU_CATEGORIES.find((c) => c.id === 'kabab-grills')!;

  const isVisible = (id: string) => filterCategory === 'all' || filterCategory === id;

  return (
    <section
      id="menu-content"
      className="relative w-full py-12 sm:py-16 md:py-20 bg-[var(--bg)] text-[var(--ink)] overflow-hidden"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ROW 1: GRAVY (Left) & RICE PLATTERS (Right) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-14 items-start relative pb-12 sm:pb-14 border-b border-[var(--ink)]/15">
          {/* Subtle center vertical divider on desktop */}
          <div
            className="hidden md:block absolute left-1/2 top-4 bottom-4 w-px bg-gradient-to-b from-transparent via-[var(--ink)]/15 to-transparent -translate-x-1/2"
            aria-hidden="true"
          />

          {/* SECTION: GRAVY */}
          {isVisible('gravy') && (
            <div id="gravy" className="relative group scroll-mt-28">
              {/* Category Header with Cutout Image & Yellow Sticker */}
              <div className="flex items-center gap-3 sm:gap-5 mb-5 sm:mb-6">
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 flex-shrink-0">
                  <img
                    src={gravyCat.image}
                    alt={gravyCat.imageAlt}
                    className="w-full h-full object-contain filter drop-shadow-[0_10px_16px_rgba(155,27,32,0.22)] transform -rotate-6 transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute -top-1 -right-1 pointer-events-none">
                    <DoodleSparks className="w-5 h-5 text-[var(--red)]" />
                  </div>
                </div>

                <div className="relative">
                  <div className="inline-block bg-[var(--yellow)] border-2 border-[var(--ink)] px-5 py-1.5 rounded-2xl shadow-[3px_3px_0px_#1A0B0B] transform -rotate-2">
                    <h2 className="font-['Lilita_One'] text-2xl sm:text-3xl lg:text-4xl text-[var(--ink)] tracking-wide uppercase">
                      {gravyCat.name}
                    </h2>
                  </div>
                </div>
              </div>

              {/* Items List with Crisp Radial Dot Leaders */}
              <ul className="space-y-2.5 sm:space-y-3 pl-1 sm:pl-3">
                {gravyCat.items.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-baseline justify-between group/item hover:text-[var(--red)] transition-colors"
                  >
                    <span className="font-['Outfit'] font-semibold text-[15px] sm:text-[17px] text-[var(--ink)] group-hover/item:text-[var(--red)] tracking-tight whitespace-nowrap">
                      {item.name}
                    </span>
                    <span
                      className="flex-1 mx-2 sm:mx-3 h-[2px] self-end mb-1 opacity-35 bg-[radial-gradient(circle,_#1A0B0B_1.2px,_transparent_1.2px)] [background-size:6px_2px] bg-repeat-x min-w-[20px]"
                      aria-hidden="true"
                    />
                    <span className="font-['Outfit'] font-bold text-[14px] sm:text-[16px] text-[var(--ink)]/85 tracking-tight shrink-0">
                      {item.price}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Red Doodle Accent */}
              <div className="absolute -bottom-5 left-10 pointer-events-none">
                <DoodleStar className="w-4 h-4 text-[var(--red)] opacity-80" />
              </div>
            </div>
          )}

          {/* SECTION: RICE PLATTERS */}
          {isVisible('rice-platters') && (
            <div id="rice-platters" className="relative group scroll-mt-28">
              {/* Category Header with Cutout Image & Yellow Sticker */}
              <div className="flex items-center gap-3 sm:gap-5 mb-5 sm:mb-6">
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 flex-shrink-0">
                  <img
                    src={riceCat.image}
                    alt={riceCat.imageAlt}
                    className="w-full h-full object-contain filter drop-shadow-[0_10px_16px_rgba(155,27,32,0.22)] transform rotate-6 transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute -top-1 -left-2 pointer-events-none">
                    <DoodleMotion className="w-6 h-6 text-[var(--red)]" />
                  </div>
                </div>

                <div className="relative">
                  <div className="inline-block bg-[var(--yellow)] border-2 border-[var(--ink)] px-5 py-1.5 rounded-2xl shadow-[3px_3px_0px_#1A0B0B] transform rotate-2">
                    <h2 className="font-['Lilita_One'] text-2xl sm:text-3xl lg:text-4xl text-[var(--ink)] tracking-wide uppercase">
                      {riceCat.name}
                    </h2>
                  </div>
                </div>
              </div>

              {/* Items List with Crisp Radial Dot Leaders */}
              <ul className="space-y-2.5 sm:space-y-3 pl-1 sm:pl-3">
                {riceCat.items.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-baseline justify-between group/item hover:text-[var(--red)] transition-colors"
                  >
                    <span className="font-['Outfit'] font-semibold text-[15px] sm:text-[17px] text-[var(--ink)] group-hover/item:text-[var(--red)] tracking-tight whitespace-nowrap">
                      {item.name}
                    </span>
                    <span
                      className="flex-1 mx-2 sm:mx-3 h-[2px] self-end mb-1 opacity-35 bg-[radial-gradient(circle,_#1A0B0B_1.2px,_transparent_1.2px)] [background-size:6px_2px] bg-repeat-x min-w-[20px]"
                      aria-hidden="true"
                    />
                    <span className="font-['Outfit'] font-bold text-[14px] sm:text-[16px] text-[var(--ink)]/85 tracking-tight shrink-0">
                      {item.price}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Red Doodle Accent */}
              <div className="absolute top-2 right-4 pointer-events-none">
                <DoodleStar className="w-5 h-5 text-[var(--red)] opacity-80" />
              </div>
            </div>
          )}
        </div>

        {/* ROW 2: ADD ONS (Left) & SNACKS (Right) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-14 items-start relative py-12 sm:py-14 border-b border-[var(--ink)]/15">
          {/* Subtle center vertical divider on desktop */}
          <div
            className="hidden md:block absolute left-1/2 top-4 bottom-4 w-px bg-gradient-to-b from-transparent via-[var(--ink)]/15 to-transparent -translate-x-1/2"
            aria-hidden="true"
          />

          {/* SECTION: ADD ONS */}
          {isVisible('add-ons') && (
            <div id="add-ons" className="relative group scroll-mt-28">
              {/* Category Header with Cutout Image & Yellow Sticker */}
              <div className="flex items-center gap-3 sm:gap-5 mb-5 sm:mb-6">
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 flex-shrink-0">
                  <img
                    src={addOnsCat.image}
                    alt={addOnsCat.imageAlt}
                    className="w-full h-full object-contain filter drop-shadow-[0_10px_16px_rgba(155,27,32,0.22)] transform -rotate-3 transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute -bottom-2 -left-1 pointer-events-none">
                    <DoodleSwirl className="w-6 h-6 text-[var(--red)]" />
                  </div>
                </div>

                <div className="relative">
                  <div className="inline-block bg-[var(--yellow)] border-2 border-[var(--ink)] px-5 py-1.5 rounded-2xl shadow-[3px_3px_0px_#1A0B0B] transform -rotate-1">
                    <h2 className="font-['Lilita_One'] text-2xl sm:text-3xl lg:text-4xl text-[var(--ink)] tracking-wide uppercase">
                      {addOnsCat.name}
                    </h2>
                  </div>
                </div>
              </div>

              {/* Items List with Crisp Radial Dot Leaders */}
              <ul className="space-y-2.5 sm:space-y-3 pl-1 sm:pl-3">
                {addOnsCat.items.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-baseline justify-between group/item hover:text-[var(--red)] transition-colors"
                  >
                    <span className="font-['Outfit'] font-semibold text-[15px] sm:text-[17px] text-[var(--ink)] group-hover/item:text-[var(--red)] tracking-tight whitespace-nowrap">
                      {item.name}
                    </span>
                    <span
                      className="flex-1 mx-2 sm:mx-3 h-[2px] self-end mb-1 opacity-35 bg-[radial-gradient(circle,_#1A0B0B_1.2px,_transparent_1.2px)] [background-size:6px_2px] bg-repeat-x min-w-[20px]"
                      aria-hidden="true"
                    />
                    <span className="font-['Outfit'] font-bold text-[14px] sm:text-[16px] text-[var(--ink)]/85 tracking-tight shrink-0">
                      {item.price}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* SECTION: SNACKS */}
          {isVisible('snacks') && (
            <div id="snacks" className="relative group scroll-mt-28">
              {/* Category Header with Yellow Sticker and Cutout Image on the Right */}
              <div className="flex items-center justify-between gap-4 mb-5 sm:mb-6">
                <div className="relative">
                  <div className="inline-block bg-[var(--yellow)] border-2 border-[var(--ink)] px-5 py-1.5 rounded-2xl shadow-[3px_3px_0px_#1A0B0B] transform rotate-2">
                    <h2 className="font-['Lilita_One'] text-2xl sm:text-3xl lg:text-4xl text-[var(--ink)] tracking-wide uppercase">
                      {snacksCat.name}
                    </h2>
                  </div>
                  <div className="absolute -top-3 -left-3 pointer-events-none">
                    <DoodleStar className="w-4 h-4 text-[var(--red)]" />
                  </div>
                </div>

                {/* Shawarma Wrap Cutout positioned on the right */}
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 flex-shrink-0">
                  <img
                    src={snacksCat.image}
                    alt={snacksCat.imageAlt}
                    className="w-full h-full object-contain filter drop-shadow-[0_10px_16px_rgba(155,27,32,0.22)] transform rotate-12 transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute -bottom-2 -right-1 pointer-events-none">
                    <DoodleSparks className="w-5 h-5 text-[var(--red)]" />
                  </div>
                </div>
              </div>

              {/* Items List with Crisp Radial Dot Leaders */}
              <ul className="space-y-2.5 sm:space-y-3 pl-1 sm:pl-3">
                {snacksCat.items.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-baseline justify-between group/item hover:text-[var(--red)] transition-colors"
                  >
                    <span className="font-['Outfit'] font-semibold text-[15px] sm:text-[17px] text-[var(--ink)] group-hover/item:text-[var(--red)] tracking-tight whitespace-nowrap">
                      {item.name}
                    </span>
                    <span
                      className="flex-1 mx-2 sm:mx-3 h-[2px] self-end mb-1 opacity-35 bg-[radial-gradient(circle,_#1A0B0B_1.2px,_transparent_1.2px)] [background-size:6px_2px] bg-repeat-x min-w-[20px]"
                      aria-hidden="true"
                    />
                    <span className="font-['Outfit'] font-bold text-[14px] sm:text-[16px] text-[var(--ink)]/85 tracking-tight shrink-0">
                      {item.price}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Red Doodle Star */}
              <div className="absolute -bottom-4 right-8 pointer-events-none">
                <DoodleStar className="w-5 h-5 text-[var(--red)] opacity-80" />
              </div>
            </div>
          )}
        </div>

        {/* ROW 3: FULL WIDTH KABAB & GRILLS SECTION */}
        {isVisible('kabab-grills') && (
          <div id="kabab-grills" className="relative group pt-12 sm:pt-14 scroll-mt-28">
            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6 lg:gap-10">
              {/* Left Side: Kabab Platter Image & Yellow Sticker */}
              <div className="flex items-center gap-4 sm:gap-6 flex-shrink-0">
                <div className="relative w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44">
                  <img
                    src={kababCat.image}
                    alt={kababCat.imageAlt}
                    className="w-full h-full object-contain filter drop-shadow-[0_12px_20px_rgba(155,27,32,0.22)] transform -rotate-6 transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute -top-2 left-2 pointer-events-none">
                    <DoodleSwirl className="w-7 h-7 text-[var(--red)]" />
                  </div>
                </div>

                <div>
                  <div className="inline-block bg-[var(--yellow)] border-2 border-[var(--ink)] px-5 py-2 rounded-2xl shadow-[3px_3px_0px_#1A0B0B] transform -rotate-1">
                    <h2 className="font-['Lilita_One'] text-2xl sm:text-3xl lg:text-4xl text-[var(--ink)] tracking-wide uppercase">
                      {kababCat.name}
                    </h2>
                  </div>
                </div>
              </div>

              {/* Right Side: 2-column menu sub-grid + Red Skewer Doodle */}
              <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-x-8 lg:gap-x-12 gap-y-3 relative pt-2 sm:pt-4">
                {/* Column 1 of kabab items */}
                <ul className="space-y-2.5 sm:space-y-3">
                  {kababCat.items.slice(0, 4).map((item) => (
                    <li
                      key={item.id}
                      className="flex items-baseline justify-between group/item hover:text-[var(--red)] transition-colors"
                    >
                      <span className="font-['Outfit'] font-semibold text-[15px] sm:text-[16px] text-[var(--ink)] group-hover/item:text-[var(--red)] tracking-tight whitespace-nowrap">
                        {item.name}
                      </span>
                      <span
                        className="flex-1 mx-2 sm:mx-3 h-[2px] self-end mb-1 opacity-35 bg-[radial-gradient(circle,_#1A0B0B_1.2px,_transparent_1.2px)] [background-size:6px_2px] bg-repeat-x min-w-[16px]"
                        aria-hidden="true"
                      />
                      <span className="font-['Outfit'] font-bold text-[14px] sm:text-[15px] text-[var(--ink)]/85 tracking-tight shrink-0">
                        {item.price}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* Column 2 of kabab items */}
                <ul className="space-y-2.5 sm:space-y-3">
                  {kababCat.items.slice(4).map((item) => (
                    <li
                      key={item.id}
                      className="flex items-baseline justify-between group/item hover:text-[var(--red)] transition-colors"
                    >
                      <span className="font-['Outfit'] font-semibold text-[15px] sm:text-[16px] text-[var(--ink)] group-hover/item:text-[var(--red)] tracking-tight whitespace-nowrap">
                        {item.name}
                      </span>
                      <span
                        className="flex-1 mx-2 sm:mx-3 h-[2px] self-end mb-1 opacity-35 bg-[radial-gradient(circle,_#1A0B0B_1.2px,_transparent_1.2px)] [background-size:6px_2px] bg-repeat-x min-w-[16px]"
                        aria-hidden="true"
                      />
                      <span className="font-['Outfit'] font-bold text-[14px] sm:text-[15px] text-[var(--ink)]/85 tracking-tight shrink-0">
                        {item.price}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* Red Skewer & Flames Doodle on the far right */}
                <div className="hidden lg:block absolute -right-14 top-1/2 -translate-y-1/2 pointer-events-none">
                  <DoodleSkewerFlames className="w-16 h-28 text-[var(--red)] opacity-90 transform rotate-12" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
