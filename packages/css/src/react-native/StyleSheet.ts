import type { SheetEntryParser } from '../jsx';
import type { AnyStyle } from './rn.types';

export class TwinStyleSheet {
  private _twinStyles = new Map<string, TwinStyle>();
  constructor(platform: 'native' | 'web') {}
}

class TwinStyle {
  private _baseStyles: AnyStyle[] = [];
  private _pointerStyles: AnyStyle[] = [];
  constructor(readonly parser: SheetEntryParser) {}
}
