/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,ts}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: '#15803D', dark: '#14532D', soft: '#DCFCE7' },
        surface: '#F8FAF9',
        ink: { DEFAULT: '#172B22', muted: '#64748B' },
        accent: '#F59E0B',
      },
      fontFamily: {
        sans: ['Manrope', 'Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: { xl2: '1.25rem' },
      boxShadow: {
        card: '0 1px 2px rgba(23,43,34,.04), 0 4px 16px rgba(23,43,34,.06)',
      },
    },
  },
  plugins: [],
}
