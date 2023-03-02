import { produce } from 'immer';
import type {
  IRegisterComponentArgs,
  TInteractionPseudoSelectors,
} from '../types/store.types';
import { reduxDevToolsConnection } from '../utils/devHelpers';
import ComponentNode from './ComponentNode';
import { createStore } from './generator';

export const storeManager = createStore({
  components: {} as Record<string, ComponentNode>,
  // tailwindConfig: resolveConfig({ content: ['__'] }),
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
      reduxDevToolsConnection?.send(
        {
          type: 'COMPONENT_REGISTERED: ',
          ...storeManager.getState(),
        },
        storeManager.getState(),
      );
    }
    return input.id;
  },
  unregisterComponent(id: string) {
    storeManager.setState((prevState) => {
      return produce(prevState, (draft) => {
        if (draft.components[id]) {
          delete draft.components[id];
        }
      });
    });
  },
  setInteractionState(
    target: ComponentNode,
    interaction: TInteractionPseudoSelectors,
    value: boolean,
  ) {
    storeManager.setState((prevState) => {
      const producer = produce(prevState, (draft) => {
        draft.components[target.id].setInteractionState(interaction, value);
      });
      return producer;
    });
    reduxDevToolsConnection?.send(
      {
        type: 'INTERACTION_STATE_CHANGE: ',
        ...storeManager.getState(),
      },
      storeManager.getState(),
    );
  },
});

reduxDevToolsConnection?.init(storeManager.getState());
