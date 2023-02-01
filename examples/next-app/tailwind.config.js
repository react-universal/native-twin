const nativewind = require('nativewind/tailwind');

/**
 * @type {import('tailwindcss').Config}
 */
module.exports = {
  theme: {},
  content: ['./pages/**/*.{js,jsx,ts,tsx}', '../../packages/**/*.{js,jsx,ts,tsx}'],
  presets: [nativewind],
};
