import { StyleSheet } from 'react-native';
import { tailwindToCSS } from '@universal-labs/core';
import { reactNativeTailwindPreset } from '@universal-labs/core/tailwind/preset';
import type { Config } from 'tailwindcss';
import type {
  AnyStyle,
  AtomStyle,
  GeneratedAtomsStyle,
  GeneratedComponentsStyleSheet,
} from '../types';
import { cssPropertiesResolver } from '../utils';
import { generateComponentHashID } from '../utils/hash';
import { classNamesToArray, extractClassesGroups } from '../utils/splitClasses';

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
const atomsStyles: GeneratedAtomsStyle = {};

export default class InlineStyleSheet {
  id: string;
  originalClasses: readonly string[];
  classes: {
    baseClasses: string[];
    pointerEventsClasses: string[];
    groupEventsClasses: string[];
    platformClasses: string[];
    childClasses: {
      first: string[];
      last: string[];
      even: string[];
      odd: string[];
    };
    appearanceClasses: string[];
  };

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
    this.originalClasses = classNamesToArray(this.classNames);
    this.id = generateComponentHashID(this.classNames ?? 'unstyled');
    this.classes = extractClassesGroups(this.originalClasses);
    if (this.classes.pointerEventsClasses.length > 0) {
      this.metadata.hasPointerEvents = true;
    }
    if (this.classes.groupEventsClasses.length > 0) {
      this.metadata.hasGroupEvents = true;
    }
    if (this.originalClasses.includes('group')) {
      this.metadata.isGroupParent = true;
    }
    this.getChildStyles = this.getChildStyles.bind(this);
  }

  create() {
    if (this.id in generatedComponentStylesheets) {
      return generatedComponentStylesheets[this.id]!;
    }
    generatedComponentStylesheets[this.id] = StyleSheet.create({
      base: this.getStylesObject(this.classes.baseClasses),
      pointerStyles: this.getStylesObject(this.classes.pointerEventsClasses),
      first: this.getStylesObject(this.classes.childClasses.first),
      last: this.getStylesObject(this.classes.childClasses.last),
      even: this.getStylesObject(this.classes.childClasses.even),
      odd: this.getStylesObject(this.classes.childClasses.odd),
      group: this.getStylesObject(this.classes.groupEventsClasses),
    });

    return generatedComponentStylesheets[this.id]!;
  }

  getStylesObject(classes: string[]): AnyStyle {
    const result: AtomStyle = {};
    for (const currentClass of classes) {
      if (currentClass in atomsStyles) {
        Object.assign(result, atomsStyles[currentClass]);
        continue;
      }
      const compiledClass = css.twj(currentClass);
      if (Object.keys(compiledClass).length === 0) {
        continue;
      }
      const styles = cssPropertiesResolver(compiledClass);
      Object.defineProperty(atomsStyles, currentClass, {
        enumerable: true,
        configurable: true,
        writable: false,
        value: styles,
      });
      Object.assign(result, styles);
    }
    return result;
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
