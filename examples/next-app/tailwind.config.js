import { defineConfig } from '@universal-labs/native-twin';
import { presetTailwind } from '@universal-labs/preset-tailwind';

export default defineConfig({
  root: {
    rem: 14,
  },
  mode: 'web',
  presets: [presetTailwind()],
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
});
