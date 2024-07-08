import { Appearance, Dimensions } from 'react-native';
import { AnyStyle, FinalSheet, SheetEntry } from '@native-twin/css';
import { INTERNAL_FLAGS, INTERNAL_RESET } from '../constants';
import { Atom } from '../store/store.types';

export interface TwinStyleSheet {
  [INTERNAL_RESET](options?: {
    dimensions?: Dimensions;
    appearance?: typeof Appearance;
  }): void;
  [INTERNAL_FLAGS]: Record<string, string>;
  // unstable_hook_onClassName?(callback: (c: string) => void): void;
  // register(options: StyleSheetRegisterOptions): void;
  // registerCompiled(options: StyleSheetRegisterCompiledOptions): void;
  getFlag(name: string): string | undefined;
  getGlobalStyle(name: string): Atom<SheetEntry> | undefined;
  compile: (tokens: string) => FinalSheet;
  registerComponent(source: string): SheetEntry[];
  styles: Map<string, AnyStyle>;
}
