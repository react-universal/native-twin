import colors from 'tailwindcss/colors';

/**
 * @type {import('tailwindcss').Config}
 */
module.exports = {
  content: ['App.tsx', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    colors: {
      primary: {
        default: colors.blue[500],
      },
    },
  },
  corePlugins: {
    preflight: true,
  },
};
