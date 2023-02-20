export function rem2px(input: any, fontSize = 16): any {
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

// {
//   ...config,
//   theme: {
//     ...config.theme,
//     borderRadius: rem2px(defaultTheme.borderRadius),
//     columns: rem2px(defaultTheme.columns),
//     fontSize: rem2px(defaultTheme.fontSize),
//     lineHeight: rem2px(defaultTheme.lineHeight),
//     maxWidth: ({ theme, breakpoints }) => ({
//       // @ts-expect-error
//       ...rem2px(defaultTheme.maxWidth ? defaultTheme.maxWidth({ theme, breakpoints }) : {}),
//     }),
//     spacing: rem2px(defaultTheme.spacing),
//   },
// }
