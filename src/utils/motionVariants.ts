import type { Variants } from 'framer-motion';

/**
 * Mady Brand Motion Design System
 *
 * Strict dictionary of reusable Framer Motion animation variants tailored
 * for Mady's street-food brand aesthetics:
 *
 * 1. popSticker: Initial scale 0.8, target scale 1, with a slight spring rotation (e.g. +/- 5 degrees).
 * 2. slideFood: Initial translateX/Y offset with opacity 0, target translate 0 with opacity 1, gentle ease-out curve.
 * 3. drawDoodle: Target the pathLength property from 0 to 1 for rendering red SVG underlines and rays.
 * 4. textUpward: A staggered translateY reveal for typography headers with overflow-hidden on the parent.
 */

export interface PopStickerCustom {
  rotate?: number;
  delay?: number;
  duration?: number;
}

export interface SlideFoodCustom {
  x?: number;
  y?: number;
  delay?: number;
  duration?: number;
}

export interface DrawDoodleCustom {
  delay?: number;
  duration?: number;
}

export interface TextUpwardCustom {
  y?: string | number;
  delay?: number;
  duration?: number;
}

/**
 * popSticker:
 * Initial scale 0.8, target scale 1, with a slight spring rotation (e.g. +/- 5 degrees).
 * Ideal for ingredient stickers, sticker badges, and CTA callouts.
 *
 * @example
 * <motion.div variants={popSticker} initial="hidden" whileInView="visible" />
 * <motion.div variants={popSticker} custom={{ rotate: 8 }} initial="hidden" animate="visible" />
 */
export const popSticker: Variants = {
  hidden: (custom?: PopStickerCustom) => ({
    scale: 0.8,
    opacity: 0,
    rotate: (custom?.rotate ?? 0) - 5,
  }),
  visible: (custom?: PopStickerCustom) => ({
    scale: 1,
    opacity: 1,
    rotate: custom?.rotate ?? 0,
    transition: {
      type: 'spring',
      damping: 14,
      stiffness: 240,
      bounce: 0.35,
      delay: custom?.delay ?? 0,
      duration: custom?.duration,
    },
  }),
  initial: (custom?: PopStickerCustom) => ({
    scale: 0.8,
    opacity: 0,
    rotate: (custom?.rotate ?? 0) - 5,
  }),
  animate: (custom?: PopStickerCustom) => ({
    scale: 1,
    opacity: 1,
    rotate: custom?.rotate ?? 0,
    transition: {
      type: 'spring',
      damping: 14,
      stiffness: 240,
      bounce: 0.35,
      delay: custom?.delay ?? 0,
      duration: custom?.duration,
    },
  }),
  hover: {
    scale: 1.06,
    rotate: 2,
    transition: { type: 'spring', stiffness: 350, damping: 12 },
  },
  tap: {
    scale: 0.94,
    rotate: -2,
  },
};

/**
 * slideFood:
 * Initial translateX/Y offset with opacity 0, target translate 0 with opacity 1,
 * using a gentle ease-out curve.
 * Ideal for shawarma wraps, food cutouts, cards, and floating menu items.
 *
 * @example
 * <motion.div variants={slideFood} initial="hidden" whileInView="visible" />
 * <motion.div variants={slideFood} custom={{ y: 70, delay: 0.1 }} initial="hidden" animate="visible" />
 */
export const slideFood: Variants = {
  hidden: (custom?: SlideFoodCustom) => ({
    x: custom?.x ?? 0,
    y: custom?.y ?? 50,
    opacity: 0,
  }),
  visible: (custom?: SlideFoodCustom) => ({
    x: 0,
    y: 0,
    opacity: 1,
    transition: {
      duration: custom?.duration ?? 0.65,
      ease: [0.22, 1, 0.36, 1], // gentle, high-end ease-out curve
      delay: custom?.delay ?? 0,
    },
  }),
  initial: (custom?: SlideFoodCustom) => ({
    x: custom?.x ?? 0,
    y: custom?.y ?? 50,
    opacity: 0,
  }),
  animate: (custom?: SlideFoodCustom) => ({
    x: 0,
    y: 0,
    opacity: 1,
    transition: {
      duration: custom?.duration ?? 0.65,
      ease: [0.22, 1, 0.36, 1],
      delay: custom?.delay ?? 0,
    },
  }),
};

