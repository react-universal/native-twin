import { Appearance, Platform, StyleSheet } from 'react-native';
import type {
  TValidAppearancePseudoSelectors,
  TValidInteractionPseudoSelectors,
  TValidPlatformPseudoSelectors,
} from '../constants';
import type { IStyleType } from '../types';
import { globalStore, IRegisterComponentStore } from './global.store';

const registerComponentInStore = function (
  componentID: string,
  meta: {
    parentID?: string;
    groupID?: string;
    isFirstChild: boolean;
    isLastChild: boolean;
    nthChild: number;
  },
) {
  if (globalStore.getState().componentsRegistry.has(componentID)) {
    return globalStore.getState().componentsRegistry.get(componentID)!;
  }
  globalStore.setState((prevState) => {
    prevState.componentsRegistry.set(componentID, {
      groupID: meta.groupID,
      interactionsState: {
        'group-hover': false,
        active: false,
        focus: false,
        hover: false,
      },
      meta,
      parentID: meta.parentID,
    });
    return prevState;
  });
  return globalStore.getState().componentsRegistry.get(componentID)!;
};

function composeStylesForPseudoClasses<T extends string>(
  styleTuples: [T, IStyleType][],
  pseudoSelector: T,
) {
  // console.log('stylesTuple', styleTuples);
  return styleTuples
    .filter(([selectorName]) => selectorName === pseudoSelector)
    .map(([, selectorStyles]) => selectorStyles);
}

function setInteractionState(
  id: string,
  interaction: TValidInteractionPseudoSelectors,
  value: boolean,
) {
  globalStore.setState((prevState) => {
    prevState.componentsRegistry.set(id, {
      ...prevState.componentsRegistry.get(id)!,
      interactionsState: {
        ...prevState.componentsRegistry.get(id)!.interactionsState,
        [interaction]: value,
      },
    });
    return prevState;
  });
  // if (typeof component?.groupID === 'string') {
  //   if (
  //     Reflect.has(componentGroupsStore, component.groupID) &&
  //     component.groupID !== 'non-group'
  //   ) {
  //     componentGroupsStore[component.groupID] = {
  //       ...componentGroupsStore[component.groupID]!,
  //       interactionsState: {
  //         ...componentGroupsStore[component.groupID]!.interactionsState,
  //         [interaction]: value,
  //       },
  //     };
  //   }
  // }

  // componentsStore[id] = {
  //   ...componentsStore[id]!,
  //   interactionsState: {
  //     ...componentsStore[id]!.interactionsState,
  //     [interaction]: value,
  //   },
  // };
  // Object.keys(componentsStore).
  return true;
}

function composeComponentStyledProps(
  interactionStyles: [TValidInteractionPseudoSelectors, IStyleType][],
  platformStyles: [TValidPlatformPseudoSelectors, IStyleType][],
  appearanceStyles: [TValidAppearancePseudoSelectors, IStyleType][],
  component: IRegisterComponentStore,
  componentStyles: IStyleType[],
) {
  const hoverStyles = composeStylesForPseudoClasses(interactionStyles, 'hover');
  const groupHoverStyles = composeStylesForPseudoClasses(interactionStyles, 'group-hover');
  const activeStyles = composeStylesForPseudoClasses(interactionStyles, 'active');
  const focusStyles = composeStylesForPseudoClasses(interactionStyles, 'focus');
  const payload: IStyleType[] = [];
  // Important: order matters
  // 1. Platform styles
  if (Platform.OS !== 'web') {
    payload.push(...composeStylesForPseudoClasses(platformStyles, 'native'));
  }
  if (Platform.OS === 'ios') {
    payload.push(...composeStylesForPseudoClasses(platformStyles, 'ios'));
  }
  if (Platform.OS === 'android') {
    payload.push(...composeStylesForPseudoClasses(platformStyles, 'android'));
  }
  if (Platform.OS === 'web') {
    payload.push(...composeStylesForPseudoClasses(platformStyles, 'web'));
  }
  // 2. Appearance styles
  if (Appearance.getColorScheme() === 'dark') {
    payload.push(...composeStylesForPseudoClasses(appearanceStyles, 'dark'));
  }
  // 2. Interaction styles
  if (
    component.interactionsState &&
    (component.interactionsState?.focus ||
      component.interactionsState?.hover ||
      component.interactionsState?.active)
  ) {
    if (hoverStyles) {
      payload.push(...hoverStyles);
    }
    if (focusStyles) {
      payload.push(...focusStyles);
    }
    if (activeStyles) {
      payload.push(...activeStyles);
    }
  }
  // 3. Group interaction styles
  // if (
  //   componentGroup?.interactionsState &&
  //   componentGroup?.interactionsState?.['group-hover'] &&
  //   groupHoverStyles
  // ) {
  //   payload.push(...groupHoverStyles);
  // }
  return StyleSheet.compose(componentStyles, payload);
}

export {
  registerComponentInStore,
  composeComponentStyledProps,
  composeStylesForPseudoClasses,
  setInteractionState,
};
