import type { AnyStyle, GeneratedComponentsStyleSheet } from '../types';
import { VirtualStyleSheet } from './VirtualStylesheet';

export const generatedComponentStylesheets: GeneratedComponentsStyleSheet = {};
const virtualSheet = new VirtualStyleSheet();

export default class InlineStyleSheet {
  id: string;

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
    this.id = this.sheet.hash;
    this.getChildStyles = this.getChildStyles.bind(this);
  }

  get getBaseSheet() {
    return this.sheet.baseStyles;
  }

  get groupEventsSheet() {
    return this.sheet.groupStyles;
  }

  get getPointerEventsSheet() {
    return this.sheet.pointerStyles;
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
