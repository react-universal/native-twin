// import * as t from '@babel/types';
// import * as Effect from 'effect/Effect';
// import { pipe } from 'effect/Function';
// import * as HM from 'effect/HashMap';
// import * as HashSet from 'effect/HashSet';
// import * as Option from 'effect/Option';
// import { TransformerContext } from '../services/TransformerContext.service';
// import { addJsxAttribute } from './jsx.builder';
// import { elementNodeToTree } from './jsx.debug';
// import { JSXCompilerService } from './jsx.service';
// import { JSXElementNode, jsxElementNodeKey } from './models/JSXElement.model';
// import { entriesToObject, runtimeEntriesToAst } from './twin.maps';

// export const jsxTransformerProgram = Effect.gen(function* () {
//   const ctx = yield* TransformerContext;
//   const { path, state } = yield* JSXCompilerService;
//   const nodeKey = jsxElementNodeKey(path, state);

//   const elementNode = pipe(
//     state.visited,
//     HM.get(nodeKey),
//     Option.map((x) => x),
//     Option.match({
//       onNone: () => new JSXElementNode(path, 0, state, null),
//       onSome: (x) => x,
//     }),
//   );

//   const sheet = elementNode.getTwinSheet(
//     ctx.twin,
//     ctx.twCtx,
//     HashSet.size(elementNode.childs),
//   );

//   const stringEntries = entriesToObject(elementNode.id, sheet.propEntries);
//   const astProps = runtimeEntriesToAst(stringEntries.styledProp);

//   if (!elementNode.parent) {
//     // console.log('STATE: ', state);
//     const treeProp = elementNodeToTree(elementNode, state.filename ?? 'Unknown_file');
//     if (treeProp.properties.length > 0) {
//       elementNode.openingElement.attributes.push(
//         t.jsxAttribute(
//           t.jsxIdentifier('_twinComponentTree'),
//           t.jsxExpressionContainer(treeProp),
//         ),
//       );
//     }
//   }
//   if (astProps) {
//     elementNode.openingElement.attributes.push(
//       t.jsxAttribute(
//         t.jsxIdentifier('_twinComponentSheet'),
//         t.jsxExpressionContainer(astProps),
//       ),
//     );
//   }

//   const astTemplateProps = runtimeEntriesToAst(stringEntries.templateEntries);
//   if (astTemplateProps) {
//     elementNode.openingElement.attributes.push(
//       t.jsxAttribute(
//         t.jsxIdentifier('_twinComponentTemplateEntries'),
//         t.jsxExpressionContainer(astTemplateProps),
//       ),
//     );
//   }
//   addJsxAttribute(elementNode.path.node, '_twinComponentID', elementNode.id);
//   addJsxAttribute(elementNode.path.node, '_twinOrd', elementNode.order);

//   return { elementNode, nodeKey };
// });
