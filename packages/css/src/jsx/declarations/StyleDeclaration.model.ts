import * as P from '@native-twin/arc-parser';
import { hasOwnProperty } from '@native-twin/helpers';
import { unitlessCssProps } from '../../css/css.constants';
import type { SheetEntryDeclaration } from '../../sheets/sheet.types';
import { getPropertyValueType } from '../../utils.parser';
import * as DeclValue from './DeclarationValue';

export interface TwinDeclaration<Tag extends string, Value>
  extends Omit<SheetEntryDeclaration, 'value'> {
  readonly _tag: Tag;
  readonly value: Value;
  readonly prop: string;
  readonly hyphenized: string;
}

export interface FlexDeclaration extends TwinDeclaration<'flex', string> {}
export interface ColorDeclaration extends TwinDeclaration<'color', string> {}
export interface DimensionDeclaration extends TwinDeclaration<'dimension', string> {}
export interface UnitlessDeclaration extends TwinDeclaration<'unitless', string> {}
export interface UnknownDeclaration
  extends TwinDeclaration<'unknown', SheetEntryDeclaration['value']> {}
export interface TransformDeclaration
  extends TwinDeclaration<'transform', AnyDeclaration[]> {}

export type AnyDeclaration =
  | FlexDeclaration
  | ColorDeclaration
  | DimensionDeclaration
  | UnitlessDeclaration
  | TransformDeclaration
  | UnknownDeclaration;

const flex = (decl: Omit<FlexDeclaration, '_tag'>): FlexDeclaration => ({
  _tag: 'flex',
  ...decl,
});
const color = (decl: Omit<ColorDeclaration, '_tag'>): ColorDeclaration => ({
  _tag: 'color',
  ...decl,
});
const dimension = (decl: Omit<DimensionDeclaration, '_tag'>): DimensionDeclaration => ({
  _tag: 'dimension',
  ...decl,
});
const transform = (decl: Omit<TransformDeclaration, '_tag'>): TransformDeclaration => ({
  _tag: 'transform',
  ...decl,
});
const unitless = (decl: Omit<UnitlessDeclaration, '_tag'>): UnitlessDeclaration => ({
  _tag: 'unitless',
  ...decl,
});
const unknown = (decl: Omit<UnknownDeclaration, '_tag'>): UnknownDeclaration => ({
  _tag: 'unknown',
  ...decl,
});
/** @category Tagged Types */
export const TaggedTwinDeclaration = {
  $is: (tag: AnyDeclaration['_tag']) => (x: AnyDeclaration) => x._tag === tag,
  flex,
  color,
  dimension,
  transform,
  unitless,
  unknown,
};

const isStringValue = (x: unknown): x is string => typeof x === 'string';
const isNumberValue = (x: unknown): x is number => typeof x === 'number';

export const fromSheetEntryDecl = (decl: SheetEntryDeclaration): AnyDeclaration => {
  const hyphenized = decl.prop.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  const type = getPropertyValueType(hyphenized);
  const value = decl.value;
  const isString = isStringValue(value);
  const isNumber = isNumberValue(value);
  const isUnitLess = hasOwnProperty.call(unitlessCssProps, decl.prop);

  if (Array.isArray(value)) {
    const declarations = value.map((x) => fromSheetEntryDecl(x));
    return TaggedTwinDeclaration.transform({ ...decl, hyphenized, value: declarations });
  }

  if (type === 'flex' && isString) {
    return TaggedTwinDeclaration.flex({ ...decl, hyphenized: hyphenized, value });
  }

  if (type === 'color' && isString) {
    return TaggedTwinDeclaration.color({ ...decl, hyphenized: hyphenized, value });
  }

  if (type === 'dimension' && isString) {
    return TaggedTwinDeclaration.dimension({ ...decl, hyphenized, value });
  }

  if ((type === 'unitless' || isUnitLess) && (isString || isNumber)) {
    const result = value.toString();
    return TaggedTwinDeclaration.unitless({ ...decl, hyphenized, value: result });
  }

  console.debug('Unknown Declaration: ', decl);
  return TaggedTwinDeclaration.unknown({ ...decl, hyphenized });
};

export const parseDeclarationValue = (
  decl: AnyDeclaration,
): P.ResultType<DeclValue.AnyDeclarationValue, null> => {
  switch (decl._tag) {
    case 'flex':
      return DeclValue.flexParser(decl.value).run(decl.value);
    case 'color':
      return DeclValue.parseColor(decl.value).run(decl.value);
    case 'dimension':
      return DeclValue.dimensionsParser.run(decl.value);
    case 'unitless':
      return DeclValue.unitlessParser.run(decl.value);
    case 'transform':
      return DeclValue.unitlessParser.run(decl.value.join(''));
    case 'unknown':
      if (typeof decl.value !== 'string') {
        return P.fail(`unknown decl value: ${JSON.stringify(decl.value)}`).run('');
      }

      const parsers: P.Parser<DeclValue.AnyDeclarationValue, null>[] = [
        DeclValue.dimensionsParser,
        DeclValue.unitlessParser,
        DeclValue.flexParser(decl.value),
        DeclValue.parseColor(decl.value),
      ];
      return P.choice(
        parsers.map((x) => P.sequenceOf([x, P.endOfInput]).map((x) => x[0])),
      ).run(decl.value);
  }
};
