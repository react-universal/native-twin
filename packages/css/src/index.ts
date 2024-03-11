export {
  cssValueUnitParser as declarationUnitParser,
  declarationValueWithUnitParser,
} from './css/css-common.parser';

//CSS UTILS
export { getPropertyValueType } from './utils.parser';

export {
  type ConvertedRule,
  Layer,
  atRulePrecedence,
  declarationPropertyPrecedence,
  moveToLayer,
  pseudoPrecedence,
  separatorPrecedence,
} from './css/precedence';

// Sheets
export {
  SHEET_EMPTY_ARRAY,
  EMPTY_COMPONENT_SHEET,
  SHEET_EMPTY_OBJECT,
  defaultGroupState,
} from './sheets';

// TYPES
export type * from './types/rn.types';
export type * from './types/parser.types';
export type * from './types/css.types';

// TAILWIND
export {
  parseTWTokens,
  getTWFeatureParser,
  cornerMap,
  directionMap,
  globalKeywords,
} from './tailwind';

export type {
  TWParsedRule,
  ArbitrarySegmentToken,
  RuleHandlerToken,
  SegmentToken,
} from './tailwind';

// CSS FEATURES
export {
  AppearancePseudoSelectors,
  ChildPseudoSelectors,
  GroupInteractionPseudoSelectors,
  InteractionPseudoSelectors,
  PlatformPseudoSelectors,
  simplePseudos,
  simplePseudoLookup,
  unitlessCssProps,
} from './css';

export type {
  ValidAppearancePseudoSelector,
  ValidChildPseudoSelector,
  ValidGroupPseudoSelector,
  ValidInteractionPseudoSelector,
  ValidPlatformInteractionPseudoSelector,
  ValidPlatformPseudoSelector,
} from './css';

// HTML
export { getStyleElement } from './html';
