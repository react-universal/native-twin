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
