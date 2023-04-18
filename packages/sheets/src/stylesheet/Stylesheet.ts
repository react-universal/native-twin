import { Platform, StyleSheet } from 'react-native';
import { tailwindToCSS } from '@universal-labs/core';
import { reactNativeTailwindPreset } from '@universal-labs/core/tailwind/preset';
import type { Config } from 'tailwindcss';
import type { AnyStyle, GeneratedComponentsStyleSheet } from '../types';
import { cssPropertiesResolver } from '../utils';
import { generateComponentHashID } from '../utils/hash';
import { classNamesToArray } from '../utils/splitClasses';

let currentTailwindConfig: Config = {
  content: ['__'],
  corePlugins: { preflight: false },
  presets: [reactNativeTailwindPreset({ baseRem: 16 })],
};

let css = tailwindToCSS({
  config: currentTailwindConfig,
  options: {
    ignoreMediaQueries: false,
    merge: false,
    minify: false,
  },
});

export function setTailwindConfig(config: Config) {
  currentTailwindConfig = config;
  css = tailwindToCSS({
    config,
    options: {
      ignoreMediaQueries: false,
      merge: false,
      minify: false,
    },
  });
}

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

  constructor(public classNames?: string) {
    const splittedClasses = classNamesToArray(this.classNames);
    this.originalClasses = Object.freeze(splittedClasses);
    this.id = generateComponentHashID(this.originalClasses.join(' ') ?? 'unstyled');
    if (this.originalClasses.includes('group')) {
      this.metadata.isGroupParent = true;
    }
    this.getChildStyles = this.getChildStyles.bind(this);

    const fullStyles = css.twj(this.originalClasses.join(' '));
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
    for (const current of Object.keys(fullStyles)) {
      if (
        current.includes('.hover') ||
        current.includes('.focus') ||
        current.includes('.active')
      ) {
        pointerStyles.push(cssPropertiesResolver(fullStyles[current]));
        this.metadata.hasPointerEvents = true;
        continue;
      }
      if (
        current.includes('.group-hover') ||
        current.includes('.group-focus') ||
        current.includes('.group-active')
      ) {
        groupStyles.push(cssPropertiesResolver(fullStyles[current]));
        this.metadata.hasGroupEvents = true;
        continue;
      }
      if (current.includes('.odd')) {
        // childStyles.odd.push(cssPropertiesResolver(fullStyles[current]));
        continue;
      }
      if (current.includes('.even')) {
        // childStyles.even.push(cssPropertiesResolver(fullStyles[current]));
        continue;
      }
      if (current.includes('.first')) {
        // childStyles.first.push(cssPropertiesResolver(fullStyles[current]));
        continue;
      }
      if (current.includes('.last')) {
        // childStyles.last.push(cssPropertiesResolver(fullStyles[current]));
        continue;
      }
      if (current.includes(`.${Platform.OS}`)) {
        platformStyles.push(cssPropertiesResolver(fullStyles[current]));
        continue;
      }
      if (!current.includes(':')) {
        // If does not match any other then is a base style
        baseStyles.push(cssPropertiesResolver(fullStyles[current]));
      }
    }
    if (!generatedComponentStylesheets[this.id]) {
      generatedComponentStylesheets[this.id] = StyleSheet.create({
        base: StyleSheet.flatten(baseStyles),
        pointerStyles: StyleSheet.flatten(pointerStyles),
        first: StyleSheet.flatten(childStyles.first),
        last: StyleSheet.flatten(childStyles.last),
        even: StyleSheet.flatten(childStyles.even),
        odd: StyleSheet.flatten(childStyles.odd),
        group: StyleSheet.flatten(groupStyles),
      });
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
}
