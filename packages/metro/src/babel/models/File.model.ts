import * as Data from 'effect/Data';
import * as Equal from 'effect/Equal';
import * as Hash from 'effect/Hash';
import type { RuntimeComponentEntry } from '@native-twin/babel/build/jsx';
import type { BabelSheetEntry } from '../../sheet/Sheet.model';

export class BabelFileModel
  extends Data.Class<{
    entries: BabelSheetEntry[];
    filename: string;
    code: string;
    styledProps: Map<string, RuntimeComponentEntry[]>;
  }>
  implements Equal.Equal
{
  toBuffer() {
    return Buffer.from(this.code, 'utf-8');
  }

  [Equal.symbol](that: unknown) {
    return that instanceof BabelFileModel && this.entries.length === that.entries.length;
  }
  [Hash.symbol]() {
    return Hash.combine(Hash.string(this.filename))(Hash.number(this.entries.length));
  }
}
