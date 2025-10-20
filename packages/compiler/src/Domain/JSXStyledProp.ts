import type { TWParsedRule } from '@native-twin/css';
import * as Data from 'effect/Data';
import * as Option from 'effect/Option';
import type { JSXAttributePath } from '../Babel';

export class TwinJSXClassnameProp extends Data.Class<{
  ast: JSXAttributePath;
  text: string;
  expression: Option.Option<string>;
  twinRules: TWParsedRule[];
  prop: string;
  target: string;
}> {
  get hasExpression() {
    return Option.isSome(this.expression);
  }
}

// export class TwinStyledProp extends Data.Class<{
//   readonly prop: TwinJSXClassnameProp;
//   readonly entries: SheetEntry[];
// }> {
//   get parsedEntries() {
//     return this.entries.map((x) => new SheetEntryParser(x));
//   }
// }
