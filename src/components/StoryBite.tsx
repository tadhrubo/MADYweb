'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, useReducedMotion, useScroll, useTransform, useSpring, type MotionValue } from 'framer-motion';
import Image from 'next/image';
import { Section } from './Section';
import { Spark } from './Spark';
import storyBlurData from '../data/storyBlurData.json';

interface StoryRow {
  id: string;
  label: string;
  desc: string;
  doodleSrc: string;
  doodleAlt: string;
  photoSrc: string;
  photoAlt: string;
  photoPosition?: string;
  doodleRotate: number;
  swayDuration: string;
  swayDelay: string;
}

const BLUR_DATA: Record<string, string> = {
  grill: storyBlurData['grill-photo'],
  roll: storyBlurData['roll-photo'],
  bite: storyBlurData['fardin_bite']
};

const ROWS: StoryRow[] = [
  {
    id: 'grill',
    label: 'THE GRILL',
    desc: 'Charred, juicy, non-negotiable.',
    doodleSrc: '/assets/section4/stickers/grill-doodle.png',
    doodleAlt: 'Shawarma grill spit doodle',
    photoSrc: '/assets/section4/photos/grill-photo.webp',
    photoAlt: 'Fresh chicken shawarma on the grill',
    doodleRotate: -8,
    swayDuration: '4.2s',
    swayDelay: '0s'
  },
  {
    id: 'roll',
    label: 'THE ROLL',
    desc: 'Warm flatbread, folded tight.',
    doodleSrc: '/assets/section4/stickers/roll-doodle.png',
    doodleAlt: 'Shawarma roll wrap doodle',
    photoSrc: '/assets/section4/photos/roll-photo.webp',
    photoAlt: 'Master chef rolling shawarma wrap',
    doodleRotate: -5,
    swayDuration: '4.8s',
    swayDelay: '-1.5s'
  },
  {
    id: 'bite',
    label: 'THE BITE',
    desc: 'Big flavour. Zero boring.',
    doodleSrc: '/assets/section4/stickers/bite-doodle.png',
    doodleAlt: 'Guy taking a huge bite of shawarma doodle',
    photoSrc: '/assets/section4/photos/fardin_bite.webp',
    photoAlt: 'Mady chef taking a massive bite of loaded shawarma in the kitchen',
    photoPosition: 'center 30%',
    doodleRotate: -10,
    swayDuration: '4.5s',
    swayDelay: '-2.8s'
  }
];

function DoodleScrollSticker({
  row,
  scrollYProgress,
  isMobile,
  prefersReduced,
}: {
  row: StoryRow;
  scrollYProgress: MotionValue<number>;
  isMobile: boolean;
  prefersReduced: boolean | null;
}) {
  const arrival = row.id === 'grill' ? 0.22 : row.id === 'roll' ? 0.28 : 0.34;
  const startVh = isMobile ? 80 : 120;
  const exitVh = isMobile ? -20 : -40;

  // Map scrollYProgress to translateY:
  // - At progress 0 (section not yet visible): translateY = +120vh (mobile: +80vh)
  // - At arrival (0.22 grill, 0.28 roll, 0.34 bite): translateY = 0 (arrived at natural position)
  // - Holds at natural position (translateY = 0) while reading section content
  // - At progress 0.85: translateY = -40vh (mobile: -20vh) (exited upward)
  const rawVh = useTransform(
    scrollYProgress,
    [0, arrival, 0.7, 0.85],
    [startVh, 0, 0, exitVh]
  );
  const springVh = useSpring(rawVh, { stiffness: 60, damping: 20 });
  const translateY = useTransform(springVh, (v) => `${v}vh`);

  return (
    <motion.div
      className={`story-doodle-scroll-wrap story-doodle-scroll-${row.id} relative z-50`}
      style={prefersReduced ? {} : { y: translateY }}
      initial={prefersReduced ? { opacity: 0 } : undefined}
      whileInView={prefersReduced ? { opacity: 1 } : undefined}
      viewport={prefersReduced ? { once: true, amount: 0.1 } : undefined}
      transition={prefersReduced ? { duration: 0.6, ease: 'easeOut' } : undefined}
    >
      <div
        className="story-doodle-sway relative z-50"
        style={
          {
            '--base-rotate': `${row.doodleRotate}deg`,
            '--sway-duration': row.swayDuration,
            '--sway-delay': row.swayDelay,
          } as React.CSSProperties
        }
      >
        <Image
          src={row.doodleSrc}
          alt={row.doodleAlt}
          width={1500}
          height={1700}
          className="story-doodle-img drop-shadow-xl relative z-50"
        />
      </div>
    </motion.div>
  );
}

