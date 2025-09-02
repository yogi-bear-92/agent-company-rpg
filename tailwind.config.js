/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          500: '#3b82f6',
          600: '#2563eb',
          900: '#1e3a8a',
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
      },
      backgroundImage: {
        'gradient-main': 'linear-gradient(to bottom right, rgb(15 23 42), rgb(88 28 135), rgb(15 23 42))',
        'gradient-xp': 'linear-gradient(to right, rgb(168 85 247), rgb(6 182 212))',
      }
    },
  },
  plugins: [],
}