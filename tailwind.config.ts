import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: '#C0120C', dark: '#9A0E09', light: '#FDECEA' },
        ink: { DEFAULT: '#14161C', 2: '#1C1F27', 3: '#262A34', line: '#323744' },
      },
      boxShadow: { card: '0 2px 12px rgba(20,22,28,.08)' },
    },
  },
  plugins: [],
};
export default config;
