export interface CssSheetNode {
  type: 'sheet';
  rules: (CssRuleNode | CssAtRuleNode)[];
}

export interface CssRuleNode {
  type: 'rule';
  group: SelectorGroup;
  selector: string;
  declarations: CssDeclarationNode[];
}

export interface CssAtRuleNode extends Omit<CssRuleNode, 'type'> {
  type: 'at-rule';
}

export interface CssDeclarationNode {
  type: 'declaration';
  property: string;
  value: CssDeclarationValueNode;
}

/* CSS VALUE TYPES */
export interface CssValueRawNode {
  type: 'raw';
  value: string;
}
export interface CssValueDimensionNode {
  type: 'dimensions';
  unit: UnitValueType;
  value: string | number;
}
export interface CssValueCalcNode {
  type: 'calc';
  left: CssValueDimensionNode;
  operation: '+' | '-' | '*' | '/';
  right: CssValueDimensionNode;
}

export interface CssTransformValueNode {
  type: 'transform';
  dimension: '2d' | '3d';
  x: CssValueDimensionNode;
  y?: CssValueDimensionNode;
  z?: CssValueDimensionNode;
}

export interface CssFlexValueNode {
  type: 'flex';
  grow: CssValueDimensionNode;
  shrink: CssValueDimensionNode;
  basis: CssDeclarationValueNode;
}

export type CssDeclarationValueNode =
  | CssValueDimensionNode
  | CssValueCalcNode
  | CssValueRawNode
  | CssTransformValueNode
  | CssFlexValueNode;
/* END OF CSS VALUE TYPES */

export type UnitValueType = 'none' | Omit<string, 'none'>;
export type AssertNextTokenFn = (condition: unknown, message: string) => asserts condition;

export type CssAstNode =
  | CssDeclarationValueNode
  | CssDeclarationNode
  | CssAtRuleNode
  | CssRuleNode
  | CssSheetNode;

export type SelectorGroup = 'base' | 'group' | 'pointer' | 'first' | 'last' | 'odd' | 'even';

export interface EvaluatorConfig {
  rem: number;
  deviceWidth: number;
  deviceHeight: number;
}
