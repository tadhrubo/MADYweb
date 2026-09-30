import React from 'react';

export interface StickerPeelProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

/**
 * StickerPeel wrapper component
 * Applies a CSS-only folded corner peel sticker effect to any wrapped <img>.
 * Lower-right corner lifts and curls showing white sticky back and casting shadows.
 * On hover, the peel deepens.
 */
export function StickerPeel({ children, className = '', ...props }: StickerPeelProps) {
  return (
    <div className={`sticker-peel ${className}`.trim()} {...props}>
      {children}
    </div>
  );
}

export default StickerPeel;
