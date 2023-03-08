/**
 * @type {import('tailwindcss').Config}
 */
module.exports = {
  theme: {},
  darkMode: 'media',
  important: 'html',
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './cypress/**/*.{js,jsx,ts,tsx}',
    '../../packages/**/*.{js,jsx,ts,tsx}',
  ],
};
