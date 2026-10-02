import React from 'react';
import dynamic from 'next/dynamic';
import { outfit, anton } from '@/utils/fontGoogle';
import '@/styles.css';

// Lazy load physics engine with Next.js dynamic import (Matter.js excluded from critical path)
const FoodNinjaFooter = dynamic(() => import('@/components/FoodNinjaFooter'), { ssr: false });

export const metadata = {
  title: 'Mady — Food That Feels Good',
  description: 'Madly Good Dhaka Street Food',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${outfit.variable} ${anton.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">
        {children}
        <FoodNinjaFooter />
      </body>
    </html>
  );
}
