import React from 'react';

interface WavyDividerProps {
  fill: string;
  position: 'top' | 'bottom';
  variant?: 'yellow-ribbon' | 'red-cta' | 'footer';
  className?: string;
}

export function WavyDivider({
  fill,
  position,
  variant = 'yellow-ribbon',
  className = '',
}: WavyDividerProps) {
  // Smooth, organic bezier wave curves matching the visual reference
  const getPath = () => {
    if (variant === 'yellow-ribbon') {
      if (position === 'top') {
        // Curve entering the yellow ribbon from cream background
        return "M 0,38 C 220,12 440,55 720,24 C 980,-2 1200,44 1440,22 L 1440,60 L 0,60 Z";
      } else {
        // Curve exiting the yellow ribbon back to cream background
        return "M 0,0 L 1440,0 L 1440,22 C 1220,48 980,10 720,38 C 440,64 220,16 0,38 Z";
      }
    } else if (variant === 'red-cta') {
      if (position === 'top') {
        // Dynamic sweeping wave entering the red CTA section
        return "M 0,42 C 260,8 520,60 800,26 C 1060,-4 1260,48 1440,24 L 1440,70 L 0,70 Z";
      } else {
        // Dynamic sweeping wave exiting the red CTA section
        return "M 0,0 L 1440,0 L 1440,26 C 1240,58 1020,14 760,44 C 480,72 240,18 0,38 Z";
      }
    } else {
      // Gentle footer bottom wave
      return "M 0,30 C 280,10 600,48 920,20 C 1140,4 1320,28 1440,16 L 1440,45 L 0,45 Z";
    }
  };

  const viewBox = variant === 'red-cta' ? "0 0 1440 70" : variant === 'footer' ? "0 0 1440 45" : "0 0 1440 60";
  const heightClass = variant === 'footer' ? "h-6 sm:h-9 md:h-12" : "h-9 sm:h-14 md:h-18 lg:h-20";

  return (
    <div
      className={`w-full overflow-hidden leading-none pointer-events-none select-none ${
        position === 'top' ? '-mb-px' : '-mt-px'
      } ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox={viewBox}
        preserveAspectRatio="none"
        className={`w-full ${heightClass} block`}
        style={{ fill }}
      >
        <path d={getPath()} />
      </svg>
    </div>
  );
}
