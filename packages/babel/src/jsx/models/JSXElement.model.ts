import { NodePath } from '@babel/traverse';
import * as t from '@babel/types';
// import * as RA from 'effect/Array';
import * as Equal from 'effect/Equal';
import { pipe } from 'effect/Function';
import * as Hash from 'effect/Hash';
// import * as HashSet from 'effect/HashSet';
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
  getBindingImportSource,
  getJSXElementAttrs,
  getJSXElementName,
} from '../ast/jsx.maps';
// import * as jsxPredicates from '../jsx.predicates';
import { JSXMappedAttribute } from '../jsx.types';
import { getElementEntries } from '../twin/twin.entries';

const jsxElementHash = (path: t.JSXElement, filename: string) => {
  const filenameHash = Hash.string(`${filename}`);
  const loc = Hash.structure(
    path.loc ?? { key: `${filenameHash}-${path.start}-${path.end}` },
  );
  return pipe(loc, Hash.combine(filenameHash));
};

export class JSXElementNodeKey implements Equal.Equal {
  constructor(
    readonly path: t.JSXElement,
    readonly filename: string,
  ) {}

  [Hash.symbol](): number {
    return jsxElementHash(this.path, this.filename);
  }

  [Equal.symbol](that: unknown): boolean {
    return (
      that instanceof JSXElementNodeKey &&
      this.path.loc === that.path.loc &&
      this.path.type === that.path.type &&
      this.path.start == that.path.start
    );
  }
}

export const jsxElementNodeKey = (path: t.JSXElement, filename: string) =>
  new JSXElementNodeKey(path, filename);

export class JSXElementNode implements Equal.Equal {
  readonly path: t.JSXElement;
  readonly id: string;
  readonly parent: JSXElementNode | null;
  order: number;
  readonly filename: string;
  _runtimeSheet: JSXElementSheet | null = null;

  constructor(
    path: t.JSXElement,
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

  getImportSource(
    binding: Option.Option<{
      kind: string;
      source: string;
    }>,
  ) {
    return binding.pipe(
      Option.map((x) => x.source),
      Option.getOrElse(() => 'Local'),
    );
  }

  binding(path: NodePath<t.JSXElement>) {
    return pipe(
      getJSXElementName(this.openingElement),
      Option.flatMapNullable((x) => path.scope.getBinding(x)),
      Option.flatMap(getBindingImportSource),
    );
  }

  get attributes() {
    return getJSXElementAttrs(this.path);
  }

  get runtimeData(): JSXMappedAttribute[] {
    return extractMappedAttributes(this.path);
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
          console.log('this_order', this.order);
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
    return this.path.openingElement;
  }

  [Hash.symbol](): number {
    return Hash.hash(this.id);
  }

  [Equal.symbol](that: unknown): boolean {
    return that instanceof JSXElementNode && this.id === that.id;
  }
}
