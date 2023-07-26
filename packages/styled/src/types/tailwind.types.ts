import { Tailwindest } from 'tailwindest';

type Customized = Tailwindest;

// type WhiteSpace = ' ' | '\n' | '\t';
// type TrimLeft<T extends string> = T extends `${WhiteSpace}${infer U}` ? TrimLeft<U> : T;
// type TrimRight<T extends string> = T extends `${infer U}${WhiteSpace}` ? TrimLeft<U> : T;
// type Trim<T extends string> = TrimLeft<TrimRight<T>>;

type TWKeys = Exclude<
  keyof Customized,
  | '::after'
  | '::backdrop'
  | '::before'
  | '::first-letter'
  | '::first-line'
  | '::file'
  | '::marker'
  | '::placeholder'
  | '::selection'
  | '::active'
  | 'animation'
  | 'backdropGrayscale'
  | 'backdropHueRotate'
  | 'backdropInvert'
  | 'backdropOpacity'
  | 'backdropSaturate'
  | 'backdropSepia'
  | 'sepia'
  | '@contrast-more'
  | '@contrast-less'
  | 'transition'
  | 'accentColor'
  | 'backgroundSize'
  | 'backdropBrightness'
  | 'gridAutoColumns'
  | 'gridAutoRows'
  | 'gridColumn'
  | 'gridColumnEnd'
  | 'gridColumnStart'
  | 'gridRow'
  | 'gridRowStart'
  | 'gridRowEnd'
  | 'gridTemplateColumns'
  | 'gridTemplateRows'
  | 'backgroundPosition'
  | 'backdropBlur'
  | 'outlineColor'
  | 'outlineOffset'
  | 'outlineWidth'
  | 'ringColor'
  | 'ringOffsetColor'
  | 'ringOffsetWidth'
  | 'ringWidth'
  | 'scrollMargin'
  | 'scrollPadding'
  | 'transformOrigin'
  | 'transitionDelay'
  | 'transitionDuration'
  | 'transitionProperty'
  | 'filterBlur'
  | 'filterBrightness'
  | 'filterContrast'
  | 'filterDropShadow'
  | 'filterGrayscale'
  | 'filterHueRotate'
  | 'filterInvert'
  | 'filterSaturate'
  | 'filterSepia'
  | 'transitionTimingFunction'
  | '@aria'
>;

export type AnyTailwindUtil = Customized[TWKeys];
