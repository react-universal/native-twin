import type { CompleteStyle } from '@native-twin/css';
import type { TwinRuntimeComponent } from '@native-twin/css/jsx';

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

export interface TwinComponentGetterOptions {
  withPointer: boolean;
  withGroup: boolean;
  getProp?: (prop: string) => string | null;
}

export const EMPTY_RN_STYLES = Object.freeze({});

export const EMPTY_STYLE_REGISTRY: ComponentStyleRegistry = Object.freeze({
  id: '___Null_',
  props: [],
  readClassProp: () => null,
} satisfies ComponentStyleRegistry);

export const EMPTY_TWIN_RUNTIME_COMPONENT: TwinRuntimeComponent = {
  childIds: [],
  childStyles: [],
  id: '____Empty',
  index: -1,
  metadata: { hasGroupEvents: false, hasPointerEvents: false, isGroupParent: false },
  parentID: null,
  parentSize: 0,
  props: [],
};
