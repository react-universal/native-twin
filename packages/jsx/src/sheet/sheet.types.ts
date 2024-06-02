import { Appearance, Dimensions } from 'react-native';
import { SheetEntry } from '@native-twin/css';
import { StyledContext } from '@native-twin/styled';
import { INTERNAL_FLAGS, INTERNAL_RESET } from '../constants';
import { Observable } from '../utils/observable';

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
  getGlobalStyle(name: string): Observable<SheetEntry> | undefined;
  runtimeContext: StyledContext;
}
