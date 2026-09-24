import { useEffect, useState } from 'react';
import { Header } from '../Header';
import { MenuHero } from './MenuHero';
import { CategoryNav } from './CategoryNav';
import { MenuSections } from './MenuSections';
import { MenuCta } from './MenuCta';
import { MenuFooter } from './MenuFooter';

export function MenuPage() {
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    // Set descriptive page title & meta for SEO
    document.title = 'MADY | The Menu — Everything We Make, Served Mady.';

    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        'content',
        'Explore the official MADY menu. Gravy, Rice Platters, Snacks, Kabab & Grills, and Add-ons. Freshly prepared, slow-grilled, authentic street food done dangerously right.'
      );
    }

    // Scroll to top on mount
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  return (
    <div className="page-wrapper min-h-screen bg-[var(--bg)] text-[var(--ink)] overflow-x-hidden selection:bg-[var(--yellow)] selection:text-[var(--ink)]">
      {/* Existing Header with isMenuPage active indicator */}
      <Header ready={true} isMenuPage={true} />

      {/* Main Content Area */}
      <main id="top">
        {/* Editorial Menu Hero */}
        <MenuHero />

        {/* Wavy Yellow Category Navigation Ribbon */}
        <CategoryNav
          activeCategory={activeCategory}
          onSelectCategory={(id) => setActiveCategory(id)}
        />

        {/* Two-Column Editorial Menu Sections */}
        <MenuSections filterCategory={activeCategory} />

        {/* Vibrant Red Shawarma Finale CTA */}
        <MenuCta />
      </main>

      {/* MADY Footer */}
      <MenuFooter />
    </div>
  );
}
