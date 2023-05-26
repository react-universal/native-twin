import { defineConfig } from '@twind/core';

export default defineConfig({
  /* options */
  preflight: false,
  variants: [
    ['ios', '&:ios'],
    ['android', '&:android'],
    ['web', ':web'],
  ],
  theme: {
    extend: {
      screens: {
        ios: ':ios',
        android: ':android',
        web: ':web',
        native: ':native',
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
  // presets: [presetTailwind()],
});
