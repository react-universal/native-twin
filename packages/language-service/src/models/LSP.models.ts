import * as Data from 'effect/Data';
import * as Graph from 'effect/Graph';
import * as Option from 'effect/Option';
import type * as t from 'vscode-languageserver-types';

export interface TwinLSPNode<Tag extends string> {
  readonly _tag: Tag;
  range: LSPRange;
  rawText: string;
}

export interface LSPParsableRegion {
  __parsable: 'LSPParsableRegion';
  /** @description this text may have the literal container AKA `|'|" even template literal vars xor expressions */
  rawText: string;
  text: string;
  range: LSPRange;
}

export interface JsxAttributeBindingRegion extends TwinLSPNode<'JsxAttributeBindingRegion'> {}
export interface JsxAttributeValueRegion
  extends LSPParsableRegion,
    TwinLSPNode<'JsxAttributeValueRegion'> {}

export interface JsxAttributeRegion extends TwinLSPNode<'JsxAttributeRegion'> {
  attributeBinding: JsxAttributeBindingRegion;
  attributeValue: JsxAttributeValueRegion;
}
/**
 * @name JsxNodeRegion
 * @description refers to jsx nodes like <div... /> | <div>...</div>
 * @see This just collect root nodes once wants to work with those needs yo traverse its childs
 * */
export interface JsxNodeRegion extends TwinLSPNode<'JsxNodeRegion'> {
  id: string;
  styledProps: JsxAttributeRegion[];
  tagName: JSXNodeTagNameRegion;
  parent: JsxNodeRegion | null;
}

export interface JSXNodeTagNameRegion extends TwinLSPNode<'JsxTagName'> {}

export type AnyTwinNodeRegion =
  | JsxAttributeRegion
  | JsxNodeRegion
  | JsxAttributeBindingRegion
  | JsxAttributeValueRegion
  | JSXNodeTagNameRegion;

/**
 * ************* / LSP identities *************
 * */

/**
 * ************* LSP Error Models *************
 * */

export class LSPPosition extends Data.TaggedClass('LSPPosition')<t.Position> {
  static create(line: number, character: number) {
    return new LSPPosition({ line, character });
  }
  static fromObject(pos: { line: number; character: number }) {
    return this.create(pos.line, pos.character);
  }
}

export class LSPRange extends Data.TaggedClass('LSPRange')<{
  start: LSPPosition;
  end: LSPPosition;
}> {
  static create(start: LSPPosition, end: LSPPosition) {
    return new LSPRange({ start, end });
  }
  static fromObject({ start, end }: { start: t.Position; end: t.Position }) {
    return this.create(
      LSPPosition.create(start.line, start.character),
      LSPPosition.create(end.line, end.character),
    );
  }
}

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
    const props = node.nodeRegion.styledProps.map((_) => _.rawText).join(' ');
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
  nodeRegion: JsxNodeRegion;
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
