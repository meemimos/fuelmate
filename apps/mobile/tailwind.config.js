/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#0c0c0e',
          2: '#131316',
          3: '#1a1a1f',
        },
        border: {
          DEFAULT: '#252530',
          2: '#32323f',
        },
        fuel: '#ff6b00',
        accent: '#00e5a0',
        muted: {
          DEFAULT: '#8888a0',
          foreground: '#50505e',
        },
      },
      fontFamily: {
        display: ['Geist_700Bold', 'system-ui'],
        body: ['Geist_400Regular', 'system-ui'],
        mono: ['GeistMono_400Regular', 'monospace'],
        money: ['PlayfairDisplay_400Regular_Italic', 'serif'],
      },
    },
  },
  plugins: [],
};
