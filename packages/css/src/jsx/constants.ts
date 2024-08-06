import { FinalSheet } from '../react-native/rn.types';
import { ChildsSheet } from './Sheet';

export const defaultSheetMetadata = {
  hasAnimations: false,
  hasGroupEvents: false,
  hasPointerEvents: false,
  isGroupParent: false,
};

export const emptyChildsSheet: ChildsSheet = {
  first: [],
  last: [],
  even: [],
  odd: [],
};

export const defaultFinalSheet: FinalSheet = {
  base: {},
  even: {},
  first: {},
  group: {},
  last: {},
  odd: {},
  pointer: {},
  dark: {},
};
