import { CSSProperties, ReactNode } from 'react';
import { WaveEdge } from './WaveEdge';

export function Section({
  children,
  bg,
  wave = true,
  className = '',
  order,
  style = {},
}: {
  children: ReactNode;
  bg: string;
  wave?: boolean;
  className?: string;
  order?: number;
  style?: CSSProperties;
}) {
  return (
    <section
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
}
