import { Appearance, Platform, StyleSheet } from 'react-native';
import type { TValidInteractionPseudoSelectors } from '../constants';
import type { IStyleType } from '../types';
import { globalStore, IRegisterComponentStore } from './global.store';
import { getStylesForClassProp } from './styles.handlers';

const registerComponentInStore = function (
  componentID: string,
  meta: {
    classNames?: string;
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
      meta: {
        ...meta,
        hasGroupInteractions: componentStyles.classNamesSet.some((item) =>
          item.startsWith('group-'),
        ),
        isGroupParent: componentStyles.classNamesSet.includes('group'),
        hasPointerInteractions: componentStyles.interactionStyles.length > 0,
      },
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

function composeComponentStyledProps(component: IRegisterComponentStore) {
  const payload: IStyleType[] = [];
  // Important: order matters
  // 1. Platform styles
  if (Platform.OS !== 'web') {
    payload.push(
      ...composeStylesForPseudoClasses(component.styleSheet.platformStyles, 'native'),
    );
  }
  if (Platform.OS === 'ios') {
    payload.push(...composeStylesForPseudoClasses(component.styleSheet.platformStyles, 'ios'));
  }
  if (Platform.OS === 'android') {
    payload.push(
      ...composeStylesForPseudoClasses(component.styleSheet.platformStyles, 'android'),
    );
  }
  if (Platform.OS === 'web') {
    payload.push(...composeStylesForPseudoClasses(component.styleSheet.platformStyles, 'web'));
  }
  // 2. Appearance styles
  if (Appearance.getColorScheme() === 'dark') {
    payload.push(
      ...composeStylesForPseudoClasses(component.styleSheet.platformStyles, 'dark'),
    );
  }
  // 2. Interaction styles
  if (
    component.interactionsState &&
    (component.interactionsState?.focus ||
      component.interactionsState?.hover ||
      component.interactionsState?.active)
  ) {
    payload.push(
      ...component.styleSheet.interactionStyles.reduce((prev, current) => {
        if (current[0] === 'focus' || current[0] === 'hover' || current[0] === 'active') {
          prev.push(current[1]);
        }
        return prev;
      }, [] as IStyleType[]),
    );
  }
  // 3. Group interaction styles
  if (
    component.interactionsState['group-hover'] ||
    component.interactionsState['group-focus'] ||
    component.interactionsState['group-active']
  ) {
    payload.push(
      ...component.styleSheet.interactionStyles.reduce((prev, current) => {
        if (
          current[0] === 'group-focus' ||
          current[0] === 'group-hover' ||
          current[0] === 'group-active'
        ) {
          prev.push(current[1]);
        }
        return prev;
      }, [] as IStyleType[]),
    );
  }
  return StyleSheet.compose(component.styleSheet.styles, payload);
}

export {
  registerComponentInStore,
  composeComponentStyledProps,
  composeStylesForPseudoClasses,
  setInteractionState,
};
