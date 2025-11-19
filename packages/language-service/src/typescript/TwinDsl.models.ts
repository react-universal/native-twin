import * as Equal from 'effect/Equal';
import type * as Graph from 'effect/Graph';
import * as Hash from 'effect/Hash';
import type ts from 'ts-morph';

export class TwinTypescriptFile implements Equal.Equal {
  private sourceFile: ts.SourceFile;
  jsxDeclarators: TwinDslModels.NodeJSXDeclarator[];
  id: string;

  get filePath() {
    return this.sourceFile.getFilePath();
  }
  constructor(sourceFile: ts.SourceFile, jsxDeclarators: TwinDslModels.NodeJSXDeclarator[]) {
    this.sourceFile = sourceFile;
    this.id = Hash.string(
      `${this.sourceFile.getFilePath()}_${this.sourceFile.getText()}`,
    ).toString();
    this.jsxDeclarators = jsxDeclarators;
  }

  isTsSourceEquals(that: ts.SourceFile) {
    return (
      this.sourceFile === that ||
      this.filePath === that.getFilePath() ||
      this.sourceFile.getText() === that.getText()
    );
  }

  [Hash.symbol]() {
    return Hash.string(this.id);
  }

  [Equal.symbol](that: unknown) {
    return that instanceof TwinTypescriptFile && that.id === this.id;
  }
}

export class JSXNode implements Equal.Equal {
  readonly _tag = 'JSXNode';
  private _id: string | null = null;
  tagName: string;
  node: TwinDslModels.AnyJSXElement;
  styledProps: TwinDslModels.NodeStyledProp[];
  childs: JSXNode[] = [];
  parent: JSXNode | null;

  private get partialID() {
    return `${this.filename}_${this.pos}_${this.tagName}_${this.childs.length}_${this.index}${this.styledProps.length}`;
  }
  get pos() {
    return this.node.compilerNode.pos;
  }
  get filename() {
    return this.node.getSourceFile().getFilePath();
  }
  get id(): string {
    if (this._id) return this._id;

    const mappedStyles = this.styledProps
      .map(
        (x) =>
          `${x.twinCX ?? 'NO_LITERAL'}_${x.expression?.getText(false) ?? ''}_${x.styleProp}_${x.classProp}`,
      )
      .join('');

    return (this._id = Hash.string(`${this.partialID}_${mappedStyles}`).toString());
  }
  get index() {
    return this.node.getChildIndex();
  }

  constructor(data: {
    tagName: string;
    node: TwinDslModels.AnyJSXElement;
    styledProps: TwinDslModels.NodeStyledProp[];
    parent: JSXNode | null;
  }) {
    this.tagName = data.tagName;
    this.node = data.node;
    this.styledProps = data.styledProps;
    this.parent = data.parent;
  }

  [Hash.symbol]() {
    return Hash.string(this.id);
  }

  [Equal.symbol](that: unknown) {
    return that instanceof JSXNode && that.id === this.id;
  }
}

export namespace TwinDslModels {
  export interface TwinSourceFile {
    readonly _tag: 'TwinSourceFile';
    jsxDeclarators: NodeJSXDeclarator[];
    node: ts.SourceFile;
  }

  export interface NodeStyledProp {
    readonly _tag: 'NodeStyledProp';
    node: ts.JsxAttribute;
    classProp: string;
    styleProp: string;
    originalText: string;
    twinCX: string;
    expression: ts.Expression | null;
  }

  export interface NodeJSXDeclarator {
    readonly _tag: 'NodeJSXDeclarator';
    node: ts.Node;
    identifier: string;
    binding: ts.BindingName;
    filename: string;
    jsxElement: JSXNode;
  }

  export type TwinNode = NodeStyledProp | JSXNode | NodeJSXDeclarator;

  export type AnyJSXElement = ts.JsxElement | ts.JsxSelfClosingElement;
}

export namespace TwinGraphModel {
  /**
   * Represents a JSX expression in the source with its declarator and root element
   */
  export interface JSXExpressionStack {
    binding: ts.Node | null;
    declarator: ts.Node | undefined;
    root: ts.Node;
    childs: ts.Node[];
  }

  export interface TraversalContext {
    visitedNodes: WeakSet<ts.Node>;
    nodeNestedInJSXTree: WeakSet<ts.Node>;
    nodeToGraph: WeakMap<ts.Node, Graph.NodeIndex>;
    depthBudget: WeakMap<ts.Node, number>;
  }

  export interface ImportInfo {
    from: string;
    node: ts.Structures;
  }

  export interface NodeInfo {
    node: ts.Node;
    identifier: string;
    isRoot: boolean;
    index: number;
    mappedProps: TwinDslModels.NodeStyledProp[];
  }

  export type EdgeInfo =
    | { relationship: 'jsx'; index: number; isRoot: boolean }
    | { relationship: 'declarator' };

  export type TwinFileGraph = Graph.Graph<NodeInfo, EdgeInfo, 'directed'>;
  export type MutableGraph = Graph.MutableGraph<NodeInfo, EdgeInfo, 'directed'>;
}

// class TrieNode<SomeShit> {
//   children = new Map<string, TrieNode<SomeShit>>();
//   isEndWord: boolean;
//   value: SomeShit | null;
//   constructor(value: SomeShit | null = null) {
//     this.isEndWord = false;
//     this.value = value;
//   }
// }

// export class Trie<SomeShit> {
//   root: TrieNode<SomeShit>;
//   constructor() {
//     this.root = new TrieNode<SomeShit>();
//   }

//   insert(word: string, data: SomeShit) {
//     let currentNode = this.root;
//     for (const char of word) {
//       if (!currentNode.children.has(char)) {
//         currentNode.children.set(char, new TrieNode<SomeShit>(data));
//       }
//       currentNode = currentNode.children.get(char)!;
//     }
//     currentNode.isEndWord = true;
//   }

//   get(word: string) {
//     let currentNode = this.root;
//     for (const char of word) {
//       if (!currentNode.children.has(char)) return null;
//       currentNode = currentNode.children.get(char)!;
//     }
//     return currentNode.value;
//   }

//   search(word: string, isPrefix = false): boolean {
//     let currentNode = this.root;
//     for (const char of word) {
//       if (!currentNode.children.has(char)) return false;
//       currentNode = currentNode.children.get(char)!;
//     }
//     return isPrefix || currentNode.isEndWord;
//   }

//   startsWith(prefix: string) {
//     return this.search(prefix, true);
//   }
// }

// const trie = new Trie<string>();

// trie.insert('a1', '1a');
// trie.insert('a2', '2a');

// trie.search('a1');

// trie.get('a');

// trie.get('a');
