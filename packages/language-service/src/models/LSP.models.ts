import * as Data from 'effect/Data';
import * as Graph from 'effect/Graph';
import * as Option from 'effect/Option';
import * as Schema from 'effect/Schema';
import type * as t from 'vscode-languageserver-types';

export class Position extends Schema.Class<Position>('Position')({
  line: Schema.Number,
  character: Schema.Number,
}) {
  static sum = (self: t.Position, that: t.Position) =>
    new Position({
      line: Math.max(self.line, that.line),
      character: self.character + that.character,
    });
  static from = (line: number, character: number) => new Position({ line, character });
}

export class Range extends Schema.Class<Range>('Range')({ start: Position, end: Position }, {}) {
  static sum = (self: t.Range, that: t.Range) =>
    new Range({
      start: Position.sum(self.start, that.start),
      end: Position.sum(self.end, that.end),
    });
  static from = (start: Position, end: Position) => new Range({ start: Position.make(start), end: Position.make(end) });
}

export class Node extends Schema.Class<Node>('Node')({
  startLine: Schema.NullOr(Schema.Number),
  endLine: Schema.NullOr(Schema.Number),
  startOffset: Schema.Number,
  endOffset: Schema.Number,
  // range: Range,
  /** @description this text may have the literal container AKA `|'|" even template literal vars xor expressions */
  rawText: Schema.String,
}) {}
Schema.annotations(Node, {});

export class JSXAttributeName extends Node.extend<JSXAttributeName>('JSXAttributeName')({
  text: Schema.String,
}) {}

export class JSXAttributeValue extends Node.extend<JSXAttributeValue>('JSXAttributeValue')({
  text: Schema.String,
}) {}

export class JSXTagName extends Node.extend<JSXTagName>('JSXTagName')({}) {}
export class JSXAttribute extends Node.extend<JSXAttribute>('JSXAttribute')({
  name: JSXAttributeName,
  value: JSXAttributeValue,
}) {}
/**
 * @name JSXNodeRegion
 * @description refers to JSX nodes like <div... /> | <div>...</div>
 * @see This just collect root nodes once wants to work with those needs yo traverse its childs
 * */
export class JSXNode extends Node.extend<JSXNode>('JSXNode')({
  id: Schema.String,
  text: Schema.String,
  attributes: Schema.Array(JSXAttribute),
  tag: JSXTagName,
  parent: Schema.NullOr(Schema.suspend((): Schema.Schema<JSXNode> => JSXNode)),
}) {}

export type JSXNodeType = typeof JSXNode.Type;

export const AnyParsedNode = Schema.Union(
  JSXAttribute,
  JSXAttributeName,
  JSXAttributeValue,
  JSXNode,
  JSXTagName,
);

export type AnyParsedNode = typeof AnyParsedNode;

/**
 * ************* / LSP identities *************
 * */

/**
 * ************* LSP Error Models *************
 * */

export class FileNotFound extends Data.TaggedError('FileNotFound')<{
  cause: Error;
}> {
  get stackTrace() {
    return this.cause.stack ?? Error.captureStackTrace(this.cause);
  }

  static create(e: unknown) {
    if (e instanceof Error) return new FileNotFound({ cause: e });
    return new FileNotFound({ cause: new Error(e as string) });
  }
}

export class LSPParserError extends Data.TaggedError('LSPParserError')<{
  cause: Error;
}> {
  get stackTrace() {
    return this.cause.stack ?? Error.captureStackTrace(this.cause);
  }

  static create(e: unknown) {
    if (e instanceof Error) return new LSPParserError({ cause: e });
    return new LSPParserError({ cause: new Error(e as string) });
  }
}

export class LSPTokenNotFound extends Data.TaggedError('LSPTokenNotFound')<{
  cause: Error;
}> {
  get stackTrace() {
    return this.cause.stack ?? Error.captureStackTrace(this.cause);
  }

  static create(e: unknown) {
    if (e instanceof Error) return new LSPTokenNotFound({ cause: e });
    return new LSPTokenNotFound({ cause: new Error(e as string) });
  }
}

