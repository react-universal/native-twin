/* eslint-disable unused-imports/no-unused-vars */
import type { Tailwindest } from 'tailwindest';

type Customized = Tailwindest;

type TWKeys = Exclude<
  keyof Customized,
  | `:${string}`
  | `scroll${string}`
  | `break${string}`
  | `backdrop${string}`
  | `grid${string}`
  | `transition${string}`
  | `filter${string}`
  | `@${string}`
  | `outline${string}`
  | `textDecoration${string}`
  | `list${string}`
  | `gradient${string}`
  | 'animation'
  | 'Grayscale'
  | 'sepia'
  | 'transition'
  | 'accentColor'
  | 'backgroundSize'
  | 'scrollMargin'
  | 'scrollPadding'
  | 'transformOrigin'
  | 'caretColor'
  | 'cursor'
  | 'columns'
  | 'appearance'
  | 'backgroundAttachment'
  | 'backgroundBlendMode'
  | 'backgroundClip'
  | 'backgroundOrigin'
  | 'backgroundRepeat'
  | 'hyphens'
  | 'lineClamp'
  | 'scrollBehavior'
  | 'boxDecoration'
  | 'screenReaders'
  | 'userSelect'
>;

// const keys: TWKeys = '';
// const utils: AnyTailwindUtil = 'ta';

// Credits to https://dev.to/virtualkirill/make-your-css-safer-by-type-checking-tailwind-css-classes-2l14
// and https://stackoverflow.com/questions/65737948/how-to-type-check-if-object-keys-conform-a-conditional-recursive-template-type/65738172#65738172
type Colors = 'red' | 'purple' | 'blue' | 'green';
type Luminance = 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
type BgColor = `bg-${Colors}-${Luminance}`;
type Layout = 'block' | 'w-1' | 'h-1';
type TailwindClass = BgColor | Layout;

type EOL = '';
type EatWhitespace<S> = S extends ` ${infer Rest}` ? EatWhitespace<Rest> : S;

// Utility type to provide nicer error messages
type Err<Cls extends string = EOL> = Cls extends EOL
  ? 'Error: Empty class'
  : `Error: ${Cls} is not a valid Tailwind class`;
type Result<R extends string = EOL> = R extends `${infer _}Error: ${infer Err}`
  ? Err extends `${infer Top} Error: ${infer _}`
    ? `Error: ${Top}`
    : `Error: ${Err}`
  : R;

export type AnyTailwindUtil = Customized[TWKeys];

type WithPrefix<T extends string> = NonNullable<AnyTailwindUtil> extends `${T}${string}`
  ? AnyTailwindUtil
  : never;

type ValidTailwindClassSeparatedByWhitespace<S> =
  EatWhitespace<S> extends `${infer Class} ${infer Rest}` ? Rest : never;

type Checked = ValidTailwindClassSeparatedByWhitespace<''>;

type ClassNames<R> = {
  [K in keyof R]: K extends ValidTailwindClassSeparatedByWhitespace<K>
    ? R[K]
    : ValidTailwindClassSeparatedByWhitespace<K>;
};

// type WhiteSpace = ' ' | '\n' | '\t';
// type TrimLeft<T extends string> = T extends `${WhiteSpace}${infer U}` ? TrimLeft<U> : T;
// type TrimRight<T extends string> = T extends `${infer U}${WhiteSpace}` ? TrimRight<U> : T;
// type Trim<T extends string> = TrimLeft<TrimRight<T>>;
