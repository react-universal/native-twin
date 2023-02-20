import { AcceptedPlugin } from 'postcss';
import defaultTheme from 'tailwindcss/defaultTheme';
import processTailwindFeatures from 'tailwindcss/src/processTailwindFeatures.js';
import resolveConfig from 'tailwindcss/src/public/resolve-config.js';
import { TailwindConfig } from 'tailwindcss/tailwindconfig.faketype';

function rem2px(input: any, fontSize = 16): any {
  if (input == null) {
    return input;
  }
  switch (typeof input) {
    case 'object':
      if (Array.isArray(input)) {
        return input.map((val) => rem2px(val, fontSize));
      } else {
        const ret = {};
        for (const key in input) {
          // @ts-expect-error
          ret[key] = rem2px(input[key]);
        }
        return ret;
      }
    case 'string':
      return input.replace(/(\d*\.?\d+)rem$/, (_, val) => parseFloat(val) * fontSize + 'px');
    default:
      return input;
  }
}

export const createTailwindcssPlugin = (props: {
  config?: TailwindConfig;
  content: string;
}): AcceptedPlugin => {
  const config = props.config ?? {};
  const tailwindConfig = resolveConfig({
    ...config,
    theme: {
      ...config.theme,
      borderRadius: rem2px(defaultTheme.borderRadius),
      columns: rem2px(defaultTheme.columns),
      fontSize: rem2px(defaultTheme.fontSize),
      lineHeight: rem2px(defaultTheme.lineHeight),
      maxWidth: ({ theme, breakpoints }) => ({
        // @ts-expect-error
        ...rem2px(defaultTheme.maxWidth ? defaultTheme.maxWidth({ theme, breakpoints }) : {}),
      }),
      spacing: rem2px(defaultTheme.spacing),
    },
  });
  const tailwindcssPlugin = processTailwindFeatures(
    (processOptions) => () =>
      processOptions.createContext(tailwindConfig, [{ content: props.content }]),
  );
  return tailwindcssPlugin;
};
