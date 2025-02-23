import type { TWParsedRule } from '@native-twin/css';
import type * as Tree from '@native-twin/helpers/tree';
import * as RA from 'effect/Array';
import * as Equal from 'effect/Equal';
import { pipe } from 'effect/Function';
import * as Hash from 'effect/Hash';
import * as Option from 'effect/Option';
import type { TwinFile } from '../FileSystem';
import { type MappedComponent, mappedComponents } from '../utils/constants';
import type { JSXElementFunction, JSXElementPath, ModuleDependency } from './Models';
import { extractStyledProp, getJSXElementAttrs } from './Utils';

export class TwinJSXElement {
  /** Describe the function that returns a JSXElement */
  readonly id: string;

  constructor(
    file: TwinFile,
    readonly jsxFunction: Option.Option<JSXElementFunction>,
    readonly meta: { isExported: boolean; name: '__Unknown' | (string & {}) },
    readonly tree: Tree.Tree<TwinJSXElementNode>,
  ) {
    this.id = this.jsxFunction.pipe(
      Option.map((x) => [x.node.start, x.node.end].join('/')),
      Option.getOrElse(() => ''),
      (_) =>
        `_JSXElement:${Hash.string(`${_}${file.path}${this.meta.isExported}${this.meta.name}`)}`,
    );
  }
}

export class TwinJSXElementNode implements Equal.Equal {
  readonly mappedProps: MappedComponent;
  readonly styledProps: JSXMappedAttribute[];
  get id() {
    return `__JSXElementNode:${this[Hash.symbol]()}:${this.name}`;
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
    this.styledProps = pipe(
      getJSXElementAttrs(this.babelPath.node),
      RA.map((x) => Option.fromNullable(extractStyledProp(x, this.mappedProps))),
      RA.getSomes,
    );
  }

  [Hash.symbol](): number {
    return pipe(
      Hash.array([this.babelPath.node.start, this.babelPath.node.end]),
      Hash.combine(Hash.string(this.name)),
      Hash.combine(Hash.number(this.styledProps.length)),
      Hash.combine(Hash.string(this.babelPath.node.loc?.filename ?? 'NO_FILE')),
    );
  }

  [Equal.symbol](that: unknown): boolean {
    return (
      that instanceof TwinJSXElementNode &&
      (TwinJSXElementNode.equals(this, that) ||
        this[Hash.symbol]() === that[Hash.symbol]())
    );
  }
  static equals = (a: TwinJSXElementNode, b: TwinJSXElementNode): boolean => {
    if (a.babelPath === b.babelPath) {
      return true;
    }
    return Equal.equals(a, b);
  };
}

export interface JSXMappedAttribute {
  value: {
    text: string;
    templateExpression: Option.Option<string>;
    twinRules: TWParsedRule[];
  };
  prop: string;
  target: string;
}
