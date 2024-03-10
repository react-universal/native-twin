// import * as P from '@universal-labs/arc-parser';
// import { ident } from '../common.parsers';
// import type { SelectorPayload } from '../types/css.types';

// const mapToken =
//   <A extends string>(type: A) =>
//   <B>(value: B) => ({
//     type,
//     value,
//   });

// const ChildPseudoClasses = P.choice([
//   P.literal('first-child'),
//   P.literal('last-child'),
//   P.literal('even'),
//   P.literal('odd'),
// ]);

// const PlatformPseudoClasses = P.choice([
//   P.literal('web'),
//   P.literal('native'),
//   P.literal('ios'),
//   P.literal('android'),
// ]);

// const PointerPseudoClasses = P.choice([
//   P.literal('hover'),
//   P.literal('focus'),
//   P.literal('active'),
// ]);
// const GroupPointerPseudoClasses = P.choice([
//   P.literal('group-hover'),
//   P.literal('group-focus'),
//   P.literal('group-active'),
//   P.literal('group'),
// ]);

// const AppearancePseudoClasses = P.choice([P.literal('dark'), P.literal('light')]);

// const ParseSelectorClassName = P.many1(
//   P.choice([
//     ident,
//     P.skip(P.char('\\')),
//     P.char('['),
//     P.char(']'),
//     P.char('%'),
//     P.char('('),
//     P.char(')'),
//   ]),
// ).map((x) => x.join(''));

// const ParseSelectorPart = P.choice([
//   ChildPseudoClasses.map(mapToken('CHILD_PSEUDO_CLASS')),
//   GroupPointerPseudoClasses.map(mapToken('GROUP_PSEUDO_CLASS')),
//   PointerPseudoClasses.map(mapToken('POINTER_PSEUDO_CLASS')),
//   PlatformPseudoClasses.map(mapToken('PLATFORM_PSEUDO_CLASS')),
//   AppearancePseudoClasses.map(mapToken('APPEARANCE_PSEUDO_CLASS')),
//   ParseSelectorClassName.map(mapToken('IDENT_PSEUDO_CLASS')),
// ]);

// export const ParseSelectorStrict = P.coroutine((run) => {
//   const token = parseNextPart();
//   const selectorToken = mapToken('SELECTOR');
//   const data = run(P.getData);
//   run(P.setData({ ...data }));

//   return selectorToken(token);

//   function parseNextPart(
//     result: SelectorPayload = { pseudoSelectors: [], selectorName: '', group: 'base' },
//   ): SelectorPayload {
//     const nextToken = run(P.peek);
//     if (nextToken == '{') {
//       return result;
//     }
//     if (nextToken == ' ') {
//       run(P.skip(P.char(' ')));
//       return parseNextPart(result);
//     }
//     if (nextToken == '\\') {
//       run(P.skip(P.many(P.char('\\'))));
//       return parseNextPart(result);
//     }
//     if (nextToken == ':') {
//       run(P.skip(P.char(':')));
//     }

//     if (nextToken == '.') {
//       run(P.skip(P.char('.')));
//     }
//     if (nextToken == '#') {
//       run(P.skip(P.char('#')));
//     }
//     const nextPart = run(ParseSelectorPart);
//     if (nextPart.type == 'IDENT_PSEUDO_CLASS') {
//       if (result.selectorName == '') {
//         result.selectorName = nextPart.value;
//       }
//     } else {
//       if (!result.pseudoSelectors.includes(nextPart.value)) {
//         result.pseudoSelectors.push(nextPart.value);
//       }
//     }
//     if (result.group == 'base') {
//       if (nextPart.type == 'APPEARANCE_PSEUDO_CLASS') {
//         result.group = 'base';
//       }
//       if (nextPart.type == 'CHILD_PSEUDO_CLASS') {
//         switch (nextPart.value) {
//           case 'even':
//             result.group = 'even';
//             break;
//           case 'first-child':
//             result.group = 'first';
//             break;
//           case 'last-child':
//             result.group = 'last';
//             break;
//           case 'odd':
//             result.group = 'odd';
//             break;
//         }
//       }
//       if (nextPart.type == 'POINTER_PSEUDO_CLASS') {
//         result.group = 'pointer';
//       }
//       if (nextPart.type == 'GROUP_PSEUDO_CLASS') {
//         result.group = 'group';
//       }
//     }
//     return parseNextPart(result);
//   }
// });
