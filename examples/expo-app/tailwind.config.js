const { nativePlugin } = require('@universal-labs/core/tailwind-plugin');

/**
 * @type {import('tailwindcss').Config}
 */
module.exports = {
  content: ['App.tsx', './src/**/*.{js,jsx,ts,tsx}'],
  plugins: [nativePlugin],
  theme: {
    extend: {
      colors: {
        primary: 'blue',
      },
    },
  },
};
