import React from 'react';

/** Hand-drawn 4-pointed sparkle / star */
export function DoodleStar({
  className = "w-5 h-5",
  color = "#E41B23"
}: {
  className?: string;
  color?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 2C12 7.5 14.5 10 20 12C14.5 14 12 16.5 12 22C12 16.5 9.5 14 4 12C9.5 10 12 7.5 12 2Z" />
    </svg>
  );
}

/** Hand-drawn little sparks (3 radiating lines) */
export function DoodleSparks({
  className = "w-6 h-6",
  color = "#E41B23"
}: {
  className?: string;
  color?: string;
}) {
  return (
    <svg
      viewBox="0 0 30 30"
      fill="none"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      className={className}
      aria-hidden="true"
    >
      <line x1="15" y1="4" x2="15" y2="10" />
      <line x1="5" y1="12" x2="10" y2="15" />
      <line x1="25" y1="12" x2="20" y2="15" />
    </svg>
  );
}

/** Hand-drawn curved motion / accent lines */
export function DoodleMotion({
  className = "w-8 h-8",
  color = "#E41B23"
}: {
  className?: string;
  color?: string;
}) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      stroke={color}
      strokeWidth="2.2"
      strokeLinecap="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M6 14C12 8 22 8 32 14" />
      <path d="M10 22C16 17 24 17 30 22" />
      <path d="M14 30C18 26 22 26 26 30" />
    </svg>
  );
}

/** Hand-drawn scribble / underline */
export function DoodleUnderline({
  className = "w-48 h-4",
  color = "#E41B23"
}: {
  className?: string;
  color?: string;
}) {
  return (
    <svg
      viewBox="0 0 200 16"
      fill="none"
      stroke={color}
      strokeWidth="3"
      strokeLinecap="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M3 11C40 7 85 13 130 9C155 7 180 12 197 10" />
    </svg>
  );
}

/** Hand-drawn cute shawarma character mascot */
export function DoodleShawarmaMascot({
  className = "w-20 h-28",
  color = "#E41B23"
}: {
  className?: string;
  color?: string;
}) {
  return (
    <svg
      viewBox="0 0 100 140"
      fill="none"
      stroke={color}
      strokeWidth="2.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* Spit top handle / rod */}
      <line x1="50" y1="5" x2="50" y2="18" />
      <line x1="42" y1="18" x2="58" y2="18" />

      {/* Shawarma meat cone body */}
      <path d="M 32 24 C 40 20 60 20 68 24 C 76 42 78 80 58 114 C 54 120 46 120 42 114 C 22 80 24 42 32 24 Z" />

      {/* Grill texture lines */}
      <path d="M 34 38 C 45 42 55 42 66 38" />
      <path d="M 32 55 C 44 60 56 60 68 55" />
      <path d="M 34 72 C 45 77 55 77 66 72" />
      <path d="M 38 90 C 46 94 54 94 62 90" />

      {/* Eyes & Smile */}
      <circle cx="44" cy="48" r="2.2" fill={color} />
      <circle cx="56" cy="48" r="2.2" fill={color} />
      <path d="M 46 56 C 49 60 51 60 54 56" />

      {/* Waving little hands */}
      <path d="M 28 50 C 18 46 14 36 12 30" />
      <path d="M 12 30 C 10 32 12 36 14 38" />

      <path d="M 72 50 C 82 48 88 56 86 64" />

      {/* Bottom drip/tray */}
      <line x1="50" y1="118" x2="50" y2="132" />
      <ellipse cx="50" cy="132" rx="14" ry="4" />
    </svg>
  );
}

/** Hand-drawn skewer with kabab chunks and flames */
export function DoodleSkewerFlames({
  className = "w-16 h-28",
  color = "#E41B23"
}: {
  className?: string;
  color?: string;
}) {
  return (
    <svg
      viewBox="0 0 90 150"
      fill="none"
      stroke={color}
      strokeWidth="2.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* Top flame */}
      <path
        d="M 52 10 C 60 22 72 26 70 38 C 68 46 60 48 56 42 C 54 48 46 52 40 46 C 36 40 38 32 46 24 C 48 20 50 14 52 10 Z"
        fill="#FFB81C"
        fillOpacity="0.25"
      />

      {/* Skewer stick running through */}
      <line x1="22" y1="140" x2="68" y2="20" strokeWidth="3" />

      {/* Meat pieces angled */}
      <rect
        x="38"
        y="42"
        width="22"
        height="16"
        rx="5"
        transform="rotate(-28 49 50)"
      />
      <rect
        x="30"
        y="66"
        width="22"
        height="16"
        rx="5"
        transform="rotate(-28 41 74)"
      />
      <rect
        x="22"
        y="90"
        width="22"
        height="16"
        rx="5"
        transform="rotate(-28 33 98)"
      />

      {/* Little accent sparks */}
      <path d="M 68 62 L 76 60" />
      <path d="M 72 70 L 78 72" />
      <path d="M 16 88 L 10 90" />
    </svg>
  );
}

/** Swirl doodle */
export function DoodleSwirl({
  className = "w-8 h-8",
  color = "#E41B23"
}: {
  className?: string;
  color?: string;
}) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      stroke={color}
      strokeWidth="2.4"
      strokeLinecap="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M 12 18 C 12 10 24 8 26 16 C 28 24 16 28 14 22 C 12 16 20 14 22 18" />
    </svg>
  );
}
