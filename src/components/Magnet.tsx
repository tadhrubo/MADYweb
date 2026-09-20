import { CSSProperties, ReactNode, useEffect, useRef } from 'react';

type MagnetItem = {
  element: HTMLElement;
  padding: number;
  strength: number;
  maxOffset: number;
  disabled: boolean;
};

const magnetRegistry = new Set<MagnetItem>();
let sharedListenerInitialized = false;
let mouseX = -9999;
let mouseY = -9999;
let isCoarseOrReduced = false;
let rafId: number | null = null;

function processMagnets() {
  rafId = null;
  if (isCoarseOrReduced) return;
  for (const item of magnetRegistry) {
    if (item.disabled) continue;
    const el = item.element;
    const r = el.getBoundingClientRect();
    const inside =
      mouseX >= r.left - item.padding &&
      mouseX <= r.right + item.padding &&
      mouseY >= r.top - item.padding &&
      mouseY <= r.bottom + item.padding;

    if (!inside) {
      if (el.dataset.magnetActive === 'true') {
        el.dataset.magnetActive = 'false';
        el.style.transform = 'translate3d(0, 0, 0) rotate(0deg)';
        el.style.transition = 'transform 0.5s ease-in-out';
      }
    } else {
      el.dataset.magnetActive = 'true';
      const centerX = r.left + r.width / 2;
      const centerY = r.top + r.height / 2;
      const dx = Math.max(-item.maxOffset, Math.min(item.maxOffset, mouseX - centerX));
      const dy = Math.max(-item.maxOffset, Math.min(item.maxOffset, mouseY - centerY));
      el.style.transform = `translate3d(${(dx / item.strength).toFixed(2)}px, ${(dy / item.strength).toFixed(2)}px, 0) rotate(${((dx / item.maxOffset) * 2).toFixed(2)}deg)`;
      el.style.transition = 'transform 0.2s ease-out';
    }
  }
}

function onMouseMove(e: MouseEvent) {
  mouseX = e.clientX;
  mouseY = e.clientY;
  if (!rafId && !isCoarseOrReduced) {
    rafId = requestAnimationFrame(processMagnets);
  }
}

function initSharedListener() {
  if (typeof window === 'undefined' || sharedListenerInitialized) return;
  sharedListenerInitialized = true;
  const media = matchMedia('(pointer: coarse), (prefers-reduced-motion: reduce)');
  isCoarseOrReduced = media.matches;
  media.addEventListener('change', (e) => {
    isCoarseOrReduced = e.matches;
    if (isCoarseOrReduced) {
      for (const item of magnetRegistry) {
        item.element.style.transform = 'none';
      }
    }
  });
  window.addEventListener('mousemove', onMouseMove, { passive: true });
}

export function Magnet({
  children,
  padding = 80,
  strength = 4,
  maxOffset = 16,
  disabled = false,
  className = '',
  style = {},
}: {
  children: ReactNode;
  padding?: number;
  strength?: number;
  maxOffset?: number;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initSharedListener();
    const el = ref.current;
    if (!el) return;
    const item: MagnetItem = { element: el, padding, strength, maxOffset, disabled };
    magnetRegistry.add(item);
    return () => {
      magnetRegistry.delete(item);
      el.style.transform = '';
    };
  }, [padding, strength, maxOffset, disabled]);

  return (
    <div
      ref={ref}
      data-magnet="true"
      className={`magnet ${className}`}
      style={{ willChange: 'transform', ...style }}
    >
      {children}
    </div>
  );
}
