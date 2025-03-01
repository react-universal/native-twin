import * as Tree from '@native-twin/helpers/tree';
import * as RA from 'effect/Array';
import * as Option from 'effect/Option';
import * as Stream from 'effect/Stream';
import * as Effect from 'effect/Effect';

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

export const mapTreeEffect = <A, B>(
  tree: Tree.Tree<A>,
  cb: (a: Tree.TreeNode<A>, parent?: Tree.TreeNode<NoInfer<B>>) => Effect.Effect<B>,
) =>
  Effect.gen(function* () {
    const newValue = yield* mapTreeNodeEffect(tree.root);
    const node = new Tree.Tree<B>(newValue.value);
    node.root = newValue;
    return node;

    function mapTreeNodeEffect(
      node: Tree.TreeNode<A>,
      parent?: Tree.TreeNode<B>,
    ): Effect.Effect<Tree.TreeNode<B>> {
      return Effect.gen(function* () {
        const newValue = yield* cb(node, parent);
        const newNode =
          parent?.addChild(newValue, parent) ?? new Tree.TreeNode(newValue, parent);

        for (const child of node.children) {
          yield* mapTreeNodeEffect(child, newNode);
        }
        return newNode;
      });
    }
  });

const traverseTreeNode = <T>(
  treeNode: Tree.TreeNode<T>,
  callback: (node: Tree.TreeNode<T>) => Effect.Effect<void>,
): Effect.Effect<void> =>
  Stream.fromIterable(RA.reverse(treeNode.children)).pipe(
    Stream.runForEach((leaf) =>
      Effect.zipRight(callback(treeNode), traverseTreeNode(leaf, callback)),
    ),
    Stream.runDrain,
  );

/**
 * Traverses the tree using the specified traversal method,
 * calling the provided callback function on each visited node.
 * @param callback A function to call on each visited node.
 * @param traversal The traversal method to use. Can be one of:
 * 'breadthFirst', 'depthFirst', 'preOrder', 'postOrder'.
 */
export const traverseTreeEffect = <T>(
  tree: Tree.Tree<T>,
  callback: (node: Tree.TreeNode<T>) => Effect.Effect<void>,
) => traverseTreeNode(tree.root, callback);
