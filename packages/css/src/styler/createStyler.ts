import { toHyphenCase } from "@native-twin/helpers";
import { isChildSelector, isPointerSelector } from "../jsx/sheet.predicates";
import {
  fromSheetEntryDecl,
  parseDeclarationValue,
} from "../react-native/declarations/style.declaration";
import type { AnyStyleValue } from "../react-native/rn.types";
import type { SheetEntry, SheetEntryDeclaration } from "../sheets/sheet.types";
import { getRuleSelectorGroups } from "../tailwind/tailwind.utils";
import { getPropertyValueType } from "../utils.parser";
import type { CreateStylerInput, ParsedStylerDecl } from "./styler.types";
import { toRNDimensionValue } from "./stylizers/dimension.styler";

export const createStyler = (input: CreateStylerInput) => {
  return {
    parseSheetEntry,
  };

  function parseSheetEntry(entry: SheetEntry) {
    let isChild = false;
    let isGroupParent = false;
    let isPointer = false;
    const selectorGroups = getRuleSelectorGroups(entry.selectors);
    
    for (const group of selectorGroups) {
      isChild ||= isChildSelector(group);
      isGroupParent ||= group === "group";
      isPointer ||= isPointerSelector(group);
    }
    const parsedDecls = entry.declarations.map((decl) => parseSheetDecl(decl));
    const baseStyles: any[] = [];
    for (const decl of parsedDecls) {
      if (!decl.parsedValue) continue;
      if (decl.parsedValue._tag === "dimension") {
        baseStyles.push({
          prop: decl.parsedDecl.hyphenized,
          value: toRNDimensionValue(decl.parsedValue, input),
        });
      }
    }

    return { entry, parsedDecls, isChild, isGroupParent, isPointer };
  }

  // function sheetDeclToStyle(decl: SheetEntryDeclaration): TwinStyleEntry {
  //   const hyphenized = toHyphenCase(decl.prop);
  //   const type = getPropertyValueType(hyphenized);
  //   const parsedDecl = fromSheetEntryDecl(decl);
  //   if (parsedDecl._tag === 'transform') {
  //     const transforms = parsedDecl.value.map((x) => parseDeclarationValue(x));
  //   }
  //   const parsedValue = parseDeclarationValue(parsedDecl);
  //   if (parsedValue.isError) {
  //     return TwinStyleEntry.partial(decl, type, parsedValue.error);
  //   }
  //   if (parsedValue.result._tag === 'transform') {
  //     parsedValue.result;
  //   }
  // }

  // function twinDeclToStyle(decl: AnyDeclaration): TwinStyleEntry {
  //   if (decl._tag === 'color') {}
  // }

  function parseSheetDecl(decl: SheetEntryDeclaration): ParsedStylerDecl {
    const hyphenized = toHyphenCase(decl.prop);
    const type = getPropertyValueType(hyphenized);
    if (type === "dimension") {
    }
    const parsedDecl = fromSheetEntryDecl(decl);
    const parsedValue = parseDeclarationValue(parsedDecl);
    if (parsedValue.isError) {
      return { parsedDecl, parsedValue: null, error: parsedValue.error };
    }
    // const value = parsedValue.result;
    return { parsedDecl, parsedValue: parsedValue.result, error: null };
  }
};

// const evaluateDeclValue = (value: AnyDeclarationValue, input: CreateStylerInput) => {
//   if (value._tag === 'dimension') {
//     return toRNDimensionValue(value, input);
//   }
//   if (value._tag === 'unitless') return value.value;
//   if (value._tag === 'color' || value._tag === 'StyleStringValue') {
//     return value.value;
//   }
//   if (value._tag === 'literal') return value.raw;
//   if (value._tag === 'flex') {
//     if (value.value._tag === 'StyleStringValue') {
//       return value.value.value;
//     }
//     const { flexBasis, flexGrow, flexShrink } = value.value.value;
//     return {
//       flexBasis:
//         flexBasis._tag === 'dimension' ? toRNDimensionValue(flexBasis, input) : flexBasis.value,
//       flexGrow: toRNDimensionValue(flexGrow, input),
//       flexShrink:
//         flexShrink._tag === 'dimension' ? toRNDimensionValue(flexShrink, input) : flexShrink.value,
//     };
//   }
// };

export interface FinalSheetEntry {
  readonly _tag: "final-entry";
  kind: ReturnType<typeof getPropertyValueType>;
  prop: string;
  value: AnyStyleValue | TwinStyleEntry[];
}
export interface PartialSheetEntry {
  readonly _tag: "partial-entry";
  kind: ReturnType<typeof getPropertyValueType>;
  prop: string;
  value: SheetEntryDeclaration["value"];
  message: string | null;
}

export type TwinStyleEntry = FinalSheetEntry | PartialSheetEntry;

// const TwinStyleEntry = {
//   final: (
//     prop: string,
//     value: AnyStyleValue | TwinStyleEntry[],
//     kind: ReturnType<typeof getPropertyValueType>
//   ): FinalSheetEntry => ({ _tag: "final-entry", prop, value, kind }),
//   partial: (
//     { prop, value }: SheetEntryDeclaration,
//     kind: ReturnType<typeof getPropertyValueType>,
//     message: string | null
//   ): PartialSheetEntry => ({
//     _tag: "partial-entry",
//     prop,
//     value,
//     kind,
//     message,
//   }),
// };
