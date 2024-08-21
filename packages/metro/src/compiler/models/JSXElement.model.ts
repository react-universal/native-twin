import * as t from '@babel/types';
import * as Equal from 'effect/Equal';
import { pipe } from 'effect/Function';
import * as Hash from 'effect/Hash';
import * as Option from 'effect/Option';
import { __Theme__, RuntimeTW } from '@native-twin/core';
import {
  getChildRuntimeEntries,
  type JSXElementSheet,
  type CompilerContext,
  applyParentEntries,
} from '@native-twin/css/jsx';
import { getElementEntries } from '../../sheet/utils/styles.utils';
import { JSXMappedAttribute } from '../ast.types';
import { getJSXNodeOpenElement } from '../ast/ast.matchers';
import { getBabelElementMappedAttributes } from '../babel/babel.constructors';

export class JSXElementNode implements Equal.Equal {
  readonly path: t.JSXElement;
  readonly id: string;
  readonly parent: JSXElementNode | null;
  readonly order: number;
  _runtimeSheet: JSXElementSheet | null = null;

  constructor(
    path: t.JSXElement,
    order: number,
    parentNode: JSXElementNode | null = null,
    id?: string,
  ) {
    this.order = order;
    this.parent = parentNode;
    if (parentNode) {
      this.id = `${parentNode.id + order}`;
    } else {
      this.id = id ?? 'Undefined';
    }
    this.path = path;
  }

  get runtimeData(): JSXMappedAttribute[] {
    return getBabelElementMappedAttributes(this.path);
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
    return getJSXNodeOpenElement(this.path);
  }

  [Hash.symbol](): number {
    return Hash.hash(this.id);
  }

  [Equal.symbol](that: unknown): boolean {
    return that instanceof JSXElementNode && this.id === that.id;
  }
}
