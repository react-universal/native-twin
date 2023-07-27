/**
 * @type {import('tailwindcss').Config}
 */
module.exports = {
  theme: {
    colors: {
      primary: 'blue',
    },
    fontFamily: {
      roboto: ['var(--font-roboto)'],
      'roboto-bold': ['var(--font-roboto)'],
      'roboto-medium': ['var(--font-roboto)'],
      sans: ['var(--font-roboto)'],
    },
  },
  content: ['./pages/**/*.{js,jsx,ts,tsx}', '../../packages/**/*.{js,jsx,ts,tsx}'],
};
