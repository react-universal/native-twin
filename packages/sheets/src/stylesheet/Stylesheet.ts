import { Platform, StyleSheet } from 'react-native';
import { transformClassNames, tw } from '@universal-labs/twind-native';
// import { reactNativeTailwindPreset } from '@universal-labs/core/tailwind/preset';
import type { Config } from 'tailwindcss';
import type { AnyStyle, GeneratedComponentsStyleSheet } from '../types';
import { generateComponentHashID } from '../utils/hash';
import { classNamesToArray } from '../utils/splitClasses';

// import SimpleLRU from './SimpleLRU';

// let currentTailwindConfig: Config = {
//   content: ['__'],
//   corePlugins: { preflight: false },
//   presets: [reactNativeTailwindPreset({ baseRem: 16 })],
// };

let currentTailwindConfig: Config = { content: ['__'] };

export function setTailwindConfig(config: Config) {
  currentTailwindConfig = config;
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
    // TODO: Finalize test case
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
    for (const current of splittedClasses) {
      const fullStyles = transformClassNames(current) as any;
      console.log('CURRENT_FULL: ', fullStyles);
      if (
        current.includes('hover') ||
        current.includes('focus') ||
        current.includes('active')
      ) {
        pointerStyles.push(fullStyles);
        this.metadata.hasPointerEvents = true;
        continue;
      }
      if (
        current.includes('group-hover') ||
        current.includes('group-focus') ||
        current.includes('group-active')
      ) {
        groupStyles.push(fullStyles);
        this.metadata.hasGroupEvents = true;
        continue;
      }
      if (current.includes('odd')) {
        // childStyles.odd.push(fullStyles);
        continue;
      }
      if (current.includes('even')) {
        // childStyles.even.push(fullStyles);
        continue;
      }
      if (current.includes('first')) {
        // childStyles.first.push(fullStyles);
        continue;
      }
      if (current.includes('last')) {
        // childStyles.last.push(fullStyles);
        continue;
      }
      if (current.includes(`${Platform.OS}`)) {
        platformStyles.push(fullStyles);
        continue;
      }
      baseStyles.push(fullStyles);
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
    console.log('STYLES: ', this.styles);
    generatedComponentStylesheets[this.id] = this.styles;
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
