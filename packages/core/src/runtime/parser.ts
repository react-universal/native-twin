import postcss from 'postcss';
import postCssJS from 'postcss-js';
import { tx, tw } from '../install';
import { parseInputs } from '../internalStore/parse-inputs';

export function parseClassNames(...classes: string[]) {
  // tw$.clear();
  let styles = {};
  console.log('PARSED: ', parseInputs(classes));
  tx(...classes);
  const root = postcss.parse(tw.target);
  const styleObject = postCssJS.objectify(root);
  Object.values(styleObject).forEach((item) => {
    styles = {
      ...styles,
      ...item,
    };
  });

  return {
    styleObject,
    styles,
  };
}
