import transform from 'css-to-react-native-transform';
import postcss from 'postcss';
import postcssVariables from 'postcss-css-variables';
import postcssJs from 'postcss-js';
import { tx, tw } from '../twind';

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

export function parseClassNames(...classes: string[]) {
  try {
    tx(...classes);
    const output = toJSSObject(tw.target.join(' '));
    console.log('OUTPUT: ', output);
    tw.clear();
    return transform(output.css);
  } catch (error) {
    console.log('ERROR TRANSFORMING CSS TO JS: ', error);
    return {};
  }
}
