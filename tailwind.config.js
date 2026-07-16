/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Podarok"', '"Lobster"', 'cursive'],
        sans: ['"Coolvetica"', '"Comfortaa"', '"Nunito"', 'system-ui', 'sans-serif'],
      },
      colors: {
        bg: 'var(--bg-base)',
        elevated: 'var(--bg-elevated)',
        ink: 'var(--text-primary)',
        muted: 'var(--text-muted)',
        accent: 'var(--accent-primary)',
        warm: 'var(--accent-warm)',
        sunny: 'var(--accent-yellow)',
        border: 'var(--border-soft)',
      },
      backgroundImage: {
        fire: 'var(--gradient-fire)',
        fireSoft: 'var(--gradient-fire-soft)',
      },
      boxShadow: {
        glow: '0 18px 60px -20px var(--accent-primary)',
        card: '0 30px 80px -40px rgba(208, 57, 85, 0.45)',
      },
      keyframes: {
        breathe: {
          '0%, 100%': { transform: 'scale(1)', filter: 'hue-rotate(0deg)' },
          '50%': { transform: 'scale(1.04)', filter: 'hue-rotate(8deg)' },
        },
        floaty: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        riseIn: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideRight: {
          '0%': { opacity: '0', transform: 'translateX(-16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        flame: {
          '0%, 100%': { opacity: '0.55', transform: 'translateY(0) scale(1)' },
          '50%': { opacity: '0.9', transform: 'translateY(-12px) scale(1.05)' },
        },
      },
      animation: {
        breathe: 'breathe 8s ease-in-out infinite',
        floaty: 'floaty 6s ease-in-out infinite',
        riseIn: 'riseIn 0.7s cubic-bezier(0.22, 1, 0.36, 1) both',
        slideRight: 'slideRight 0.5s ease-out both',
        flame: 'flame 4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
