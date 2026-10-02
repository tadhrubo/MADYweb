// Next.js Server Component (NO "use client"; at the top)
// Interactive components (Header, Hero, FoodFeel, PureQuality, StoryBite, FindUs)
// are isolated child client components marked with 'use client';

import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { Seam } from '@/components/Seam';
import { FoodFeel } from '@/components/FoodFeel';
import { PureQuality } from '@/components/PureQuality';
import { StoryBite } from '@/components/StoryBite';
import { FindUs } from '@/components/FindUs';

export default function HomePage() {
  return (
    <main className="page-wrapper">
      <Header />
      <Hero ready={true} />
      <Seam />
      <FoodFeel />
      <PureQuality />
      <StoryBite />
      <FindUs />
    </main>
  );
}
