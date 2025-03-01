import * as RA from 'effect/Array';
import * as Equal from 'effect/Equal';
import * as Hash from 'effect/Hash';
import * as Option from 'effect/Option';
import { type MappedComponent, mappedComponents } from '../../utils/constants';
import { fromJSXAttribute, type TwinJSXStyledProp } from './JSXStyledProp';
import type { TwinFile } from '../../FileSystem';
import type { JSXElementPath, ModuleDependency } from '../Models';
import { getJSXElementAttrs } from '../Utils';

export class TwinJSXElementNode implements Equal.Equal {
  readonly mappedProps: MappedComponent;
  readonly styledProps: TwinJSXStyledProp[];
  get id() {
    return `__JSXElementNode:${this[Hash.symbol]()}:${this.name}`;
  }
  get hasExpressions() {
    return this.styledProps.some((x) => x.hasExpression);
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

    this.styledProps = RA.getSomes(
      RA.map(getJSXElementAttrs(this.babelPath.node), (x) =>
        Option.fromNullable(fromJSXAttribute(x, this.mappedProps)),
      ),
    );
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
