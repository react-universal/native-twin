import type {
  AutocompleteItem,
  Twind,
  TailwindTheme,
  BaseTheme,
} from '@universal-labs/twind-adapter';
import type { SuggestionCommon, SuggestionVariant, SuggestionClass } from '../types';

export interface IntellisenseCommon extends SuggestionCommon {
  source: string;
  index: number;
  position: number;
  filter: string;
  theme?: AutocompleteItem['theme'];
}

export interface IntellisenseVariant extends IntellisenseCommon, SuggestionVariant {
  modifiers?: IntellisenseVariant[];
}

export interface IntellisenseClass extends IntellisenseCommon, SuggestionClass {
  modifiers?: IntellisenseClass[];
}

export interface IntellisenseContext {
  tw: Twind<BaseTheme & TailwindTheme>;
  variants: Map<string, IntellisenseVariant>;
  classes: Map<string, IntellisenseClass>;
  suggestions: (IntellisenseVariant | IntellisenseClass)[];
  isIgnored: (className: string) => boolean;
  generateCSS: (token: string) => string;
}

export interface Boundary {
  start: number;
  end: number;
  content: string;
}
