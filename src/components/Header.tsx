import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

function Roll({ children }: { children: string }) {
  return (
    <span className="roll">
      <span>{children}</span>
      <span>{children}</span>
    </span>
  );
}

export function Header({ ready }: { ready: boolean }) {
  const [open, setOpen] = useState(false);
  const close = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', esc);
    if (open) close.current?.focus();
    return () => window.removeEventListener('keydown', esc);
  }, [open]);

  return (
    <motion.header
      className={`header ${open ? 'menu-open z-[1000]' : 'z-20'}`}
      initial={{ y: -30, opacity: 0 }}
      animate={ready ? { y: 0, opacity: 1 } : {}}
      transition={{ duration: 0.6 }}
    >
      <a className="wordmark" href="#top" aria-label="Mady home">
        <img src="/assets/mady-logo.png" alt="Mady" width="180" height="76" decoding="async" />
      </a>

      <nav>
        <a className="pill solid" href="#find-us">
          <Roll>FIND US</Roll>
        </a>
        <button
          className="pill outline"
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={open}
        >
          <Roll>MENU</Roll>
          <Menu size={18} />
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            className="menu-overlay z-[1000]"
            role="dialog"
            aria-modal="true"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            style={{ willChange: 'transform' }}
          >
            <button
              ref={close}
              className="close"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
            >
              <X size={32} />
            </button>
            <div className="menu-links">
              {[
                { label: 'Home', href: '#top' },
                { label: 'Inside the Wrap', href: '#wrap' },
                { label: 'Find Us', href: '#find-us' },
                { label: 'Food Ninja', href: '#ninja-canvas' },
              ].map((item) => (
                <a
                  key={item.label}
                  onClick={() => setOpen(false)}
                  href={item.href}
                >
                  {item.label}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
