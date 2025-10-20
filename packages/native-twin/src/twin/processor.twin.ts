import {
  createVirtualSheet,
  interpolate,
  parseTWTokens,
  type Sheet,
  type SheetEntry,
  sortedInsertionIndex,
} from '@native-twin/css';
import type { StringLike } from '@native-twin/helpers';
import { defineConfig } from '../config/define-config';
import { parsedRuleToEntry } from '../convert/ruleToEntry';
import { createThemeContext } from '../theme/theme.context';
import type {
  Preset,
  TailwindConfig,
  TailwindUserConfig,
  ThemeContext,
} from '../types/config.types';
import type { __Theme__ } from '../types/theme.types';

export class Processor<Theme extends __Theme__, _ extends Preset<any>[] = Preset[]> {
  private _internal = { initialized: false };
  private _config: TailwindConfig<Theme>;
  private _context: ThemeContext<__Theme__>;
  private _insertedRules = new Set<string>();
  private _sortedEntries: SheetEntry[] = [];
  private _sheet: Sheet<SheetEntry[]>;
  private _cache: Map<string, SheetEntry[]> = new Map();
  // private _rulesMatcher: TwinRule<Theme>[];

  public get theme() {
    return this._config.theme;
  }

  constructor(config: TailwindUserConfig<any>) {
    this._config = defineConfig(config);
    this._context = createThemeContext(this._config);
    this._sheet = createVirtualSheet();
    this._internal.initialized = true;
    // this._rulesMatcher = this._config.rules.map((x) => new TwinRule(x));
  }

  insertEntry(entry: SheetEntry) {
    this._insertedRules.add(entry.className);
    if (entry.declarations.length === 0) {
      return;
    }
    const index = sortedInsertionIndex(this._sortedEntries, entry);
    this._sheet.insert(entry, index);
    this._sortedEntries.splice(index, 0, entry);
  }

  private parseClassnames(raw: string) {
    return parseTWTokens(raw);
  }

  // Exposed methods
  public snapshot() {
    const restoreSheet = this._sheet.snapshot();
    const cache$ = new Map(this._cache);

    return () => {
      restoreSheet();
      this._cache = cache$;
    };
  }

  public clear() {
    this._sheet.clear();
    this._cache = new Map();
    this._insertedRules.clear();
    this._sortedEntries = [];
    // subscriptions.clear();
  }

  public run(tokens: StringLike) {
    tokens = interpolate`${[tokens]}`;
    if (this._cache.has(tokens)) {
      return this._cache.get(tokens);
    }
    const parsedClasses = this.parseClassnames(tokens);
    const entries = parsedClasses.reduce((prev, current) => {
      prev.push(parsedRuleToEntry(current, this._context));
      return prev;
    }, [] as SheetEntry[]);

    const resolved = parsedClasses.map((parsedClass) => {
      return this._context.r(parsedClass);
    });
    return { entries, resolved };
  }
}
