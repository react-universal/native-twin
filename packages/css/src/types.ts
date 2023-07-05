import type { ImageStyle, TextStyle, ViewStyle } from 'react-native';

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
  flexBasis: string | number;
  flexShrink: string | number;
  flexGrow: string | number;
}

export interface AstShadowNode {
  type: 'SHADOW';
  value: {
    shadowOffset: { width: string | number; height: string | number };
    shadowRadius?: string | number;
    shadowOpacity?: string | number;
    shadowColor?: string;
  };
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

export type CssParserCache = Map<
  string,
  {
    group: SelectorGroup;
    styles: Record<string, any>;
  }
>;

export type AnyStyle = ImageStyle | TextStyle | ViewStyle;
