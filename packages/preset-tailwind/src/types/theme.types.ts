import { ThemeAnimation, __Theme__ } from '@universal-labs/native-twin';

export interface TailwindPresetTheme extends __Theme__ {
  opacity?: Record<string, string>;
  objectFit?: Record<string, string>;
  resizeMode?: Record<string, string>;
  position?: Record<string, string>;
  alignItems?: Record<string, string>;
  alignContent?: Record<string, string>;
  borderStyle?: Record<string, string>;
  backfaceVisibility?: Record<string, string>;
  fontStyle?: Record<string, string>;
  width?: Record<string, string>;
  height?: Record<string, string>;
  maxWidth?: Record<string, string>;
  flexBasis?: Record<string, string>;
  flexGrow?: Record<string, string>;
  maxHeight?: Record<string, string>;
  minWidth?: Record<string, string>;
  minHeight?: Record<string, string>;
  inlineSize?: Record<string, string>;
  blockSize?: Record<string, string>;
  verticalAlign?: Record<string, string>;
  textAlign?: Record<string, string>;
  flex?: Record<string, string>;
  flexDirection?: Record<string, string>;
  flexWrap?: Record<string, string>;
  justifyContent?: Record<string, string>;
  overflow?: Record<string, string>;
  aspectRatio?: Record<string, string>;
  maxInlineSize?: Record<string, string>;
  maxBlockSize?: Record<string, string>;
  minInlineSize?: Record<string, string>;
  minBlockSize?: Record<string, string>;
  borderRadius?: Record<string, string>;
  textDecorationStyle?: Record<string, string>;
  textTransform?: Record<string, string>;
  borderWidth?: Record<string, string>;
  verticalBreakpoints?: Record<string, string | number>;
  fontFamily?: Record<string, string>;
  fontSize?: Record<string, string>;
  fontWeight?: Record<string, string>;
  lineHeight?: Record<string, string>;
  letterSpacing?: Record<string, string>;
  wordSpacing?: Record<string, string>;
  boxShadow?: Record<string, Record<string, any>>;
  textIndent?: Record<string, string>;
  textShadow?: Record<string, string | string[]>;
  textStrokeWidth?: Record<string, string>;
  ringWidth?: Record<string, string>;
  lineWidth?: Record<string, string>;
  spacing?: Record<string, string>;
  duration?: Record<string, string>;
  translate?: Record<string, string>;
  rotate?: Record<string, string>;
  scale?: Record<string, string>;
  skew?: Record<string, string>;
  aria?: Record<string, string>;
  data?: Record<string, string>;
  // filters
  blur?: Record<string, string>;
  dropShadow?: Record<string, string | string[]>;
  // transitions
  easing?: Record<string, string>;
  // media queries
  media?: Record<string, string>;
  // supports queries
  supports?: Record<string, string>;
  // container queries
  containers?: Record<string, string>;
  // animation
  animation?: ThemeAnimation;
  // grids
  gridAutoColumn?: Record<string, string>;
  gridAutoRow?: Record<string, string>;
  gridColumn?: Record<string, string>;
  gridRow?: Record<string, string>;
  gridTemplateColumn?: Record<string, string>;
  gridTemplateRow?: Record<string, string>;
  // container
  container?: {
    center?: boolean;
    padding?: string | Record<string, string>;
    maxWidth?: Record<string, string>;
  };
  // vars
  zIndex?: Record<string, string>;
}
