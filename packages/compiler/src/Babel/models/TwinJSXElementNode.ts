import { SheetEntryHandler } from '@native-twin/css/jsx';
import * as RA from 'effect/Array';
import * as Equal from 'effect/Equal';
import * as Hash from 'effect/Hash';
import * as Option from 'effect/Option';
import type { TwinFile } from '../../FileSystem';
import type { CompilerStyleSheet } from '../../StyleSheet/Model';
import { type MappedComponent, mappedComponents } from '../../utils/constants';
import type { JSXElementPath } from '../Models';
import { getJSXElementAttrs } from '../Utils';
import {
  TwinJSXNodeStyledProp,
  type TwinJSXStyledProp,
  fromJSXAttribute,
} from './JSXStyledProp';
import type { ModuleDependency } from './TwinBabelModule';

export class TwinJSXElementNode implements Equal.Equal {
  readonly mappedProps: MappedComponent;
  readonly classnameProps: TwinJSXStyledProp[];
  get id() {
    return `__JSXElementNode:${this[Hash.symbol]()}:${this.name}`;
  }
  get hasExpressions() {
    return this.classnameProps.some((x) => x.hasExpression);
  }

  constructor(
    readonly file: TwinFile,
    readonly babelPath: JSXElementPath,
    readonly name: string,
    readonly dependency: Option.Option<ModuleDependency>,
  ) {
    this.mappedProps = RA.findFirst(mappedComponents, (x) => x.name === this.name).pipe(
      Option.getOrElse(
        (): MappedComponent => ({ name: this.name, config: {}, kind: 'unknown' }),
      ),
    );

    this.classnameProps = RA.getSomes(
      RA.map(getJSXElementAttrs(this.babelPath.node), (x) =>
        Option.fromNullable(fromJSXAttribute(x, this.mappedProps)),
      ),
    );
  }

  getStyledProps(runner: CompilerStyleSheet) {
    return this.classnameProps.map((prop) => {
      const entries = runner
        .twinFn(prop.text)
        .map((x) => new SheetEntryHandler(x, runner.ctx));
      return new TwinJSXNodeStyledProp({
        entries,
        expression: prop.expression,
        prop: prop.prop,
        target: prop.target,
        text: prop.text,
      });
    });
  }

  [Hash.symbol](): number {
    return Hash.structure({
      loc: this.babelPath.node.loc,
      range: [this.babelPath.node.start, this.babelPath.node.end],
    });
  }

  [Equal.symbol](that: unknown): boolean {
    return (
      that instanceof TwinJSXElementNode && this[Hash.symbol]() === that[Hash.symbol]()
    );
  }
}
