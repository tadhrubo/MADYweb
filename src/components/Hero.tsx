import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { hero } from '../content/hero';
import { FitText } from './FitText';
import { Magnet } from './Magnet';
import { StickerWord } from './StickerWord';

function Eyes() {
  const [p, setP] = useState({ x: 0, y: 0 });
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const move = (e: MouseEvent) => {
      const r = ref.current?.getBoundingClientRect();
      if (!r) return;
      setP({
        x: Math.max(-6, Math.min(6, (e.clientX - r.left - r.width / 2) / 15)),
        y: Math.max(-6, Math.min(6, (e.clientY - r.top - r.height / 2) / 15)),
      });
    };
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, []);
  return (
    <div ref={ref} className="eyes" aria-hidden="true">
      <i>
        <b style={{ transform: `translate(${p.x}px,${p.y}px)` }} />
      </i>
      <i>
        <b style={{ transform: `translate(${p.x}px,${p.y}px)` }} />
      </i>
    </div>
  );
}

export function Hero({ ready }: { ready: boolean }) {
  const root = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: root, offset: ['start start', 'end start'] });
  const smooth = useSpring(scrollYProgress, { stiffness: 80, damping: 22 });
  const imageY = useTransform(smooth, [0, 1], ['0%', '-6%']);
  const imageScale = useTransform(smooth, [0, 1], [1, 1.15]);
  const headY = useTransform(smooth, [0, 1], ['0%', '10%']);

  return (
    <section id="top" ref={root} className="hero">
      <motion.div className="headline" style={{ y: headY }}>
        <FitText className="headline-text">{hero.headline}</FitText>
      </motion.div>
      <motion.div
        className="food-shell"
        initial={{ scale: 0.7, y: 90, rotate: -10, opacity: 0 }}
        animate={ready ? { scale: 1, y: 0, rotate: 0, opacity: 1 } : {}}
        style={{ y: imageY, scale: imageScale }}
        transition={{ type: 'spring', duration: 1.1, bounce: 0.25 }}
      >
        <motion.div animate={{ y: [-6, 6, -6] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}>
          <Magnet>
            <img src={hero.image} width="274" height="458" decoding="async" alt={hero.alt} />
            {hero.showEyes && <Eyes />}
          </Magnet>
        </motion.div>
      </motion.div>
      <div className="ground" aria-hidden="true" />
      <StickerWord text={hero.stickers[0]} className="sticker-one" delay={0.35} />
      <StickerWord text={hero.stickers[1]} className="sticker-two hero-garlic" delay={0.47} />

      {/* Bottom-left info box */}
      <div className="side-container left-container absolute bottom-20 md:bottom-24 lg:bottom-28 left-6 md:left-8 z-20 transform -translate-y-8 md:-translate-y-10 lg:-translate-y-12 pointer-events-auto">
        <motion.p
          className="side left relative z-10 font-outfit font-medium text-[#1A0B0B]"
          initial={{ y: 20, opacity: 0 }}
          animate={ready ? { y: 0, opacity: 1 } : {}}
          transition={{ delay: 0.5 }}
        >
          {hero.left}
        </motion.p>
      </div>

      {/* Bottom-right info box */}
      <div className="side-container right-container absolute bottom-20 md:bottom-24 lg:bottom-28 right-6 md:right-8 z-20 transform -translate-y-8 md:-translate-y-10 lg:-translate-y-12 text-right pointer-events-auto">
        <motion.p
          className="side right relative z-10 font-outfit font-medium text-[#1A0B0B]"
          initial={{ y: 20, opacity: 0 }}
          animate={ready ? { y: 0, opacity: 1 } : {}}
          transition={{ delay: 0.6 }}
        >
          {hero.right}
        </motion.p>
      </div>
    </section>
  );
}
