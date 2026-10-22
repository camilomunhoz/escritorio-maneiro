/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        calm: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },
        sage: {
          50: '#F4F7F5',
          100: '#E5ECE7',
          200: '#CBD9CE',
          300: '#AEC3B3',
          400: '#8DA794',
          500: '#6D8B75',
          600: '#556F5C',
          700: '#405445',
          800: '#2E3D32',
          900: '#1D2720',
        },
        sand: {
          50: '#FDFCFB',
          100: '#F9F6F0',
          200: '#F2ECE0',
          300: '#E9DFC9',
          400: '#DECFA9',
          500: '#CCA97D',
          600: '#B88F61',
          700: '#8C6C47',
          800: '#634C31',
        },
        slateMuted: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        },
        terracottaMuted: {
          100: '#FAEEEB',
          200: '#F3D8D1',
          500: '#C87D6B',
          700: '#9E5B4B',
        }
      },
      width: {
        'drawer-normal': '350px',
        'drawer-expanded': '750px',
        'drawer-compact': '350px',
      },
      height: {
        'drawer-normal': '500px',
        'drawer-expanded': '500px',
        'drawer-compact': '50px',
      },
      boxShadow: {
        'drawer': '0 10px 25px -5px rgba(15, 23, 42, 0.15), 0 8px 10px -6px rgba(15, 23, 42, 0.1)',
        'soft': '0 2px 8px rgba(0, 0, 0, 0.04)',
      }
    },
  },
  plugins: [],
}
