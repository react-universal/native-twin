import { TailwindConfig, __Theme__ } from '@native-twin/core';
import { FinalSheet, SheetEntry } from '@native-twin/css';
import { RegisteredComponent, RuntimeComponentEntry } from '@native-twin/css/jsx';
import { Atom } from '@native-twin/helpers';
import { StyledContext } from '../store/observables/styles.obs';
import { ComponentConfig } from '../types/styled.types';
import { INTERNAL_FLAGS, INTERNAL_RESET } from '../utils/constants';

export interface TwinStyleSheet {
  [INTERNAL_RESET](tw?: TailwindConfig<__Theme__>): void;
  [INTERNAL_FLAGS]: Record<string, string>;
  getFlag(name: string): string | undefined;
  getGlobalStyle(name: string): Atom<SheetEntry> | undefined;
  entriesToFinalSheet(entries: SheetEntry[]): FinalSheet;
  getComponentByID(id: string): RegisteredComponent | undefined;
  registerComponent(
    id: string,
    props: RuntimeComponentEntry[],
    context: StyledContext,
  ): RegisteredComponent;
  getComponentState(id: string): Atom<ComponentState>;
}

export interface ComponentState {
  isGroupActive: boolean;
  isLocalActive: boolean;
}

export interface ComponentConfigProps extends ComponentConfig {
  className: string;
}
