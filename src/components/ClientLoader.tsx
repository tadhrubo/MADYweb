'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

export interface ClientLoaderProps {
  children?: React.ReactNode;
  onComplete?: () => void;
}

/**
 * Global <ClientLoader> component for Next.js / React layouts.
 * Checks sessionStorage for 'hasVisited'; if true, bypasses the loader entirely.
 * If false, triggers a sequential 4-stage animation (< 1.8s total):
 * 1. Full-screen cream background with red Mady logo.
 * 2. Animated SVG line drawing underneath it, followed by 'PREPARING THE KITCHEN...'.
 * 3. Slide in shawarma cutout image with CSS-animated SVG flame doodle, text becomes 'HOT. FRESH. READY.'.
 * 4. Scale Mady logo up until it clips viewport, then translate completely upward to reveal homepage.
 * Sets 'hasVisited' to true upon completion.
 */
export function ClientLoader({ children, onComplete }: ClientLoaderProps) {
  // Check sessionStorage for 'hasVisited' key
  const [hasVisited, setHasVisited] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        return sessionStorage.getItem('hasVisited') === 'true';
      } catch {
        return false;
      }
    }
    return false;
  });

  const [stage, setStage] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    try {
      const visited = sessionStorage.getItem('hasVisited');
      if (visited === 'true') {
        setHasVisited(true);
        onComplete?.();
        return;
      }
    } catch {
      // In case sessionStorage access is restricted
    }

    setHasVisited(false);

    const mountTime = typeof performance !== 'undefined' ? performance.now() : Date.now();

    // Stage 1: Full-screen cream background with red Mady logo (0ms - 280ms)
    // Stage 2: SVG line drawing + 'PREPARING THE KITCHEN...' (280ms - 620ms)
    const tStage2 = setTimeout(() => {
      setStage(2);
    }, 280);

    // Stage 3: 'GRILLING SHAWARMA...' + Shawarma cutout enters (620ms - 980ms)
    const tStage3 = setTimeout(() => {
      setStage(3);
    }, 620);

    // Stage 4: CSS-animated flame doodle + 'HOT. FRESH. READY.' (980ms - 1320ms)
    const tStage4 = setTimeout(() => {
      setStage(4);
    }, 980);

    // Stage 5: Scale Mady logo up to clip viewport, then translate upward (1320ms - 1620ms)
    const tStage5 = setTimeout(() => {
      setStage(5);
      onComplete?.();
    }, 1320);

    // Sequence completion: Strictly under 1.8 seconds (1620ms total)
    const tComplete = setTimeout(() => {
      try {
        sessionStorage.setItem('hasVisited', 'true');
      } catch {
        // ignore
      }
      const elapsed = typeof performance !== 'undefined' ? Math.round(performance.now() - mountTime) : 1620;
      console.log(`[ClientLoader] Sequence completed in ${elapsed}ms`);
      setIsDismissed(true);
      setHasVisited(true);
      onComplete?.();
    }, 1620);

    return () => {
      clearTimeout(tStage2);
      clearTimeout(tStage3);
      clearTimeout(tStage4);
      clearTimeout(tStage5);
      clearTimeout(tComplete);
    };
  }, [onComplete]);

  // If already visited, bypass loader entirely and return children or null
  if (hasVisited || isDismissed) {
    return children ? <>{children}</> : null;
  }

  return (
    <>
      {/* When wrapping the layout, render children underneath the curtain */}
      {children}

      {/* Global ClientLoader Overlay Curtain */}
      <motion.div
        role="status"
        aria-live="polite"
        className="client-loader-overlay fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#F6E3C8] overflow-hidden select-none pointer-events-auto"
        initial={{ y: 0 }}
        animate={stage === 5 ? { y: '-108%' } : { y: 0 }}
        transition={{
          duration: 0.34,
          delay: 0.12, // Brief delay so logo scales up to clip viewport first
          ease: [0.76, 0, 0.24, 1],
        }}
      >
        <style>{`
          @keyframes flameDoodleFlicker {
            0%, 100% {
              transform: scale(1) rotate(0deg);
              filter: drop-shadow(0 4px 10px rgba(228, 27, 35, 0.5));
            }
            25% {
              transform: scale(1.1, 0.93) rotate(-3deg);
              filter: drop-shadow(0 6px 14px rgba(255, 184, 28, 0.8));
            }
            50% {
              transform: scale(0.95, 1.08) rotate(3deg);
              filter: drop-shadow(0 4px 10px rgba(228, 27, 35, 0.65));
            }
            75% {
              transform: scale(1.06, 0.96) rotate(-2deg);
              filter: drop-shadow(0 7px 16px rgba(255, 184, 28, 0.9));
            }
          }
          .client-loader-flame-svg {
            transform-origin: bottom center;
            animation: flameDoodleFlicker 0.36s ease-in-out infinite alternate;
          }
        `}</style>

        <div className="relative flex flex-col items-center justify-center w-full max-w-md px-6 py-6 text-center">
          {/* 1. Red Mady Logo - Scales up to clip viewport in Stage 5 */}
          <motion.div
            layout
            className="client-loader-logo-wrapper relative z-20 flex items-center justify-center"
            initial={{ scale: 0.88, opacity: 0 }}
            animate={
              stage === 5
                ? {
                    scale: 26,
                    opacity: 1,
                    transition: { duration: 0.42, ease: [0.65, 0, 0.25, 1] },
                  }
                : {
                    scale: 1,
                    opacity: 1,
                    transition: { duration: 0.25, ease: 'easeOut' },
                  }
            }
          >
            <Image
              src="/assets/madySolo.png"
              alt="Mady"
              width={260}
              height={126}
              priority={true}
              className="w-52 sm:w-64 md:w-72 h-auto object-contain block drop-shadow-[0_4px_14px_rgba(155,27,32,0.22)]"
            />
          </motion.div>

          {/* 2. Animated SVG Line Drawing Underneath Logo */}
          <motion.div
            layout
            className="relative z-10 -mt-1 mb-2 flex items-center justify-center overflow-visible"
            initial={{ opacity: 0 }}
            animate={
              stage >= 2 && stage < 5
                ? { opacity: 1 }
                : stage === 5
                ? { opacity: 0, transition: { duration: 0.1 } }
                : { opacity: 0 }
            }
          >
            <svg
              viewBox="0 0 260 22"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-48 sm:w-60 md:w-68 h-5 sm:h-6 text-[#E41B23] overflow-visible"
            >
              <motion.path
                d="M 6 12 C 45 4, 110 3, 254 13 C 180 18, 90 19, 20 16"
                stroke="#E41B23"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={stage >= 2 ? { pathLength: 1 } : { pathLength: 0 }}
                transition={{ duration: 0.28, ease: 'easeOut' }}
              />
            </svg>
          </motion.div>

          {/* 3. Shawarma Cutout Image with CSS-animated Flame Doodle */}
          <AnimatePresence>
            {(stage === 3 || stage === 4) && (
              <motion.div
                key="shawarma-cutout-flame"
                layout
                initial={{ y: 25, opacity: 0, scale: 0.75, rotate: -8 }}
                animate={{ y: 0, opacity: 1, scale: 1, rotate: -3 }}
                exit={{ opacity: 0, scale: 0.65, transition: { duration: 0.12 } }}
                transition={{ type: 'spring', damping: 14, stiffness: 240 }}
                className="flex flex-col items-center justify-center my-1"
              >
                <Image
                  src="/assets/shawarma-hero.png"
                  alt="Shawarma"
                  width={274}
                  height={458}
                  priority={true}
                  className="w-24 sm:w-28 md:w-32 h-auto max-h-[110px] object-contain drop-shadow-[0_8px_16px_rgba(155,27,32,0.35)]"
                />
                {/* CSS-Animated SVG Flame Doodle in Stage 4 */}
                <div className={`-mt-3 z-10 transition-opacity duration-200 ${stage === 4 ? 'opacity-100' : 'opacity-0'}`}>
                  <svg
                    viewBox="0 0 54 62"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="client-loader-flame-svg w-10 h-12 sm:w-12 sm:h-14 overflow-visible"
                  >
                    {/* Outer Flame (Yellow #FFB81C with Red Stroke) */}
                    <path
                      d="M27 2C27 2 34 16 39 23C46 31 50 39 48 48C45 58 35 62 27 62C19 62 9 58 6 48C4 39 8 31 15 23C20 16 27 2 27 2Z"
                      fill="#FFB81C"
                      stroke="#E41B23"
                      strokeWidth="2.5"
                      strokeLinejoin="round"
                    />
                    {/* Mid Flame Tongue (Red #E41B23) */}
                    <path
                      d="M27 20C27 20 32 29 35 34C39 40 38 46 35 50C33 54 30 55 27 55C24 55 21 54 19 50C16 46 15 40 19 34C22 29 27 20 27 20Z"
                      fill="#E41B23"
                    />
                    {/* Core Flame Highlight (Cream/Yellow #FFF9D2) */}
                    <path
                      d="M27 34C27 34 29 39 31 42C33 45 32 48 30 50C29 51 28 51 27 51C26 51 25 51 24 50C22 48 21 45 23 42C25 39 27 34 27 34Z"
                      fill="#FFF9D2"
                    />
                  </svg>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Sequential Status Text: 'PREPARING THE KITCHEN...' -> 'GRILLING SHAWARMA...' -> 'HOT. FRESH. READY.' */}
          <motion.div layout className="relative flex items-center justify-center mt-2 min-h-[38px]">
            <AnimatePresence mode="wait">
              {stage === 2 && (
                <motion.p
                  key="stage-2-text"
                  initial={{ y: 6, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -6, opacity: 0 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  style={{
                    fontFamily: "'Bebas Neue', Anton, sans-serif",
                    color: '#E41B23',
                    letterSpacing: '0.14em',
                  }}
                  className="text-2xl sm:text-3xl tracking-[0.14em] m-0 text-center uppercase select-none font-bold"
                >
                  PREPARING THE KITCHEN...
                </motion.p>
              )}
              {stage === 3 && (
                <motion.p
                  key="stage-3-text"
                  initial={{ y: 6, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -6, opacity: 0 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  style={{
                    fontFamily: "'Bebas Neue', Anton, sans-serif",
                    color: '#E41B23',
                    letterSpacing: '0.14em',
                  }}
                  className="text-2xl sm:text-3xl tracking-[0.14em] m-0 text-center uppercase select-none font-bold"
                >
                  GRILLING SHAWARMA...
                </motion.p>
              )}
              {stage === 4 && (
                <motion.p
                  key="stage-4-text"
                  initial={{ scale: 0.88, opacity: 0, y: 6 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ opacity: 0, transition: { duration: 0.1 } }}
                  transition={{ type: 'spring', damping: 13, stiffness: 260 }}
                  style={{
                    fontFamily: "Anton, 'Bebas Neue', sans-serif",
                    color: '#E41B23',
                    letterSpacing: '0.06em',
                  }}
                  className="text-3xl sm:text-4xl tracking-[0.06em] m-0 text-center uppercase select-none drop-shadow-[0_2px_0_#fff]"
                >
                  HOT. FRESH. READY.
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </motion.div>
    </>
  );
}

export default ClientLoader;
