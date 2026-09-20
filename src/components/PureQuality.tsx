import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { Section } from './Section';
import { ingredients, Ingredient } from '../content/ingredients';
import { Magnet } from './Magnet';
import { Spark } from './Spark';

const HEADLINE_LINES = ['EVERY LAYER', 'PACKED WITH', 'SIGNATURE', 'FLAVOR'];

const DESKTOP_SPARKS = [
  { id: 'sp-chicken', style: { left: '5%', top: '8%' } },
  { id: 'sp-lettuce', style: { left: '3%', top: '56%' } },
  { id: 'sp-tomato', style: { left: '6%', top: '78%' } },
  { id: 'sp-packed-left', style: { left: '30%', top: '41%' } },
  { id: 'sp-packed-right', style: { left: '66%', top: '41%' } },
  { id: 'sp-flavor-left', style: { left: '32%', top: '65%' } },
  { id: 'sp-flavor-right', style: { left: '64%', top: '65%' } },
  { id: 'sp-onion', style: { left: '92%', top: '12%' } },
  { id: 'sp-garlic', style: { left: '92%', top: '38%' } },
  { id: 'sp-flatbread', style: { left: '92%', top: '76%' } },
];

const MOBILE_POSITIONS: Record<string, { left: number; top: number }> = {
  chicken: { left: 4, top: 4 },
  lettuce: { left: 27, top: 10 },
  'garlic-sauce': { left: 50, top: 2 },
  'red-onion': { left: 72, top: 8 },
  tomato: { left: 6, top: 52 },
  pickles: { left: 28, top: 56 },
  chili: { left: 51, top: 50 },
  flatbread: { left: 71, top: 54 },
};

function IngredientItem({
  item,
  index,
  sectionRef,
}: {
  item: Ingredient;
  index: number;
  sectionRef: React.RefObject<HTMLElement | null>;
}) {
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const parallaxY = useTransform(
    scrollYProgress,
    [0, 1],
    shouldReduceMotion ? [0, 0] : [-item.depth * 28, item.depth * 28]
  );

  const entranceX = item.side === 'left' ? -140 : 140;
  const initialRotate = item.rotate + (item.side === 'left' ? -25 : 25);
  const floatDistance = Math.min(12, Math.max(6, item.float * 1.5));
  const mob = MOBILE_POSITIONS[item.slot] ?? { left: item.left, top: item.top };

  return (
    // 1. Entrance / Parallax wrapper
    <motion.div
      className={`ingredient-sticker sticker-${item.slot}`}
      style={
        {
          '--desk-left': `${item.left}%`,
          '--desk-top': `${item.top}%`,
          '--desk-width': `${item.width}%`,
          '--desk-rotate': `${item.rotate}deg`,
          '--mob-left': `${mob.left}%`,
          '--mob-top': `${mob.top}%`,
          y: parallaxY,
        } as any
      }
      initial={
        shouldReduceMotion
          ? { opacity: 0 }
          : { x: entranceX, rotate: initialRotate, opacity: 0 }
      }
      whileInView={
        shouldReduceMotion
          ? { opacity: 1 }
          : { x: 0, rotate: item.rotate, opacity: 1 }
      }
      viewport={{ once: true, margin: '-40px' }}
      transition={{
        type: 'spring',
        duration: 0.9,
        bounce: 0.25,
        delay: index * 0.08,
      }}
    >
      {/* 2. Float wrapper */}
      <motion.div
        className="sticker-float-wrap"
        animate={
          shouldReduceMotion
            ? {}
            : { y: [-floatDistance, floatDistance, -floatDistance] }
        }
        transition={{
          duration: item.float,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        {/* 3. Magnet wrapper */}
        <Magnet padding={80} strength={4} maxOffset={16}>
          {/* 4. img element */}
          <img
            src={`/assets/ingredients/${item.slot}.webp`}
            alt={item.slot}
            width="900"
            height="900"
            className="sticker-img"
            decoding="async"
          />
        </Magnet>
      </motion.div>
    </motion.div>
  );
}

const headlineVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.09,
      delayChildren: 0.05,
    },
  },
};

const lineVariants = {
  hidden: { y: '110%', opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.7,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  },
};

export function PureQuality() {
  const sectionRef = useRef<HTMLElement>(null);
  const shouldReduceMotion = useReducedMotion();

  return (
    <Section bg="var(--bg)" order={3} className="pure-quality">
      <div ref={sectionRef as React.RefObject<HTMLDivElement>} className="quality-stage">
        {/* Eyebrow and Headline block centered in stage */}
        <div className="quality-headline-block">
          <motion.p
            className="quality-eyebrow"
            initial={shouldReduceMotion ? { opacity: 0 } : { scale: 0, opacity: 0 }}
            whileInView={shouldReduceMotion ? { opacity: 1 } : { scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', duration: 0.6, bounce: 0.35 }}
          >
            PURE QUALITY
          </motion.p>
          <motion.div
            className="quality-headline"
            initial={shouldReduceMotion ? 'visible' : 'hidden'}
            whileInView="visible"
            viewport={{ once: true, margin: '-30px' }}
            variants={headlineVariants}
          >
            {HEADLINE_LINES.map((line) => (
              <div key={line} className="headline-line-mask">
                <motion.span
                  className="headline-line"
                  variants={lineVariants}
                >
                  {line}
                </motion.span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* 8 Ingredient images with nested transforms */}
        <div className="mobile-cluster">
          {ingredients.map((item, index) => (
            <IngredientItem
              key={item.slot}
              item={item}
              index={index}
              sectionRef={sectionRef}
            />
          ))}
        </div>

        {/* Desktop Sparks (10 bursts) */}
        {DESKTOP_SPARKS.map((spark, i) => (
          <motion.div
            key={spark.id}
            className="desktop-spark"
            style={spark.style as React.CSSProperties}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 + i * 0.05 }}
          >
            <Spark color="var(--red)" />
          </motion.div>
        ))}

        {/* Mobile Sparks (4 bursts) */}
        <motion.div
          className="mobile-spark"
          style={{ left: '8%', top: '10px' }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <Spark color="var(--red)" />
        </motion.div>
        <motion.div
          className="mobile-spark"
          style={{ right: '8%', top: '25px' }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.55 }}
        >
          <Spark color="var(--red)" />
        </motion.div>
        <motion.div
          className="mobile-spark"
          style={{ left: '4%', top: '48%' }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
        >
          <Spark color="var(--red)" />
        </motion.div>
        <motion.div
          className="mobile-spark"
          style={{ right: '4%', top: '78%' }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.65 }}
        >
          <Spark color="var(--red)" />
        </motion.div>
      </div>
    </Section>
  );
}
