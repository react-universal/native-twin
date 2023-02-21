import type { CSSProperties } from 'react';
import { setup } from '@react-universal/tailwind';
import type { CssInJs } from 'postcss-js';
import type { IStyleType } from '../types/styles.types';

const twj = setup({ content: ['__'] });

const toRNStyles = (JSS: CssInJs) => {
  const cssStyles = Object.entries(JSS)
    .map(([, cssValue]): CSSProperties => {
      return cssValue;
    })
    .map((cssProperties) => {
      console.log('CSS_PROP: ', cssProperties);
      return cssProperties;
    });
  console.log('CSS_STYLES: ', cssStyles);
  return {};
};

export function transformClassNames(...classes: string[]): IStyleType {
  try {
    console.log('CLASSES: ', classes);
    const styles = twj(classes.join(' '));
    console.log('STYLES: ', styles);
    return toRNStyles(styles.JSS);
  } catch (error) {
    console.log('ERROR TRANSFORMING CSS TO JS: ', error);
    return {};
  }
}
