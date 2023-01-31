const nativewind = require('nativewind/tailwind');
const {
  themePlugin,
} = require('@react-universal/nativewind-utils/build/cjs/plugins/theme-plugin');

/**
 * @type {import('tailwindcss').Config}
 */
module.exports = {
  theme: {},
  content: ['./pages/**/*.{js,jsx,ts,tsx}', '../../packages/**/*.{js,jsx,ts,tsx}'],
  presets: [nativewind],
  darkMode: 'class',
  plugins: [themePlugin],
};
