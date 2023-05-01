import { StyleSheet } from 'react-native';
import { Platform } from 'react-native';
import {
  setTailwindConfig as setTwindConfig,
  transformClassNames,
} from '@universal-labs/twind-native';
import transform from 'css-to-react-native';
import type { Config } from 'tailwindcss';
import type { AnyStyle, GeneratedComponentsStyleSheet } from '../types';
import { generateComponentHashID } from '../utils/hash';
import { classNamesToArray } from '../utils/splitClasses';
import SheetsStore from './SheetsStore';
import { VirtualStyleSheet } from './VirtualStylesheet';

const store = SheetsStore.getInstance();

export function setTailwindConfig(config: Config, baseRem = 16) {
  setTwindConfig(
    {
      colors: {
        ...config.theme?.colors,
        ...config.theme?.extend?.colors,
      },
      fontFamily: { ...config.theme?.extend?.fontFamily },
    },
    baseRem,
  );
}

export const generatedComponentStylesheets: GeneratedComponentsStyleSheet = {};
const virtualSheet = new VirtualStyleSheet();

export default class InlineStyleSheet {
  id: string;
  originalClasses: readonly string[];

  styles?: {
    base: AnyStyle;
    pointerStyles: AnyStyle;
    first: AnyStyle;
    last: AnyStyle;
    even: AnyStyle;
    odd: AnyStyle;
    group: AnyStyle;
  };

  sheet: ReturnType<VirtualStyleSheet['injectUtilities']>;

  get metadata() {
    return {
      isGroupParent: this.originalClasses.includes('group'),
      hasPointerEvents: Object.keys(this.getPointerEventsSheet).length > 0,
      hasGroupEvents: this.sheet.generatedClasses.includes('group-'),
    };
  }

  constructor(public classNames?: string) {
    const cache = store.get(classNames ?? 'unstyled');
    if (cache) {
      this.sheet = cache;
    } else {
      this.sheet = virtualSheet.injectUtilities(classNames);
      store.setStyle(classNames ?? 'unstyled', this.sheet);
    }
    const transformedClasses = transformClassNames(classNames ?? '');
    const splittedClasses = classNamesToArray(transformedClasses.generated);
    this.originalClasses = Object.freeze(splittedClasses);
    this.id = generateComponentHashID(this.originalClasses.join(' ') ?? 'unstyled');
    this.getChildStyles = this.getChildStyles.bind(this);
  }

  getStyles() {
    return generatedComponentStylesheets[this.id]!;
  }

  get getBaseSheet() {
    return StyleSheet.flatten(
      this.sheet.extracted
        .filter((s) => {
          if (
            (s[0].includes('ios') || s[0].includes('web') || s[0].includes('android')) &&
            !s[0].includes('hover') &&
            !s[0].includes('focus') &&
            !s[0].includes('active')
          ) {
            return s[0].includes(Platform.OS);
          }
          return !s[0].includes(':');
        })
        .map((s) => {
          return transform(s[1]);
        }) as AnyStyle[],
    );
  }

  get groupEventsSheet() {
    return StyleSheet.flatten(
      this.sheet.extracted
        .filter((s) => {
          if (
            (s[0].includes('ios') || s[0].includes('web') || s[0].includes('android')) &&
            s[0].includes('group-hover') &&
            s[0].includes('group-focus') &&
            s[0].includes('group-active')
          ) {
            return s[0].includes(Platform.OS);
          }
          return (
            s[0].includes('group-hover') ||
            s[0].includes('group-focus') ||
            s[0].includes('group-active')
          );
        })
        .map((s) => {
          return transform(s[1]);
        }) as AnyStyle[],
    );
  }

  get getPointerEventsSheet() {
    return StyleSheet.flatten(
      this.sheet.extracted
        .filter((s) => {
          if (
            (s[0].includes('ios') || s[0].includes('web') || s[0].includes('android')) &&
            s[0].includes('hover') &&
            s[0].includes('focus') &&
            s[0].includes('active')
          ) {
            return s[0].includes(Platform.OS);
          }
          return s[0].includes('hover') || s[0].includes('focus') || s[0].includes('active');
        })
        .map((s) => {
          return transform(s[1]);
        }) as AnyStyle[],
    );
  }

  public getChildStyles(input: {
    isFirstChild: boolean;
    isLastChild: boolean;
    isEven: boolean;
    isOdd: boolean;
  }) {
    const result: AnyStyle = {};
    if (!this) return result;
    const styleSheet = generatedComponentStylesheets[this.id];
    if (styleSheet) {
      if (input.isFirstChild) {
        Object.assign(result, styleSheet.first);
      }
      if (input.isLastChild) {
        Object.assign(result, styleSheet.last);
      }
      if (input.isEven) {
        Object.assign(result, styleSheet.even);
      }
      if (input.isOdd) {
        Object.assign(result, styleSheet.odd);
      }
    }
    return Object.freeze(result);
  }
}
