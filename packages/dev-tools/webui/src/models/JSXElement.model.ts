import * as Equal from 'effect/Equal';
import * as Hash from 'effect/Hash';
import { type JSXElementSheet } from '@native-twin/css/jsx';

export interface RawJSXElementNode {
  node: string;
  order: number;
  parentNode: JSXElementNode | null;
  childs: JSXElementNode[];
  id: string;
}

export class JSXElementNode implements Equal.Equal {
  readonly node: string;
  readonly id: string;
  readonly parent: JSXElementNode | null;
  readonly order: number;
  readonly childs: JSXElementNode[];
  _runtimeSheet: JSXElementSheet | null = null;

  constructor(params: RawJSXElementNode) {
    this.childs = params.childs;
    this.order = params.order;
    this.parent = params.parentNode;

    this.id = params.id;
    this.node = params.node;
  }

  [Hash.symbol](): number {
    return Hash.hash(this.id);
  }

  [Equal.symbol](that: unknown): boolean {
    return that instanceof JSXElementNode && this.id === that.id;
  }
}
