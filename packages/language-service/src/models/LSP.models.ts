import * as NumberADT from '@effect/typeclass/data/Number';
import * as Monoid from '@effect/typeclass/Monoid';
import * as SemiGroup from '@effect/typeclass/Semigroup';
import * as RA from 'effect/Array';
import * as Data from 'effect/Data';
import * as Equivalence from 'effect/Equivalence';
import * as Graph from 'effect/Graph';
import * as Option from 'effect/Option';
import * as Order from 'effect/Order';
import * as Schema from 'effect/Schema';
import * as Tuple from 'effect/Tuple';
import type * as t from 'vscode-languageserver-types';

export class Position extends Schema.Class<Position>('Position')({
  line: Schema.Number,
  character: Schema.Number,
}) {}

export namespace Position {
  export const semigroup: SemiGroup.Semigroup<Position> = SemiGroup.struct({
    character: NumberADT.SemigroupSum,
    line: NumberADT.SemigroupMax,
  });

  export const monoid = Monoid.fromSemigroup(semigroup, Position.make({ character: 0, line: 0 }));

  export const product = SemiGroup.Product.of(semigroup);

  export const sum = semigroup.combine;

  export const decodeUnknown = Schema.decodeUnknownSync(Position);

  export const eq: Equivalence.Equivalence<Position> = Equivalence.struct({
    character: Equivalence.number,
    line: Equivalence.number,
  });

  export const order: Order.Order<Position> = Order.struct({
    character: Order.number,
    line: Order.number,
  });
}

export class Range extends Schema.Class<Range>('Range')({ start: Position, end: Position }) {}

export namespace Range {
  export const semigroup: SemiGroup.Semigroup<Range> = SemiGroup.struct({
    start: Position.semigroup,
    end: Position.semigroup,
  });

  export const monoid = Monoid.fromSemigroup(
    semigroup,
    new Range({ start: Position.monoid.empty, end: Position.monoid.empty }),
  );
  export const sum = semigroup.combine;

  export const encode = (vsRange: t.Range) =>
    new Range({ start: Position.make(vsRange.start), end: Position.make(vsRange.end) });

  export const from = (start: Position | t.Position, end: Position | t.Position) =>
    new Range({ start: Position.make(start), end: Position.make(end) });

  export const equals: Equivalence.Equivalence<Range> = Equivalence.mapInput(
    Equivalence.product(Position.eq, Position.eq),
    (range: Range) => Tuple.make(range.start, range.end),
  );

  export const order: Order.Order<Range> = Order.struct({
    start: Position.order,
    end: Position.order,
  });

  export const sort = RA.sortBy<Range[]>(Range.order);
}

export class Location extends Schema.Class<Location>('Location')({
  uri: Schema.String,
  range: Range,
}) {}

export namespace Location {
  export const from = (uri: string, range: Range) => new Location({ uri, range });

  export const equals: Equivalence.Equivalence<Location> = Equivalence.mapInput(
    Equivalence.product(Equivalence.string, Range.equals),
    (location: Location) => Tuple.make(location.uri, location.range),
  );
}

export namespace Regions {
  export class Node extends Schema.Class<Node>('Node')({
    startLine: Schema.NullOr(Schema.Number),
    endLine: Schema.NullOr(Schema.Number),
    startOffset: Schema.Number,
    endOffset: Schema.Number,
    /** @description this text may have the literal container AKA `|'|" even template literal vars xor expressions */
    rawText: Schema.String,
  }) {}

  export namespace Node {
    export const toRange = (self: Node) =>
      Range.from(
        Position.decodeUnknown({ line: self.startLine ?? 1, character: self.startOffset }),
        Position.decodeUnknown({ line: self.endLine ?? 1, character: self.endOffset }),
      );
    export const eq = Equivalence.mapInput(Range.equals, toRange);
  }

  export class JSXAttributeName extends Node.extend<JSXAttributeName>('JSXAttributeName')({
    _tag: Schema.Literal('JSXAttributeName').pipe(
      Schema.propertySignature,
      Schema.withConstructorDefault(() => 'JSXAttributeName'),
    ),
    text: Schema.String,
  }) {}

