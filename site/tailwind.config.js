/**
 * @type {import('tailwindcss').Config}
 */
module.exports = {
  theme: {
    colors: {
      primary: 'blue',
    },
  },
  content: ['./pages/**/*.{js,jsx,ts,tsx}', '../../packages/**/*.{js,jsx,ts,tsx}'],
};
