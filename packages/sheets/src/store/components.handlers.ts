import { Appearance, Platform, StyleSheet } from 'react-native';
import type {
  TValidAppearancePseudoSelectors,
  TValidInteractionPseudoSelectors,
  TValidPlatformPseudoSelectors,
} from '../constants';
import type { IStyleType } from '../types';
import { globalStore, IRegisterComponentStore } from './global.store';
import { getStylesForClassProp } from './styles.handlers';

const registerComponentInStore = function (
  componentID: string,
  meta: {
    classNames: string;
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
  const componentStyles = getStylesForClassProp(meta.classNames);
  globalStore.setState((prevState) => {
    prevState.componentsRegistry.set(componentID, {
      id: componentID,
      styleSheet: componentStyles,
      groupID: meta.groupID,
      interactionsState: {
        'group-hover': false,
        'group-active': false,
        'group-focus': false,
        active: false,
        focus: false,
        hover: false,
      },
      meta: {
        ...meta,
        hasGroupInteractions: componentStyles.hasGroupInteractions,
        isGroupParent: componentStyles.isGroupParent,
        hasPointerInteractions: componentStyles.hasPointerInteractions,
      },
      parentID: meta.parentID,
    });
    return prevState;
  }, false);
  return globalStore.getState().componentsRegistry.get(componentID)!;
};

function composeStylesForPseudoClasses<T extends string>(
  styleTuples: [T, IStyleType][],
  pseudoSelector: T,
) {
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
    const currentComponent = prevState.componentsRegistry.get(id);
    if (
      currentComponent &&
      interaction === 'group-hover' &&
      currentComponent.meta.isGroupParent
    ) {
      [...prevState.componentsRegistry.values()]
        .filter(
          (item) =>
            item.groupID !== '' &&
            item.groupID === currentComponent.groupID &&
            item.meta.hasGroupInteractions,
        )
        .forEach((item) => {
          prevState.componentsRegistry.set(item.id, {
            ...item,
            interactionsState: {
              ...prevState.componentsRegistry.get(item.id)!.interactionsState,
              [interaction]: value,
            },
          });
        });
    }
    return prevState;
  });
  return true;
}

function composeComponentStyledProps(
  interactionStyles: [TValidInteractionPseudoSelectors, IStyleType][],
  platformStyles: [TValidPlatformPseudoSelectors, IStyleType][],
  appearanceStyles: [TValidAppearancePseudoSelectors, IStyleType][],
  component: IRegisterComponentStore,
  componentStyles: IStyleType[],
) {
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
    payload.push(
      ...composeStylesForPseudoClasses(interactionStyles, 'hover'),
      ...composeStylesForPseudoClasses(interactionStyles, 'focus'),
      ...composeStylesForPseudoClasses(interactionStyles, 'active'),
    );
  }
  // 3. Group interaction styles
  if (
    component.interactionsState['group-hover'] ||
    component.interactionsState['group-focus'] ||
    component.interactionsState['group-active']
  ) {
    payload.push(
      ...composeStylesForPseudoClasses(interactionStyles, 'group-hover'),
      ...composeStylesForPseudoClasses(interactionStyles, 'group-focus'),
      ...composeStylesForPseudoClasses(interactionStyles, 'group-active'),
    );
  }
  return StyleSheet.compose(componentStyles, payload);
}

export {
  registerComponentInStore,
  composeComponentStyledProps,
  composeStylesForPseudoClasses,
  setInteractionState,
};
