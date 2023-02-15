/**
 * @type {import('tailwindcss').Config}
 */
module.exports = {
  content: ['App.tsx', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {},
  corePlugins: {
    preflight: true,
  },
};
