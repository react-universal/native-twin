const defaultColors = require('tailwindcss/colors');
/**
 * @type {import('tailwindcss').Config}
 */
module.exports = {
  content: ['./App.tsx', './src/**/*.{js,jsx,ts,tsx}', '../../packages/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ...defaultColors,
      },
    },
  },
};
