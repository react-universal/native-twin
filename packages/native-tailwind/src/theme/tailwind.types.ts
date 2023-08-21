import type { CSSProperties, MaybeArray, BaseTheme } from '../types';

export interface Container {
  screens?: BaseTheme['screens'];
  center?: boolean;
  padding?: string | Record<string, string>;
}

export type FontSizeValue =
  | string
  | [size: string, lineHeight: string]
  | [
      size: string,
      options: { lineHeight?: string; letterSpacing?: string; fontWeight?: string },
    ];

export type FontFamilyValue =
  | MaybeArray<string>
  | [fontFamily: MaybeArray<string>, configuration: { fontFeatureSettings?: string }];

export interface TailwindTheme extends BaseTheme {
  columns: Record<string, string>;
  spacing: Record<string, string>;
  durations: Record<string, MaybeArray<string>>;

  accentColor: BaseTheme['colors'];
  animation: Record<string, MaybeArray<string>>;
  aria: Record<string, string>;
  aspectRatio: Record<string, string>;
  backdropBlur: Record<string, string>;
  backdropBrightness: Record<string, string>;
  backdropContrast: Record<string, string>;
  backdropGrayscale: Record<string, string>;
  backdropHueRotate: Record<string, string>;
  backdropInvert: Record<string, string>;
  backdropOpacity: Record<string, string>;
  backdropSaturate: Record<string, string>;
  backdropSepia: Record<string, string>;
  backgroundColor: BaseTheme['colors'];
  backgroundImage: Record<string, MaybeArray<string>>;
  backgroundOpacity: Record<string, string>;
  backgroundPosition: Record<string, string>;
  backgroundSize: Record<string, MaybeArray<string>>;
  blur: Record<string, string>;
  borderColor: BaseTheme['colors'];
  borderOpacity: Record<string, string>;
  borderRadius: Record<string, string>;
  borderSpacing: Record<string, string>;
  borderWidth: Record<string, string>;
  boxShadow: Record<string, MaybeArray<string>>;
  boxShadowColor: BaseTheme['colors'];
  brightness: Record<string, string>;
  caretColor: BaseTheme['colors'];
  container: Container;
  content: Record<string, string>;
  contrast: Record<string, string>;
  cursor: Record<string, MaybeArray<string>>;
  data: Record<string, string>;
  divideColor: BaseTheme['colors'];
  divideOpacity: Record<string, string>;
  divideWidth: Record<string, string>;
  dropShadow: Record<string, MaybeArray<string>>;
  fill: BaseTheme['colors'];
  flex: Record<string, string>;
  flexBasis: Record<string, string>;
  flexGrow: Record<string, number | string>;
  flexShrink: Record<string, number | string>;
  fontFamily: Record<string, FontFamilyValue>;
  fontSize: Record<string, FontSizeValue>;
  fontWeight: Record<string, string>;
  gap: Record<string, string>;
  gradientColorStops: BaseTheme['colors'];
  grayscale: Record<string, string>;
  gridAutoColumns: Record<string, string>;
  gridAutoRows: Record<string, string>;
  gridColumn: Record<string, string>;
  gridColumnEnd: Record<string, string>;
  gridColumnStart: Record<string, string>;
  gridRow: Record<string, string>;
  gridRowEnd: Record<string, string>;
  gridRowStart: Record<string, string>;
  gridTemplateColumns: Record<string, string>;
  gridTemplateRows: Record<string, string>;
  height: Record<string, string>;
  hueRotate: Record<string, string>;
  inset: Record<string, string>;
  invert: Record<string, string>;
  keyframes: Record<string, Record<string, CSSProperties>>;
  letterSpacing: Record<string, string>;
  lineHeight: Record<string, string>;
  listStyleType: Record<string, string>;
  margin: Record<string, string>;
  maxHeight: Record<string, string>;
  maxWidth: Record<string, string>;
  minHeight: Record<string, string>;
  minWidth: Record<string, string>;
  objectPosition: Record<string, string>;
  opacity: Record<string, string>;
  order: Record<string, string>;
  outlineColor: BaseTheme['colors'];
  outlineOffset: Record<string, string>;
  outlineWidth: Record<string, string>;
  padding: Record<string, string>;
  placeholderColor: BaseTheme['colors'];
  placeholderOpacity: Record<string, string>;
  ringColor: BaseTheme['colors'];
  ringOffsetColor: BaseTheme['colors'];
  ringOffsetWidth: Record<string, string>;
  ringOpacity: Record<string, string>;
  ringWidth: Record<string, string>;
  rotate: Record<string, string>;
  saturate: Record<string, string>;
  scale: Record<string, string>;
  scrollMargin: Record<string, string>;
  scrollPadding: Record<string, string>;
  sepia: Record<string, string>;
  skew: Record<string, string>;
  space: Record<string, string>;
  stroke: BaseTheme['colors'];
  strokeWidth: Record<string, string>;
  supports: Record<string, string>;
  textColor: BaseTheme['colors'];
  textDecorationColor: BaseTheme['colors'];
  textDecorationThickness: Record<string, string>;
  textIndent: Record<string, string>;
  textOpacity: Record<string, string>;
  textUnderlineOffset: Record<string, string>;
  transformOrigin: Record<string, string>;
  transitionDelay: Record<string, MaybeArray<string>>;
  transitionDuration: Record<string, MaybeArray<string>>;
  transitionProperty: Record<string, MaybeArray<string>>;
  transitionTimingFunction: Record<string, MaybeArray<string>>;
  translate: Record<string, string>;
  width: Record<string, string>;
  willChange: Record<string, string>;
  zIndex: Record<string, string>;
}
