import type { __Theme__, RuntimeTW, StyleSheetAdapter } from '@native-twin/core';
import type { Sheet, SheetEntry } from '@native-twin/css';
import type {
  RuntimeJSXStyle,
  RuntimeSheetDeclaration,
  TwinInjectedProp,
} from '@native-twin/css/jsx';
import type { Atom } from '@native-twin/helpers/react';
import type { StyleSheet } from 'react-native';
import type { ComponentState } from '../store/components.store';
import { INTERNAL_RESET } from '../utils/constants';

export interface TwinStyleSheet extends StyleSheetAdapter<__Theme__> {
  create: typeof StyleSheet.create;
  absoluteFill: typeof StyleSheet.absoluteFill;
  absoluteFillObject: typeof StyleSheet.absoluteFillObject;
  compose: typeof StyleSheet.compose;
  flatten: typeof StyleSheet.flatten;
  hairlineWidth: typeof StyleSheet.hairlineWidth;
  tw: RuntimeTW<__Theme__, Sheet<SheetEntry[]>>;
  [INTERNAL_RESET]: () => {};

  getComponentState(id: string): Atom<ComponentState>;
  getComponentByID(
    id: string,
    templateEntries: TwinInjectedProp['templateEntries'] | undefined,
  ): {
    id: string;
    props: {
      prop: string;
      target: string;
      entries: RuntimeJSXStyle[];
      declarations: {
        base: RuntimeSheetDeclaration[];
        pointer: RuntimeSheetDeclaration[];
        group: RuntimeSheetDeclaration[];
      };
    }[];
    metadata: {
      isGroupParent: boolean;
      hasGroupEvents: boolean;
      hasPointerEvents: boolean;
    };
  };
}