export type AnyLSPError = FileNotFound | LSPParserError | LSPTokenNotFound;

/**
 * ************* / LSP Error Models *************
 * */

const traverseNode = (index: number, handler: GraphState): TraversalResult => {
  if (handler.visited.has(index)) return handler.visited.get(index)!;
  const { node, childs, padStart, startText, endText } = handler.visitNodeIndex(index);
  const childNodes = childs.map((x) => traverseNode(x, handler));
  const childsText = childNodes.map((x) => `${padStart}${x.bodyText}`);
  const bodyText = [startText, childsText, endText].flat().join('\n');
  const result = {
    sourceInfo: node,
    childs: childNodes,
    bodyText,
    index,
  };

  handler.visited.set(index, result);
  return handler.visited.get(index)!;
};

export class GraphState {
  readonly lastNodeIndex: number;
  readonly currentIdent = '';
  visited = new Map<number, TraversalResult>();
  // private sourceNodes = new Map<string, SourceNodeInfo>();
  dfs: Graph.NodeWalker<SourceNodeInfo>;

  constructor(private readonly graph: Graph.Graph<SourceNodeInfo, SourceEdgeInfo>) {
    this.lastNodeIndex = graph.nextNodeIndex - 1;
    this.dfs = Graph.dfsPostOrder(this.graph, {
      direction: 'incoming',
      start: [this.lastNodeIndex],
    });
  }

  getChildEdges(graphIndex: number) {
    return Graph.findEdges(this.graph, (_data, sourceIndex, _target) => graphIndex === sourceIndex);
  }

  getNodeString(node: SourceNodeInfo) {
    const props = node.nodeRegion.attributes.map((_) => _.rawText).join(' ');
    return `${node.tagName} ${props}`;
  }

  findNode(index: number) {
    return Graph.getNode(this.graph, index);
  }

  fromPostOrder(index: number, node: SourceNodeInfo) {
    const childs = this.getChildEdges(index);
    let startText = '';
    let endText = '';
    const padStart = ''.padStart(this.lastNodeIndex - index, ' ');
    if (childs.length > 0) {
      startText = `${padStart}<${this.getNodeString(node)}>`;
      endText = `${padStart}</${node.tagName}>`;
    } else {
      startText = `${padStart}<${this.getNodeString(node)} />`;
    }
    return { node, childs, index, startText, endText, padStart };
  }

  visitNodeIndex(index: number) {
    const node = this.findNode(index).pipe(Option.getOrThrow);

    // const childs = this.getChildEdges(index).filter((x) => x > index);
    const childs = Graph.neighborsDirected(this.graph, index, 'incoming');
    // const childsIncoming = Graph.neighborsDirected(this.graph, index, 'incoming');
    let startText = '';
    let endText = '';
    const padStart = ''.padStart(this.lastNodeIndex - index, ' ');
    if (childs.length > 0) {
      startText = `${padStart}<${this.getNodeString(node)}>`;
      endText = `${padStart}</${node.tagName}>`;
    } else {
      startText = `${padStart}<${this.getNodeString(node)} />`;
    }
    return { node, childs: childs, index, startText, endText, padStart };
  }

  nodeToCode(index: number) {
    return traverseNode(index, this);
  }

  traverseNode = traverseNode;
}

export class SourceNodeInfo extends Data.TaggedClass('SourceNodeInfo')<{
  id: string;
  tagName: string;
  nodeRegion: JSXNode;
}> {}

export class SourceEdgeInfo extends Data.TaggedClass('SourceEdgeInfo')<{
  relationship: 'jsx-child';
  index: number;
  isRoot: boolean;
  nodeText: string;
}> {}

export interface TraversalResult {
  sourceInfo: SourceNodeInfo;
  childs: TraversalResult[];
  index: number;
  bodyText: string;
}
