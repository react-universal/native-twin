import { Appearance, Dimensions } from 'react-native';
import { PlatformOSType } from 'react-native';
import { AnyStyle, FinalSheet, SheetEntry } from '@native-twin/css';
import { INTERNAL_FLAGS, INTERNAL_RESET } from '../constants';
import { Atom } from '../store/atomic.store';

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
  compile(tokens: string): FinalSheet;
  registerClassNames(source: string): SheetEntry[];
  entriesToFinalSheet(entries: SheetEntry[]): FinalSheet;
  styles: Map<string, ComponentSheet>;
}

export interface ComponentSheet {
  sheet: FinalSheet;
  styles: {
    base: AnyStyle;
    active: AnyStyle;
    first: AnyStyle;
    last: AnyStyle;
  };
}

export type Units = {
  '%'?: number;
  vw?: number;
  vh?: number;
  vmin?: number;
  vmax?: number;
  em: number;
  rem: number;
  px: number;
  pt: number;
  pc: number;
  in: number;
  cm: number;
  mm: number;
};

export type StyledContext = {
  orientation: 'portrait' | 'landscape';
  resolution: number;
  fontScale: number;
  deviceWidth: number;
  deviceHeight: number;
  deviceAspectRatio: number;
  platform: PlatformOSType;
  colorScheme: 'dark' | 'light';
  units: Units;
};
