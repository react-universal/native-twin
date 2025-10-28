import type { TWParsedRule } from '@native-twin/css';
import * as Data from 'effect/Data';
import * as Option from 'effect/Option';
import type { JSXAttributePath } from '../Babel';
import type { JSXClassPropExpression } from '../Babel/Models';

const Constructor = Data.Class<{
  ast: JSXAttributePath;
  text: string;
  expression: Option.Option<JSXClassPropExpression>;
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
    return Option.map(this.expression, (x) => x.text)
      .pipe(Option.getOrElse(() => ''))
      .concat(this.text);
  }

  compileAttribute() {
    const value = this.ast.get('value');
    if (value.isStringLiteral()) return this.ast.remove();
    if (value.isJSXExpressionContainer()) {
      const expression = value.get('expression');
      if (expression.isStringLiteral()) return this.ast.remove();

      if (expression.isTemplateLiteral()) {
      }
    }
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
