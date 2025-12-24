/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        graffiti: ['"Permanent Marker"', 'cursive'],
        rye: ['"Rye"', 'serif'],
        // New Badge Fonts
        serif: ['"Playfair Display"', 'serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        slab: ['"Roboto Slab"', 'serif'],
        handwritten: ['"Caveat"', 'cursive'],
        pixel: ['"Press Start 2P"', 'cursive'],
        script: ['"Dancing Script"', 'cursive'],
        gothic: ['"Oswald"', 'sans-serif'], // Alternative for Oswald
        modern: ['"Montserrat"', 'sans-serif'],
      },
      colors: {
        'street-dark': 'var(--bg-primary)',
        'street-gray': 'var(--bg-card)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'border-color': 'var(--border-color)',
        'neon-yellow': '#EAB308',
        'neon-orange': '#F97316',
        'spray-purple': '#A855F7',
        'spray-cyan': '#06B6D4',
      },
      backgroundImage: {
        'track-pattern':
          'linear-gradient(to bottom, transparent 50%, rgba(255, 255, 255, 0.05) 50%), linear-gradient(90deg, transparent 50%, rgba(0, 0, 0, 0.5) 50%)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-track': 'slideTrack 2s linear infinite',
      },
      keyframes: {
        slideTrack: {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(20px)' },
        },
      },
    },
  },
  plugins: [],
};
