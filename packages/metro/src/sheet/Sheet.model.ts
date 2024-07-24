import type * as t from '@babel/types';
import * as Data from 'effect/Data';
import * as Equal from 'effect/Equal';
import * as Equivalence from 'effect/Equivalence';
import { pipe } from 'effect/Function';
import * as Hash from 'effect/Hash';
import * as Order from 'effect/Order';
import { createObjectExpressionAST } from '@native-twin/babel/build/babel';
import type { SheetEntry } from '@native-twin/css';

export class BabelSheetEntry extends Data.Class<SheetEntry> implements Equal.Equal {
  get entryObject() {
    return {
      animations: this.animations,
      className: this.className,
      declarations: this.declarations,
      important: this.important,
      precedence: this.precedence,
      selectors: this.selectors,
    };
  }

  toAST(): t.ObjectExpression {
    return createObjectExpressionAST(this.entryObject) as any;
  }

  toJSON() {
    return this.entryObject;
  }

  static equivalence = pipe(
    Equivalence.string,
    Equivalence.mapInput((x: BabelSheetEntry) => x.className),
  );

  static order = Order.make((a: BabelSheetEntry, b: BabelSheetEntry) => {
    if (a.precedence === b.precedence) return 0;
    if (a.precedence > b.precedence) return 1;
    return -1;
  });

  [Equal.symbol](that: unknown) {
    return (
      that instanceof BabelSheetEntry &&
      this.className === that.className &&
      this.selectors.join('') === that.selectors.join('') &&
      this.important === that.important
    );
  }
  [Hash.symbol]() {
    return Hash.combine(Hash.string(this.className))(Hash.number(this.precedence));
  }
}
