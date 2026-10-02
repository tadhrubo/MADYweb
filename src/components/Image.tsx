import React, { useState, useEffect, forwardRef } from 'react';

export interface ImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'placeholder' | 'src'> {
  src: string;
  alt: string;
  width?: number | string;
  height?: number | string;
  fill?: boolean;
  priority?: boolean;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  sizes?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const Image = forwardRef<HTMLImageElement, ImageProps>(function Image(
  {
    src,
    alt,
    width,
    height,
    fill = false,
    priority = false,
    placeholder = 'empty',
    blurDataURL,
    sizes,
    className = '',
    style,
    onLoad,
    ...rest
  },
  ref
) {
  const [loaded, setLoaded] = useState(false);

  // Preload link in document head when priority is enabled (Next.js LCP behavior)
  useEffect(() => {
    if (priority && typeof document !== 'undefined') {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      document.head.appendChild(link);
      return () => {
        if (document.head.contains(link)) {
          document.head.removeChild(link);
        }
      };
    }
  }, [src, priority]);

  const fillStyle: React.CSSProperties = fill
    ? {
        position: 'absolute',
        height: '100%',
        width: '100%',
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
      }
    : {};

  const blurStyle: React.CSSProperties =
    placeholder === 'blur' && blurDataURL && !loaded
      ? {
          backgroundImage: `url("${blurDataURL}")`,
          backgroundSize: 'cover',
          backgroundPosition: '50% 50%',
          backgroundRepeat: 'no-repeat',
        }
      : {};

  return (
    <img
      ref={ref}
      src={src}
      alt={alt}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      loading={priority ? 'eager' : 'lazy'}
      // @ts-ignore fetchPriority is supported in modern browsers
      fetchPriority={priority ? 'high' : 'auto'}
      decoding={priority ? 'sync' : 'async'}
      sizes={sizes}
      className={className}
      style={{
        ...fillStyle,
        ...blurStyle,
        ...style,
      }}
      onLoad={(e) => {
        setLoaded(true);
        onLoad?.(e);
      }}
      {...rest}
    />
  );
});

export default Image;

