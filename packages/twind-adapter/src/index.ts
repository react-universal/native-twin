import toRNStyles from 'css-to-react-native';
import postcss from 'postcss';
import postcssVariables from 'postcss-css-variables';
import postcssJs from 'postcss-js';
import { tx, tw } from './client';

const toJSSObject = (cssText: string) => {
  // let root = postcss.parse(cssText);
  const { root, css } = postcss([postcssVariables()]).process(cssText);
  return {
    object: postcssJs.objectify(root),
    css,
  };
};

const parseObjectValuesAsStrings = (object: any) => {
  return Object.entries(object).reduce(
    (previous, [key, value]) => {
      if (typeof value === 'object') {
        Object.assign(previous, { [key]: parseObjectValuesAsStrings(value) });
      } else {
        Object.assign(previous, { [key]: String(value) });
      }
      return previous;
    },
    {} as {
      [key: string]: string;
    },
  );
};

export function transformClassNames(...classes: string[]) {
  try {
    console.log('INCOMING: ', classes);
    tx(...classes);
    const output = toJSSObject(tw.target.join(' '));
    return output;

    const transformed = Object.values(output.object).reduce((previous, current) => {
      // if (name === 'colorScheme' || name === 'from' || name === 'to' || name === ':root')
      console.log('INFO: ', current);
      const toRN = toRNStyles(Object.entries(parseObjectValuesAsStrings(current)));
      console.log('RN: ', toRN);
      return Object.assign(previous, toRN);
      // previous = Object.assign(previous, getStylesForProperty(name, String(value)));
      // return previous;
    }, {} as any);
    console.log('TRANSFORMED: ', transformed);
    return transformed;
  } catch (error) {
    console.log('ERROR TRANSFORMING CSS TO JS: ', error);
    return {};
  }
}

export { tw, tx };
