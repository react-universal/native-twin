import plugin from 'tailwindcss/plugin';

const unsupportedVariants = ['ios', 'android', 'windows', 'macos', 'native'];

const tailwindPlugin = plugin(function ({ addVariant }) {
  addVariant('web', '&');
  for (const variant of unsupportedVariants) {
    addVariant(variant, '@media unsupported');
  }
});

export { tailwindPlugin };
export { parseClassNames } from './runtime';
export { useStore } from './store';
