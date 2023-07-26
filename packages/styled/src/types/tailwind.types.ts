/* eslint-disable unused-imports/no-unused-vars */
// @ts-nocheck
import type { Tailwindest } from 'tailwindest';

type Customized = Tailwindest;

// type WhiteSpace = ' ' | '\n' | '\t';
// type TrimLeft<T extends string> = T extends `${WhiteSpace}${infer U}` ? TrimLeft<U> : T;
// type TrimRight<T extends string> = T extends `${infer U}${WhiteSpace}` ? TrimRight<U> : T;
// type Trim<T extends string> = TrimLeft<TrimRight<T>>;

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

export type AnyTailwindUtil = Customized[TWKeys];
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

// Helper type to validate that a string contains one or multiple valid
// Tailwind classes separated by whitespace
type ValidTailwindClassSeparatedByWhitespace<S> =
  EatWhitespace<S> extends `${infer Class} ${infer Rest}`
    ? Rest extends EOL
      ? Class extends EOL
        ? S
        : Class extends AnyTailwindUtil
        ? Class
        : AnyTailwindUtil
      : Result<`${ValidTailwindClassSeparatedByWhitespace<Class>} ${ValidTailwindClassSeparatedByWhitespace<Rest>}`>
    : EatWhitespace<S> extends `${infer Class}`
    ? Class extends AnyTailwindUtil
      ? Class
      : AnyTailwindUtil
    : AnyTailwindUtil;

type Checked = ValidTailwindClassSeparatedByWhitespace<'f'>;

type ClassNames<R> = {
  [K in keyof R]: K extends ValidTailwindClassSeparatedByWhitespace<K>
    ? R[K]
    : ValidTailwindClassSeparatedByWhitespace<K>;
};

function classNamesWrapper<S1, S2>(
  classesOrModifiers1: S1 extends string
    ? ValidTailwindClassSeparatedByWhitespace<S1>
    : ClassNames<S1>,
  classesOrModifiers2?: S2 extends string
    ? ValidTailwindClassSeparatedByWhitespace<S2>
    : ClassNames<S2>,
): string {
  // All arguments would be passed to npmjs.com/package/classnames
  // For the example, just return empty string.
  return '';
}

classNamesWrapper('bg-blue-100 capitalize', 'bg-blue-200');