  export class JSXAttributeValue extends Node.extend<JSXAttributeValue>('JSXAttributeValue')({
    _tag: Schema.Literal('JSXAttributeValue').pipe(
      Schema.propertySignature,
      Schema.withConstructorDefault(() => 'JSXAttributeValue'),
    ),
    text: Schema.String,
  }) {}

  export class JSXTagName extends Node.extend<JSXTagName>('JSXTagName')({
    _tag: Schema.Literal('JSXTagName').pipe(
      Schema.propertySignature,
      Schema.withConstructorDefault(() => 'JSXTagName'),
    ),
  }) {}

  export class JSXAttribute extends Node.extend<JSXAttribute>('JSXAttribute')({
    _tag: Schema.Literal('JSXAttribute').pipe(
      Schema.propertySignature,
      Schema.withConstructorDefault(() => 'JSXAttribute'),
    ),
    name: JSXAttributeName,
    value: JSXAttributeValue,
  }) {}
  /**
   * @name JSXNodeRegion
   * @description refers to JSX nodes like <div... /> | <div>...</div>
   * @see This just collect root nodes once wants to work with those needs yo traverse its childs
   * */
  export class JSXNode extends Node.extend<JSXNode>('JSXNode')({
    _tag: Schema.Literal('JSXNode').pipe(
      Schema.propertySignature,
      Schema.withConstructorDefault(() => 'JSXNode'),
    ),
    id: Schema.String,
    text: Schema.String,
    attributes: Schema.Array(JSXAttribute),
    tag: JSXTagName,
    parent: Schema.NullOr(Schema.suspend((): Schema.Schema<JSXNode> => JSXNode)),
  }) {}

  export const AnyParsedNode = Schema.Union(
    JSXAttribute,
    JSXAttributeName,
    JSXAttributeValue,
    JSXNode,
    JSXTagName,
  );

  export type AnyParsedNode = typeof AnyParsedNode.Type;
}

// export interface ParsedTwinConfigFile {
//   userTheme: InternalTwinConfig['theme'];
//   presets: {
//     caller: string;
//     source: string;
//     importBinding: string;
//   }[];
//   rules: Array<object>;
//   content: InternalTwinConfig['content'];
//   preflight: InternalTwinConfig['preflight'];
//   darkMode: InternalTwinConfig['darkMode'];
//   variants: InternalTwinConfig['variants'];
//   root: InternalTwinConfig['root'];
// }

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

export namespace LSPGraph {
  export class SourceNodeInfo extends Data.TaggedClass('SourceNodeInfo')<{
    id: string;
    tagName: string;
    nodeRegion: Regions.JSXNode;
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

  export class GraphState {
    readonly lastNodeIndex: number;
    readonly currentIdent = '';
    visited = new Map<number, LSPGraph.TraversalResult>();
    // private sourceNodes = new Map<string, SourceNodeInfo>();
    dfs: Graph.NodeWalker<LSPGraph.SourceNodeInfo>;

    constructor(
      private readonly graph: Graph.Graph<LSPGraph.SourceNodeInfo, LSPGraph.SourceEdgeInfo>,
    ) {
      this.lastNodeIndex = graph.nextNodeIndex - 1;
      this.dfs = Graph.dfsPostOrder(this.graph, {
        direction: 'incoming',
        start: [this.lastNodeIndex],
      });
    }

    getChildEdges(graphIndex: number) {
      return Graph.findEdges(
        this.graph,
        (_data, sourceIndex, _target) => graphIndex === sourceIndex,
      );
    }

    getNodeString(node: LSPGraph.SourceNodeInfo) {
      const props = node.nodeRegion.attributes.map((_) => _.rawText).join(' ');
      return `${node.tagName} ${props}`;
    }

    findNode(index: number) {
      return Graph.getNode(this.graph, index);
    }

    fromPostOrder(index: number, node: LSPGraph.SourceNodeInfo) {
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
  }
}
