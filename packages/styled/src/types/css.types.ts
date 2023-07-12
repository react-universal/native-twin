import { AnyStyle, FinalSheet } from '@universal-labs/css';
import { TwindManager } from '@universal-labs/twind-adapter';
import type { Config } from 'tailwindcss';

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
  prefersReducedMotion: 'no-preference' | 'reduce';
  deviceWidth: number;
  deviceHeight: number;
  deviceAspectRatio: number;
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
  setThemeConfig(config: Config, rem: number): void;
  twind: TwindManager;
}
