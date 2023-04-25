import type { AnyStyle } from '../types';

export default class StyleAtom {
  className: string;
  style: AnyStyle;
  constructor(className: string, style: AnyStyle) {
    this.className = className;
    this.style = style;
  }
}
