import type { CSSProperties } from 'react';
import { twj } from '@react-universal/native-tw-to-css';
import { getStylesForProperty } from 'css-to-react-native';
import type { IStyleType } from '../types/styles.types';

const toJSSObject = (styles: CSSProperties) => {
  const parsedStyles = {};
  console.group('STYLES');
  console.log('UN_PARSED: ', styles);
  Object.entries(styles).map(([property, value]) => {
    const style = getStylesForProperty(property, value);
    console.log('PARSED: ', style);
    Object.assign(parsedStyles, style);
  });
  console.groupEnd();
  return parsedStyles;
};

export function transformClassNames(...classes: string[]): IStyleType {
  try {
    const styles = twj(classes);
    console.log('CLASSES: ', classes);
    return toJSSObject(styles);
  } catch (error) {
    console.log('ERROR TRANSFORMING CSS TO JS: ', error);
    return {};
  }
}
