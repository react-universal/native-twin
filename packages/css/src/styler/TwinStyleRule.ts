import type { AnyStyleValue } from '../react-native/rn.types';
import type { SheetEntryDeclaration } from '../sheets/sheet.types';
import type { getPropertyValueType } from '../utils.parser';

// interface _StyleRuleParserData {
//   ctx: CreateStylerInput;
//   decl: SheetEntryDeclaration;
// }

// interface _StyleRuleDeclarationProp {
//   value: string;
//   kind: any;
// }

// const makeStyleRuleParser = (declaration: SheetEntryDeclaration, info: CreateStylerInput) => {
//   const data: _StyleRuleParserData = { ctx: info, decl: declaration };
// };

// interface RNFlattenStyle {
//   readonly _tag: 'rn/flatten';
//   prop: string;
// }
export interface ReactNativeRule {
  readonly _tag: 'react-native';
  prop: string;
  value: AnyStyleValue | TwinStyleEntry[];
}
export interface PartialSheetEntry {
  readonly _tag: 'partial-entry';
  kind: ReturnType<typeof getPropertyValueType>;
  prop: string;
  value: SheetEntryDeclaration['value'];
  message: string | null;
}

export type TwinStyleEntry = any | PartialSheetEntry;

// const TwinStyleEntry = {
//   final: (
//     prop: string,
//     value: AnyStyleValue | TwinStyleEntry[],
//     kind: ReturnType<typeof getPropertyValueType>,
//   ): any => ({ _tag: 'final-entry', prop, value, kind }),
//   partial: (
//     { prop, value }: SheetEntryDeclaration,
//     kind: ReturnType<typeof getPropertyValueType>,
//     message: string | null,
//   ): PartialSheetEntry => ({ _tag: 'partial-entry', prop, value, kind, message }),
// };
