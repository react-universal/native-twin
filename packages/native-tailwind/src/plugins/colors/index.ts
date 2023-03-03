import type { AcceptedPlugin } from 'postcss';

const colorRule = new RegExp(
  /rgb\(\s*(?<red>\d+)\s*(?<green>\d+)\s*(?<blue>\d+)(?:\s*\/\s*(?<alpha>[\d%.]+))?\s*\)/gm,
);

const postcssPluginReactNativeColors = (): AcceptedPlugin => {
  return {
    postcssPlugin: 'postcss-rgb-to-rgba',
    Declaration(decl) {
      decl.value = decl.value.replace(colorRule, (match, red, green, blue, alpha = 1) => {
        return `rgba(${red},${green},${blue}${alpha === 1 ? ',1' : `,${alpha}`})`;
      });
    },
  };
};

export { postcssPluginReactNativeColors };
