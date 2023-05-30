import type { AnyStyle } from '../types';
import { VirtualStyleSheet } from './VirtualStylesheet';

const virtualSheet = new VirtualStyleSheet();

export default class InlineStyleSheet {
  id: string;

  sheet: ReturnType<VirtualStyleSheet['injectUtilities']>;

  constructor(public classNames?: string) {
    this.sheet = virtualSheet.injectUtilities(classNames);
    this.id = this.sheet.hash;
    this.getChildStyles = this.getChildStyles.bind(this);
  }

  get metadata() {
    return {
      isGroupParent: this.sheet.isGroupParent,
      hasPointerEvents: this.sheet.hasPointerEvents,
      hasGroupEvents: this.sheet.hasGroupEvents,
    };
  }

  getStyles(input: { isPointerActive: boolean; isParentActive: boolean }) {
    const styles: AnyStyle = { ...this.sheet.baseStyles };
    if (input.isPointerActive) Object.assign(styles, this.sheet.pointerStyles);
    if (input.isParentActive) Object.assign(styles, this.sheet.groupStyles);
    return styles;
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
      Object.assign(result, this.sheet.first);
    }
    if (input.isLastChild) {
      Object.assign(result, this.sheet.last);
    }
    if (input.isEven) {
      Object.assign(result, this.sheet.even);
    }
    if (input.isOdd) {
      Object.assign(result, this.sheet.odd);
    }
    return Object.freeze(result);
  }
}
