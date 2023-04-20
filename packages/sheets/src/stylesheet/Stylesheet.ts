import { Platform, StyleSheet } from 'react-native';
import {
  transformClassNames,
  setTailwindConfig as setTwindConfig,
} from '@universal-labs/twind-native';
import postcss from 'postcss';
import postcssVariables from 'postcss-css-variables';
import postcssJs from 'postcss-js';
// import { reactNativeTailwindPreset } from '@universal-labs/core/tailwind/preset';
import type { Config } from 'tailwindcss';
import type { AnyStyle, GeneratedComponentsStyleSheet } from '../types';
import { cssPropertiesResolver } from '../utils';
import { generateComponentHashID } from '../utils/hash';
import { classNamesToArray } from '../utils/splitClasses';

// import SimpleLRU from './SimpleLRU';

// let currentTailwindConfig: Config = {
//   content: ['__'],
//   corePlugins: { preflight: false },
//   presets: [reactNativeTailwindPreset({ baseRem: 16 })],
// };

export function setTailwindConfig(config: Config) {
  setTwindConfig({
    colors: {
      ...config.theme?.colors,
      ...config.theme?.extend?.colors,
    },
    // @ts-expect-error
    fontFamily: { ...config.theme?.extend?.fontFamily },
  });
}

// const cache = new SimpleLRU(100);

export const generatedComponentStylesheets: GeneratedComponentsStyleSheet = {};

export default class InlineStyleSheet {
  id: string;
  originalClasses: readonly string[];

  metadata = {
    parentID: '',
    groupID: '',
    isFirstChild: false,
    isLastChild: false,
    nthChild: -1,
    isGroupParent: false,
    hasPointerEvents: false,
    hasGroupEvents: false,
  };

  styles: {
    base: AnyStyle;
    pointerStyles: AnyStyle;
    first: AnyStyle;
    last: AnyStyle;
    even: AnyStyle;
    odd: AnyStyle;
    group: AnyStyle;
  };

  constructor(public classNames?: string) {
    const splittedClasses = classNamesToArray(this.classNames);
    this.originalClasses = Object.freeze(splittedClasses);
    this.id = generateComponentHashID(this.originalClasses.join(' ') ?? 'unstyled');
    if (this.originalClasses.includes('group')) {
      this.metadata.isGroupParent = true;
    }
    this.getChildStyles = this.getChildStyles.bind(this);
    if (generatedComponentStylesheets[this.id]) {
      this.styles = generatedComponentStylesheets[this.id]!;
      if (Object.keys(this.styles.group).length > 0) {
        this.metadata.hasGroupEvents = true;
      }
      if (Object.keys(this.styles.pointerStyles).length > 0) {
        this.metadata.hasPointerEvents = true;
      }
    } else {
      const baseStyles: AnyStyle[] = [];
      const pointerStyles: AnyStyle[] = [];
      const groupStyles: AnyStyle[] = [];
      const platformStyles: AnyStyle[] = [];
      const childStyles = {
        first: [] as AnyStyle[],
        last: [] as AnyStyle[],
        even: [] as AnyStyle[],
        odd: [] as AnyStyle[],
      };
      const css = transformClassNames(...splittedClasses);
      const JSS = toJSSObject(css);
      for (const current of Object.entries(JSS.object)) {
        const [className, styles] = current;
        if (
          className.includes('.hover') ||
          className.includes('.focus') ||
          className.includes('.active')
        ) {
          pointerStyles.push(cssPropertiesResolver(styles));
          this.metadata.hasPointerEvents = true;
          continue;
        }
        if (
          className.includes('.group-hover') ||
          className.includes('.group-focus') ||
          className.includes('.group-active')
        ) {
          groupStyles.push(cssPropertiesResolver(styles));
          this.metadata.hasGroupEvents = true;
          continue;
        }
        if (className.includes('.odd')) {
          childStyles.odd.push(cssPropertiesResolver(styles));
          continue;
        }
        if (className.includes('.even')) {
          childStyles.even.push(cssPropertiesResolver(styles));
          continue;
        }
        if (className.includes('.first')) {
          childStyles.first.push(cssPropertiesResolver(styles));
          continue;
        }
        if (className.includes('.last')) {
          childStyles.last.push(cssPropertiesResolver(styles));
          continue;
        }
        if (className.includes(`.${Platform.OS}`)) {
          platformStyles.push(cssPropertiesResolver(styles));
          continue;
        }
        if (!className.includes(':')) {
          baseStyles.push(cssPropertiesResolver(styles));
        }
      }
      this.styles = StyleSheet.create({
        base: StyleSheet.flatten(baseStyles),
        pointerStyles: StyleSheet.flatten(pointerStyles),
        first: StyleSheet.flatten(childStyles.first),
        last: StyleSheet.flatten(childStyles.last),
        even: StyleSheet.flatten(childStyles.even),
        odd: StyleSheet.flatten(childStyles.odd),
        group: StyleSheet.flatten(groupStyles),
      });
      generatedComponentStylesheets[this.id] = this.styles;
    }
  }

  getStyles() {
    return generatedComponentStylesheets[this.id]!;
  }

  public getChildStyles(input: {
    isFirstChild: boolean;
    isLastChild: boolean;
    isEven: boolean;
    isOdd: boolean;
  }) {
    const result: AnyStyle = {};
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

  getClassNameData(className: string) {
    if (
      className.includes('hover') ||
      className.includes('focus') ||
      className.includes('active')
    ) {
      // pointerStyles.push(fullStyles);
      // this.metadata.hasPointerEvents = true;
      return {
        kind: 'pointerEvent',
        className,
      };
    }
    if (
      className.includes('group-hover') ||
      className.includes('group-focus') ||
      className.includes('group-active')
    ) {
      // groupStyles.push(fullStyles);
      this.metadata.hasGroupEvents = true;
      return {
        kind: 'group',
        className,
      };
    }
    if (className.includes('odd')) {
      // childStyles.odd.push(fullStyles);
      return {
        kind: 'odd',
        className,
      };
    }
    if (className.includes('even')) {
      // childStyles.even.push(fullStyles);
      return {
        kind: 'even',
        className,
      };
    }
    if (className.includes('first')) {
      // childStyles.first.push(fullStyles);
      return {
        kind: 'first',
        className,
      };
    }
    if (className.includes('last')) {
      // childStyles.last.push(fullStyles);
      return {
        kind: 'last',
        className,
      };
    }
    if (className.includes(`.${Platform.OS}`)) {
      return {
        kind: 'platform',
        className,
      };
    }
    return {
      kind: 'base',
      className,
    };
  }

  // parseClasses(...classes: string[]) {
  //   classes.forEach((current) => {
  //     const stored = cache.get(current);
  //     if (stored) {

  //     }
  //   });
  // }
}

const toJSSObject = (cssText: string) => {
  // let root = postcss.parse(cssText);
  const { root, css } = postcss([postcssVariables()]).process(cssText);
  return {
    object: postcssJs.objectify(root),
    css,
  };
};
