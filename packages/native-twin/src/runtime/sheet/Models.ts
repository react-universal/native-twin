import type { CompleteStyle } from '@native-twin/css';

export interface ClassnameStyles {
  base: CompleteStyle;
  pointer: CompleteStyle;
  dark: CompleteStyle;
  group: CompleteStyle;
}

export interface TwinComponentStyleProp {
  text: string;
  classname: string;
  prop: string;
  target: string;
  styles: ClassnameStyles;
  expression: string | null;
}
export interface ComponentStyleRegistry {
  id: string;
  readClassProp: (prop: string) => string | null;
  props: TwinComponentStyleProp[];
}

export type ReadClassNameProp = (prop: string) => string | undefined;

export const EMPTY_RN_STYLES = Object.freeze({});

export const emptyComponent: ComponentStyleRegistry = Object.freeze({
  id: '___Null_',
  props: [],
  readClassProp: () => null,
} satisfies ComponentStyleRegistry);