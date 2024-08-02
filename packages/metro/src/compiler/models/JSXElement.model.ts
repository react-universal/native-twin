import * as RA from 'effect/Array';
import * as Data from 'effect/Data';
import * as Equal from 'effect/Equal';
import { pipe } from 'effect/Function';
import * as Hash from 'effect/Hash';
import * as HashSet from 'effect/HashSet';
import * as Option from 'effect/Option';
import { JsxElement, JsxSelfClosingElement, Node } from 'ts-morph';
import { RuntimeTW } from '@native-twin/core';
import { RuntimeComponentEntry } from '../../sheet/sheet.types';
import { getOpeningElement } from '../ast/visitors';
import { JSXMappedAttribute, ValidJSXElementNode } from '../twin.types';
import { isValidJSXElement } from '../ast/ast.guards';
import {
  getComponentID,
  getComponentStyledEntries,
  getJSXElementConfig,
  getJSXElementTagName,
} from '../ast/constructors.utils';
import { getElementEntries } from './compiler.model';

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

  constructor(path: ValidJSXElementNode, parentKey: JSXElementNode | null = null) {
    this.id = jsxElementNodeKey(path);
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

  getTwinSheet(twin: RuntimeTW): RuntimeComponentEntry[] {
    return getElementEntries(this.runtimeData, twin);
  }

  get childs(): HashSet.HashSet<JSXElementNode> {
    const current = this;
    return taggedJSXElement.$match({
      JSXelement: (element) => {
        return pipe(
          element.node.getJsxChildren(),
          RA.filterMap((x) => pipe(x, Option.liftPredicate(isValidJSXElement))),
          RA.map((x) => new JSXElementNode(x, current)),
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
