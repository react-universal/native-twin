import { StyleSheet as NativeSheet } from 'react-native';
import * as Equal from 'effect/Equal';
import {
  AnyStyle,
  GetChildStylesArgs,
  SheetEntry,
  SheetInteractionState,
} from '@native-twin/css';
import { Atom, atom } from '@native-twin/helpers';
import { JSXStyledProps } from '../jsx/jsx-custom-props';
import {
  StyledContext,
  remObs,
  styledContext,
  twinConfigObservable,
} from '../store/observables';
import { globalStyles } from '../store/styles.store';
import { ComponentConfig } from '../types/styled.types';
import { INTERNAL_FLAGS, INTERNAL_RESET } from '../utils/constants';
import { getSheetEntryStyles } from '../utils/sheet.utils';
import { tw } from './native-tw';
import {
  ComponentConfigProps,
  ComponentSheet,
  RegisteredComponent,
  TwinStyleSheet,
  ComponentState,
} from './sheet.types';

const componentsRegistry: Map<string, RegisteredComponent> = new Map();
const componentsState: Map<string, Atom<ComponentState>> = new Map();

const internalSheet: TwinStyleSheet = {
  [INTERNAL_FLAGS]: {
    STARTED: 'NO',
  },
  [INTERNAL_RESET](twConfig) {
    globalStyles.clear();
    const config = twConfig ?? tw.config;
    twinConfigObservable.set(config);
    remObs.set(config.root.rem);
    this[INTERNAL_FLAGS]['STARTED'] = 'YES';
  },
  getFlag(name: string) {
    return this[INTERNAL_FLAGS][name];
  },
  getGlobalStyle(name) {
    return globalStyles.get(name);
  },
  compile(tokens) {
    const entries = tw(tokens);
    return getSheetEntryStyles(entries, styledContext.get());
  },
  entriesToFinalSheet(entries) {
    return getSheetEntryStyles(entries, styledContext.get());
  },
  registerClassNames(source: string) {
    const entries = tw(`${source}`);
    return entries;
  },
  registerComponent(id, params) {
    const component = componentsRegistry.get(id);
    const styledMaps = (params.props?.['styledProps'] as JSXStyledProps) ?? {};

    if (component) {
      if (styledMaps && Equal.equals(styledMaps, component.prevProps)) {
        component.sheets = component.sheets.map((x) => x.recompute());
        return component;
      }
    }

    const sheets: ComponentSheet[] = [];
    for (const style of styledMaps.styleTuples ?? []) {
      const entries = tw(`${style.className}`);
      sheets.push(createComponentSheet(style.target, entries, params.context));
    }
    const registerComponent: RegisteredComponent = {
      id,
      prevProps: styledMaps,
      sheets,
      metadata: {
        isGroupParent: sheets.some((x) => x.metadata.isGroupParent),
        hasGroupEvents: sheets.some((x) => x.metadata.hasGroupEvents),
        hasPointerEvents: sheets.some((x) => x.metadata.hasPointerEvents),
        hasAnimations: sheets.some((x) => x.metadata.hasAnimations),
      },
    };
    componentsRegistry.set(id, registerComponent);
    if (!componentsState.has(id)) {
      componentsState.set(id, atom({ isGroupActive: false, isLocalActive: false }));
    }
    return componentsRegistry.get(id)!;
  },
  getComponentState(id) {
    const component = componentsState.get(id);

    return component!;
  },
};

export const StyleSheet = Object.assign({}, internalSheet, NativeSheet);

export function createComponentSheet(
  prop: string,
  entries: SheetEntry[] = [],
  context: StyledContext,
): ComponentSheet {
  const sheet = StyleSheet.create(getSheetEntryStyles(entries, context));
  const base = sheet.base;
  if (context.colorScheme === 'dark') {
    Object.assign({ ...base }, { ...sheet.dark });
  }
  return {
    prop,
    getStyles,
    sheet,
    getChildStyles,
    recompute: () => {
      return createComponentSheet(prop, entries, styledContext.get());
    },
    metadata: {
      isGroupParent: entries.some((x) => x.className == 'group'),
      hasGroupEvents: Object.keys(sheet.group).length > 0,
      hasPointerEvents: Object.keys(sheet.pointer).length > 0,
      hasAnimations: entries.some((x) => x.animations.length > 0),
    },
  };

  function getStyles(input: Partial<SheetInteractionState>) {
    const styles: AnyStyle = { ...sheet.base };
    if (input.dark) Object.assign(styles, { ...sheet.dark });
    if (input.isPointerActive) Object.assign(styles, { ...sheet.pointer });
    if (input.isParentActive) Object.assign(styles, { ...sheet.group });

    return styles;
  }

  function getChildStyles(input: Partial<GetChildStylesArgs>) {
    const result: AnyStyle = {};
    if (input.isFirstChild) {
      Object.assign(result, sheet.first);
    }
    if (input.isLastChild) {
      Object.assign(result, sheet.last);
    }
    if (input.isEven) {
      Object.assign(result, sheet.even);
    }
    if (input.isOdd) {
      Object.assign(result, sheet.odd);
    }
    return Object.freeze(result);
  }
}

export type ComponentSheetHandler = ReturnType<typeof createComponentSheet>;

export const intersectConfigProps = (
  props: Record<string, any>,
  configs: ComponentConfig[],
): ComponentConfigProps[] => {
  const styledProps: ComponentConfigProps[] = [];
  if (props && configs) {
    for (const config of configs) {
      const source = props?.[config.source];
      if (!source) continue;

      if (source) {
        styledProps.push({
          ...config,
          className: source,
        });
      }
    }
  }
  return styledProps;
};
