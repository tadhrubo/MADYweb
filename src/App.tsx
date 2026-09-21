import { useCallback, useState } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Preloader } from './components/Preloader';
import { Seam } from './components/Seam';
import { FoodFeel } from './components/FoodFeel';
import { PureQuality } from './components/PureQuality';
import { StoryBite } from './components/StoryBite';
import { FoodNinjaFooter } from './components/FoodNinjaFooter';

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
      <StoryBite />
      <FoodNinjaFooter />
    </div>
  );
}

