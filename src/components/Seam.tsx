import { motion } from 'framer-motion';

export function Seam() {
  return (
    <div className="seam">
      <a
        className="order-now -translate-y-6 md:translate-y-0 rounded-full transition-all duration-300 ease-in-out hover:rounded-[50%_20%_60%_30%]"
        href="https://www.foodpanda.com.bd/restaurant/sjiu/mady-sjiu"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Order on Foodpanda"
      >
        ORDER NOW
      </a>

      <motion.div
        className="seam-badge translate-y-3 md:translate-y-0"
        animate={{ rotate: 360 }}
        transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
        aria-hidden="true"
      >
        <svg viewBox="0 0 400 400" className="w-full h-full">
          <defs>
            <path
              id="seamCircle"
              d="M200,200 m-155,0 a155,155 0 1,1 310,0 a155,155 0 1,1 -310,0"
            />
          </defs>
          <text>
            <textPath
              href="#seamCircle"
              textLength="970"
              lengthAdjust="spacing"
            >
              BEWARE YOU WILL GO MAD · BEWARE YOU WILL GO MAD · BEWARE YOU WILL GO MAD · BEWARE YOU WILL GO MAD ·{' '}
            </textPath>
          </text>
          <image
            href="/assets/madySolo.png"
            x="85"
            y="85"
            width="230"
            height="230"
            preserveAspectRatio="xMidYMid meet"
          />
        </svg>
      </motion.div>
    </div>
  );
}


