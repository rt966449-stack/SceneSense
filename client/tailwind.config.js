/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        prime: {
          bg: '#0A0E17',
          card: '#121927',
          cardHover: '#1B2436',
          border: '#233047',
          cyan: '#00A8E1',
          cyanHover: '#00BFFF',
          gold: '#FF9900',
          accent: '#00C8FF',
          textMuted: '#8C9DB5'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif']
      }
    },
  },
  plugins: [],
}
