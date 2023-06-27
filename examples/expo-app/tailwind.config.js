/**
 * @type {import('tailwindcss').Config}
 */
module.exports = {
  content: ['App.tsx', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    colors: {
      primary: 'blue',
    },
    fontFamily: {
      DEFAULT: 'Inter-Regular',
      inter: 'Inter-Regular',
      'inter-bold': 'Inter-Bold',
      'inter-medium': 'Inter-Medium',
      sans: 'Inter-Regular',
    },
  },
};
