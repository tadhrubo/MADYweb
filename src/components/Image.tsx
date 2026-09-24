import React, { useState, useEffect, useRef } from 'react';

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

export default function Image({
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
  ...rest
}: ImageProps) {
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (imgRef.current && imgRef.current.complete) {
      setLoaded(true);
    }
  }, []);

  // Preload link in document head when priority is enabled
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

  const imgStyle: React.CSSProperties = {
    ...style,
    ...(fill
      ? {
          position: 'absolute',
          height: '100%',
          width: '100%',
          inset: 0,
        }
      : {}),
    transition: 'opacity 0.35s ease-out',
    opacity: loaded || !blurDataURL ? 1 : 0,
  };

  return (
    <div
      className={`relative overflow-hidden ${fill ? 'w-full h-full' : ''}`}
      style={{
        width: fill ? '100%' : width,
        height: fill ? '100%' : height,
      }}
    >
      {/* Instant Blur Placeholder */}
      {placeholder === 'blur' && blurDataURL && !loaded && (
        <img
          src={blurDataURL}
          alt=""
          aria-hidden="true"
          className={`absolute inset-0 w-full h-full object-cover filter blur-md scale-110 pointer-events-none transition-opacity duration-300 ${
            loaded ? 'opacity-0' : 'opacity-100'
          }`}
          style={style}
        />
      )}

      {/* Main High-Resolution Image */}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding={priority ? 'sync' : 'async'}
        sizes={sizes}
        className={`${className} ${fill ? 'object-cover w-full h-full' : ''}`}
        style={imgStyle}
        onLoad={() => setLoaded(true)}
        {...rest}
      />
    </div>
  );
}
