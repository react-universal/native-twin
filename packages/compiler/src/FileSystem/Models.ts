import * as Equal from 'effect/Equal';
import * as Hash from 'effect/Hash';
import type { TwinPath } from '../internal/fs';

export class TwinFileResult implements Equal.Equal {
  constructor(
    readonly filename: TwinPath.FullFilePath,
    readonly content: string,
  ) {}

  [Equal.symbol](that: unknown): boolean {
    return (
      that instanceof TwinFileResult &&
      that.filename === this.filename &&
      that[Hash.symbol]() === this[Hash.symbol]()
    );
  }

  [Hash.symbol](): number {
    return Hash.combine(Hash.string(this.filename))(Hash.string(this.content));
  }
}
