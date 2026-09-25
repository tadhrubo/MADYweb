import { useCallback, useEffect, useState } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Preloader } from './components/Preloader';
import { Seam } from './components/Seam';
import { FoodFeel } from './components/FoodFeel';
import { PureQuality } from './components/PureQuality';
import { StoryBite } from './components/StoryBite';
import { FindUs } from './components/FindUs';
import { FoodNinjaFooter } from './components/FoodNinjaFooter';
import { MenuPage } from './components/menu/MenuPage';

function checkIsMenuRoute(): boolean {
  if (typeof window === 'undefined') return false;
  const path = window.location.pathname.toLowerCase();
  const hash = window.location.hash.toLowerCase();
  return (
    path === '/menu' ||
    path.startsWith('/menu/') ||
    hash === '#/menu' ||
    hash.startsWith('#/menu') ||
    hash === '#menu'
  );
}

export default function App() {
  const [isMenu, setIsMenu] = useState(checkIsMenuRoute);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const handleLocationChange = () => {
      setIsMenu(checkIsMenuRoute());
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  const done = useCallback(() => {
    setReady(true);
    console.log('[mady] hero ready');
  }, []);

  return (
    <div className="page-wrapper">
      {isMenu ? (
        <MenuPage />
      ) : (
        <>
          <Preloader done={done} />
          <Header ready={ready} />
          <Hero ready={ready} />
          <Seam />
          <FoodFeel />
          <PureQuality />
          <StoryBite />
          <FindUs />
        </>
      )}
      {/* Global Root Food Ninja Footer across all routes */}
      <FoodNinjaFooter />
    </div>
  );
}
