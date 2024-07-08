import { defineConfig } from '@native-twin/core';
import { presetTailwind } from '@native-twin/preset-tailwind';

export default defineConfig({
  content: ['./App.tsx', './src/**/*.{js,jsx,ts,tsx}'],
  root: {
    rem: 16,
  },
  theme: {
    extend: {
      screens: {
        sm: {
          min: '200px',
          max: '500px',
        },
      },
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
  },
  presets: [presetTailwind()],
});
