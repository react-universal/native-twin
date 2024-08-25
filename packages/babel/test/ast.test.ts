import * as Effect from 'effect/Effect';
import { pipe } from 'effect/Function';
import fs from 'fs';
import path from 'path';
import { createBabelAST } from '../src/babel';
import { getAstTrees } from '../src/jsx';

describe('test ast trees', () => {
  it('Create JSX tree', async () => {
    const filePath = path.join(__dirname, 'fixtures', 'jsx', 'code-ast.tsx');
    const code = fs.readFileSync(filePath);
    const ast = createBabelAST(code.toString('utf-8'));
    const result = await pipe(getAstTrees(ast, filePath), Effect.runPromise);
    expect(result.parents.length).toBeGreaterThan(0);
  });
});

// const traverseFile = (ast: any) =>
//   new Promise<any[]>((resolve) => {
//     traverse(
//       ast,
//       {
//         Program: {
//           exit() {
//             console.log('EXIT: ');
//             console.log(inspect(this.forest, false, null, true));
//             console.group('BFS');
//             this.forest.traverse((node) => {
//               console.log(node.value + '\n');
//             }, 'breadthFirst');
//             console.groupEnd();

//             console.group('DFS');
//             this.forest.traverse((node) => {
//               console.log(node.value + '\n');
//             }, 'depthFirst');
//             console.groupEnd();

//             console.group('postOrder');
//             this.forest.traverse((node) => {
//               console.log(node.value + '\n');
//             }, 'postOrder');
//             console.groupEnd();
//             console.group('preOrder');
//             this.forest.traverse((node) => {
//               console.log(node.value + '\n');
//             }, 'preOrder');
//             console.groupEnd();
//             resolve(this.astCollection);
//           },
//         },
//         JSXElement: {
//           enter(path) {
//             const attributes = path.get('openingElement').get('attributes');

//             pipe(
//               attributes,
//               Array.filterMap(Option.liftPredicate(isJSXAttributePath)),
//               Array.filterMap((x) => {
//                 const value = x.get('value');
//                 const name = x.get('name');
//                 if (!value.isStringLiteral() || !name.isJSXIdentifier())
//                   return Option.none();
//                 return Option.some({
//                   value: value.node.value,
//                   childs: [],
//                 });
//               }),
//               Array.forEach((x) => {
//                 this.astCollection.push(x);
//               }),
//             );
//           },
//           exit() {
//             if (this.astCollection.length > 1) {
//               const child = this.astCollection.pop();
//               const parent = this.astCollection[this.astCollection.length - 1];

//               if (this.forest.root.value === null) {
//                 this.forest.root = new TreeNode(parent.value);
//               } else {
//                 const findParent = this.forest.root
//                   .all()
//                   .find((x) => x.value === parent.value);
//                 console.log('FF: ', findParent);
//                 if (findParent) {
//                   findParent.addChild(child.value);
//                 } else {
//                   const parentNode = this.forest.root.addChild(parent.value);
//                   parentNode.addChild(child.value);
//                 }
//               }
//               if (child && parent) {
//                 parent.childs.push(child);
//               } else {
//                 console.log('NONE');
//               }
//             }
//           },
//         },
//       },
//       undefined,
//       {
//         astCollection: [] as any[],
//         forest: new Tree<any>(null),
//         current: new Tree<any>(null),
//       },
//     );
//   });
