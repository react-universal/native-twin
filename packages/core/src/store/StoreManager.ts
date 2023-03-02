import { produce } from 'immer';
import type {
  IRegisterComponentArgs,
  TInteractionPseudoSelectors,
} from '../types/store.types';
import ComponentNode from './ComponentNode';
import { createStore } from './generator';

const storeManager = createStore({
  components: {} as Record<string, ComponentNode>,
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
  },
});

export default storeManager;
