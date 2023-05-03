import { StyleSheet } from 'react-native';
import type { AnyStyle, GeneratedComponentsStyleSheet } from '../types';
import { generateComponentHashID } from '../utils/hash';
import { classNamesToArray } from '../utils/splitClasses';
import { VirtualStyleSheet } from './VirtualStylesheet';

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
      isGroupParent: this.sheet.isGroupParent,
      hasPointerEvents: this.sheet.hasPointerEvents,
      hasGroupEvents: this.sheet.hasGroupeEvents,
    };
  }

  constructor(public classNames?: string) {
    this.sheet = virtualSheet.injectUtilities(classNames);
    const transformedClasses = virtualSheet.transformClassNames(classNames ?? '');
    const splittedClasses = classNamesToArray(transformedClasses.generated);
    this.originalClasses = Object.freeze(splittedClasses);
    this.id = generateComponentHashID(this.originalClasses.join(' ') ?? 'unstyled');
    this.getChildStyles = this.getChildStyles.bind(this);
  }

  getStyles() {
    return generatedComponentStylesheets[this.id]!;
  }

  get getBaseSheet() {
    return StyleSheet.flatten(this.sheet.baseUtilities);
  }

  get groupEventsSheet() {
    return StyleSheet.flatten(this.sheet.groupStyles);
  }

  get getPointerEventsSheet() {
    return StyleSheet.flatten(this.sheet.pointerStyles);
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
