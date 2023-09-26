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
