import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X, Facebook, Instagram } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

export function Header({
  ready = true,
  isMenuPage = false,
}: {
  ready?: boolean;
  isMenuPage?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const close = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', esc);
    if (open) close.current?.focus();
    return () => window.removeEventListener('keydown', esc);
  }, [open]);

  const navigateTo = (path: string) => {
    setOpen(false);
    if (path === '/menu') {
      if (isMenuPage) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      window.location.href = '/menu';
      return;
    }
    if (path === '/' || path === '#top') {
      if (!isMenuPage) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      window.location.href = '/';
      return;
    }
    if (path.startsWith('/#') || path.startsWith('#')) {
      if (isMenuPage) {
        window.location.href = path.startsWith('/#') ? path : '/' + path;
        return;
      } else {
        const hash = path.replace('/#', '#');
        const el = document.querySelector(hash);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
          return;
        }
      }
    }
    window.location.href = path;
  };

  return (
    <motion.header
      className={`header bg-transparent ${open ? 'menu-open z-[1000]' : 'z-50'}`}
      initial={{ y: -30, opacity: 0 }}
      animate={ready ? { y: 0, opacity: 1 } : {}}
      transition={{ duration: 0.6 }}
    >
      <a
        className="wordmark shrink-0"
        href="/"
        onClick={(e) => {
          if (isMenuPage) {
            e.preventDefault();
            window.location.href = '/';
          }
        }}
        aria-label="Mady home"
      >
        <img src="/assets/madySolo.png" alt="Mady" width="180" height="76" decoding="async" />
      </a>

      {/* Right-side navigation flex container: (Menu, Facebook, Instagram, Hamburger) */}
      <nav className="flex items-center gap-2 sm:gap-3 flex-nowrap shrink-0">
        {/* Solid colored Menu pill button */}
        <Link
          href="/menu"
          onClick={(e) => {
            if (isMenuPage) {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
          className="text-xs sm:text-sm font-bold px-3.5 py-1.5 sm:px-4 bg-red-600 text-white rounded-full uppercase tracking-wide flex items-center justify-center shrink-0 hover:bg-red-700 active:scale-95 transition-all select-none shadow-sm cursor-pointer no-underline"
        >
          Menu
        </Link>

        {/* Outlined Facebook Social Icon */}
        <a
          href="https://www.facebook.com/profile.php?id=61587293055358"
          target="_blank"
          rel="noopener noreferrer"
          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 border-solid border-red-600 text-red-600 bg-transparent hover:bg-red-600 hover:text-white transition-all shrink-0 cursor-pointer no-underline"
          aria-label="Mady on Facebook"
          title="Facebook"
        >
          <Facebook size={16} className="sm:w-[18px] sm:h-[18px]" />
        </a>

        {/* Outlined Instagram Social Icon */}
        <a
          href="https://www.instagram.com/mady.bd"
          target="_blank"
          rel="noopener noreferrer"
          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 border-solid border-red-600 text-red-600 bg-transparent hover:bg-red-600 hover:text-white transition-all shrink-0 cursor-pointer no-underline"
          aria-label="Mady on Instagram"
          title="Instagram"
        >
          <Instagram size={16} className="sm:w-[18px] sm:h-[18px]" />
        </a>

        {/* Compact circular hamburger menu toggle button */}
        <button
          type="button"
          className="w-8 h-8 sm:w-10 sm:h-10 p-1.5 sm:p-2 rounded-full flex items-center justify-center border-2 border-solid border-red-600 text-red-600 bg-transparent hover:bg-red-600 hover:text-white transition-all shrink-0 cursor-pointer"
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-label="Open navigation menu"
        >
          <Menu size={18} className="sm:w-5 sm:h-5" />
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
                { label: 'The Menu', href: '/menu', isExternal: false },
                { label: 'Home', href: '/', isExternal: false },
                { label: 'Inside the Wrap', href: '/#wrap', isExternal: false },
                { label: 'Find Us', href: '/#find-us', isExternal: false },
                { label: 'Food Ninja', href: '/#ninja-canvas', isExternal: false },
              ].map((item) => (
                <a
                  key={item.label}
                  onClick={(e) => {
                    e.preventDefault();
                    navigateTo(item.href);
                  }}
                  href={item.href}
                >
                  {item.label}
                </a>
              ))}
            </div>

            {/* Mobile Drawer Order & Social Links */}
            <div className="mt-8 flex flex-col items-center gap-4">
              <a
                href="https://www.foodpanda.com.bd/restaurant/sjiu/mady-sjiu"
                target="_blank"
                rel="noopener noreferrer"
                className="font-['Bebas_Neue'] text-xl sm:text-2xl tracking-widest text-[var(--red)] bg-[var(--yellow)] px-8 py-2.5 rounded-full border-2 border-white shadow-lg hover:scale-105 transition-all"
              >
                ORDER ON FOODPANDA
              </a>

              <div className="flex items-center gap-4">
                <a
                  href="https://www.facebook.com/profile.php?id=61587293055358"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-full bg-white text-[var(--red)] flex items-center justify-center hover:bg-[var(--yellow)] transition-all shadow-md"
                  aria-label="Facebook"
                >
                  <Facebook size={22} />
                </a>
                <a
                  href="https://www.instagram.com/mady.bd"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-full bg-white text-[var(--red)] flex items-center justify-center hover:bg-[var(--yellow)] transition-all shadow-md"
                  aria-label="Instagram"
                >
                  <Instagram size={22} />
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

