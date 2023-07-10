import type { AnyStyle } from '@universal-labs/css';
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
    const styles: AnyStyle = { ...this.sheet.styles.base };
    if (input.isPointerActive) Object.assign(styles, { ...this.sheet.styles.pointer });
    if (input.isParentActive) Object.assign(styles, { ...this.sheet.styles.group });
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
      Object.assign(result, this.sheet.styles.first);
    }
    if (input.isLastChild) {
      Object.assign(result, this.sheet.styles.last);
    }
    if (input.isEven) {
      Object.assign(result, this.sheet.styles.even);
    }
    if (input.isOdd) {
      Object.assign(result, this.sheet.styles.odd);
    }
    return Object.freeze(result);
  }
}
