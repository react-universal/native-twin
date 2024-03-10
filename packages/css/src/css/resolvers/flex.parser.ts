// import type { FlexStyle } from 'react-native';
// import * as P from '@universal-labs/arc-parser';
// import { ParseCssDimensions } from '../dimensions.parser';

// /* flex-grow | flex-shrink | flex-basis */
// export const ParseFlexValue = P.choice([
//   P.sequenceOf([
//     ParseCssDimensions,
//     P.maybe(ParseCssDimensions),
//     P.maybe(P.choice([ParseCssDimensions, P.literal('auto')])),
//   ]).map(
//     ([flexGrow, flexShrink, flexBasis]): FlexStyle => ({
//       flexGrow,
//       flexShrink: flexShrink ?? flexGrow,
//       flexBasis: flexBasis ?? '0%',
//     }),
//   ),
//   P.literal('none').map((x) => ({
//     flex: x as unknown as number,
//   })),
// ]);
