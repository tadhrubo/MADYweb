import { useCallback, useState } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Preloader } from './components/Preloader';
import { Seam } from './components/Seam';
import { FoodFeel } from './components/FoodFeel';
import { Section } from './components/Section';
import { PureQuality } from './components/PureQuality';

export default function App() {
  const [ready, setReady] = useState(false);
  const done = useCallback(() => {
    setReady(true);
    console.log('[mady] hero ready');
  }, []);

  return (
    <div className="page-wrapper">
      <Preloader done={done} />
      <Header ready={ready} />
      <Hero ready={ready} />
      <Seam />
      <FoodFeel />
      <PureQuality />
      <Section bg="var(--yellow)" order={4} className="placeholder-section">
        <h2>Section 4 placeholder</h2>
      </Section>
    </div>
  );
}
