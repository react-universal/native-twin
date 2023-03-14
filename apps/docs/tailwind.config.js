/**
 * @type {import('tailwindcss').Config}
 */
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'blue',
          focus: 'red',
          content: 'white',
        },
        secondary: {
          DEFAULT: 'blue',
          focus: 'red',
          content: 'white',
        },
        accent: {
          DEFAULT: 'blue',
          focus: 'red',
          content: 'white',
        },
        neutral: {
          DEFAULT: 'blue',
          focus: 'red',
          content: 'white',
        },
        info: {
          DEFAULT: 'blue',
          content: 'white',
        },
        success: {
          DEFAULT: 'green',
          content: 'white',
        },
        error: {
          DEFAULT: 'red',
          content: 'white',
        },
      },
      fontFamily: {
        roboto: ['var(--font-roboto)'],
        'roboto-bold': ['var(--font-roboto)'],
        'roboto-medium': ['var(--font-roboto)'],
        sans: ['var(--font-roboto)'],
      },
      fontSize: {
        DEFAULT: 80,
      },
    },
  },
  darkMode: 'media',
  important: 'html',
  content: [
    './pages/**/*.{js,jsx,ts,tsx}',
    './lib/**/*.{js,jsx,ts,tsx}',
    '../../packages/**/*.{js,jsx,ts,tsx}',
  ],
};
