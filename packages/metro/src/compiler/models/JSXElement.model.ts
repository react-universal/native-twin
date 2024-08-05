import * as RA from 'effect/Array';
import * as Data from 'effect/Data';
import * as Equal from 'effect/Equal';
import { pipe } from 'effect/Function';
import * as Hash from 'effect/Hash';
import * as HashSet from 'effect/HashSet';
import * as Option from 'effect/Option';
import { JsxElement, JsxSelfClosingElement, Node } from 'ts-morph';
import { __Theme__, RuntimeTW } from '@native-twin/core';
import { getChildRuntimeEntries, type JSXElementSheet } from '@native-twin/css/jsx';
import { getElementEntries } from '../../sheet/utils/styles.utils';
import { isValidJSXElement } from '../ast/ast.guards';
import {
  getComponentID,
  getComponentStyledEntries,
  getJSXElementConfig,
  getJSXElementTagName,
} from '../ast/constructors.utils';
import { getOpeningElement } from '../ast/visitors';
import { CompilerContext, JSXMappedAttribute, ValidJSXElementNode } from '../twin.types';

type JSXElementNodePath = Data.TaggedEnum<{
  JSXelement: { node: JsxElement };
  JSXSelfClosingElement: { node: JsxSelfClosingElement };
}>;

const taggedJSXElement = Data.taggedEnum<JSXElementNodePath>();

const jsxElementNodeKey = (node: ValidJSXElementNode) =>
  new JSXElementNodeKey(getComponentID(node, node.getSourceFile().getFilePath()));

export class JSXElementNode implements Equal.Equal {
  readonly path: JSXElementNodePath;
  readonly id: JSXElementNodeKey;
  readonly parent: JSXElementNode | null;
  readonly order: number;
  _runtimeSheet: JSXElementSheet | null = null;

  constructor(
    path: ValidJSXElementNode,
    order: number,
    parentKey: JSXElementNode | null = null,
  ) {
    this.id = jsxElementNodeKey(path);
    this.order = order;
    this.parent = parentKey;
    if (Node.isJsxElement(path)) {
      this.path = taggedJSXElement.JSXelement({ node: path });
    } else {
      this.path = taggedJSXElement.JSXSelfClosingElement({ node: path });
    }
  }

  get runtimeData(): JSXMappedAttribute[] {
    const styledConfig = pipe(
      this.path.node,
      getJSXElementTagName,
      Option.fromNullable,
      Option.flatMap((x) => Option.fromNullable(getJSXElementConfig(x))),
    );
    const openTag = getOpeningElement(this.path.node);
    return Option.zipWith(openTag, styledConfig, (tag, config) => {
      return getComponentStyledEntries(tag, config);
    }).pipe(Option.getOrElse(() => []));
  }

  getTwinSheet(twin: RuntimeTW, ctx: CompilerContext): JSXElementSheet {
    if (this._runtimeSheet) {
      return this._runtimeSheet;
    }
    const propEntries = getElementEntries(this.runtimeData, twin);
    this._runtimeSheet = {
      propEntries,
      childEntries: pipe(propEntries, getChildRuntimeEntries),
    };
    return this._runtimeSheet;
  }

  get childs(): HashSet.HashSet<JSXElementNode> {
    const current = this;
    return taggedJSXElement.$match({
      JSXelement: (element) => {
        return pipe(
          element.node.getJsxChildren(),
          RA.filterMap((x) => pipe(x, Option.liftPredicate(isValidJSXElement))),
          RA.map((x, i) => new JSXElementNode(x, i, current)),
          HashSet.fromIterable,
        );
      },
      JSXSelfClosingElement: () => HashSet.empty(),
    })(this.path);
  }

  [Hash.symbol](): number {
    return Hash.hash(this.id);
  }

  [Equal.symbol](that: unknown): boolean {
    return that instanceof JSXElementNode && this.id === that.id;
  }
}

export class JSXElementNodeKey implements Equal.Equal {
  constructor(readonly id: string) {}

  [Hash.symbol](): number {
    return Hash.hash(this.id);
  }

  [Equal.symbol](u: unknown): boolean {
    return u instanceof JSXElementNodeKey && this.id === u.id;
  }
}
