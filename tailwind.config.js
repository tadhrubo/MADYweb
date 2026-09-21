/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        outfit: ['Outfit', 'sans-serif'],
      },
      colors: {
        cream: '#F6E3C8',
        madyRed: '#E41B23',
        madyMaroon: '#9B1B20',
        madyYellow: '#FFB81C',
        madyInk: '#1A0B0B',
      },
    },
  },
  plugins: [],
};
