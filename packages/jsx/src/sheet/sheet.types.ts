import { TailwindConfig, __Theme__ } from '@native-twin/core';
import {
  AnyStyle,
  FinalSheet,
  GetChildStylesArgs,
  SheetEntry,
  SheetInteractionState,
} from '@native-twin/css';
import { Atom } from '@native-twin/helpers';
import { JSXStyledProps } from '../jsx/jsx-custom-props';
import { StyledContext } from '../store/observables/styles.obs';
import { ComponentConfig } from '../types/styled.types';
import { INTERNAL_FLAGS, INTERNAL_RESET } from '../utils/constants';

export interface TwinStyleSheet {
  [INTERNAL_RESET](tw?: TailwindConfig<__Theme__>): void;
  [INTERNAL_FLAGS]: Record<string, string>;
  getFlag(name: string): string | undefined;
  getGlobalStyle(name: string): Atom<SheetEntry> | undefined;
  compile(tokens: string): FinalSheet;
  registerClassNames(source: string): SheetEntry[];
  entriesToFinalSheet(entries: SheetEntry[]): FinalSheet;
  registerComponent(
    id: string,
    data: {
      configs: ComponentConfig[];
      props: Record<string, any> | null;
      context: StyledContext;
    },
  ): RegisteredComponent;
  getComponentState(id: string): Atom<ComponentState>;
}

export interface ComponentState {
  isGroupActive: boolean;
  isLocalActive: boolean;
}

export interface RegisteredComponent {
  id: string;
  prevProps: JSXStyledProps;
  sheets: ComponentSheet[];
  metadata: {
    isGroupParent: boolean;
    hasGroupEvents: boolean;
    hasPointerEvents: boolean;
  };
}

export interface ComponentSheet {
  prop: string;
  sheet: FinalSheet;
  getChildStyles(input: Partial<GetChildStylesArgs>): AnyStyle;
  getStyles: (input: Partial<SheetInteractionState>) => AnyStyle;
  metadata: {
    isGroupParent: boolean;
    hasGroupEvents: boolean;
    hasPointerEvents: boolean;
  };
  recompute(): ComponentSheet;
}

export interface ComponentConfigProps extends ComponentConfig {
  className: string;
}
