import { useEffect, useRef, useState } from 'react';

function getWavePath(t = 0) {
  let d = 'M 0 92 ';
  for (let x = 0; x <= 1000; x += 8) {
    const y = 44 + Math.sin((x / 550) * 2 * Math.PI + t * 0.18) * 22 + Math.sin((x / 300) * 2 * Math.PI - t * 0.11) * 10;
    d += `L ${x} ${y.toFixed(2)} `;
  }
  return d + 'L 1000 100 L 0 100 Z';
}

const INITIAL_PATH = getWavePath(0);

export function WaveEdge({ fill }: { fill: string }) {
  const path = useRef<SVGPathElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const node = svg.current;
    if (!node) return;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    io.observe(node);

    let frame = 0;
    let last = 0;
    const start = performance.now();

    const draw = (now: number) => {
      if (!reduced && visible && now - last > 33) {
        last = now;
        const t = (now - start) / 1000;
        path.current?.setAttribute('d', getWavePath(t));
      }
      if (!reduced) {
        frame = requestAnimationFrame(draw);
      }
    };

    if (!reduced) {
      frame = requestAnimationFrame(draw);
    }

    return () => {
      cancelAnimationFrame(frame);
      io.disconnect();
    };
  }, [visible]);

  return (
    <svg
      ref={svg}
      className="wave-edge"
      viewBox="0 0 1000 100"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path ref={path} fill={fill} d={INITIAL_PATH} />
    </svg>
  );
}
