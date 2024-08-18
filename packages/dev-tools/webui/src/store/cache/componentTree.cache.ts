import * as Equal from 'effect/Equal';
import { pipe } from 'effect/Function';
import * as Hash from 'effect/Hash';

export class ComponentTreeNodeKey implements Equal.Equal {
  readonly id: string;
  readonly order: number;
  constructor(node: { id: string; order: number }) {
    this.id = node.id;
    this.order = node.order;
  }

  [Equal.symbol](that: unknown): boolean {
    return (
      that instanceof ComponentTreeNodeKey &&
      this.id === that.id &&
      this.order === that.order
    );
  }
  [Hash.symbol](): number {
    return pipe(this.id, Hash.string, Hash.combine(this.order));
  }
}

export const makeCmpTreeNodeKey = (node: { id: string; order: number }) =>
  new ComponentTreeNodeKey(node);
