import { StyleSheet } from 'react-native';
import { setup } from '@universal-labs/core';
import { reactNativeTailwindPreset } from '@universal-labs/core/tailwind/preset';
import type { CssInJs } from 'postcss-js';
import type { Config } from 'tailwindcss';
import type {
  AnyStyle,
  AtomStyle,
  ComponentStylesheet,
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

let css = setup(currentTailwindConfig);

export function setTailwindConfig(config: Config) {
  currentTailwindConfig = config;
  css = setup(config);
}

export const generatedComponentStylesheets: GeneratedComponentsStyleSheet = {};
const atomsStyles: GeneratedAtomsStyle = {};

export default class InlineStyleSheet {
  id: string;
  classes: {
    originalClasses: readonly string[];
    baseClasses: string[];
    pointerEventsClasses: string[];
    groupEventsClasses: string[];
    platformClasses: string[];
    childClasses: string[];
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
    const originalClassNamesArray = classNamesToArray(this.classNames);
    this.id = generateComponentHashID(this.classNames ?? 'unstyled');
    this.classes = extractClassesGroups(originalClassNamesArray);
    if (this.classes.pointerEventsClasses.length > 0) {
      this.metadata.hasPointerEvents = true;
    }
    if (this.classes.groupEventsClasses.length > 0) {
      this.metadata.hasGroupEvents = true;
    }
    if (originalClassNamesArray.includes('group')) {
      this.metadata.isGroupParent = true;
    }
  }

  create() {
    if (this.id in generatedComponentStylesheets) {
      return generatedComponentStylesheets[this.id];
    }
    const baseStyles = this.getStylesObject(css(this.classes.baseClasses.join(' ')));

    return baseStyles;
  }

  getStylesObject(CssInJS: CssInJs): AnyStyle {
    const result: AtomStyle = {};
    for (const currentClass of Object.keys(CssInJS)) {
      let cssProp = currentClass.replace('.', '');
      cssProp = cssProp.replace(/\\/g, '');
      if (cssProp in atomsStyles) {
        Object.assign(result, atomsStyles[cssProp]);
        continue;
      }
      const styles = cssPropertiesResolver({
        [cssProp]: CssInJS[currentClass],
      });
      Object.defineProperty(atomsStyles, cssProp, {
        enumerable: true,
        configurable: true,
        writable: false,
        value: styles,
      });
      Object.assign(result, styles);
    }
    return result;
  }

  generateStyleSheet() {
    return StyleSheet.create<ComponentStylesheet>({
      active: {},
      base: {},
      focus: {},
      hover: {},
      children: {},
    });
  }
}
