import * as Tree from '@native-twin/helpers/tree';
import { Effect, Option, Stream } from 'effect';

interface MakeTreeInput<Input, Out> {
  input: Input;
  getChilds: (item: Input) => Input[];
  transform: (item: Input) => Out | null;
  shouldAdd?: (item: Out) => boolean;
}

export const makeTreeFrom = <Data, R>({
  getChilds,
  input,
  shouldAdd,
  transform,
}: MakeTreeInput<Data, R>): Tree.Tree<R> => {
  const root = transform(input)!;
  const tree = new Tree.Tree<R>(root);
  addChilds(input, tree.root);

  return tree;

  function addChilds(item: Data, parent: Tree.TreeNode<R>) {
    const childs = getChilds(item);
    for (const child of childs) {
      const next = transform(child);
      if (!next) continue;
      if (shouldAdd && !shouldAdd(next)) continue;

      const node = parent.addChild(next);
      addChilds(child, node);
    }
  }
};

interface MakeTreeInputEffect<Input, Out> {
  input: Input;
  getChilds: (item: Input) => Effect.Effect<Input[]>;
  transform: (item: Input) => Effect.Effect<Out | null>;
  shouldAdd?: (item: Out) => Effect.Effect<boolean>;
}

export const makeTreeFromEffect = <Data, R>({
  getChilds,
  input,
  shouldAdd,
  transform,
}: MakeTreeInputEffect<Data, R>): Effect.Effect<Tree.Tree<R>> =>
  Effect.gen(function* () {
    const root = yield* transform(input);
    const tree = new Tree.Tree<R>(root!);
    addChilds(input, tree.root);

    return tree;

    function addChilds(item: Data, parent: Tree.TreeNode<R>): Effect.Effect<void> {
      return Stream.fromIterableEffect(getChilds(item)).pipe(
        Stream.flatMap((data) =>
          Stream.suspend(() => Stream.make(data)).pipe(
            Stream.mapEffect((item) => transform(item)),
            Stream.filterMap((x) => Option.fromNullable(x)),
            Stream.filterEffect((r) =>
              Effect.fromNullable(shouldAdd).pipe(
                Effect.map((x) => !x(r)),
                Effect.orElse(() => Effect.succeed(false)),
              ),
            ),
            Stream.map((r) => parent.addChild(r, parent)),
            Stream.tap((r) => addChilds(data, r)),
          ),
        ),
        Stream.runDrain,
      );
    }
  });
