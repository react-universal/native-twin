import type { NodePath } from '@babel/traverse';
import * as t from '@babel/types';
import * as Tree from '@native-twin/helpers/tree';
import * as RA from 'effect/Array';
import { pipe } from 'effect/Function';
import * as Option from 'effect/Option';
import { type MappedComponent, mappedComponents } from '../shared/compiler.constants';
import {
  getBabelBindingImportSource,
  getJSXElementAttrs,
} from '../utils/babel/babel.utils';
import type { ImportSource, JSXElementDeclaration } from './Models';
import { extractStyledProp, isLocalImport } from './Utils';

export class TwinCompilerDom {
  readonly tree: Tree.Tree<TwinDomElement>;

  private get rootElement() {
    return this.declarator.rootJSXElement;
  }

  get name() {
    return this.declarator.name;
  }

  constructor(private readonly declarator: JSXElementDeclaration) {
    const ident = this.rootElement.node.openingElement.name;
    const name = t.isJSXIdentifier(ident) ? ident.name : 'UnknownRootElement';
    this.tree = new Tree.Tree(new TwinDomElement(this.rootElement, name));
    this.buildTree(this.tree.root);
  }

  private buildTree(parent: Tree.TreeNode<TwinDomElement>) {
    const childs = parent.value.jsxPath.get('children').filter((x) => x.isJSXElement());
    for (const child of childs) {
      const ident = child.node.openingElement.name;
      if (!t.isJSXIdentifier(ident)) continue;

      const childLeave = parent.addChild(new TwinDomElement(child, ident.name), parent);
      this.buildTree(childLeave);
    }
  }
}

export class TwinDomElement {
  private get binding() {
    return Option.fromNullable(this.jsxPath.scope.getBinding(this.name));
  }
  get importSource(): ImportSource {
    return Option.flatMap(this.binding, getBabelBindingImportSource).pipe(
      Option.getOrElse((): ImportSource => ({ kind: 'unknown', source: 'none' })),
    );
  }
  get mappedProps(): MappedComponent {
    return RA.findFirst(mappedComponents, (x) => x.name === this.name).pipe(
      Option.getOrElse(() => ({ name: this.name, config: {} })),
    );
  }
  get isLocalImport() {
    return (
      (this.importSource.kind === 'import' || this.importSource.kind === 'require') &&
      isLocalImport(this.importSource.source)
    );
  }
  get styledProps() {
    return pipe(
      getJSXElementAttrs(this.jsxPath.node),
      RA.map((x) => Option.fromNullable(extractStyledProp(x, this.mappedProps))),
      RA.getSomes,
    );
  }
  constructor(
    readonly jsxPath: NodePath<t.JSXElement>,
    readonly name: string,
  ) {}
}
