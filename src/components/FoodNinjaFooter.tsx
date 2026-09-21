import { useEffect, useRef, useState } from 'react';
import Matter from 'matter-js';
import { WaveEdge } from './WaveEdge';

interface FoodType {
  key: string;
  wholeSrc: string;
  cutASrc: string;
  cutBSrc: string;
  particleColor: string;
  radius: number;
}

const FOOD_TYPES: FoodType[] = [
  {
    key: 'chicken',
    wholeSrc: '/assets/foodNinja/chickenWhole.png',
    cutASrc: '/assets/foodNinja/chickenCut_A.png',
    cutBSrc: '/assets/foodNinja/chickenCut_B.png',
    particleColor: '#D97706',
    radius: 46
  },
  {
    key: 'flatbread',
    wholeSrc: '/assets/foodNinja/flatbreadWhole.png',
    cutASrc: '/assets/foodNinja/flatbreadCut_A.png',
    cutBSrc: '/assets/foodNinja/flatbreadCut_B.png',
    particleColor: '#FDE68A',
    radius: 48
  },
  {
    key: 'lettuce',
    wholeSrc: '/assets/foodNinja/lettuceWhole.png',
    cutASrc: '/assets/foodNinja/lettuceCut_A.png',
    cutBSrc: '/assets/foodNinja/lettuceCut_B.png',
    particleColor: '#22C55E',
    radius: 44
  },
  {
    key: 'onion',
    wholeSrc: '/assets/foodNinja/onionWhole.png',
    cutASrc: '/assets/foodNinja/onionCut_A.png',
    cutBSrc: '/assets/foodNinja/onionCut_B.png',
    particleColor: '#A855F7',
    radius: 42
  },
  {
    key: 'pickle',
    wholeSrc: '/assets/foodNinja/pickleWhole.png',
    cutASrc: '/assets/foodNinja/pickleCut_A.png',
    cutBSrc: '/assets/foodNinja/pickleCut_B.png',
    particleColor: '#84CC16',
    radius: 40
  },
  {
    key: 'redChili',
    wholeSrc: '/assets/foodNinja/redChiliWhole.png',
    cutASrc: '/assets/foodNinja/redChiliCut_A.png',
    cutBSrc: '/assets/foodNinja/redChiliCut_B.png',
    particleColor: '#EF4444',
    radius: 38
  }
];

interface GameItem {
  body: Matter.Body;
  type: 'whole' | 'cut' | 'bomb';
  food?: FoodType;
  img: HTMLImageElement;
  width: number;
  height: number;
  radius: number;
  sliced: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  life: number;
}

interface Explosion {
  x: number;
  y: number;
  startTime: number;
  duration: number;
}

interface FloatingScore {
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
  vy: number;
}

interface TrailPoint {
  x: number;
  y: number;
  time: number;
}

