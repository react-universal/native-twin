import type {
  AutocompleteItem,
  BaseTheme,
  ExtractUserTheme,
  ThemeFunction,
  Twind,
  TwindConfig,
} from '@universal-labs/twind-native';
import type { TailwindTheme } from '@universal-labs/twind-adapter';
import type { Numberify, RGBA } from '@ctrl/tinycolor';

export type CurrentTheme = BaseTheme & TailwindTheme;
export type TailwindConfig = TwindConfig<CurrentTheme>;

export type LanguageId =
  | (
      | 'html'
      | 'javascript'
      | 'javascriptreact'
      | 'markdown'
      | 'svelte'
      | 'typescript'
      | 'typescriptreact'
      | 'vue-html'
      | 'vue'
    )
  | (string & {});

export interface Intellisense<Theme extends CurrentTheme = CurrentTheme> {
  readonly theme: ThemeFunction<ExtractUserTheme<CurrentTheme>>;
  readonly config: TwindConfig<Theme>;

  suggest(input: string, options?: SuggestAtOptions): Promise<Suggestion[]>;
}

export interface DocumentationForOptions {
  format?: 'md' | 'html';
}

export interface Diagnostics {
  code: 'invalidVariant' | 'invalidClass' | 'invalidCSS';
  severity: 'hint' | 'info' | 'warning' | 'error';
  value: string;
  message: string;
  start: number;
  end: number;
  suggestions?: [];
  related?: RelatedDiagnostic[];
}

export interface RelatedDiagnostic {
  resource: string;
  message: string;
  start: number;
  end: number;
}

export interface DocumentationAt {
  start: number;
  end: number;
  value: string;
}

export interface ColorInformation {
  start: number;
  end: number;
  value: string;
  rgba: Numberify<RGBA>;
  editable?: boolean;
}

export interface SuggestAtOptions {
  prefix?: string;
  ignore?: string[];
}

export interface SuggestionAt {
  start: number;
  end: number;
  suggestions: Suggestion[];
}

export interface SuggestionCommon {
  /** The full name of the suggested value */
  name: string;
  /** The value as it will be used in this context */
  value: string;
  /** Short info to be displayed inline */
  description?: string;
  detail?: string;
  color?: string;
}

export interface SuggestionVariant extends SuggestionCommon {
  type: 'variant';
}

export interface SuggestionClass extends SuggestionCommon {
  type: 'class';
}

export type Suggestion = SuggestionClass | SuggestionVariant;

export interface IntellisenseOptions {
  cache?: {
    /**
    The maximum number of milliseconds an item should remain in the cache.

    @default Infinity

    By default, `maxAge` will be `Infinity`, which means that items will never expire.
    Lazy expiration upon the next write or read call.

    Individual expiration of an item can be specified by the `set(key, value, maxAge)` method.
    */
    readonly maxAge?: number;

    /**
    The maximum number of items before evicting the least recently used items.

    @default 1000
    */
    readonly maxSize: number;
  };

  mdnOrigin?: string;
}

export interface TwindPluginConfiguration {
  readonly configFile?: string;
  readonly tags: ReadonlyArray<string>;
  readonly attributes: ReadonlyArray<string>;
  readonly styles: ReadonlyArray<string>;
  readonly debug?: boolean;
  readonly enable: boolean;
}

export type LanguageServiceContext = {
  completionEntries: Map<string, Suggestion>;
};

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
  tw: Twind<CurrentTheme>;
  variants: Map<string, IntellisenseVariant>;
  classes: Map<string, IntellisenseClass>;
  suggestions: (IntellisenseVariant | IntellisenseClass)[];
  isIgnored: (className: string) => boolean;
  generateCSS: (token: string) => string;
}
