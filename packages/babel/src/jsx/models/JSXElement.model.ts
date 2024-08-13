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
import { TwinVisitorsState } from '../../types/plugin.types';
import { extractMappedAttributes, getJSXElementAttrs } from '../jsx.maps';
import * as jsxPredicates from '../jsx.predicates';
import { JSXMappedAttribute } from '../jsx.types';
import { getElementEntries } from '../twin/twin.entries';

const jsxElementHash = (path: NodePath<t.JSXElement>, state: TwinVisitorsState) => {
  const filename = Hash.string(`${state.filename}`);
  const loc = Hash.structure(path.node.loc ?? { key: state.key });
  return pipe(loc, Hash.combine(filename));
};

export class JSXElementNodeKey implements Equal.Equal {
  constructor(
    readonly path: NodePath<t.JSXElement>,
    readonly state: TwinVisitorsState,
  ) {}

  [Hash.symbol](): number {
    return jsxElementHash(this.path, this.state);
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

export const jsxElementNodeKey = (
  path: NodePath<t.JSXElement>,
  state: TwinVisitorsState,
) => new JSXElementNodeKey(path, state);

export class JSXElementNode implements Equal.Equal {
  readonly path: NodePath<t.JSXElement>;
  readonly id: string;
  readonly parent: JSXElementNode | null;
  readonly order: number;
  readonly state: TwinVisitorsState;
  _runtimeSheet: JSXElementSheet | null = null;

  constructor(
    path: NodePath<t.JSXElement>,
    order: number,
    state: TwinVisitorsState,
    parentNode: JSXElementNode | null = null,
  ) {
    this.state = state;
    this.order = order;
    this.parent = parentNode;

    this.id = `${jsxElementHash(path, state)}`;
    this.path = path;
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
      RA.map((x, i) => new JSXElementNode(x, i, this.state, this)),
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
