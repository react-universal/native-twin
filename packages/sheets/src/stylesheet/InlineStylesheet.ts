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

const css = new InlineStyleSheet('text-xl leading-6 text-gray-800 group-hover:text-white');
const sheet = () => css.sheet;
sheet(); //?
