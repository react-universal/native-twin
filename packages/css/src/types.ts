export interface AstSheetNode {
  type: 'SHEET';
  value: AstRuleNode;
}

export interface AstRuleNode {
  type: 'RULE';
  selector: string;
  declarations: AstDeclarationNode[];
}

export interface AstDeclarationNode {
  type: 'DECLARATION';
  property: string;
  value: AstDeclarationValueNode;
}

export interface AstDimensionsNode {
  type: 'DIMENSIONS';
  value: number;
  units: string;
}

export interface AstRawValueNode {
  type: 'RAW';
  value: string;
}

export interface AstFlexNode {
  type: 'FLEX';
  flexBasis: AstDimensionsNode;
  flexShrink: AstDimensionsNode;
  flexGrow: AstDimensionsNode;
}

export interface AstTransformValueNode {
  type: 'TRANSFORM';
  dimension: '2d' | '3d';
  x: AstDimensionsNode;
  y?: AstDimensionsNode;
  z?: AstDimensionsNode;
}

export type AstDeclarationValueNode =
  | AstDimensionsNode
  | AstFlexNode
  | AstRawValueNode
  | AstTransformValueNode;

export type SelectorGroup = 'base' | 'group' | 'pointer' | 'first' | 'last' | 'odd' | 'even';

export interface EvaluatorConfig {
  rem: number;
  deviceWidth: number;
  deviceHeight: number;
}
