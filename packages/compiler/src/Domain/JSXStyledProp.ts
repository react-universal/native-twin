import type { TWParsedRule } from '@native-twin/css';
import * as Data from 'effect/Data';
import * as Option from 'effect/Option';
import type { JSXAttributePath } from '../Babel';

const Constructor = Data.Class<{
  ast: JSXAttributePath;
  text: string;
  expression: Option.Option<string>;
  twinRules: TWParsedRule[];
  prop: string;
  target: string;
}>;

export class TwinJSXClassnameProp extends Constructor {
  // private _ownTwinRules: TWParsedRule[] | null = null;
  // private _childRules: TWParsedRule[] | null = null;
  constructor(input: InstanceType<typeof Constructor>) {
    super(input);
  }

  get classname() {
    return Option.getOrElse(this.expression, () => '').concat(this.text);
  }

  // get ownRules() {
  //   if (!this._ownTwinRules) {
  //     this._ownTwinRules = this.twinRules.filter((x) => {
  //       const variants = getRuleSelectorGroups(x.v);
  //       return !variants.some(Predicates.isChildSelector);
  //     });
  //   }
  //   return this._ownTwinRules;
  // }

  // get childRules() {
  //   if (!this._childRules) {
  //     this._childRules = this.twinRules.filter((x) => {
  //       const variants = getRuleSelectorGroups(x.v);
  //       return variants.some(Predicates.isChildSelector);
  //     });
  //   }
  //   return this._childRules;
  // }

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
