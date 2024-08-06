import * as RA from 'effect/Array';
import * as Data from 'effect/Data';
import * as Equal from 'effect/Equal';
import { pipe } from 'effect/Function';
import * as Hash from 'effect/Hash';
import * as HashSet from 'effect/HashSet';
import * as Option from 'effect/Option';
import nodePath from 'node:path';
import { JsxElement, JsxSelfClosingElement, Node } from 'ts-morph';
import { __Theme__, RuntimeTW } from '@native-twin/core';
import {
  getChildRuntimeEntries,
  type JSXElementSheet,
  type CompilerContext,
  applyParentEntries,
} from '@native-twin/css/jsx';
import { getElementEntries } from '../../sheet/utils/styles.utils';
import { getJSXElementLevel } from '../../utils/jsx.utils';
import { isValidJSXElement } from '../ast/ast.guards';
import {
  getComponentStyledEntries,
  getJSXElementConfig,
  getJSXElementTagName,
} from '../ast/constructors.utils';
import { getOpeningElement } from '../ast/visitors';
import { JSXMappedAttribute, ValidJSXElementNode } from '../twin.types';

type JSXElementNodePath = Data.TaggedEnum<{
  JSXelement: { node: JsxElement };
  JSXSelfClosingElement: { node: JsxSelfClosingElement };
}>;

const taggedJSXElement = Data.taggedEnum<JSXElementNodePath>();

const jsxHash = (level: string, order: number, path: string) =>
  pipe(
    Hash.number(order),
    Hash.combine(Hash.string(level)),
    Hash.combine(Hash.string(nodePath.basename(path))),
  );

export class JSXElementNode implements Equal.Equal {
  readonly path: JSXElementNodePath;
  readonly id: string;
  readonly parent: JSXElementNode | null;
  readonly order: number;
  readonly level: string;
  _runtimeSheet: JSXElementSheet | null = null;

  constructor(
    path: ValidJSXElementNode,
    order: number,
    level: string,
    parentKey: JSXElementNode | null = null,
  ) {
    this.order = order;
    this.parent = parentKey;
    this.level = level;

    const levelHash = jsxHash(level, order, path.getSourceFile().getFilePath());
    this.id = `${level}${levelHash}`;

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
    const propEntries = getElementEntries(this.runtimeData, twin, ctx);
    const runtimeSheet = {
      propEntries,
      childEntries: pipe(propEntries, getChildRuntimeEntries),
    };
    this._runtimeSheet = pipe(
      Option.fromNullable(this.parent),
      Option.map((x) => ({
        entries: x.getTwinSheet(twin, ctx).childEntries,
        childsNumber: HashSet.size(x.childs),
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

  get childs(): HashSet.HashSet<JSXElementNode> {
    const current = this;
    return taggedJSXElement.$match({
      JSXelement: (element) => {
        return pipe(
          element.node.getJsxChildren(),
          RA.filterMap((x) => pipe(x, Option.liftPredicate(isValidJSXElement))),
          RA.map(
            (x, i) =>
              new JSXElementNode(x, i, getJSXElementLevel(i, current.level), current),
          ),
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
