import type * as Effect from 'effect/Effect';
import type * as Graph from 'effect/Graph';
import type ts from 'ts-morph';

// export class JSXNode implements Equal.Equal {
//   readonly _tag = 'JSXNode';
//   private _id: string | null = null;
//   // private allNodes: JSXNode[] | null = null;
//   // private _languageRegions: DocumentLanguageRegion[] | null = null;
//   tagName: string;
//   node: TwinDslModels.AnyJSXElement;
//   styledProps: TwinDslModels.NodeStyledProp[];
//   childs: JSXNode[] = [];
//   parent: JSXNode | null;

//   private get partialID() {
//     return `${this.filename}_${this.pos}_${this.tagName}_${this.childs.length}_${this.index}${this.styledProps.length}`;
//   }

//   get pos() {
//     return this.node.getPos();
//   }
//   get filename() {
//     return this.node.getSourceFile().getFilePath();
//   }
//   get id(): string {
//     if (this._id) return this._id;

//     const mappedStyles = this.styledProps
//       .map(
//         (x) =>
//           `${x.twinCX ?? 'NO_LITERAL'}_${x.node.getPos()}_${x.node.getEnd()}_${x.expression?.getText() ?? ''}_${x.styleProp}_${x.classProp}`,
//       )
//       .join('');

//     return (this._id = Hash.string(`${this.partialID}_${mappedStyles}`).toString());
//   }
//   get index() {
//     return this.node.getParent().getChildren().indexOf(this.node);
//   }

//   constructor(data: {
//     tagName: string;
//     node: TwinDslModels.AnyJSXElement;
//     styledProps: TwinDslModels.NodeStyledProp[];
//     parent: JSXNode | null;
//   }) {
//     this.tagName = data.tagName;
//     this.node = data.node;
//     this.styledProps = data.styledProps;
//     this.parent = data.parent;
//   }

//   // getLanguageRegions() {
//   //   if (this._languageRegions) return this._languageRegions;
//   //   return (this._languageRegions = this.styledProps.flatMap((prop): DocumentLanguageRegion[] => {
//   //     const propValue = prop.valueTextNode;
//   //     if (!propValue) return [];
//   //     const text = propValue.getText(true);
//   //     const plusOffset = text.startsWith('`') ? 1 : 0;
//   //     const startPosition: VSCDocument.Position = {
//   //       line: propValue.getStartLineNumber(),
//   //       character: propValue.getStart(true) + plusOffset,
//   //     };
//   //     const endPosition: VSCDocument.Position = {
//   //       line: propValue.getEndLineNumber(),
//   //       character: propValue.getEnd() + plusOffset,
//   //     };
//   //     const range: VSCDocument.Range = { start: startPosition, end: endPosition };
//   //     return asArray(
//   //       new DocumentLanguageRegion(
//   //         range,
//   //         startPosition.character,
//   //         endPosition.character,
//   //         propValue.getText(true),
//   //       ),
//   //     );
//   //   }));
//   // }

//   getAllNodes(): JSXNode[] {
//     return pipe(
//       this.childs.flatMap((x) => x.getAllNodes()),
//       RA.union([this]),
//     );
//   }

//   [Hash.symbol]() {
//     return Hash.string(this.id);
//   }

//   [Equal.symbol](that: unknown) {
//     return that instanceof JSXNode && that.id === this.id;
//   }
// }

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
