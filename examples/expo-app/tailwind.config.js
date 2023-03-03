const { nativePlugin } = require('@react-universal/core/tailwind');

/**
 * @type {import('tailwindcss').Config}
 */
module.exports = {
  content: ['App.tsx', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {},
  plugins: [nativePlugin],
  corePlugins: {
    preflight: false,
  },
};
