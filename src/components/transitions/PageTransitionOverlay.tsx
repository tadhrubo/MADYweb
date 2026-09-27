'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePageTransition, TransitionType } from './PageTransitionContext';

/**
 * Full-screen fixed transition overlay for MADY.
 * Plays a high-energy 600-900ms editorial transition:
 * - Warm MADY cream layer sweeps across viewport
 * - Red MADY logo appears & settles
 * - Hand-drawn SVG red underline draws in
 * - Shawarma food cutout glides through with a 4deg tilt
 * - Curtain wipes upward to reveal the new page entering underneath.
 */
export function PageTransitionOverlay() {
  const { isTransitioning, transitionType } = usePageTransition();
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const media = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReduced(media.matches);
      const listener = () => setPrefersReduced(media.matches);
      media.addEventListener('change', listener);
      return () => media.removeEventListener('change', listener);
    }
  }, []);

  if (!isTransitioning) return null;

  const isRed = transitionType === 'red';
  const isWipe = transitionType === 'wipe';

  // Reduced motion: simple, fast opacity fade
  if (prefersReduced) {
    return (
      <motion.div
        aria-hidden="true"
        className={`fixed inset-0 z-[9990] flex items-center justify-center ${
          isRed ? 'bg-[#E41B23]' : 'bg-[#F6E3C8]'
        }`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
      >
        <img
          src="/assets/madySolo.png"
          alt="Mady"
          className={`w-48 h-auto object-contain ${isRed ? 'brightness-0 invert' : ''}`}
        />
      </motion.div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        aria-hidden="true"
        className={`fixed inset-0 z-[9990] flex flex-col items-center justify-center overflow-hidden pointer-events-auto select-none ${
          isRed ? 'bg-[#E41B23]' : 'bg-[#F6E3C8]'
        }`}
        initial={
          isWipe
            ? { x: '100%' }
            : { y: '100%' }
        }
        animate={{
          x: 0,
          y: 0,
          transition: {
            duration: 0.28,
            ease: [0.22, 1, 0.36, 1],
          },
        }}
        exit={
          isWipe
            ? {
                x: '-100%',
                transition: { duration: 0.32, ease: [0.76, 0, 0.24, 1] },
              }
            : {
                y: '-105%',
                transition: { duration: 0.32, ease: [0.76, 0, 0.24, 1] },
              }
        }
      >
        {/* Subtle dynamic background poster rays */}
        <div className="absolute inset-0 pointer-events-none opacity-5 flex items-center justify-center overflow-hidden">
          <div className="w-[1200px] h-[1200px] rounded-full border-[80px] border-dashed border-[#1A0B0B] animate-[spin_60s_linear_infinite]" />
        </div>

        {/* Central Logo & Underline Composition */}
        <div className="relative z-20 flex flex-col items-center justify-center px-4">
          {/* 1. Brand MADY Logo */}
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{
              duration: 0.28,
              delay: 0.08,
              type: 'spring',
              stiffness: 260,
              damping: 18,
            }}
            className="flex items-center justify-center"
          >
            <img
              src="/assets/madySolo.png"
              alt="Mady"
              width="240"
              height="116"
              className={`w-44 sm:w-56 md:w-64 h-auto object-contain block drop-shadow-[0_6px_16px_rgba(155,27,32,0.2)] ${
                isRed ? 'brightness-0 invert' : ''
              }`}
            />
          </motion.div>

          {/* 2. Hand-drawn SVG Red Underline (Animates from 0 to full width) */}
          <motion.div
            className="relative z-10 -mt-1 flex items-center justify-center overflow-visible"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.18, duration: 0.15 }}
          >
            <svg
              viewBox="0 0 240 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className={`w-40 sm:w-52 md:w-60 h-4 sm:h-5 overflow-visible ${
                isRed ? 'text-white' : 'text-[#E41B23]'
              }`}
            >
              <motion.path
                d="M 6 12 C 45 4, 110 3, 234 13 C 160 18, 80 18, 18 15"
                stroke="currentColor"
                strokeWidth="4.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.28, delay: 0.2, ease: 'easeOut' }}
              />
            </svg>
          </motion.div>

          {/* 3. Tiny energetic sub-label */}
          <motion.span
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.26, duration: 0.18 }}
            className={`font-['Bebas_Neue'] text-sm sm:text-base tracking-[0.22em] mt-2 uppercase ${
              isRed ? 'text-white/90' : 'text-[#E41B23]'
            }`}
          >
            MADLY GOOD STREET FOOD
          </motion.span>
        </div>

        {/* 4. Gliding Food Cutout Element (Shawarma moves through with 4° tilt) */}
        {!isRed && (
          <motion.div
            initial={{ x: -160, y: 40, opacity: 0, rotate: 6 }}
            animate={{
              x: [ -160, 0, 160 ],
              y: [ 40, -10, -40 ],
              opacity: [ 0, 1, 0 ],
              rotate: [ 6, 3, 0 ],
            }}
            transition={{
              duration: 0.55,
              delay: 0.18,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="absolute z-10 pointer-events-none"
          >
            <img
              src="/assets/shawarma-hero.png"
              alt="Mady Shawarma"
              className="w-20 sm:w-28 md:w-32 h-auto object-contain filter drop-shadow-[0_12px_24px_rgba(155,27,32,0.35)]"
            />
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

export default PageTransitionOverlay;
