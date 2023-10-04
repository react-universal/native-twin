import type {
  ValidAppearancePseudoSelector,
  ValidChildPseudoSelector,
  ValidGroupPseudoSelector,
  ValidInteractionPseudoSelector,
  ValidPlatformPseudoSelector,
} from '../constants/pseudo.constants';

export type SelectorGroup = 'base' | 'group' | 'pointer' | 'first' | 'last' | 'odd' | 'even';

type CSSUnits =
  | 'em'
  | 'rem'
  | 'px'
  | 'cn'
  | 'vh'
  | 'pc'
  | 'vw'
  | 'deg'
  | 'ex'
  | 'in'
  | '%'
  | 'turn'
  | 'rad';

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
