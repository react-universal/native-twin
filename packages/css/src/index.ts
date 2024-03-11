// CONSTANTS
export {
  EMPTY_ARRAY,
  EMPTY_COMPONENT_SHEET,
  EMPTY_OBJECT,
  defaultGroupState,
} from './constants/empties';
export {
  AppearancePseudoSelectors,
  ChildPseudoSelectors,
  GroupInteractionPseudoSelectors,
  InteractionPseudoSelectors,
  PlatformPseudoSelectors,
  type ValidAppearancePseudoSelector,
  type ValidChildPseudoSelector,
  type ValidGroupPseudoSelector,
  type ValidInteractionPseudoSelector,
  type ValidPlatformInteractionPseudoSelector,
  type ValidPlatformPseudoSelector,
} from './constants/pseudo.constants';
export { cornerMap, directionMap, globalKeywords } from './constants/mappings';
export {
  type SimplePseudos,
  simplePseudoLookup,
  simplePseudos,
} from './constants/simplePseudos';
export { unitlessCssProps } from './constants/css.unitless';

export {
  cssValueUnitParser as declarationUnitParser,
  declarationValueWithUnitParser,
} from './features/css/css-common.parser';

// CONVERT
export { toCamelCase } from './convert/toCamelCase';
export { toHyphenCase } from './convert/toHyphenCase';
export { toTailDashed } from './convert/toTailDashed';
export { toColorValue } from './convert/toColorValue';

//CSS UTILS
export { getPropertyValueType } from './utils.parser';
export { fixHTMLTagClassNamesList } from './utils/fix-classnames-list';

export {
  type ConvertedRule,
  Layer,
  atRulePrecedence,
  declarationPropertyPrecedence,
  moveToLayer,
  pseudoPrecedence,
  separatorPrecedence,
} from './css/precedence';

export { escapeSelector } from './utils/escape-selector';
export { compareClassNames } from './utils/compare';
export { hash } from './utils/hash';

// Sheets
export { globalSheet } from './sheets/virtual';

// TYPES
export type * from './types/rn.types';
export type * from './types/parser.types';
export type * from './types/css.types';

// TAILWIND
export { parseTWTokens, getTWFeatureParser } from './features/tailwind';
export type {
  TWParsedRule,
  ArbitrarySegmentToken,
  RuleHandlerToken,
  SegmentToken,
} from './features/tailwind';
