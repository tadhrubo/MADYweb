import { CSSProperties, ReactNode, forwardRef } from 'react';
import { WaveEdge } from './WaveEdge';

export const Section = forwardRef<HTMLElement, {
  children: ReactNode;
  bg: string;
  wave?: boolean;
  className?: string;
  order?: number;
  style?: CSSProperties;
  id?: string;
}>(function Section(
  {
    children,
    bg,
    wave = true,
    className = '',
    order,
    style = {},
    id,
  },
  ref
) {
  return (
    <section
      ref={ref}
      id={id}
      className={`section ${className}`}
      style={{
        background: bg,
        position: 'relative',
        zIndex: order,
        ...style,
      }}
    >
      {wave && <WaveEdge fill={bg} />}
      <div className="section-inner">{children}</div>
    </section>
  );
});

