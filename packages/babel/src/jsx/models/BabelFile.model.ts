import * as Equal from 'effect/Equal';
import { pipe } from 'effect/Function';
import * as Hash from 'effect/Hash';
import { RawJSXElementTreeNode } from '@native-twin/css/jsx';

export class TwinBabelFile implements Equal.Equal {
  constructor(
    readonly data: {
      readonly code: string;
      readonly filename: string;
      readonly type: string;
      readonly platform: string;
    },
    readonly tree: RawJSXElementTreeNode,
  ) {} 

  [Equal.symbol](that: unknown): boolean {
    return that instanceof TwinBabelFile && this.data.filename === that.data.filename;
  }
  [Hash.symbol](): number {
    return pipe(
      Hash.string(this.data.filename),
      Hash.combine(Hash.string(this.data.platform)),
      Hash.combine(Hash.string(this.data.type)),
    );
  }
}
