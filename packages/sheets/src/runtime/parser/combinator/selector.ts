import { parseUntil } from '../composers/until';

// const matchDotSelector = matchString('.').map((result) => ({
//   type: 'dot-selector',
//   value: result,
// }));
// const matchAtSelector = matchString('@').map((result) => ({
//   type: 'at-selector',
//   value: result,
// }));
// const matchSharpSelector = matchString('#').map((result) => ({
//   type: 'sharp-selector',
//   value: result,
// }));

// export const matchCssSelector = matchChoice([
//   matchDotSelector,
//   matchAtSelector,
//   matchSharpSelector,
// ]);

export const matchCssSelector = parseUntil('{').map((result: any) => {
  return {
    type: 'selector',
    value: result.join(''),
  };
});
