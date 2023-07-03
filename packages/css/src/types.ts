import type { Parser } from './lib/Parser';

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

export interface AstShadowNode {
  type: 'SHADOW';
  value: {
    offsetX: AstDimensionsNode;
    offsetY: AstDimensionsNode;
    shadowRadius?: AstDimensionsNode;
    spreadRadius?: AstDimensionsNode;
    color?: AstRawValueNode;
  }[];
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
  | AstTransformValueNode
  | AstShadowNode;

export type SelectorGroup = 'base' | 'group' | 'pointer' | 'first' | 'last' | 'odd' | 'even';

export interface CssParserData {
  rem: number;
  deviceWidth: number;
  deviceHeight: number;
}

export interface CssParserError {
  position: number;
  message: string;
}

export type CssParserType<Result> = Parser<Result, CssParserError, CssParserData>;

export type CssParserCache = Map<
  string,
  {
    group: SelectorGroup;
    styles: Record<string, any>;
  }
>;
