import type { ImageStyle, TextStyle, ViewStyle } from 'react-native';

export type SelectorGroup = 'base' | 'group' | 'pointer' | 'first' | 'last' | 'odd' | 'even';

export type AnyStyle = ImageStyle | TextStyle | ViewStyle;

type CSSUnits =
  | 'em'
  | 'rem'
  | 'px'
  | 'cn'
  | 'vh'
  | 'vw'
  | 'deg'
  | 'ex'
  | 'in'
  | '%'
  | 'turn'
  | 'rad'
  | 'none';

export type CSSLengthUnit = {
  [U in CSSUnits]: {
    value: number;
    units: U;
  };
}[CSSUnits];

type CSSPointerEventKind = 'hover' | 'active' | 'focus';

export type CSSPointerEvent = {
  [U in CSSPointerEventKind]: {
    value: number;
    unit: U;
  };
}[CSSPointerEventKind];
