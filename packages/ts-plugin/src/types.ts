import {
  __Theme__,
  TailwindConfig as InternalTWConfig,
} from '@universal-labs/native-tailwind';

export type CurrentTheme = __Theme__;
export type TailwindConfig = InternalTWConfig<CurrentTheme>;

interface CommonCompletionItem {
  name: string;
  position: number;
  index: number;
}
export interface ClassCompletionItem extends CommonCompletionItem {
  kind: 'class';
  property: string;
  themeSection: string;
  canBeNegative: boolean;
  isColor: boolean;
  themeValue: string | null;
}

export interface VariantCompletionItem extends CommonCompletionItem {
  kind: 'variant';
}

export type CompletionItem = ClassCompletionItem | VariantCompletionItem;

export interface CompletionItemLocation {
  position: number;
  index: number;
}
