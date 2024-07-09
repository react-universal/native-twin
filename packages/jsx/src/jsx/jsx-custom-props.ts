import * as Equal from 'effect/Equal';
import * as Hash from 'effect/Hash';

// export type JSXStyledProps = [string, SheetEntry[]];

export interface JSXStyleProp {
  prop: string;
  target: string;
  className: string;
}
export class JSXStyledProps implements Equal.Equal {
  constructor(readonly styleTuples: JSXStyleProp[] = []) {}

  [Equal.symbol](that: unknown) {
    return (
      that instanceof JSXStyledProps &&
      this.styleTuples.length === that.styleTuples.length &&
      this.styleHash === that.styleHash
    );
  }

  [Hash.symbol]() {
    return Hash.string(this.styleHash + String(this.styleTuples.length));
  }

  private get styleHash() {
    return this.styleTuples.flatMap((x) => `${x.target}-${x.className}`).join('//');
  }
}
