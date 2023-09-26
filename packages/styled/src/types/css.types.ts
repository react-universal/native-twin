import { PlatformOSType } from 'react-native';

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
