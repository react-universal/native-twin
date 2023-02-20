import { tailwindInlineCSS } from '@react-universal/native-tw-to-css';
import transform from 'css-to-react-native-transform';
import postcss from 'postcss';
import postcssVariables from 'postcss-css-variables';
import postcssJs from 'postcss-js';
import defaultTheme from 'tailwindcss/defaultTheme';
import { tx, tw } from '../twind';
import type { IStyleType } from '../types/styles.types';

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

const twj = tailwindInlineCSS({
  theme: {
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

const transformCssOutput = (css: string) => {
  console.log('CSS: ', css);
  const styles = transform(css);
  const values = Object.values(styles).reduce<Record<string, any>>((prev, curr) => {
    return Object.assign(prev, curr);
  }, {});
  return values;
};

const toJSSObject = (cssText: string) => {
  // let root = postcss.parse(cssText);
  const { root, css } = postcss([postcssVariables()]).process(cssText);
  return {
    object: postcssJs.objectify(root),
    css,
  };
};

export function parseSingleClassName(className: string) {
  try {
    tx(className);
    const output = toJSSObject(tw.target.join(' '));
    return transform(output.css);
  } catch (error) {
    console.log('ERROR TRANSFORMING CSS TO JS: ', error);
    return {};
  }
}

export function transformClassNames(...classes: string[]): IStyleType {
  try {
    tx(...classes);
    const output = toJSSObject(tw.target.join(' '));
    tw.clear();
    try {
      const exp = twj(classes);
      console.log('EXP: ', exp);
    } catch (error) {
      console.log('ERROR: ', error);
    }
    return transformCssOutput(output.css);
  } catch (error) {
    console.log('ERROR TRANSFORMING CSS TO JS: ', error);
    return {};
  }
}
