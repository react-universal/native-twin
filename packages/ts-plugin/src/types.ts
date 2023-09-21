import {
  __Theme__,
  ComponentSheet,
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
  canBeNegative: boolean;
  kind: 'class';
  isColor: boolean;
  theme: ComponentSheet | null;
}

export interface VariantCompletionItem extends CommonCompletionItem {
  kind: 'variant';
}

export type CompletionItem = ClassCompletionItem | VariantCompletionItem;

export interface GetCssResult {
  className: string;
  css: string;
  sheet: ComponentSheet;
}

export interface CompletionItemLocation {
  position: number;
  index: number;
}
