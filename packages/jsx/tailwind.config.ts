import { defineConfig } from '@native-twin/core';
import { presetTailwind } from '@native-twin/preset-tailwind';

export default defineConfig({
  content: ['./src/__tests__/**/*.{js,jsx,ts,tsx}'],
  root: {
    rem: 16,
  },
  theme: {
    extend: {
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
