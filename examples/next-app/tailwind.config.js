const { tailwindPlugin } = require('@react-universal/core');

/**
 * @type {import('tailwindcss').Config}
 */
module.exports = {
  theme: {},
  content: ['./pages/**/*.{js,jsx,ts,tsx}', '../../packages/**/*.{js,jsx,ts,tsx}'],
  plugins: [tailwindPlugin],
};
