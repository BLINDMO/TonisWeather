/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['var(--font-display)', 'Georgia', 'serif'],
      },
      colors: {
        // Soft, modern "weather" palette
        ink: '#2a2540',
        dusk: '#6d5dfc',
        lilac: '#a99bff',
        mist: '#f7f5ff',
        sky: '#7cc6ff',
        sun: '#ffd166',
        rose: '#ff8fb1',
        storm: '#7b6f9e',
        rain: '#8fa3c7',
        leaf: '#7bd6a8',
      },
      boxShadow: {
        soft: '0 10px 40px -12px rgba(109, 93, 252, 0.35)',
        card: '0 8px 30px -10px rgba(42, 37, 64, 0.18)',
        glow: '0 0 60px -10px rgba(255, 209, 102, 0.6)',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0) translateX(0)' },
          '50%': { transform: 'translateY(-12px) translateX(6px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        rise: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        float: 'float 5s ease-in-out infinite',
        'float-slow': 'float-slow 8s ease-in-out infinite',
        shimmer: 'shimmer 3s linear infinite',
        rise: 'rise 0.5s ease-out both',
        'spin-slow': 'spin-slow 60s linear infinite',
      },
    },
  },
  plugins: [],
}
