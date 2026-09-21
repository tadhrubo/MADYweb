import { useRef, useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Section } from './Section';
import { Spark } from './Spark';

interface StoryRow {
  id: string;
  label: string;
  desc: string;
  doodleSrc: string;
  doodleAlt: string;
  photoSrc: string;
  photoAlt: string;
  doodleRotate: number;
  swayDuration: string;
  swayDelay: string;
}

const ROWS: StoryRow[] = [
  {
    id: 'grill',
    label: 'THE GRILL',
    desc: 'Charred, juicy, non-negotiable.',
    doodleSrc: '/assets/section4/stickers/grill-doodle.png',
    doodleAlt: 'Shawarma grill spit doodle',
    photoSrc: '/assets/section4/photos/grill-photo.jpg',
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
    photoSrc: '/assets/section4/photos/roll-photo.jpg',
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
    photoSrc: '/assets/section4/photos/bite-photo.jpg',
    photoAlt: 'Customer taking a bite of delicious shawarma',
    doodleRotate: -10,
    swayDuration: '4.5s',
    swayDelay: '-2.8s'
  }
];

function getDoodleStyle(row: StoryRow, scrollY: number): React.CSSProperties {
  if (row.doodleSrc.includes('grill-doodle.png') || row.id === 'grill') {
    return {
      transform: `translateY(${scrollY * 0.15}px) perspective(500px) rotate(${Math.sin(scrollY * 0.005) * 12}deg) rotateX(${Math.cos(scrollY * 0.005) * 15}deg)`
    };
  }
  if (row.doodleSrc.includes('roll-doodle.png') || row.id === 'roll') {
    return {
      transform: `translateY(${scrollY * -0.1}px) perspective(500px) rotate(${-Math.sin(scrollY * 0.005) * 10}deg) rotateY(${Math.cos(scrollY * 0.005) * 18}deg)`
    };
  }
  if (row.doodleSrc.includes('bite-doodle.png') || row.id === 'bite') {
    return {
      transform: `translateY(${scrollY * 0.08}px) perspective(500px) rotate(${Math.cos(scrollY * 0.005) * 14}deg) rotateX(${Math.sin(scrollY * 0.005) * 12}deg)`
    };
  }
  return {};
}

export function StoryBite() {
  const prefersReduced = useReducedMotion();
  const rowsContainerRef = useRef<HTMLDivElement>(null);
  const card1Ref = useRef<HTMLDivElement>(null);
  const card3Ref = useRef<HTMLDivElement>(null);

  const [connectorGeometry, setConnectorGeometry] = useState<{ top: number; height: number } | null>(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

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
    <Section bg="var(--yellow)" order={4} className="story-section">
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
                <div className="story-col story-col-doodle">
                  <motion.div
                    className="story-doodle-entrance"
                    variants={{
                      hidden: { x: prefersReduced ? 0 : -60, opacity: 0 },
                      visible: {
                        x: 0,
                        opacity: 1,
                        transition: { duration: 0.7, ease: 'easeOut' }
                      }
                    }}
                  >
                    <div
                      className="story-doodle-sway"
                      style={
                        {
                          '--base-rotate': `${row.doodleRotate}deg`,
                          '--sway-duration': row.swayDuration,
                          '--sway-delay': row.swayDelay
                        } as React.CSSProperties
                      }
                    >
                      <img
                        src={row.doodleSrc}
                        alt={row.doodleAlt}
                        className="story-doodle-img drop-shadow-xl"
                        loading="lazy"
                        style={getDoodleStyle(row, scrollY)}
                      />
                    </div>
                  </motion.div>
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
                      <img
                        src={row.photoSrc}
                        alt={row.photoAlt}
                        className="story-card-photo"
                        loading="lazy"
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
