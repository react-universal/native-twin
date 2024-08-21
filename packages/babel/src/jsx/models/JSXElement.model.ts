import { NodePath } from '@babel/traverse';
import * as t from '@babel/types';
import * as RA from 'effect/Array';
import * as Equal from 'effect/Equal';
import { pipe } from 'effect/Function';
import * as Hash from 'effect/Hash';
import * as HashSet from 'effect/HashSet';
import * as Option from 'effect/Option';
import { __Theme__, RuntimeTW } from '@native-twin/core';
import {
  getChildRuntimeEntries,
  type JSXElementSheet,
  type CompilerContext,
  applyParentEntries,
} from '@native-twin/css/jsx';
import {
  extractMappedAttributes,
  getBingingImportSource,
  getJSXElementAttrs,
  getJSXElementName,
} from '../jsx.maps';
import * as jsxPredicates from '../jsx.predicates';
import { JSXMappedAttribute } from '../jsx.types';
import { getElementEntries } from '../twin/twin.entries';

const jsxElementHash = (path: NodePath<t.JSXElement>, filename: string) => {
  const filenameHash = Hash.string(`${filename}`);
  const loc = Hash.structure(path.node.loc ?? { key: filenameHash });
  return pipe(loc, Hash.combine(filenameHash));
};

export class JSXElementNodeKey implements Equal.Equal {
  constructor(
    readonly path: NodePath<t.JSXElement>,
    readonly filename: string,
  ) {}

  [Hash.symbol](): number {
    return jsxElementHash(this.path, this.filename);
  }

  [Equal.symbol](that: unknown): boolean {
    return (
      that instanceof JSXElementNodeKey &&
      this.path.node.loc === that.path.node.loc &&
      this.path.scope.uid === that.path.scope.uid &&
      this.path.parentKey === that.path.parentKey &&
      this.path.key === that.path.key
    );
  }
}

export const jsxElementNodeKey = (path: NodePath<t.JSXElement>, state: string) =>
  new JSXElementNodeKey(path, state);

export class JSXElementNode implements Equal.Equal {
  readonly path: NodePath<t.JSXElement>;
  readonly id: string;
  readonly parent: JSXElementNode | null;
  readonly order: number;
  readonly filename: string;
  _runtimeSheet: JSXElementSheet | null = null;

  constructor(
    path: NodePath<t.JSXElement>,
    order: number,
    filename: string,
    parentNode: JSXElementNode | null = null,
  ) {
    this.filename = filename;
    this.order = order;
    this.parent = parentNode;

    this.id = `${jsxElementHash(path, filename)}`;
    this.path = path;
  }

  get importSource() {
    return this.binding().pipe(
      Option.map((x) => x.source),
      Option.getOrElse(() => 'Local'),
    );
  }

  private binding() {
    return pipe(
      getJSXElementName(this.openingElement),
      Option.flatMapNullable((x) => this.path.scope.getBinding(x)),
      Option.flatMap(getBingingImportSource),
    );
  }

  get attributes() {
    return getJSXElementAttrs(this.path.node);
  }

  get runtimeData(): JSXMappedAttribute[] {
    return extractMappedAttributes(this.path.node);
  }

  get childs(): HashSet.HashSet<JSXElementNode> {
    return pipe(
      RA.ensure(this.path.get('children')),
      RA.filter(jsxPredicates.isJSXElementPath),
      RA.map((x, i) => new JSXElementNode(x, i, this.filename, this)),
      HashSet.fromIterable,
    );
  }

  getTwinSheet(
    twin: RuntimeTW,
    ctx: CompilerContext,
    childsNumber: number,
  ): JSXElementSheet {
    if (this._runtimeSheet) {
      return this._runtimeSheet;
    }
    const propEntries = getElementEntries(this.runtimeData, twin, ctx);
    const runtimeSheet = {
      propEntries,
      childEntries: pipe(propEntries, getChildRuntimeEntries),
    };
    this._runtimeSheet = pipe(
      Option.fromNullable(this.parent),
      Option.map((parentNode) => ({
        entries: parentNode.getTwinSheet(twin, ctx, childsNumber).childEntries,
        childsNumber: childsNumber,
      })),
      Option.match({
        onNone: () => runtimeSheet,
        onSome: (parent) => {
          const entries = applyParentEntries(
            runtimeSheet.propEntries,
            parent.entries,
            this.order,
            parent.childsNumber,
          );
          return {
            propEntries: entries,
            childEntries: runtimeSheet.childEntries,
          };
        },
      }),
    );
    return this._runtimeSheet;
  }

  get openingElement() {
    return this.path.node.openingElement;
  }

  [Hash.symbol](): number {
    return Hash.hash(this.id);
  }

  [Equal.symbol](that: unknown): boolean {
    return (
      that instanceof JSXElementNode &&
      this.id === that.id &&
      this.path.scope.uid === that.path.scope.uid &&
      this.path.key === that.path.key
    );
  }
}
