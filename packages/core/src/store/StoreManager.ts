import { produce } from 'immer';
import type { Config } from 'tailwindcss';
import resolveConfig from 'tailwindcss/resolveConfig';
import type { IRegisterComponentArgs, TPseudoSelectorTypes } from '../types/store.types';
import ComponentNode from './ComponentNode';
import { createStore } from './generator';

export const storeManager = createStore({
  components: {} as Record<string, ComponentNode>,
  tailwindConfig: resolveConfig({ content: ['__'] }) as Config,
  registerComponent(input: IRegisterComponentArgs) {
    let component: ComponentNode;
    const cache = storeManager.getState().components[input.id];
    if (cache) {
      component = cache;
    } else {
      component = new ComponentNode(input);
      storeManager.setState((prevState) => {
        return produce(prevState, (draft) => {
          draft.components[component.id] = component;
        });
      });
    }
    return input.id;
  },
  setInteractionState(
    target: ComponentNode,
    interaction: TPseudoSelectorTypes,
    value: boolean,
  ) {
    storeManager.setState((prevState) => {
      // prevState.components[target.id].setInteractionState(interaction, value);
      const producer = produce(prevState, (draft) => {
        draft.components[target.id].setInteractionState(interaction, value);
      });
      return producer;
    });
  },
});
