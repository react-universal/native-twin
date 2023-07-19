import type { Platform } from 'react-native';
import { AnyStyle, FinalSheet } from '@universal-labs/css';
import { TwindManager } from '@universal-labs/twind-adapter';

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
  platform: Platform['OS'];
  colorScheme: 'dark' | 'light';
  units: Units;
};

export interface SheetMetadata {
  isGroupParent: boolean;
  hasPointerEvents: boolean;
  hasGroupEvents: boolean;
}

export interface SheetChildState {
  isFirstChild: boolean;
  isLastChild: boolean;
  isEven: boolean;
  isOdd: boolean;
}

export interface SheetInteractionState {
  isPointerActive: boolean;
  isParentActive: boolean;
}

export interface SheetInterpreterFn {
  (classNames: string): {
    finalSheet: FinalSheet;
    metadata: SheetMetadata;
    getStyles: (data: SheetInteractionState) => AnyStyle;
    getChildStyles: (data: SheetChildState) => AnyStyle;
  };
}

export interface SheetManagerFn {
  (context: StyledContext): SheetInterpreterFn;
  twind?: TwindManager | undefined;
}
