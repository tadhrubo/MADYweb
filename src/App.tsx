import { useCallback, useEffect, useState } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ClientLoader } from './components/ClientLoader';
import { Seam } from './components/Seam';
import { FoodFeel } from './components/FoodFeel';
import { PureQuality } from './components/PureQuality';
import { StoryBite } from './components/StoryBite';
import { FindUs } from './components/FindUs';
import { FoodNinjaFooter } from './components/FoodNinjaFooter';
import { MenuPage } from './components/menu/MenuPage';
import { PageTransitionProvider } from './components/transitions/PageTransitionContext';
import { PageTransitionOverlay } from './components/transitions/PageTransitionOverlay';

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
  const [ready, setReady] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        return (
          sessionStorage.getItem('hasVisited') === 'true' ||
          sessionStorage.getItem('mady-loaded') === '1'
        );
      } catch {
        return false;
      }
    }
    return false;
  });

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

  // Smooth scroll to target hash section once home page mounts
  useEffect(() => {
    if (isMenu) return;

    const scrollToHashTarget = (behavior: ScrollBehavior = 'smooth') => {
      const hash = window.location.hash || sessionStorage.getItem('mady-pending-scroll');
      if (!hash) return false;
      const el = document.querySelector(hash);
      if (el) {
        const headerOffset = window.innerWidth < 768 ? 70 : 80;
        const targetTop = el.getBoundingClientRect().top + window.scrollY - headerOffset;
        window.scrollTo({
          top: Math.max(0, targetTop),
          behavior,
        });
        return true;
      }
      return false;
    };

    if (window.location.hash || sessionStorage.getItem('mady-pending-scroll')) {
      // 1. Instant jump on first frame
      scrollToHashTarget('auto');

      // 2. Continuous alignment passes as fonts, layout, and images mount
      const interval = setInterval(() => {
        scrollToHashTarget('smooth');
      }, 100);

      // Stop tracking after 1.8 seconds once layout is completely settled
      const stopTimer = setTimeout(() => {
        clearInterval(interval);
        sessionStorage.removeItem('mady-pending-scroll');
        scrollToHashTarget('smooth');
      }, 1800);

      return () => {
        clearInterval(interval);
        clearTimeout(stopTimer);
      };
    }
  }, [isMenu, ready]);

  return (
    <PageTransitionProvider>
      <ClientLoader onComplete={done}>
        <PageTransitionOverlay />
        <div className="page-wrapper">
          {isMenu ? (
            <MenuPage />
          ) : (
            <>
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
      </ClientLoader>
    </PageTransitionProvider>
  );
}