/**
 * drawDoodle:
 * Targets the pathLength property from 0 to 1 for rendering red SVG underlines,
 * squiggles, spark rays, and hand-drawn doodles.
 *
 * @example
 * <motion.path d="M 0 10 Q 50 0, 100 10" variants={drawDoodle} initial="hidden" animate="visible" />
 */
export const drawDoodle: Variants = {
  hidden: () => ({
    pathLength: 0,
    opacity: 0,
  }),
  visible: (custom?: DrawDoodleCustom) => ({
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: {
        duration: custom?.duration ?? 0.55,
        ease: 'easeOut',
        delay: custom?.delay ?? 0,
      },
      opacity: {
        duration: 0.15,
        delay: custom?.delay ?? 0,
      },
    },
  }),
  initial: () => ({
    pathLength: 0,
    opacity: 0,
  }),
  animate: (custom?: DrawDoodleCustom) => ({
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: {
        duration: custom?.duration ?? 0.55,
        ease: 'easeOut',
        delay: custom?.delay ?? 0,
      },
      opacity: {
        duration: 0.15,
        delay: custom?.delay ?? 0,
      },
    },
  }),
};

/**
 * textUpwardContainer:
 * Parent container variant that coordinates staggered reveals of child text lines.
 * Pair with overflow-hidden on the parent wrapper element.
 *
 * @example
 * <motion.div variants={textUpwardContainer} initial="hidden" whileInView="visible" className="overflow-hidden">
 *   <motion.h2 variants={textUpward}>DONE DANGEROUSLY</motion.h2>
 *   <motion.h2 variants={textUpward}>RIGHT</motion.h2>
 * </motion.div>
 */
export const textUpwardContainer: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: (custom?: { stagger?: number; delay?: number }) => ({
    opacity: 1,
    transition: {
      staggerChildren: custom?.stagger ?? 0.08,
      delayChildren: custom?.delay ?? 0.05,
    },
  }),
  initial: {
    opacity: 0,
  },
  animate: (custom?: { stagger?: number; delay?: number }) => ({
    opacity: 1,
    transition: {
      staggerChildren: custom?.stagger ?? 0.08,
      delayChildren: custom?.delay ?? 0.05,
    },
  }),
};

/**
 * textUpward:
 * A staggered translateY reveal for typography headers with overflow-hidden on the parent.
 * Translates text lines upward from beneath the mask into view with snappy typographic easing.
 *
 * @example
 * <div className="overflow-hidden">
 *   <motion.h2 variants={textUpward} initial="hidden" whileInView="visible">
 *     A STORY IN EVERY BITE.
 *   </motion.h2>
 * </div>
 */
export const textUpward: Variants = {
  hidden: (custom?: TextUpwardCustom) => ({
    y: custom?.y ?? '115%',
    opacity: 0,
  }),
  visible: (custom?: TextUpwardCustom) => ({
    y: '0%',
    opacity: 1,
    transition: {
      duration: custom?.duration ?? 0.65,
      ease: [0.16, 1, 0.3, 1], // snappy typographic ease-out
      delay: custom?.delay ?? 0,
    },
  }),
  initial: (custom?: TextUpwardCustom) => ({
    y: custom?.y ?? '115%',
    opacity: 0,
  }),
  animate: (custom?: TextUpwardCustom) => ({
    y: '0%',
    opacity: 1,
    transition: {
      duration: custom?.duration ?? 0.65,
      ease: [0.16, 1, 0.3, 1],
      delay: custom?.delay ?? 0,
    },
  }),
};

/**
 * Strict dictionary of reusable animation variants for the Mady brand.
 */
export const motionVariants = {
  popSticker,
  slideFood,
  drawDoodle,
  textUpward,
  textUpwardContainer,
} as const;

export default motionVariants;
