import * as RA from 'effect/Array';
import * as Data from 'effect/Data';
import { pipe } from 'effect/Function';
import * as Match from 'effect/Match';
import * as Predicate from 'effect/Predicate';
import * as P from '@native-twin/arc-parser';
import { hasOwnProperty } from '@native-twin/helpers';
import { declarationValueWithUnitParser } from '../css/css-common.parser';
import { unitlessCssProps } from '../css/css.constants';
import { CSSUnit } from '../css/css.types';
import { AnyStyle } from '../react-native/rn.types';
import { SheetEntryDeclaration } from '../sheets/sheet.types';
import { getPropertyValueType } from '../utils.parser';
import { CompilerContext } from './metro.runtime';

/** @category Tagged Types */
export type RuntimeSheetDeclaration = Data.TaggedEnum<{
  NOT_COMPILED: SheetEntryDeclaration;
  COMPILED: SheetEntryDeclaration;
}>;

/** @category Tagged Types */
export const RuntimeSheetDeclaration = Data.taggedEnum<RuntimeSheetDeclaration>();

/** @category Parsers */
export const compileEntryDeclaration = (
  decl: SheetEntryDeclaration,
  ctx: CompilerContext,
): RuntimeSheetDeclaration => {
  const isUnitLess =
    !decl.prop.includes('flex') && hasOwnProperty.call(unitlessCssProps, decl.prop);

  if (RA.isArray(decl.value)) {
    const compiled = pipe(
      decl.value,
      RA.map((x) => compileEntryDeclaration(x, ctx)),
    );
    if (RA.every(compiled, RuntimeSheetDeclaration.$is('COMPILED'))) {
      return RuntimeSheetDeclaration.COMPILED({
        ...decl,
        value: compiled,
      });
    }
    return RuntimeSheetDeclaration.NOT_COMPILED(decl);
  }

  if (Predicate.isObject(decl.value)) {
    return RuntimeSheetDeclaration.NOT_COMPILED(decl);
  }
  if (Predicate.isNumber(decl.value)) {
    return RuntimeSheetDeclaration.COMPILED(decl);
  }

  if (isUnitLess) {
    const data = parseUnitlessValue.run(decl.value);
    if (!data.isError) {
      return RuntimeSheetDeclaration.COMPILED({
        ...decl,
        value: data.result,
      });
    }
    return RuntimeSheetDeclaration.NOT_COMPILED(decl);
  }

  const type = getPropertyValueType(
    decl.prop.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase(),
  );

  if (type === 'DIMENSION') {
    const data = declarationValueConvertParser(ctx).run(decl.value);
    if (!data.isError && data.result) {
      return RuntimeSheetDeclaration.COMPILED({
        ...decl,
        value: data.result,
      });
    }
    return RuntimeSheetDeclaration.NOT_COMPILED(decl);
  }

  if (type == 'FLEX') {
    const data = ParseFlexValue(ctx).run(decl.value);
    if (!data.isError && data.result) {
      return RuntimeSheetDeclaration.COMPILED({
        ...decl,
        value: data.result,
      });
    }
    return RuntimeSheetDeclaration.NOT_COMPILED(decl);
  }

  return RuntimeSheetDeclaration.COMPILED(decl);
};

/** @category Parsers */
const parseUnitlessValue = P.float.map((x) => Number(x));

/** @category Parsers */
export const declarationValueConvertParser = (ctx: CompilerContext) =>
  P.withData(declarationValueWithUnitParser)<CompilerContext>(ctx).mapFromData(
    ({ result, data }) => {
      if (!result[1]) return result[0];
      const converted = matchUnitConvert(result[1].value);
      return converted(result[0], data.baseRem);
    },
  );

/** @category Parsers */
const ParseFlexValue = (ctx: CompilerContext) =>
  P.withData(
    P.choice([
      P.sequenceOf([
        declarationValueConvertParser(ctx),
        P.maybe(declarationValueConvertParser(ctx)),
        P.maybe(P.choice([declarationValueConvertParser(ctx), P.literal('auto')])),
      ]).map(([flexGrow, flexShrink, flexBasis]) => {
        if (!flexGrow) return null;
        return {
          flexGrow: parseFloat(String(flexGrow)),
          flexShrink: parseFloat(String(flexShrink ?? flexGrow)),
          flexBasis: (flexBasis as AnyStyle['flexBasis']) ?? '0%',
        };
      }),
      P.literal('none').map((x) => ({
        flex: x as any as number,
      })),
    ]),
  )(ctx);

/** @category Match */
export const matchUnitConvert = Match.type<CSSUnit>().pipe(
  Match.when(
    (x) => x === 'px',
    (_) => (value: string) => parseFloat(value),
  ),
  Match.when(
    (x) => x === 'rem' || x === 'em',
    (_) => (value: string, rem: number) => parseFloat(value) * rem,
  ),
  Match.when(
    (x) => x === '%',
    (_) => (value: string) => `${value}%`,
  ),
  Match.when(
    (x) => x === 'vh' || x === 'vw' || x === 'vmax' || x === 'vmin',
    (_) => (_v: string) => null,
  ),
  Match.when(
    (x) => x === 'turn',
    (_) => (value: string) => `${360 * parseFloat(value)}deg`,
  ),
  Match.when(
    (x) => x === 'deg' || x === 'rad',
    (u) => (value: string) => `${value}${u}`,
  ),
  Match.when(
    (x) => x === 'in',
    (_) => (value: string) => parseFloat(value) * 96,
  ),
  Match.when(
    (x) => x === 'pc',
    (_) => (value: string) => parseFloat(value) * (96 / 6),
  ),
  Match.when(
    (x) => x === 'pt',
    (_) => (value: string) => parseFloat(value) * (96 / 72),
  ),
  Match.when(
    (x) => x === 'cm',
    (_) => (value: string) => parseFloat(value) * 97.8,
  ),
  Match.when(
    (x) => x === 'mm',
    (_) => (value: string) => parseFloat(value) * (97.8 / 10),
  ),
  Match.when(
    (x) => x === 'Q',
    (_) => (value: string) => parseFloat(value) * (97.8 / 40),
  ),
  Match.orElse((_) => (_value: string) => null),
);
