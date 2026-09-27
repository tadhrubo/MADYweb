import React from 'react';
import { usePageTransition, TransitionType } from './transitions/PageTransitionContext';

export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  transitionType?: TransitionType;
}

export default function Link({
  href,
  className = '',
  children,
  onClick,
  transitionType,
  ...rest
}: LinkProps) {
  let pageTransition: ReturnType<typeof usePageTransition> | null = null;
  try {
    pageTransition = usePageTransition();
  } catch {
    // Graceful fallback if Link is rendered outside provider
  }

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) onClick(e);
    if (e.defaultPrevented) return;

    // External links (let native browser handle or open new tab)
    if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('mailto:') || href.startsWith('tel:')) {
      return;
    }

    // Internal navigation with MADY page transition
    if (pageTransition) {
      e.preventDefault();
      pageTransition.navigate(href, { transitionType });
      return;
    }

    // Basic SPA fallback
    if (href.startsWith('/')) {
      if (window.location.pathname === href) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      if (href === '/menu' || href === '/') {
        e.preventDefault();
        window.history.pushState({}, '', href);
        window.dispatchEvent(new PopStateEvent('popstate'));
      }
    }
  };

  return (
    <a href={href} className={className} onClick={handleClick} {...rest}>
      {children}
    </a>
  );
}
