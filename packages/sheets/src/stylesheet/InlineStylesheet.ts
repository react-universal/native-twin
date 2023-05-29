import type { AnyStyle } from '../types';
import { VirtualStyleSheet } from './VirtualStylesheet';

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
    if (typeof this.sheet.baseStyles === 'function') {
      return this.sheet.baseStyles();
    }
    return this.sheet.baseStyles;
  }

  get groupEventsSheet() {
    if (typeof this.sheet.groupStyles === 'function') {
      return this.sheet.groupStyles();
    }
    return this.sheet.groupStyles;
  }

  get getPointerEventsSheet() {
    if (typeof this.sheet.pointerStyles === 'function') {
      return this.sheet.pointerStyles();
    }
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
    if (input.isFirstChild) {
      Object.assign(
        result,
        typeof this.sheet.first === 'function' ? this.sheet.first() : this.sheet.first,
      );
    }
    if (input.isLastChild) {
      Object.assign(
        result,
        typeof this.sheet.last === 'function' ? this.sheet.last() : this.sheet.last,
      );
    }
    if (input.isEven) {
      Object.assign(
        result,
        typeof this.sheet.even === 'function' ? this.sheet.even() : this.sheet.even,
      );
    }
    if (input.isOdd) {
      Object.assign(
        result,
        typeof this.sheet.odd === 'function' ? this.sheet.odd() : this.sheet.odd,
      );
    }
    return Object.freeze(result);
  }
}
