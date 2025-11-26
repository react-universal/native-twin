import type * as Effect from 'effect/Effect';
import type * as Graph from 'effect/Graph';
import type ts from 'ts-morph';

export namespace TwinDslModels {
  export interface TwinSourceFile {
    readonly _tag: 'TwinSourceFile';
    jsxDeclarators: NodeJSXDeclarator[];
    node: ts.SourceFile;
  }

  export interface NodeStyledProp {
    readonly _tag: 'NodeStyledProp';
    node: ts.JsxAttribute;
    valueTextNode: ts.Node | null;
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
    // jsxElement: JSXNode;
  }

  export type TwinNode = NodeStyledProp | NodeJSXDeclarator;

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
    state: {
      nodeToVisit: ts.Node[];
      jsxExpressions: {
        jsxElement: TwinDslModels.AnyJSXElement;
        declarator: ts.BindingName;
      }[];
      mutableGraph: MutableGraph;
    };
    buildGraph: () => TwinFileGraph;
    getNextNode: () => Effect.Effect<ts.Node, never, never>;
    getDepthBudgetFor: (node: ts.Node) => number;
    processJSXElementNode: (
      currentNode: ts.Node,
      currentDepthBudget: number,
    ) => Effect.Effect<void, never, never>;
    createJSXExpressionStacks: () => Map<ts.Node, JSXExpressionStack>;
    processIdentifierNode: (
      currentNode: ts.Node,
      currentDepthBudget: number,
      jsxStacks: Map<ts.Node, JSXExpressionStack>,
    ) => Effect.Effect<void, never, never>;
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
