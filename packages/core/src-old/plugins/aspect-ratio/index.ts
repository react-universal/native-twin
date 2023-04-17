import type { AcceptedPlugin } from 'postcss';

const aspectRatioValue = new RegExp(/(-?\d*\.?\d+) \/ (-?\d*\.?\d+)/g);

const postcssPluginReactNativeAspectRatio = (): AcceptedPlugin => {
  return {
    postcssPlugin: 'postcss-aspect-ratio',
    Declaration(decl) {
      if (decl.prop === 'aspect-ratio') {
        decl.value = decl.value.replace(aspectRatioValue, (match, p1, p2) => {
          return `${Number(p1) / Number(p2)}`;
        });
      }
    },
  };
};

export { postcssPluginReactNativeAspectRatio };
