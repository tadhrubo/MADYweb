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

    // Unfocus clicked item so focus management doesn't lock viewport scrolling
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    if (path === '/menu') {
      if (isMenuPage) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      window.history.pushState({}, '', '/menu');
      window.dispatchEvent(new PopStateEvent('popstate'));
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (path === '/' || path === '#top') {
      if (!isMenuPage) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      window.history.pushState({}, '', '/');
      window.dispatchEvent(new PopStateEvent('popstate'));
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (path.startsWith('/#') || path.startsWith('#')) {
      const hash = path.replace('/#', '#');

      if (isMenuPage) {
        // Navigating from /menu to a home page section
        window.history.pushState({}, '', '/' + hash);
        window.dispatchEvent(new PopStateEvent('popstate'));
        window.dispatchEvent(new HashChangeEvent('hashchange'));
        return;
      } else {
        // Already on home page
        window.history.pushState(null, '', hash);
        const scrollToElement = () => {
          const el = document.querySelector(hash);
          if (el) {
            const headerOffset = 80;
            const elementPosition = el.getBoundingClientRect().top + window.scrollY;
            window.scrollTo({
              top: Math.max(0, elementPosition - headerOffset),
              behavior: 'smooth',
            });
            return true;
          }
          return false;
        };

        // Fire after overlay close transition initiates to prevent animation interference
        setTimeout(scrollToElement, 60);
        setTimeout(scrollToElement, 280);
        return;
      }
    }

    window.location.href = path;
  };

  return (
    <motion.header
      className={`header bg-transparent flex justify-between items-center ${open ? 'menu-open z-[1000]' : 'z-[110]'}`}
      initial={{ y: -30, opacity: 0 }}
      animate={ready ? { y: 0, opacity: 1 } : {}}
      transition={{ duration: 0.6 }}
    >
      <a
        className="wordmark shrink-0 flex items-center h-10 sm:h-12"
        href="/"
        onClick={(e) => {
          if (isMenuPage) {
            e.preventDefault();
            window.location.href = '/';
          }
        }}
        aria-label="Mady home"
      >
        <img
          src="/assets/madySolo.png"
          alt="Mady"
          width="180"
          height="76"
          decoding="async"
          className="h-10 sm:h-12 w-auto object-contain block"
        />
      </a>

      {/* Right-side navigation flex container: (Menu, Facebook, Instagram, Hamburger) */}
      <nav className="flex items-center gap-2 sm:gap-3 flex-nowrap shrink-0">
        {/* Solid colored Menu pill button with white border for contrast on red sections */}
        <Link
          href="/menu"
          onClick={(e) => {
            if (isMenuPage) {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
          className="h-10 sm:h-12 px-4 sm:px-6 bg-red-600 text-white rounded-full uppercase tracking-wide text-sm sm:text-base font-bold flex items-center justify-center shrink-0 border-2 border-solid border-white shadow-md hover:bg-red-700 active:scale-95 transition-all select-none cursor-pointer no-underline"
        >
          Menu
        </Link>

        {/* Outlined Facebook Social Icon with solid beige background */}
        <a
          href="https://www.facebook.com/profile.php?id=61587293055358"
          target="_blank"
          rel="noopener noreferrer"
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center border-2 border-solid border-red-600 text-red-600 bg-[#F6E3C8] shadow-sm hover:bg-red-600 hover:text-white transition-all shrink-0 cursor-pointer no-underline"
          aria-label="Mady on Facebook"
          title="Facebook"
        >
          <Facebook size={20} className="sm:w-[22px] sm:h-[22px]" />
        </a>

        {/* Outlined Instagram Social Icon with solid beige background */}
        <a
          href="https://www.instagram.com/mady.bd"
          target="_blank"
          rel="noopener noreferrer"
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center border-2 border-solid border-red-600 text-red-600 bg-[#F6E3C8] shadow-sm hover:bg-red-600 hover:text-white transition-all shrink-0 cursor-pointer no-underline"
          aria-label="Mady on Instagram"
          title="Instagram"
        >
          <Instagram size={20} className="sm:w-[22px] sm:h-[22px]" />
        </a>

        {/* Compact circular hamburger menu toggle button with solid beige background */}
        <button
          type="button"
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center border-2 border-solid border-red-600 text-red-600 bg-[#F6E3C8] shadow-sm hover:bg-red-600 hover:text-white transition-all shrink-0 cursor-pointer"
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-label="Open navigation menu"
        >
          <Menu size={22} className="sm:w-6 sm:h-6" />
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

