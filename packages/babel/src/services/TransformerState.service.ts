import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import { pipe } from 'effect/Function';
import * as Ref from 'effect/Ref';
import * as Scope from 'effect/Scope';
import { JSXElementNode } from '../jsx/models/JSXElement.model';

interface State {
  acquire(): Effect.Effect<JSXElementNode[], never, Scope.Scope>;
  acquired(): Effect.Effect<JSXElementNode[]>;
  insert(node: JSXElementNode): Effect.Effect<void>;
}

export class TransformerState implements State {
  constructor(readonly ref: Ref.Ref<JSXElementNode[]>) {}
  acquire(): Effect.Effect<JSXElementNode[], never, Scope.Scope> {
    return pipe(
      Ref.get(this.ref),
      Effect.zipRight(this.acquired()),
      Effect.uninterruptible,
    );
  }

  acquired(): Effect.Effect<JSXElementNode[]> {
    return pipe(Ref.get(this.ref));
  }

  released(): Effect.Effect<JSXElementNode[]> {
    return pipe(Ref.get(this.ref));
  }
  insert(node: JSXElementNode): Effect.Effect<JSXElementNode> {
    return Ref.modify(this.ref, (nodes) => [node, nodes]);
  }

  static make = (): Effect.Effect<TransformerState> => {
    return pipe(
      Ref.make<JSXElementNode[]>([]),
      Effect.map((ref) => new TransformerState(ref)),
    );
  };
}

const TransformerServiceTypeId = Symbol.for('effect/Reloadable/transformer-state');
type TransformerServiceTypeId = typeof TransformerServiceTypeId;

interface TransformerService {
  readonly [TransformerServiceTypeId]: TransformerServiceTypeId;
}

export const TransformerService: TransformerService = {
  [TransformerServiceTypeId]: TransformerServiceTypeId,
};

export const TransformerStateTag = Context.GenericTag<TransformerService>(
  'babel/transformer-state-context',
);
