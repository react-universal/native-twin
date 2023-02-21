import { AcceptedPlugin } from 'postcss';

const postcssPluginRemToPx = (opts = { baseValue: 16 }): AcceptedPlugin => {
  return {
    postcssPlugin: 'postcss-rem-to-px',
    Declaration(decl) {
      const unit = 'px';
      decl.value = decl.value.replace(
        /"[^"]+"|'[^']+'|url\([^)]+\)|(-?\d*\.?\d+)rem/g,
        (match, p1) => {
          if (p1 === undefined) return match;

          return `${p1 * opts.baseValue}${p1 == 0 ? '' : unit}`;
        },
      );
    },
  };
};

export { postcssPluginRemToPx };
