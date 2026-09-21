import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { Section } from './Section';
import { Spark } from './Spark';

function Glove({ side }: { side: 'left' | 'right' }) {
  return (
    <div className={`glove glove-${side}`}>
      <motion.div
        animate={{ x: [-6, 6, -6] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        <img src="/assets/glove.png" alt="" aria-hidden="true" />
      </motion.div>
    </div>
  );
}

export function FoodFeel() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [15, -30]);

  return (
    <Section bg="var(--red)" order={2} className="food-feel pb-36 md:pb-0">
      <section ref={ref} className="food-feel-body pb-36 md:pb-[105px]">
        <motion.p
          className="experience"
          initial={{ scale: 0, rotate: -12 }}
          whileInView={{ scale: 1, rotate: -2 }}
          viewport={{ once: true }}
        >
          STREET FOOD
        </motion.p>
        <div className="feel-title">
          <motion.h2 initial={{ y: '110%' }} whileInView={{ y: 0 }} viewport={{ once: true }}>
            DONE DANGEROUSLY
          </motion.h2>
          <motion.h2
            className="larger"
            initial={{ y: '110%' }}
            whileInView={{ y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08 }}
          >
            RIGHT
          </motion.h2>
        </div>
        <motion.div
          className="feel-wrap-main"
          style={{ y }}
          initial={{ scale: 0.85, y: 70, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
        >
          <img
            src="/assets/shawarma-hero.png"
            alt="Mady chicken shawarma in branded paper wrap"
            width="274"
            height="458"
            decoding="async"
          />
          <Glove side="left" />
          <Glove side="right" />
          <Spark />
          <Spark />
        </motion.div>
        <motion.div
          className="feel-list list-left bottom-[95px] md:bottom-auto"
          initial={{ x: -20, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ once: true }}
        >
          FRESH CHICKEN
          <br />
          DAILY PREP
          <br />
          HAND ROLLED
          <Spark />
        </motion.div>
        <motion.div
          className="feel-list list-right bottom-[95px] md:bottom-auto"
          initial={{ x: 20, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ once: true }}
        >
          HOT OFF THE GRILL
          <br />
          CRISP VEGGIES
          <br />
          SIGNATURE SAUCE
          <Spark />
        </motion.div>
      </section>
    </Section>
  );
}
