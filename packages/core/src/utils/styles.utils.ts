import { getStylesForProperty } from 'css-to-react-native';
import type { CssInJs } from 'postcss-js';
import type { IStyleType } from '../types/styles.types';

export function cssPropertiesResolver(input: CssInJs) {
  try {
    const keys = Object.keys(input);
    const styles: IStyleType = {};
    keys.forEach((className) => {
      const style = input[className];
      const transformed = Object.entries(style).reduce((previous, [name, value]) => {
        if (
          name === 'colorScheme' ||
          name === 'from' ||
          name === 'to' ||
          name === 'fontFamily' ||
          name === ':root'
        )
          return previous;
        previous = Object.assign(previous, getStylesForProperty(name, String(value)));
        return previous;
      }, {} as IStyleType);
      Object.assign(styles, transformed);
    });
    return styles;
    // return normalizeStyles(transform(input.trim()));
    // return transform(input);
  } catch (error) {
    console.log('cssPropertiesResolver_ERROR: ', error);
    return {};
  }
}
