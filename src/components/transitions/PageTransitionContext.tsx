'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

export type TransitionType = 'cream' | 'red' | 'wipe';

export interface PageTransitionContextType {
  isTransitioning: boolean;
  transitionType: TransitionType;
  currentRoute: string;
  navigate: (
    to: string,
    options?: { transitionType?: TransitionType; hash?: string; external?: boolean }
  ) => void;
}

const PageTransitionContext = createContext<PageTransitionContextType | null>(null);

function getInitialPath(): string {
  if (typeof window === 'undefined') return '/';
  const path = window.location.pathname.toLowerCase();
  const hash = window.location.hash.toLowerCase();
  if (path === '/menu' || path.startsWith('/menu/') || hash === '#/menu' || hash.startsWith('#/menu')) {
    return '/menu';
  }
  return path || '/';
}

export function PageTransitionProvider({ children }: { children: React.ReactNode }) {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionType, setTransitionType] = useState<TransitionType>('cream');
  const [currentRoute, setCurrentRoute] = useState<string>(getInitialPath);

  const isTransitioningRef = useRef(false);
  const currentRouteRef = useRef(currentRoute);

  useEffect(() => {
    isTransitioningRef.current = isTransitioning;
  }, [isTransitioning]);

  useEffect(() => {
    currentRouteRef.current = currentRoute;
  }, [currentRoute]);

  const navigate = useCallback(
    (
      to: string,
      options?: { transitionType?: TransitionType; hash?: string; external?: boolean }
    ) => {
      // 1. External URLs (e.g. Foodpanda, Instagram, Facebook)
      if (to.startsWith('http://') || to.startsWith('https://')) {
        window.open(to, '_blank', 'noopener,noreferrer');
        return;
      }

      // 2. Hash scroll within same page
      const currentPath = window.location.pathname.toLowerCase();
      const isMenuPage = currentPath === '/menu' || currentPath.startsWith('/menu/');

      if (to.startsWith('#') || to.startsWith('/#')) {
        const hash = to.startsWith('/#') ? to.slice(1) : to;
        if (!isMenuPage) {
          // Already on home page: smooth scroll
          const el = document.querySelector(hash);
          if (el) {
            const headerOffset = window.innerWidth < 768 ? 70 : 80;
            const targetTop = el.getBoundingClientRect().top + window.scrollY - headerOffset;
            window.scrollTo({ top: Math.max(0, targetTop), behavior: 'smooth' });
            window.history.pushState(null, '', hash);
          }
          return;
        }
        // On menu page: set pending scroll and navigate to home with wipe transition
        sessionStorage.setItem('mady-pending-scroll', hash);
        to = '/';
      }

      // 3. Same route check (e.g. click Menu when already on /menu)
      const targetPath = to === '' ? '/' : to;
      if (currentPath === targetPath) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      // 4. Resolve transition type based on page transition rules:
      // HOME -> MENU: 'cream'
      // MENU -> HOME: 'wipe'
      // ORDER/CTA: 'red'
      let resolvedType: TransitionType = options?.transitionType || 'cream';
      if (!options?.transitionType) {
        if (isMenuPage && (targetPath === '/' || targetPath === '')) {
          resolvedType = 'wipe';
        } else if (targetPath === '/menu') {
          resolvedType = 'cream';
        }
      }

      setTransitionType(resolvedType);
      setIsTransitioning(true);

      const prefersReduced =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      const midpointMs = prefersReduced ? 120 : 380;
      const totalMs = prefersReduced ? 300 : 750;

      // At midpoint: screen is completely covered by transition layer. Switch route cleanly!
      setTimeout(() => {
        window.history.pushState({}, '', targetPath);
        setCurrentRoute(targetPath);
        window.dispatchEvent(new PopStateEvent('popstate'));
        window.scrollTo(0, 0);
      }, midpointMs);

      // At total duration: overlay unmounts / clears
      setTimeout(() => {
        setIsTransitioning(false);
      }, totalMs);
    },
    []
  );

  // Listen for browser Back & Forward button events (popstate)
  useEffect(() => {
    const handlePopState = () => {
      const newPath = window.location.pathname.toLowerCase() || '/';
      const prevPath = currentRouteRef.current;

      if (newPath !== prevPath) {
        currentRouteRef.current = newPath;
        setCurrentRoute(newPath);

        // If not already transitioning, run seamless transition
        if (!isTransitioningRef.current) {
          const type: TransitionType = newPath === '/' ? 'wipe' : 'cream';
          setTransitionType(type);
          setIsTransitioning(true);
          setTimeout(() => {
            setIsTransitioning(false);
          }, 650);
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return (
    <PageTransitionContext.Provider
      value={{
        isTransitioning,
        transitionType,
        currentRoute,
        navigate,
      }}
    >
      {children}
    </PageTransitionContext.Provider>
  );
}

export function usePageTransition() {
  const context = useContext(PageTransitionContext);
  if (!context) {
    throw new Error('usePageTransition must be used within a PageTransitionProvider');
  }
  return context;
}
