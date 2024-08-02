import * as RA from 'effect/Array';
import * as Effect from 'effect/Effect';
import { pipe } from 'effect/Function';
import * as HashSet from 'effect/HashSet';
import * as Queue from 'effect/Queue';
import { JSXElementNode } from '../models/JSXElement.model';

export const traverseASTQueue = (nodeSet: HashSet.HashSet<JSXElementNode>) => {
  return Effect.gen(function* () {
    const queue = yield* Queue.unbounded<JSXElementNode>();
    yield* Effect.all(flatElements(RA.fromIterable(nodeSet)), {
      concurrency: 'unbounded',
    });

    const concurrentElements = yield* Queue.takeAll(queue);

    return concurrentElements;

    function sendElement(queue: Queue.Enqueue<JSXElementNode>, value: JSXElementNode) {
      return queue.offer(value);
    }

    function flatElements(elements: Array<JSXElementNode>) {
      return pipe(
        elements,
        RA.fromIterable,
        RA.flatMap((x): Effect.Effect<boolean>[] => {
          return [sendElement(queue, x), ...flatElements(RA.fromIterable(x.childs))];
        }),
      );
    }
  });
};