export function StoryBite() {
  const prefersReduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const rowsContainerRef = useRef<HTMLDivElement>(null);
  const card1Ref = useRef<HTMLDivElement>(null);
  const card3Ref = useRef<HTMLDivElement>(null);

  const [connectorGeometry, setConnectorGeometry] = useState<{ top: number; height: number } | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  useEffect(() => {
    function updateConnector() {
      if (!rowsContainerRef.current || !card1Ref.current || !card3Ref.current) return;
      const containerRect = rowsContainerRef.current.getBoundingClientRect();
      const card1Rect = card1Ref.current.getBoundingClientRect();
      const card3Rect = card3Ref.current.getBoundingClientRect();

      const top = card1Rect.bottom - containerRect.top;
      const bottom = card3Rect.top - containerRect.top;
      const height = Math.max(0, bottom - top);

      setConnectorGeometry({ top, height });
    }

    updateConnector();

    const observer = new ResizeObserver(() => {
      updateConnector();
    });

    if (rowsContainerRef.current) observer.observe(rowsContainerRef.current);
    if (card1Ref.current) observer.observe(card1Ref.current);
    if (card3Ref.current) observer.observe(card3Ref.current);
    window.addEventListener('resize', updateConnector);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateConnector);
    };
  }, []);

  return (
    <Section ref={sectionRef} bg="var(--yellow)" order={4} className="story-section" id="story-bite">
      <div className="story-container">
        {/* Header Block */}
        <motion.div
          className="story-header"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          transition={{ staggerChildren: 0.08 }}
        >
          <div className="story-headline-mask">
            <motion.h2
              className="story-headline"
              variants={{
                hidden: { y: '115%', opacity: 0 },
                visible: {
                  y: 0,
                  opacity: 1,
                  transition: prefersReduced
                    ? { duration: 0.3 }
                    : { type: 'spring', damping: 20, stiffness: 120 }
                }
              }}
            >
              A STORY IN EVERY BITE.
            </motion.h2>
          </div>

          <div className="story-subheading-mask">
            <motion.p
              className="story-subheading"
              variants={{
                hidden: { y: '115%', opacity: 0 },
                visible: {
                  y: 0,
                  opacity: 1,
                  transition: { duration: 0.6, ease: 'easeOut' }
                }
              }}
            >
              From the grill to your hands, every layer matters.
            </motion.p>
          </div>
        </motion.div>

        {/* Three Story Rows */}
        <div className="story-rows" ref={rowsContainerRef}>
          {/* Animated Dashed Connector Line */}
          {connectorGeometry && (
            <motion.div
              className="story-connector-line"
              style={{
                top: `${connectorGeometry.top}px`,
                height: `${connectorGeometry.height}px`
              }}
              initial={prefersReduced ? { opacity: 1, scaleY: 1 } : { scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
            />
          )}

          {ROWS.map((row, idx) => {
            const isFirst = idx === 0;
            const isLast = idx === ROWS.length - 1;
            const cardRef = isFirst ? card1Ref : isLast ? card3Ref : undefined;

            return (
              <motion.div
                key={row.id}
                className={`story-row story-row-${row.id}`}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.25 }}
                transition={{ staggerChildren: 0.15 }}
              >
                {/* Left Column: Doodle */}
                <div className="story-col story-col-doodle relative z-50">
                  <DoodleScrollSticker
                    row={row}
                    scrollYProgress={scrollYProgress}
                    isMobile={isMobile}
                    prefersReduced={prefersReduced}
                  />
                </div>

                {/* Center Column: Photo Card */}
                <div className="story-col story-col-card" ref={cardRef}>
                  <motion.div
                    className="story-card-entrance"
                    variants={{
                      hidden: { scale: prefersReduced ? 1 : 0.88, opacity: 0 },
                      visible: {
                        scale: 1,
                        opacity: 1,
                        transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] }
                      }
                    }}
                  >
                    <div className="story-card">
                      <Image
                        src={row.photoSrc}
                        alt={row.photoAlt}
                        fill={true}
                        priority={true}
                        placeholder="blur"
                        blurDataURL={BLUR_DATA[row.id]}
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="story-card-photo object-cover"
                        style={row.photoPosition ? { objectPosition: row.photoPosition } : undefined}
                      />
                    </div>
                  </motion.div>
                </div>

                {/* Right Column: Label with Sparks */}
                <div className="story-col story-col-label">
                  <motion.div
                    className="story-label-entrance"
                    variants={{
                      hidden: { x: prefersReduced ? 0 : 60, opacity: 0 },
                      visible: {
                        x: 0,
                        opacity: 1,
                        transition: { duration: 0.7, ease: 'easeOut' }
                      }
                    }}
                  >
                    <div className="story-label-badge">
                      <div className="story-label-sparks-left">
                        <Spark color="var(--red)" className="story-spark-side spark-1" />
                        <Spark color="var(--red)" className="story-spark-side spark-2" />
                      </div>

                      <div className="story-label-text-wrap">
                        <span className="story-label-title">{row.label}</span>
                        <span className="story-label-desc">{row.desc}</span>
                      </div>

                      <div className="story-label-sparks-right">
                        <Spark color="var(--red)" className="story-spark-side spark-3" />
                        <Spark color="var(--red)" className="story-spark-side spark-4" />
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </Section>
  );
}
