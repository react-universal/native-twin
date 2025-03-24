import * as P from '@native-twin/arc-parser';
import { asString } from '@native-twin/helpers';
import { FlexStyle } from 'react-native';
import type { SheetEntryDeclaration } from '../sheets/sheet.types';
import type { CreateStylerInput } from './styler.types';

interface _StyleRuleParserData {
  ctx: CreateStylerInput;
  decl: SheetEntryDeclaration;
}

interface _StyleRuleDeclarationProp {
  value: string;
  kind: 
}

const makeStyleRuleParser = (declaration: SheetEntryDeclaration, info: CreateStylerInput) => {
  const data: _StyleRuleParserData = { ctx: info, decl: declaration };
};

interface RNFlattenStyle {
  readonly _tag: 'rn/flatten';
  prop: string;
}
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

export type TwinStyleEntry = TwinStyleRule | PartialSheetEntry;

const TwinStyleEntry = {
  final: (
    prop: string,
    value: AnyStyleValue | TwinStyleEntry[],
    kind: ReturnType<typeof getPropertyValueType>,
  ): TwinStyleRule => ({ _tag: 'final-entry', prop, value, kind }),
  partial: (
    { prop, value }: SheetEntryDeclaration,
    kind: ReturnType<typeof getPropertyValueType>,
    message: string | null,
  ): PartialSheetEntry => ({ _tag: 'partial-entry', prop, value, kind, message }),
};
