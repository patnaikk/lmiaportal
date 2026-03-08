import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: '#1D4ED8',
        green: {
          DEFAULT: '#16A34A',
          bg: '#F0FDF4',
        },
        yellow: {
          DEFAULT: '#D97706',
          bg: '#FFFBEB',
        },
        red: {
          DEFAULT: '#DC2626',
          bg: '#FEF2F2',
        },
        grey: {
          DEFAULT: '#4B5563',
          bg: '#F9FAFB',
        },
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
}

export default config
