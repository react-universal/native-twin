import type { PlatformOSType, StyleProp } from 'react-native';
import type { AnyStyle, SelectorGroup } from '@universal-labs/css';
import type { Falsey, StringLike } from './util.types';

export type CSSValue =
  | string
  | number
  | bigint
  | Falsey
  | StringLike
  | StyleProp<any>
  | CSSValue[];

export type SheetEntry = [className: string, group: SelectorGroup, styles: AnyStyle];

export interface Sheet<Target = unknown> {
  readonly target: Map<string, Target>;
  insert(entry: SheetEntry): void;
  getClassName(key: string): SheetEntry | undefined;
  // snapshot(): () => void;
  /** Clears all CSS rules from the sheet. */
  clear(): void;
  destroy(): void;
  // resume(addClassName: (className: string) => void, insert: (cssText: string) => void): void;
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
