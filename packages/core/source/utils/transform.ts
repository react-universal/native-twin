import transform, { StyleTuple } from 'css-to-react-native';
import postcss from 'postcss';
import postcssJs from 'postcss-js';

const toJSSObject = (cssText) => {
  const root = postcss.parse(cssText);
  return postcssJs.objectify(root);
};

export const toJSS = (cssText) => {
  try {
    return JSON.stringify(toJSSObject(cssText), null, 2);
  } catch (e) {
    return 'Error translating CSS to JSS';
  }
};

export const toRN = (cssText) => {
  try {
    const output = toJSSObject(cssText);
    const result: StyleTuple[] = Object.keys(output).map((rules) => [rules, output[rules]]);
    return JSON.stringify(transform(result), null, 2);
  } catch (e) {
    return 'Error translating CSS to RN';
  }
};
