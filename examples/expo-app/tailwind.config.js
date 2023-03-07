const { nativePlugin } = require('@universal-labs/core/tailwind');

/**
 * @type {import('tailwindcss').Config}
 */
module.exports = {
  content: ['App.tsx', './src/**/*.{js,jsx,ts,tsx}'],
  plugins: [nativePlugin],
};
