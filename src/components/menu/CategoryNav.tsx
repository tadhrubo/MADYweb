import { useEffect, useState } from 'react';
import { WavyDivider } from './WavyDivider';
import { DoodleStar, DoodleSparks } from './Doodles';

export interface CategoryNavProps {
  activeCategory: string;
  onSelectCategory: (id: string) => void;
}

const CATEGORIES = [
  { id: 'all', label: 'ALL' },
  { id: 'snacks', label: 'SNACKS' },
  { id: 'gravy', label: 'GRAVY' },
  { id: 'rice-platters', label: 'RICE PLATTERS' },
  { id: 'kabab-grills', label: 'KABAB & GRILLS' },
  { id: 'add-ons', label: 'ADD ONS' },
];

export function CategoryNav({
  activeCategory,
  onSelectCategory,
}: CategoryNavProps) {
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      setIsSticky(offset > 340);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleClick = (id: string) => {
    onSelectCategory(id);
    if (id === 'all') {
      const el = document.getElementById('menu-content');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      const el = document.getElementById(id);
      if (el) {
        const yOffset = -110;
        const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }
  };

  return (
    <div
      className={`relative z-30 w-full transition-all duration-300 ${
        isSticky ? 'sticky top-0 shadow-lg' : ''
      }`}
    >
      {/* Top Wavy Edge */}
      <WavyDivider fill="var(--yellow)" position="top" variant="yellow-ribbon" />

      {/* Yellow Ribbon Container */}
      <div className="bg-[var(--yellow)] py-2 sm:py-3.5 px-3 sm:px-6 relative overflow-hidden -my-px">
        {/* Playful Doodles on the yellow strip */}
        <div className="hidden sm:block absolute left-8 top-1/2 -translate-y-1/2 pointer-events-none">
          <DoodleStar className="w-4 h-4 text-[var(--red)] opacity-75" />
        </div>
        <div className="hidden md:block absolute right-12 top-1/2 -translate-y-1/2 pointer-events-none">
          <DoodleSparks className="w-5 h-5 text-[var(--red)] opacity-75" />
        </div>

        {/* Category Buttons List */}
        <div className="max-w-6xl mx-auto">
          <nav
            aria-label="Menu Categories"
            className="flex items-center justify-start sm:justify-center gap-2 sm:gap-3.5 overflow-x-auto no-scrollbar scroll-smooth py-1 px-1"
          >
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleClick(cat.id)}
                  type="button"
                  className={`flex-shrink-0 px-4 sm:px-6 py-1.5 sm:py-2 rounded-full font-['Bebas_Neue'] text-base sm:text-lg md:text-xl tracking-wider transition-all duration-200 select-none border-2 border-[var(--ink)] cursor-pointer ${
                    isActive
                      ? 'bg-[var(--red)] text-white shadow-[2px_2px_0px_#1A0B0B] scale-105'
                      : 'bg-[#FFF9EE] text-[var(--ink)] hover:bg-white hover:scale-102 shadow-[2px_2px_0px_#1A0B0B]'
                  }`}
                  aria-pressed={isActive}
                >
                  {cat.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Bottom Wavy Edge */}
      <WavyDivider fill="var(--yellow)" position="bottom" variant="yellow-ribbon" />
    </div>
  );
}
