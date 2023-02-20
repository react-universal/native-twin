import type { CSSProperties } from 'react';
import { twj } from '@react-universal/native-tw-to-css';
import { getStylesForProperty } from 'css-to-react-native';
import type { IStyleType } from '../types/styles.types';

const toJSSObject = (styles: CSSProperties) => {
  const parsedStyles = {};
  Object.entries(styles).map(([property, value]) => {
    const style = getStylesForProperty(property, value);
    Object.assign(parsedStyles, style);
  });
  return parsedStyles;
};

export function transformClassNames(...classes: string[]): IStyleType {
  try {
    const styles = twj(classes);
    return toJSSObject(styles);
  } catch (error) {
    console.log('ERROR TRANSFORMING CSS TO JS: ', error);
    return {};
  }
}
