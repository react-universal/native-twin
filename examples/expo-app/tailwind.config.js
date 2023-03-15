const preset = require('@universal-labs/core/tailwind/preset');

/**
 * @type {import('tailwindcss').Config}
 */
module.exports = {
  content: ['App.tsx', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [preset()],
  theme: {
    extend: {
      colors: {
        primary: 'blue',
      },
    },
  },
};
