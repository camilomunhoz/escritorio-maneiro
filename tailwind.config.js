/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        primary: ['Ledger', 'Georgia', 'serif'],
        serif: ['Ledger', 'Georgia', 'serif'],
        display: ['Ledger', 'Georgia', 'serif'],
        sans: ['"Source Sans 3"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        body: ['"Source Sans 3"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      colors: {
        // Warm Earthy Neutral scale (replaces sterile cold whites and grays)
        calm: {
          50: '#FAF6F0',   // Warm linen / cream base
          100: '#F3ECE1',  // Soft oatmeal / parchment
          200: '#E5DCD0',  // Warm neutral border
          300: '#D5C8B8',  // Accent border / divider
          400: '#AFA08E',  // Muted earthy icon / tertiary text
          500: '#847462',  // Earthy neutral secondary text
          600: '#675847',  // Medium warm reading text
          700: '#4E4234',  // Dark warm headers
          800: '#382F24',  // Deep rich espresso
          900: '#221B14',  // Warm black / dark roast
          950: '#15110C',
        },
        // Semantic surface tokens for warm earthy layouts
        surface: {
          DEFAULT: '#FAF6F0',
          base: '#FAF6F0',    // Drawer & modal container background
          card: '#FFFDF9',    // Warm elevated card surface
          cardHover: '#F7F2E9',
          subtle: '#F2EDE4',  // Headers, toolbars, recessed panels
          muted: '#EAE2D5',   // Tags, chips, dividers
          border: '#E5DCD0',  // Warm border
          active: '#DFD5C6',  // Active tab / pressed state
        },
        // Earthy neutral warm clay/stone palette
        earthy: {
          50: '#FAF6F0',
          100: '#F4ECE0',
          200: '#E7DCCB',
          300: '#D7C7B2',
          400: '#B6A187',
          500: '#978065',
          600: '#79654D',
          700: '#5C4B38',
          800: '#3F3224',
          900: '#231B13',
        },
        sage: {
          50: '#F4F7F4',
          100: '#E5ECE6',
          200: '#CAD8CD',
          300: '#A9C1AD',
          400: '#88A68D',
          500: '#698B6F',
          600: '#527058',
          700: '#3E5542',
          800: '#2C3D30',
          900: '#1B261D',
        },
        sand: {
          50: '#FDFCF9',
          100: '#F8F4EC',
          200: '#EFE7DA',
          300: '#E3D7C3',
          400: '#D4C3A9',
          500: '#BFA889',
          600: '#A68D6C',
          700: '#856D50',
          800: '#5F4D37',
          900: '#3B2F21',
        },
        slateMuted: {
          50: '#F7F8F9',
          100: '#EEF0F2',
          200: '#DDE1E5',
          300: '#C5CBD2',
          400: '#8F99A3',
          500: '#626E7A',
          600: '#49535D',
          700: '#353D45',
          800: '#20252A',
          900: '#101316',
        },
        terracottaMuted: {
          50: '#FDF7F5',
          100: '#FAEEEB',
          200: '#F3D8D1',
          300: '#E5B6AB',
          400: '#D69686',
          500: '#C87D6B',
          600: '#B16654',
          700: '#9E5B4B',
          800: '#7B4235',
          900: '#552C23',
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
        'drawer': '0 10px 25px -5px rgba(31, 26, 22, 0.12), 0 8px 10px -6px rgba(31, 26, 22, 0.08)',
        'soft': '0 2px 8px rgba(31, 26, 22, 0.04)',
      }
    },
  },
  plugins: [],
}
