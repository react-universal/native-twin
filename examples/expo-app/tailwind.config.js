const { reactNativeTailwindPreset } = require('@universal-labs/core/tailwind/preset');

/**
 * @type {import('tailwindcss').Config}
 */
module.exports = {
  content: ['App.tsx', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [reactNativeTailwindPreset({ baseRem: 16 })],

  theme: {
    extend: {
      colors: {
        primary: 'blue',
      },
    },
  },
};
