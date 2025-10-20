import { defaultCssUnits } from '../css/css.constants';
import type { SheetEntry } from '../sheets/sheet.types';
import { type DeclValue, TwinDecl } from './declarations';
import * as Decl from './declarations/style.declaration';
import { TwinStyleResult } from './twin.style';

export class StylesInterpreter {
  readonly units = defaultCssUnits;
  private constructor(
    readonly platform: string,
    readonly options: { rem: number; vh?: number; vw?: number },
  ) {}

  evalSheetEntry(sheetEntry: SheetEntry) {
    const declarations = sheetEntry.declarations.map(Decl.fromSheetEntryDecl);
    return declarations;
  }

  evalDecl(decl: Decl.AnyDeclaration) {
    const value = this.getDeclValue(decl);
    if (value._tag === 'FAIL') {
      return TwinStyleResult.fail(decl, value.message);
    }
    if (value._tag === 'NOT_COMPILED') {
      return TwinStyleResult.runtime(decl, value.raw);
    }
    return TwinStyleResult.success(decl.prop, value.value);
  }

  getDeclValue(decl: Decl.AnyDeclaration) {
    const parsedValue = TwinDecl.parseDeclarationValue(decl);
    if (parsedValue.isError) {
      return InterpreterResult.fail(decl, parsedValue.error ?? 'parser error');
    }
    const result = parsedValue.result;
    switch (result._tag) {
      case 'dimension':
      case 'unitless':
      case 'color':
      case 'literal':
      case 'StyleStringValue':
        return this.evalFlatDecl(result);
      case 'flex':
        return this.evalFlexValue(result);
      case 'transform':
        return InterpreterResult.fail(decl, 'unimplemented');
    }
  }

  evalFlatDecl(value: DeclValue.FlatDeclValues) {
    if (value._tag === 'dimension') {
      return this.getDimensionValue(value);
    }
    if (value._tag === 'literal') {
      return InterpreterResult.compiled(value.raw);
    }
    return InterpreterResult.compiled(value.value);
  }

  evalFlexValue(flex: DeclValue.FlexValue) {
    if (flex.value._tag === 'FullFlexValue') {
      const flexBasis = this.evalFlatDecl(flex.value.value.flexBasis);
      const flexGrow = this.evalFlatDecl(flex.value.value.flexGrow);
      const flexShrink = this.evalFlatDecl(flex.value.value.flexShrink);

      if (
        flexBasis._tag === 'COMPILED' &&
        flexGrow._tag === 'COMPILED' &&
        flexShrink._tag === 'COMPILED'
      ) {
        return InterpreterResult.compiled({
          flexProps: {
            flexBasis: flexBasis.value,
            flexGrow: flexGrow.value,
            flexShrink: flexBasis.value,
          },
        });
      }
      return InterpreterResult.notCompiled(flex);
    }
    return InterpreterResult.compiled({ display: flex.value.value });
  }
  private getDimensionValue(dimension: DeclValue.DimensionValue) {
    const value = getDimensionValue(dimension, this.options);
    if (value === null) return InterpreterResult.notCompiled(dimension);
    return InterpreterResult.compiled(value);
  }

  static make = (options: { platform: string; rem: number; vh?: number; vw?: number }) => {
    const { platform, rem, vh, vw } = options;
    if (options.vh && options.vw) {
      return new StylesInterpreter(platform, { vh, vw, rem });
    }
    return new StylesInterpreter(platform, { rem });
  };
}

export interface CompiledValue<A> {
  readonly _tag: 'COMPILED';
  value: A;
}
export interface NotCompiledValue {
  readonly _tag: 'NOT_COMPILED';
  raw: DeclValue.AnyDeclarationValue;
}
export interface FailedCompile {
  readonly _tag: 'FAIL';
  decl: Decl.AnyDeclaration;
  message: string;
}
/** @category Tagged Types */
export type InterpreterResult<A> = CompiledValue<A> | NotCompiledValue | FailedCompile;

/** @category Tagged Types */
export const InterpreterResult = {
  $is: (tag: InterpreterResult<any>['_tag']) => (x: InterpreterResult<any>) => x._tag === tag,
  compiled: <A>(value: A): CompiledValue<A> => ({ _tag: 'COMPILED', value }),
  notCompiled: (raw: DeclValue.AnyDeclarationValue): NotCompiledValue => ({
    _tag: 'NOT_COMPILED',
    raw,
  }),
  fail: (decl: Decl.AnyDeclaration, message: string): FailedCompile => ({
    _tag: 'FAIL',
    decl,
    message,
  }),
};

const getDimensionValue = (
  { unit, value }: DeclValue.DimensionValue,
  units: StylesInterpreter['options'],
) => {
  if (unit === 'vh') {
    if (!units.vh) return null;
    return units.vh * (value / 100);
  }
  if (unit === 'vw') {
    if (!units.vw) return null;
    return units.vw * (value / 100);
  }
  switch (unit) {
    case 'px':
      return value;
    case 'rem':
    case 'em':
      return value * units.rem;
    case '%':
      return `${value}%` as unknown as number;
    case 'turn':
      return `${360 * value}deg` as unknown as number;
    case 'deg':
      return `${value}deg` as unknown as number;
    case 'rad':
      return `${value}rad` as unknown as number;
    case 'in':
      return value * 96;
    case 'pc':
      return value * (96 / 6);
    case 'pt':
      return value * (96 / 72);
    case 'cm':
      return value * 97.8;
    case 'mm':
      return value * (97.8 / 10);
    case 'Q':
      return value * (97.8 / 40);
    default:
      return null;
  }
};
