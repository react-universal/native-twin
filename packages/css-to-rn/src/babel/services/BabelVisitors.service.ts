// import type { VisitNodeFunction } from '@babel/traverse';
// import * as t from '@babel/types';
// import * as RA from 'effect/Array';
// import * as Effect from 'effect/Effect';
// import { pipe } from 'effect/Function';
// import * as Hash from 'effect/Hash';
// import * as Option from 'effect/Option';
// import * as Queue from 'effect/Queue';
// import { Tree, TreeNode } from '@native-twin/helpers/tree';
// import type { JSXElementNodePath, JSXElementTree } from '../models/jsx.models';
// import * as babelPredicates from '../utils/babel.predicates';
// import { getBindingImportSource } from '../utils/babel.utils';
// import { getJSXElementName } from '../utils/jsx.utils';
// import { BabelCompiler } from './BabelCompiler.service';
// import { Chunk, Stream } from 'effect';

// interface TwinVisitorsState {
//   filename: string;
//   cssImports: string[];
//   trees: Tree<JSXElementTree>[];
//   queue: Queue.Queue<Tree<JSXElementTree>>;
// }
// interface TwinVisitors {
//   JSXElement: VisitNodeFunction<TwinVisitorsState, t.JSXElement>;
// }

// export const makeBabelVisitors = Effect.gen(function* () {
//   const babel = yield* BabelCompiler;
//   const queue = yield* Queue.unbounded<Tree<JSXElementTree>>();

//   const visitors: TwinVisitors = {
//     JSXElement(path, state) {
//       const uid = path.scope.generateUidIdentifier();
//       const hash = Hash.string(state.filename + uid.name);

//       const parentTree = new Tree<JSXElementTree>({
//         order: -1,
//         babelNode: path.node,
//         uid: `${hash}:0`,
//         source: getJSXElementSource(path),
//         cssImports: state.cssImports,
//         parentID: null,
//       });

//       gelBabelJSXElementChildLeaves(path, parentTree.root);
//       state.trees.push(parentTree);
//       state.queue.unsafeOffer(parentTree);
//       path.skip();
//     },
//   };
//   Stream.fromQueue(queue).pipe(
//     Stream.bindTo('trees'),
//     Stream.map(x => babel.getJSXElementTrees())
//   )
//   Queue.take(queue).pipe(
//     Effect.
//   )
//   return {};
// });

// const gelBabelJSXElementChildLeaves = (
//   path: JSXElementNodePath,
//   parent: TreeNode<JSXElementTree>,
// ) => {
//   const childs = pipe(
//     path.get('children'),
//     RA.filterMap(Option.liftPredicate(babelPredicates.isJSXElementPath)),
//   );

//   for (const childPath of childs) {
//     const order = parent.childrenCount;
//     const childUid = path.scope.generateUid();
//     // console.log('CHILD_UID: ', childUid);
//     const childLeave = parent.addChild({
//       order,
//       babelNode: childPath.node,
//       uid: `${parent.value.uid}:${order}_${childUid}`,
//       source: getJSXElementSource(childPath),
//       cssImports: parent.value.cssImports,
//       parentID: parent.value.uid,
//     });
//     childLeave.parent = parent;
//     gelBabelJSXElementChildLeaves(childPath, childLeave);
//   }
// };

// const getJSXElementSource = (path: JSXElementNodePath) =>
//   pipe(
//     getJSXElementName(path.node.openingElement),
//     Option.flatMap((x) => Option.fromNullable(path.scope.getBinding(x))),
//     Option.flatMap((binding) => getBindingImportSource(binding)),
//     Option.getOrElse(() => ({ kind: 'local', source: 'unknown' })),
//   );