export function FoodNinjaFooter() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [isShaking, setIsShaking] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Preload Images
    const images: Record<string, HTMLImageElement> = {};
    const loadImg = (key: string, src: string) => {
      const img = new Image();
      img.src = src;
      images[key] = img;
    };

    loadImg('bomb', '/assets/foodNinja/bomb.png');
    loadImg('bombExplode', '/assets/foodNinja/bombExplode.png');

    FOOD_TYPES.forEach((food) => {
      loadImg(`${food.key}_whole`, food.wholeSrc);
      loadImg(`${food.key}_cutA`, food.cutASrc);
      loadImg(`${food.key}_cutB`, food.cutBSrc);
    });

    // Resize Handler
    let width = container.clientWidth;
    let height = container.clientHeight;

    const resize = () => {
      if (!container || !canvas) return;
      width = container.clientWidth;
      height = container.clientHeight;
      canvas.width = width;
      canvas.height = height;
    };
    resize();
    window.addEventListener('resize', resize);

    // Matter.js Setup
    const engine = Matter.Engine.create({
      gravity: { x: 0, y: 1.0, scale: 0.001 }
    });

    const activeItems = new Map<number, GameItem>();
    const particles: Particle[] = [];
    const explosions: Explosion[] = [];
    const floatingScores: FloatingScore[] = [];
    const trailPoints: TrailPoint[] = [];

    let isPointerDown = false;
    let lastPointerPos: { x: number; y: number } | null = null;
    let currentScore = 0;

    // Web Audio Synthesizer (Zero-latency micro SFX)
    let audioCtx: AudioContext | null = null;
    const getAudio = () => {
      if (!audioCtx) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) audioCtx = new AudioCtx();
      }
      if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      return audioCtx;
    };

    const playSliceSfx = () => {
      try {
        const actx = getAudio();
        if (!actx) return;
        const osc = actx.createOscillator();
        const gain = actx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(650, actx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(140, actx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.2, actx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, actx.currentTime + 0.12);
        osc.connect(gain);
        gain.connect(actx.destination);
        osc.start();
        osc.stop(actx.currentTime + 0.12);
      } catch {
        // audio muted or unsupported
      }
    };

    const playBombSfx = () => {
      try {
        const actx = getAudio();
        if (!actx) return;
        const osc = actx.createOscillator();
        const gain = actx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(160, actx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(35, actx.currentTime + 0.45);
        gain.gain.setValueAtTime(0.4, actx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, actx.currentTime + 0.45);
        osc.connect(gain);
        gain.connect(actx.destination);
        osc.start();
        osc.stop(actx.currentTime + 0.45);
      } catch {
        // audio muted or unsupported
      }
    };

    // Spawning Function
    const spawnItem = () => {
      if (document.hidden) return;

      const isBomb = Math.random() < 0.24;
      const startX = width * (0.18 + Math.random() * 0.64);
      const startY = height + 60;

      // Arc towards center
      const targetCenter = width * 0.5;
      const dxToCenter = (targetCenter - startX) / (width * 0.5);
      const vx = dxToCenter * (2 + Math.random() * 3.5) + (Math.random() - 0.5) * 2;
      // Upward impulse to reach upper 20-40% of the canvas
      const minPeakY = height * 0.22;
      const maxPeakY = height * 0.45;
      const targetPeakY = minPeakY + Math.random() * (maxPeakY - minPeakY);
      const dist = startY - targetPeakY;
      const vy = -Math.sqrt(2 * 0.95 * dist * 0.35) * (0.9 + Math.random() * 0.2);

      if (isBomb) {
        const radius = 38;
        const body = Matter.Bodies.circle(startX, startY, radius, {
          label: 'bomb',
          restitution: 0.5,
          frictionAir: 0.012
        });

        Matter.Body.setVelocity(body, { x: vx, y: vy });
        Matter.Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.08);

        Matter.World.add(engine.world, body);
        activeItems.set(body.id, {
          body,
          type: 'bomb',
          img: images['bomb'],
          width: radius * 2.3,
          height: radius * 2.3,
          radius,
          sliced: false
        });
      } else {
        const food = FOOD_TYPES[Math.floor(Math.random() * FOOD_TYPES.length)];
        const radius = food.radius;
        const body = Matter.Bodies.circle(startX, startY, radius, {
          label: 'ingredient',
          restitution: 0.5,
          frictionAir: 0.012
        });

        Matter.Body.setVelocity(body, { x: vx, y: vy });
        Matter.Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.08);

        Matter.World.add(engine.world, body);
        activeItems.set(body.id, {
          body,
          type: 'whole',
          food,
          img: images[`${food.key}_whole`],
          width: radius * 2.2,
          height: radius * 2.2,
          radius,
          sliced: false
        });
      }
    };

    // Spawn wave timer
    const spawnTimer = setInterval(() => {
      // Spawn 1 to 2 items in wave
      const count = Math.random() < 0.35 ? 2 : 1;
      for (let i = 0; i < count; i++) {
        setTimeout(spawnItem, i * 220);
      }
    }, 1600);

    // Slicing Raycast Execution
    const performSlice = (p1: { x: number; y: number }, p2: { x: number; y: number }) => {
      const bodies = Array.from(activeItems.values())
        .filter((item) => !item.sliced)
        .map((item) => item.body);

      if (bodies.length === 0) return;

      const hits = Matter.Query.ray(bodies, p1, p2, 16);
      if (hits.length === 0) return;

      for (const hit of hits) {
        const bodyId = hit.bodyA.id;
        const item = activeItems.get(bodyId);
        if (!item || item.sliced) continue;

        item.sliced = true;
        const { x, y } = item.body.position;
        const { x: vx, y: vy } = item.body.velocity;

        if (item.type === 'whole') {
          // Remove whole ingredient
          Matter.World.remove(engine.world, item.body);
          activeItems.delete(item.body.id);

          const food = item.food!;
          const cutRadius = item.radius * 0.75;

          // Spawn Cut Piece A
          const bodyA = Matter.Bodies.circle(x - 12, y, cutRadius, {
            label: 'cutPiece',
            restitution: 0.4,
            frictionAir: 0.014
          });
          Matter.Body.setVelocity(bodyA, { x: vx - 4.5, y: vy - 1.5 });
          Matter.Body.setAngularVelocity(bodyA, -0.09);

          // Spawn Cut Piece B
          const bodyB = Matter.Bodies.circle(x + 12, y, cutRadius, {
            label: 'cutPiece',
            restitution: 0.4,
            frictionAir: 0.014
          });
          Matter.Body.setVelocity(bodyB, { x: vx + 4.5, y: vy - 1.5 });
          Matter.Body.setAngularVelocity(bodyB, 0.09);

          Matter.World.add(engine.world, [bodyA, bodyB]);

          activeItems.set(bodyA.id, {
            body: bodyA,
            type: 'cut',
            food,
            img: images[`${food.key}_cutA`],
            width: cutRadius * 2.2,
            height: cutRadius * 2.2,
            radius: cutRadius,
            sliced: true
          });

          activeItems.set(bodyB.id, {
            body: bodyB,
            type: 'cut',
            food,
            img: images[`${food.key}_cutB`],
            width: cutRadius * 2.2,
            height: cutRadius * 2.2,
            radius: cutRadius,
            sliced: true
          });

          // Juice Splatter Particles
          for (let p = 0; p < 14; p++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 6;
            particles.push({
              x,
              y,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              color: food.particleColor,
              size: 3 + Math.random() * 5,
              alpha: 1,
              life: 0
            });
          }

          // Score Increment
          currentScore += 1;
          setScore(currentScore);
          const scoreEl = document.getElementById('score');
          if (scoreEl) scoreEl.textContent = String(currentScore);

          // Floating Score Text
          floatingScores.push({
            x,
            y: y - 15,
            text: '+1',
            color: '#E41B23',
            alpha: 1,
            vy: -2.2
          });

          playSliceSfx();
        } else if (item.type === 'bomb') {
          // Slice Bomb: BOOM!
          Matter.World.remove(engine.world, item.body);
          activeItems.delete(item.body.id);

          explosions.push({
            x,
            y,
            startTime: performance.now(),
            duration: 650
          });

          // Reset score to 0
          currentScore = 0;
          setScore(0);
          const scoreEl = document.getElementById('score');
          if (scoreEl) scoreEl.textContent = '0';

          // Screen shake
          setIsShaking(true);
          setTimeout(() => setIsShaking(false), 450);

          floatingScores.push({
            x,
            y: y - 20,
            text: 'BOOM!',
            color: '#E41B23',
            alpha: 1,
            vy: -1.5
          });

          playBombSfx();
        }
      }
    };

    // Pointer Event Handlers
    const getPos = (e: MouseEvent | Touch) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    };

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      isPointerDown = true;
      const point = 'touches' in e ? e.touches[0] : e;
      if (!point) return;
      const pos = getPos(point);
      lastPointerPos = pos;
      trailPoints.push({ x: pos.x, y: pos.y, time: performance.now() });
    };

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      const point = 'touches' in e ? e.touches[0] : e;
      if (!point) return;
      const pos = getPos(point);
      const now = performance.now();
      trailPoints.push({ x: pos.x, y: pos.y, time: now });

      if (isPointerDown || 'touches' in e) {
        if (lastPointerPos) {
          performSlice(lastPointerPos, pos);
        }
        lastPointerPos = pos;
      }
    };

    const handlePointerUp = () => {
      isPointerDown = false;
      lastPointerPos = null;
    };

    // Event Listeners on Canvas
    canvas.addEventListener('mousedown', handlePointerDown);
    canvas.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);

    canvas.addEventListener('touchstart', handlePointerDown, { passive: true });
    canvas.addEventListener('touchmove', handlePointerMove, { passive: true });
    window.addEventListener('touchend', handlePointerUp);

    // Main Game & Animation Loop (60 FPS)
    let animationFrameId: number;
    let lastTime = performance.now();

    const gameLoop = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.033);
      lastTime = now;

      // Step physics
      Matter.Engine.update(engine, 1000 / 60);

      // Clear Canvas
      ctx.clearRect(0, 0, width, height);

      // 1. Render Matter.js Bodies
      for (const [id, item] of activeItems) {
        const { x, y } = item.body.position;
        const angle = item.body.angle;

        // Garbage Collection: below canvas threshold
        if (y > height + 130) {
          Matter.World.remove(engine.world, item.body);
          activeItems.delete(id);
          continue;
        }

        if (item.img && item.img.complete && item.img.naturalWidth > 0) {
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(angle);

          // Subtle shadow under airborne items
          ctx.shadowColor = 'rgba(26, 11, 11, 0.18)';
          ctx.shadowBlur = 10;
          ctx.shadowOffsetY = 8;

          ctx.drawImage(
            item.img,
            -item.width / 2,
            -item.height / 2,
            item.width,
            item.height
          );
          ctx.restore();
        }
      }

      // 2. Render Explosions
      for (let i = explosions.length - 1; i >= 0; i--) {
        const exp = explosions[i];
        const elapsed = now - exp.startTime;
        if (elapsed > exp.duration) {
          explosions.splice(i, 1);
          continue;
        }

        const progress = elapsed / exp.duration;
        const scale = 0.5 + progress * 2.2;
        const alpha = Math.max(0, 1 - progress * 1.2);
        const expImg = images['bombExplode'];

        if (expImg && expImg.complete) {
          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.translate(exp.x, exp.y);
          const size = 180 * scale;
          ctx.drawImage(expImg, -size / 2, -size / 2, size, size);
          ctx.restore();
        }
      }

      // 3. Render Juice Particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.25; // gravity
        p.alpha -= 0.024;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 4. Render Floating Scores
      for (let i = floatingScores.length - 1; i >= 0; i--) {
        const fs = floatingScores[i];
        fs.y += fs.vy;
        fs.alpha -= 0.022;

        if (fs.alpha <= 0) {
          floatingScores.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = fs.alpha;
        ctx.font = 'bold 28px "Lilita One", Anton, sans-serif';
        ctx.fillStyle = fs.color;
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 4;
        ctx.textAlign = 'center';
        ctx.strokeText(fs.text, fs.x, fs.y);
        ctx.fillText(fs.text, fs.x, fs.y);
        ctx.restore();
      }

      // 5. Render Slicing Blade Trail
      // Prune old trail points (> 150ms)
      while (trailPoints.length > 0 && now - trailPoints[0].time > 150) {
        trailPoints.shift();
      }

      if (trailPoints.length >= 2) {
        ctx.save();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Outer Neon Red/Orange Glow
        for (let i = 1; i < trailPoints.length; i++) {
          const p1 = trailPoints[i - 1];
          const p2 = trailPoints[i];
          const age = (now - p2.time) / 150;
          const alpha = Math.max(0, 1 - age);
          const widthTaper = (i / trailPoints.length) * 12;

          ctx.strokeStyle = `rgba(228, 27, 35, ${alpha * 0.7})`;
          ctx.lineWidth = widthTaper + 4;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }

        // Inner Sharp White Blade Core
        for (let i = 1; i < trailPoints.length; i++) {
          const p1 = trailPoints[i - 1];
          const p2 = trailPoints[i];
          const age = (now - p2.time) / 150;
          const alpha = Math.max(0, 1 - age);
          const widthTaper = (i / trailPoints.length) * 5;

          ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
          ctx.lineWidth = widthTaper;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);

    // Cleanup
    return () => {
      window.removeEventListener('resize', resize);
      clearInterval(spawnTimer);
      cancelAnimationFrame(animationFrameId);

      canvas.removeEventListener('mousedown', handlePointerDown);
      canvas.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);

      canvas.removeEventListener('touchstart', handlePointerDown);
      canvas.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);

      Matter.World.clear(engine.world, false);
      Matter.Engine.clear(engine);
    };
  }, []);

  return (
    <footer className={`footer-container ${isShaking ? 'screen-shake' : ''}`} ref={containerRef}>
      <WaveEdge fill="var(--bg)" />

      {/* Background Watermark Mady Logo */}
      <img
        src="/assets/madySolo.png"
        alt="Mady Logo"
        className="footer-bg-logo"
        aria-hidden="true"
      />

      {/* Floating HUD & Navigation Links */}
      <div className="footer-hud">
        <div className="footer-badge">
          <span className="footer-badge-dot" />
          FOOD NINJA ARENA
        </div>
        <p className="footer-hint">SWIPE / DRAG TO SLICE &bull; AVOID THE BOMBS!</p>

        {/* Horizontal Navigation Links */}
        <nav className="footer-nav flex items-center justify-center gap-6 sm:gap-8 mt-2 pointer-events-auto z-10">
          <a
            href="#menu"
            className="font-['Bebas_Neue'] text-lg sm:text-xl tracking-widest text-[var(--red)] hover:text-[var(--maroon)] transition-colors underline-offset-4 hover:underline"
          >
            MENU
          </a>
          <a
            href="#find-us"
            className="font-['Bebas_Neue'] text-lg sm:text-xl tracking-widest text-[var(--red)] hover:text-[var(--maroon)] transition-colors underline-offset-4 hover:underline"
          >
            CONTACT
          </a>
          <a
            href="#top"
            className="font-['Bebas_Neue'] text-lg sm:text-xl tracking-widest text-[var(--red)] hover:text-[var(--maroon)] transition-colors underline-offset-4 hover:underline"
          >
            ABOUT
          </a>
        </nav>
      </div>

      {/* Interactive Physics Canvas */}
      <canvas id="ninja-canvas" className="ninja-canvas" ref={canvasRef} />

      {/* Absolute Bottom-Right Score Counter */}
      <div
        id="score-counter"
        className="score-counter absolute bottom-6 right-6 md:bottom-8 md:right-8 z-20 pointer-events-auto"
      >
        Score: <span id="score">{score}</span>
      </div>

      {/* Footer Branding & Copyright at Bottom */}
      <div className="footer-bottom-bar">
        <div className="footer-wordmark">Mady</div>
        <p className="footer-tag">BEWARE YOU WILL GO MAD.</p>
        <p className="footer-copy">&copy; {new Date().getFullYear()} MADY SHAWARMA. ALL RIGHTS RESERVED.</p>
      </div>
    </footer>
  );
}
