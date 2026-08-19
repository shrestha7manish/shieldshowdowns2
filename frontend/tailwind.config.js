/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#fffdf0',
          100: '#fef7be',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04',
          700: '#a16207',
          800: '#854d0e',
          900: '#713f12',
          DEFAULT: '#E8C766', // Soft Gold
          bright: '#E8C766', // Soft Gold
          glow: '#F5A623',
        },
        light: {
          bg: '#FFFFFF',        // Soft White - Main background
          card: '#EEF5FA',      // Ice Blue - Highlight boxes / stats
          sky: '#DCEAF4',       // Light Sky Blue - Section backgrounds
          section: '#F7F9FB',   // Pale Gray - Tables / secondary areas
          border: '#E5E7EB',    // Soft Silver - Borders / dividers
          heading: '#4F7CAC',   // Slate Blue - Headings & accents
          text: '#243B53',      // Dark Navy - Main text
          gold: '#E8C766',      // Soft Gold - Small premium highlights
          warm: '#FAF8F2',      // Light Beige - Warm background
        },
        dark: {
          card: '#121214',
          bg: '#080809',
          border: '#2A2B2F',
          input: '#1A1A1E',
          text: '#E2E8F0',
        }
      },
      fontFamily: {
        gaming: ['Orbitron', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'gold-glow': '0 0 15px rgba(212, 175, 55, 0.25)',
        'gold-glow-lg': '0 0 25px rgba(212, 175, 55, 0.4)',
        'gold-glow-btn': '0 0 15px rgba(255, 215, 0, 0.4)',
      }
    },
  },
  plugins: [],
}
