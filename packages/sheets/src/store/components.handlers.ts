import { produce } from 'immer';
import type { ValidGroupPseudoSelector, ValidInteractionPseudoSelector } from '../constants';
import { generatedComponentStylesheets } from '../stylesheet/Stylesheet';
import type { AnyStyle } from '../types';
import ComponentNode, { ComponentNodeInput } from './ComponentNode';
import { globalStore } from './global.store';

const registerComponentInStore = function (input: ComponentNodeInput) {
  if (input.componentID in globalStore.getState().componentsRegistry) {
    return globalStore.getState().componentsRegistry[input.componentID]!;
  }
  globalStore.setState(
    produce((prevState) => {
      prevState.componentsRegistry[input.componentID] = new ComponentNode(input);
    }),
    false,
  );
  return globalStore.getState().componentsRegistry[input.componentID]!;
};

function composeStylesForPseudoClasses<T extends string>(
  styleTuples: [T, AnyStyle][],
  pseudoSelector: T,
) {
  return styleTuples
    .filter(([selectorName]) => selectorName === pseudoSelector)
    .map(([, selectorStyles]) => selectorStyles);
}

function setInteractionState(
  id: string,
  interaction: ValidInteractionPseudoSelector | ValidGroupPseudoSelector,
  value: boolean,
) {
  globalStore.setState(
    produce((prevState) => {
      prevState.componentsRegistry[id]!.interactionsState[interaction] = value;
      const currentComponent = prevState.componentsRegistry[id];
      if (currentComponent && interaction === 'group-hover') {
        for (const lookupComponent of Object.values(prevState.componentsRegistry)) {
          const sheet = generatedComponentStylesheets[lookupComponent.stylesheetID];
          if (
            sheet &&
            lookupComponent.groupID !== '' &&
            currentComponent.groupID === lookupComponent.groupID &&
            Object.keys(sheet.group).length > 0
          ) {
            prevState.componentsRegistry[lookupComponent.id]!.interactionsState[interaction] =
              value;
          }
        }
      }
    }),
  );
  return true;
}

// function composeComponentStyledProps(component: {
//   platformStyles: IComponentsStyleSheets['platformStyles'];
//   interactionStyles: IComponentsStyleSheets['interactionStyles'];
//   appearanceStyles: IComponentsStyleSheets['appearanceStyles'];
//   interactionsState: IRegisterComponentStore['interactionsState'];
//   baseStyles: IComponentsStyleSheets['styles'];
// }) {
//   const payload: StyledObject[] = [];
//   // Important: order matters
//   // 1. Platform styles
//   if (Platform.OS !== 'web') {
//     payload.push(...composeStylesForPseudoClasses(component.platformStyles, 'native'));
//   }
//   if (Platform.OS === 'ios') {
//     payload.push(...composeStylesForPseudoClasses(component.platformStyles, 'ios'));
//   }
//   if (Platform.OS === 'android') {
//     payload.push(...composeStylesForPseudoClasses(component.platformStyles, 'android'));
//   }
//   if (Platform.OS === 'web') {
//     payload.push(...composeStylesForPseudoClasses(component.platformStyles, 'web'));
//   }
//   // 2. Appearance styles
//   if (Appearance.getColorScheme() === 'dark') {
//     payload.push(...composeStylesForPseudoClasses(component.appearanceStyles, 'dark'));
//   }
//   // 2. Interaction styles
//   if (
//     component.interactionsState &&
//     (component.interactionsState?.focus ||
//       component.interactionsState?.hover ||
//       component.interactionsState?.active)
//   ) {
//     payload.push(
//       ...component.interactionStyles.reduce((prev, current) => {
//         if (current[0] === 'focus' || current[0] === 'hover' || current[0] === 'active') {
//           prev.push(current[1]);
//         }
//         return prev;
//       }, [] as StyledObject[]),
//     );
//   }
//   // 3. Group interaction styles
//   if (
//     component.interactionsState['group-hover'] ||
//     component.interactionsState['group-focus'] ||
//     component.interactionsState['group-active']
//   ) {
//     payload.push(
//       ...component.interactionStyles.reduce((prev, current) => {
//         if (
//           current[0] === 'group-focus' ||
//           current[0] === 'group-hover' ||
//           current[0] === 'group-active'
//         ) {
//           prev.push(current[1]);
//         }
//         return prev;
//       }, [] as StyledObject[]),
//     );
//   }
//   return StyleSheet.flatten([component.baseStyles, payload]);
// }

export { registerComponentInStore, composeStylesForPseudoClasses, setInteractionState };
