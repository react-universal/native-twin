import type {
  ValidAppearancePseudoSelector,
  ValidChildPseudoSelector,
  ValidGroupPseudoSelector,
  ValidInteractionPseudoSelector,
  ValidPlatformPseudoSelector,
} from '../css/css.types';

export type SelectorGroup = 'base' | 'group' | 'pointer' | 'first' | 'last' | 'odd' | 'even';

export type CSSUnits =
  | 'px'
  | '%'
  | 'em'
  | 'rem'
  | 'deg'
  | 'vh'
  | 'vw'
  | 'rad'
  | 'turn'
  | 'pc'
  | 'cn'
  | 'ex'
  | 'in'
  | 'pt'
  | 'cm'
  | 'mm'
  | 'Q';

export type CSSLengthUnit = {
  [U in CSSUnits]: {
    value: number;
    units: U;
  };
}[CSSUnits];

type CSSPointerEventKind = 'hover' | 'active' | 'focus';

export type CSSPointerEvent = {
  [U in CSSPointerEventKind]: {
    value: number;
    unit: U;
  };
}[CSSPointerEventKind];

export interface SelectorPayload {
  group: SelectorGroup;
  selectorName: string;
  pseudoSelectors: (
    | ValidInteractionPseudoSelector
    | ValidChildPseudoSelector
    | ValidPlatformPseudoSelector
    | ValidGroupPseudoSelector
    | ValidAppearancePseudoSelector
  )[];
}

export interface SheetInteractionState {
  isPointerActive: boolean;
  isParentActive: boolean;
}

export interface SheetRule {
  className: string;
  declarations: {
    property: string;
    value: string;
  };
  isMedia: boolean;
  pseudos: string[];
}

export interface GlobalSheet {
  readonly target: Map<string, SheetRule>;
  readonly insertedClasses: Set<string>;
  insert(rule: SheetRule): void;
  snapshot(): () => void;
  clear(): void;
  stringify(): string;
}

export type CssFeature =
  | 'edges'
  | 'corners'
  | 'colors'
  | 'default'
  | 'gap'
  | 'transform-2d'
  | 'transform-3d';
