import * as P from '@native-twin/arc-parser';
import { declarationValueWithUnitParser } from '../../css/css-common.parser';
import type { CSSUnit } from '../../css/css.types';
export interface DeclarationValue<Tag extends string> {
  readonly _tag: Tag;
  readonly raw: string;
}

export interface StyleStringValue<T extends string> {
  _tag: 'StyleStringValue';
  value: T;
}
export interface StyleNoneValue extends StyleStringValue<'none'> {}
export interface StyleAutoValue extends StyleStringValue<'auto'> {}
export interface NullValue<A> extends DeclarationValue<'null'> {}
export interface LiteralValue<A = unknown> extends DeclarationValue<'literal'> {}
export interface DimensionValue extends DeclarationValue<'dimension'> {
  value: number;
  unit: CSSUnit;
}
export interface UnitlessValue extends DeclarationValue<'unitless'> {
  value: number;
}
export interface ColorValue extends DeclarationValue<'color'> {
  value: string;
}
export interface TransformValue extends DeclarationValue<'transform'> {
  value: number;
  unit: string;
  kind: '2d' | '3d';
}

export interface FullFlexValue {
  _tag: 'FullFlexValue';
  value: {
    flexGrow: DimensionValue;
    flexShrink: DimensionValue | UnitlessValue;
    flexBasis: DimensionValue | StyleAutoValue;
  };
}

export interface FlexValue extends DeclarationValue<'flex'> {
  value: FullFlexValue | StyleNoneValue;
}

export type AnyDeclarationValue =
  | DimensionValue
  | UnitlessValue
  | ColorValue
  | TransformValue
  | FlexValue
  | LiteralValue
  | StyleAutoValue
  | StyleNoneValue;

export type FlatDeclValues =
  | DimensionValue
  | UnitlessValue
  | ColorValue
  | LiteralValue
  | StyleAutoValue
  | StyleNoneValue;

const dimension = (value: Omit<DimensionValue, '_tag'>): DimensionValue => ({
  ...value,
  _tag: 'dimension',
});
const unitless = (value: Omit<UnitlessValue, '_tag'>): UnitlessValue => ({
  ...value,
  _tag: 'unitless',
});
const color = (value: Omit<ColorValue, '_tag'>): ColorValue => ({
  ...value,
  _tag: 'color',
});
const transform = (value: Omit<TransformValue, '_tag'>): TransformValue => ({
  ...value,
  _tag: 'transform',
});
const flex = (value: Omit<FlexValue, '_tag'>): FlexValue => ({ ...value, _tag: 'flex' });

const stringValue = <T extends string>(value: T): StyleStringValue<T> => ({
  _tag: 'StyleStringValue',
  value,
});

export const TaggedDeclValue = {
  $is: (tag: AnyDeclarationValue['_tag']) => (x: AnyDeclarationValue) => x._tag === tag,
  color,
  dimension,
  transform,
  unitless,
  flex,
  stringValue,
};

export const dimensionsParser = declarationValueWithUnitParser.map(([value, unit]) =>
  TaggedDeclValue.dimension({
    raw: value,
    unit: unit?.value ?? 'px',
    value: Number.parseFloat(value),
  }),
);

export const unitlessParser = P.float.map((raw) =>
  TaggedDeclValue.unitless({ raw, value: Number(raw) }),
);

const fullFlexParser = P.sequenceOf([
  dimensionsParser,
  P.maybe(dimensionsParser),
  P.maybe(
    P.choice([dimensionsParser, P.literal('auto').map((x) => TaggedDeclValue.stringValue(x))]),
  ),
]).map(
  ([flexGrow, flexShrink, flexBasis]): FullFlexValue => ({
    _tag: 'FullFlexValue',
    value: {
      flexGrow,
      flexShrink: flexShrink ?? TaggedDeclValue.unitless({ raw: '0', value: 0 }),
      flexBasis: flexBasis ?? TaggedDeclValue.dimension({ raw: '0%', value: 0, unit: '%' }),
    },
  }),
);
const flexNoneParser = P.literal('none').map((x) => TaggedDeclValue.stringValue(x));

export const flexParser = (value: string) =>
  P.choice([fullFlexParser, flexNoneParser]).map((x) =>
    TaggedDeclValue.flex({ raw: value, value: x }),
  );

export const parseColor = (color: string) =>
  P.succeedWith(color).map((x) => TaggedDeclValue.color({ raw: color, value: x }));
