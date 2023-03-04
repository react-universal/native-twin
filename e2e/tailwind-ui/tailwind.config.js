/**
 * @type {import('tailwindcss').Config}
 */
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        roboto: ['var(--font-roboto)'],
        'roboto-bold': ['var(--font-roboto)'],
        'roboto-medium': ['var(--font-roboto)'],
        sans: ['var(--font-roboto)'],
      },
    },
  },
  darkMode: 'class',
  content: [
    './pages/**/*.{js,jsx,ts,tsx}',
    './lib/**/*.{js,jsx,ts,tsx}',
    '../../packages/**/*.{js,jsx,ts,tsx}',
  ],
};
