import { defineConfig } from '@native-twin/core';
import { presetTailwind } from '.';

export default defineConfig({
  root: { rem: 16 },
  content: ['index.js', 'App.tsx', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [presetTailwind()],
});
