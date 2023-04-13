import { Appearance, Platform, StyleSheet } from 'react-native';
import { produce, enableMapSet } from 'immer';
import type { TValidInteractionPseudoSelectors } from '../constants';
import type { IStyleType } from '../types';
import ComponentNode from './ComponentNode';
import { globalStore, IComponentsStyleSheets, IRegisterComponentStore } from './global.store';

// import { getStylesForClassProp } from './styles.handlers';

enableMapSet();

const registerComponentInStore = function (
  componentID: string,
  styledProps: { [key: string]: IComponentsStyleSheets },
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
    const cachedComponent = globalStore.getState().componentsRegistry.get(componentID)!;
    // const cachedComponent = globalStore.getState().componentsRegistry.get(componentID)!;
    // if (cachedComponent.meta.classNames !== meta.classNames) {
    //   const componentStyles = getStylesForClassProp(meta.classNames);
    //   let hasGroupInteractions = componentStyles.classNamesSet.some((item) =>
    //     item.startsWith('group-'),
    //   );
    //   let hasPointerInteractions = componentStyles.interactionStyles.length > 0;
    //   let isGroupParent = componentStyles.classNamesSet.includes('group');
    //   for (const currentPropStylesheet of Object.values(styledProps)) {
    //     hasGroupInteractions = currentPropStylesheet.classNamesSet.some((item) =>
    //       item.startsWith('group-'),
    //     );
    //     hasPointerInteractions = currentPropStylesheet.interactionStyles.length > 0;
    //     isGroupParent = currentPropStylesheet.classNamesSet.includes('group');
    //   }
    //   globalStore.setState((prevState) => {
    //     prevState.componentsRegistry.set(componentID, {
    //       ...cachedComponent,
    //       styleSheet: componentStyles,
    //       meta: {
    //         ...cachedComponent.meta,
    //         classNames: meta.classNames,
    //         hasGroupInteractions,
    //         isGroupParent,
    //         hasPointerInteractions,
    //       },
    //     });
    //     return prevState;
    //   }, false);
    //   return globalStore.getState().componentsRegistry.get(componentID)!;
    // }
    if (cachedComponent) {
      if (cachedComponent.classNames !== meta.classNames) {
        globalStore.setState(
          produce((prevState) => {
            prevState.componentsRegistry.get(componentID)!.classNames = meta.classNames;
            // prevState.componentsRegistry.set(componentID, {
            //   ...globalStore.getState().componentsRegistry.get(componentID)!,
            //   getStylesheet: prevState.componentsRegistry.get(componentID)!.getStylesheet,
            //   styleSheet: getStylesForClassProp(meta.classNames),
            // });
          }),
          false,
        );
      }
      return globalStore.getState().componentsRegistry.get(componentID)!;
    }
  }
  globalStore.setState(
    produce((prevState) => {
      prevState.componentsRegistry.set(
        componentID,
        new ComponentNode({ componentID, meta, styledProps }),
      );
      return prevState;
    }),
    false,
  );
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
  globalStore.setState(
    produce((prevState) => {
      prevState.componentsRegistry.get(id)!.interactionsState[interaction] = value;
      // prevState.componentsRegistry.set(id, {
      //   ...prevState.componentsRegistry.get(id)!,
      //   interactionsState: {
      //     ...prevState.componentsRegistry.get(id)!.interactionsState,
      //     [interaction]: value,
      //   },
      // });
      const currentComponent = prevState.componentsRegistry.get(id);
      if (
        currentComponent &&
        interaction === 'group-hover' &&
        currentComponent.meta.isGroupParent
      ) {
        for (const currentComponent of prevState.componentsRegistry.values()) {
          if (
            currentComponent.meta.groupID !== '' &&
            currentComponent.meta.groupID === currentComponent.meta.groupID &&
            currentComponent.meta.hasGroupInteractions
          ) {
            prevState.componentsRegistry.get(currentComponent.id)!.interactionsState[
              interaction
            ] = value;
          }
        }
      }
    }),
  );
  return true;
}

function composeComponentStyledProps(component: {
  platformStyles: IComponentsStyleSheets['platformStyles'];
  interactionStyles: IComponentsStyleSheets['interactionStyles'];
  appearanceStyles: IComponentsStyleSheets['appearanceStyles'];
  interactionsState: IRegisterComponentStore['interactionsState'];
  baseStyles: IComponentsStyleSheets['styles'];
}) {
  const payload: IStyleType[] = [];
  // Important: order matters
  // 1. Platform styles
  if (Platform.OS !== 'web') {
    payload.push(...composeStylesForPseudoClasses(component.platformStyles, 'native'));
  }
  if (Platform.OS === 'ios') {
    payload.push(...composeStylesForPseudoClasses(component.platformStyles, 'ios'));
  }
  if (Platform.OS === 'android') {
    payload.push(...composeStylesForPseudoClasses(component.platformStyles, 'android'));
  }
  if (Platform.OS === 'web') {
    payload.push(...composeStylesForPseudoClasses(component.platformStyles, 'web'));
  }
  // 2. Appearance styles
  if (Appearance.getColorScheme() === 'dark') {
    payload.push(...composeStylesForPseudoClasses(component.appearanceStyles, 'dark'));
  }
  // 2. Interaction styles
  if (
    component.interactionsState &&
    (component.interactionsState?.focus ||
      component.interactionsState?.hover ||
      component.interactionsState?.active)
  ) {
    payload.push(
      ...component.interactionStyles.reduce((prev, current) => {
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
      ...component.interactionStyles.reduce((prev, current) => {
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
  return StyleSheet.flatten([component.baseStyles, payload]);
}

export {
  registerComponentInStore,
  composeComponentStyledProps,
  composeStylesForPseudoClasses,
  setInteractionState,
};
