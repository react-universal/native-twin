import transform from 'css-to-react-native-transform';
import { tx, tw } from '../install';
import { parseInputs } from '../utils/classNamesParser';

const transformSingleRule = (rule: string) => {
  try {
    const transformed = transform(rule, { parseMediaQueries: true });
    let styles = {};
    Object.values(transformed).forEach((item) => {
      styles = {
        ...styles,
        // @ts-expect-error
        ...item,
      };
    });
    return styles;
  } catch (error) {
    console.log('ERROR_transformSingleRule: ', error);
    return {};
  }
};

const processTarget = (target: string[] = []) => {
  let styles = {};
  target.forEach((item) => {
    styles = {
      ...styles,
      ...transformSingleRule(item),
    };
  });
  return styles;
};
export function parseClassNames(...classes: string[]) {
  // tw$.clear();
  tx(...classes);
  console.log('TARGET: ', tw.target);
  console.log('PARSED: ', parseInputs(classes));
  const styles = processTarget(tw.target);
  return {
    styles,
  };

  // const root = postcss.parse(tw.target);
  // const styleObject = postCssJS.objectify(root);
  // Object.values(styleObject).forEach((item) => {
  //   styles = {
  //     ...styles,
  //     ...item,
  //   };
  // });
  // console.log('STYLES: ', styleObject);
}
