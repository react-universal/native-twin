import type { Platform } from 'react-native';

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

export type ClassValue = string | null | undefined | ClassValue[];

export type ClassNamesProp =
  | {
      tw: ClassValue;
      className?: never;
    }
  | { tw?: never; className: ClassValue }
  | { tw?: never; className?: never };
