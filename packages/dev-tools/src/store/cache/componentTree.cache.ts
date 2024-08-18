import * as Equal from 'effect/Equal';
import * as Hash from 'effect/Hash';
import { RawJSXElementTreeNode } from '@native-twin/css/jsx';
import { pipe } from 'effect';

export class ComponentTreeNodeKey implements Equal.Equal {
  readonly id: string;
  readonly filename: string;
  readonly order: number;

  constructor(node: RawJSXElementTreeNode) {
    this.id = node.id;
    this.filename = node.filename;
    this.order = node.order;
  }

  [Equal.symbol](that: unknown): boolean {
    return (
      that instanceof ComponentTreeNodeKey &&
      this.id === that.id &&
      this.id === that.id &&
      this.order === that.order &&
      this.filename === that.filename
    );
  }
  [Hash.symbol](): number {
    return pipe(
      this.id,
      Hash.string,
      Hash.combine(this.order),
    )
  }
}

export const makeCmpTreeNodeKey = (node: RawJSXElementTreeNode) =>
  new ComponentTreeNodeKey(node);
