import { CSSProperties } from 'react';

export function Spark({
  color = 'var(--bg)',
  className = '',
  style = {},
}: {
  color?: string;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <svg
      className={`spark ${className}`}
      style={{ stroke: color, ...style }}
      viewBox="0 0 50 50"
      aria-hidden="true"
    >
      <path d="M8 25h14M25 8v14M12 12l10 10M32 32l10 10" />
    </svg>
  );
}
