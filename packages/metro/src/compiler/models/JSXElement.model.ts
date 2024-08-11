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
import { getBabelElementMappedAttributes } from '../ast/babel.constructors';
import { getJSXRuntimeData } from '../ast/ts.constructors';
import {
  createJSXElementNodeHash,
  getJSXElementPath,
  getJSXNodeOpenElement,
  JSXElementNodePath,
  taggedJSXElement,
} from '../ast/shared.utils';
import { JSXMappedAttribute, ValidJSXElementNode } from '../types/tsCompiler.types';

export class JSXElementNode implements Equal.Equal {
  readonly path: JSXElementNodePath;
  readonly id: string;
  readonly parent: JSXElementNode | null;
  readonly order: number;
  readonly level: string;
  _runtimeSheet: JSXElementSheet | null = null;

  constructor(
    path: ValidJSXElementNode | t.JSXElement,
    order: number,
    level: string,
    filename: string,
    parentKey: JSXElementNode | null = null,
  ) {
    this.order = order;
    this.parent = parentKey;
    this.level = level;

    const levelHash = createJSXElementNodeHash(level, order, filename);
    this.id = `${level}${levelHash}`;
    this.path = getJSXElementPath(path);
  }

  get runtimeData(): JSXMappedAttribute[] {
    return taggedJSXElement.$match({
      BabelJSXElement: ({ node }) => getBabelElementMappedAttributes(node),
      JSXelement: ({ node }) => getJSXRuntimeData(node, node.getOpeningElement()),
      JSXSelfClosingElement: ({ node }) => getJSXRuntimeData(node, node),
    })(this.path);
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
