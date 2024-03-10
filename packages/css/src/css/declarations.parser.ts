// import * as P from '@universal-labs/arc-parser';
// import { ident, parseDeclarationProperty } from '../common.parsers';
// import type { AnyStyle } from '../types/rn.types';
// import { getPropertyValueType } from '../utils.parser';
// import { ParseCssDimensions } from './dimensions.parser';
// import { ParseAspectRatio } from './resolvers/aspect-ratio.parser';
// import { ParseShadowValue } from './resolvers/box-shadow.parser';
// import { ParseCssColor } from './resolvers/color.parser';
// import { ParseFlexValue } from './resolvers/flex.parser';
// import { ParseRotateValue } from './resolvers/rotate.parser';
// import { ParseSkewValue } from './resolvers/skew.parser';
// import { ParseTranslateValue } from './resolvers/translate.parser';

// export const ParseCssDeclarationLine = P.coroutine((run) => {
//   const getValue = () => {
//     const property = run(parseDeclarationProperty);
//     const meta = getPropertyValueType(property);
//     if (meta == 'DIMENSION') {
//       return {
//         [kebab2camel(property)]: run(ParseCssDimensions),
//       };
//     }
//     if (meta == 'FLEX') {
//       return run(ParseFlexValue);
//     }

//     if (meta == 'SHADOW') {
//       return run(ParseShadowValue);
//     }

//     if (meta == 'MATH') {
//       return run(ParseAspectRatio);
//     }

//     if (meta == 'TRANSFORM') {
//       return {
//         transform: run(P.choice([ParseTranslateValue, ParseRotateValue, ParseSkewValue])),
//       };
//     }

//     if (meta == 'COLOR') {
//       const value = run(ParseCssColor);
//       return {
//         [kebab2camel(property)]: value,
//       };
//     }

//     //CSS:  .font-sans{font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,"Noto Sans",sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji"}

//     if (meta == 'FIRST-COMMA-IDENT') {
//       const value = P.separatedByComma(
//         P.many(P.choice([ident, P.whitespace, P.char('"')])),
//       ).map((x) => {
//         return x;
//       });
//       return {
//         [kebab2camel(property)]: run(value)[0]![0],
//       };
//     }
//     return {
//       [kebab2camel(property)]: run(ident),
//     };
//   };

//   const composeValue = (result: AnyStyle = {}): AnyStyle => {
//     run(P.maybe(P.char(';')));
//     const isValid = run(P.peek) !== '}' || run(P.peek) == '"';
//     if (!isValid) return result;
//     let value = {
//       ...result,
//       ...getValue(),
//     };
//     if (run(P.peek) == ';') {
//       return composeValue(value);
//     }
//     return value;
//   };

//   return composeValue();
// });

// function kebab2camel(input: string) {
//   if (!input.includes('-')) return input;
//   return input.replace(/-./g, (x) => x.toUpperCase().charAt(1));
// }
