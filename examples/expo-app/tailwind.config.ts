import { defineConfig, presetTailwind } from '@universal-labs/native-twin';

export default defineConfig({
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
