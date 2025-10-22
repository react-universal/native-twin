import type { SheetEntryParser } from '../jsx';
import type { AnyStyle } from './rn.types';

export class TwinStyleSheet {
  _twinStyles = new Map<string, TwinStyle>();
  constructor(_platform: 'native' | 'web') {}
}

class TwinStyle {
  _baseStyles: AnyStyle[] = [];
  _pointerStyles: AnyStyle[] = [];
  constructor(readonly parser: SheetEntryParser) {}
}
