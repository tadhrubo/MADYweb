import React, { useEffect } from 'react';

export interface ScriptProps extends React.ScriptHTMLAttributes<HTMLScriptElement> {
  strategy?: 'beforeInteractive' | 'afterInteractive' | 'lazyOnload';
  onLoad?: () => void;
  onError?: (e: any) => void;
}

export function Script({
  src,
  strategy = 'afterInteractive',
  onLoad,
  onError,
  dangerouslySetInnerHTML,
  children,
  ...rest
}: ScriptProps) {
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const injectScript = () => {
      if (src && document.querySelector(`script[src="${src}"]`)) return;

      const script = document.createElement('script');
      if (src) script.src = src;
      if (dangerouslySetInnerHTML?.__html) {
        script.innerHTML = String(dangerouslySetInnerHTML.__html);
      } else if (children && typeof children === 'string') {
        script.innerHTML = children;
      }

      if (onLoad) script.onload = onLoad;
      if (onError) script.onerror = onError;

      Object.entries(rest).forEach(([k, v]) => {
        if (typeof v === 'string') script.setAttribute(k, v);
      });

      document.body.appendChild(script);
    };

    if (strategy === 'lazyOnload') {
      if ('requestIdleCallback' in window) {
        const id = (window as any).requestIdleCallback(injectScript);
        return () => (window as any).cancelIdleCallback(id);
      } else {
        const timer = setTimeout(injectScript, 2000);
        return () => clearTimeout(timer);
      }
    } else {
      // afterInteractive
      const timer = setTimeout(injectScript, 50);
      return () => clearTimeout(timer);
    }
  }, [src, strategy, onLoad, onError, dangerouslySetInnerHTML, children]);

  return null;
}

export default Script;
