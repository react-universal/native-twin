import { produce, enableMapSet } from 'immer';
import type {
  IRegisterComponentArgs,
  TInteractionPseudoSelectors,
} from '../types/store.types';
import ComponentNode from './ComponentNode';
import { createStore } from './generator';

enableMapSet();

const storeManager = createStore({
  components: new Map<string, ComponentNode>(),
  registerComponent(input: IRegisterComponentArgs) {
    let component: ComponentNode;
    component = new ComponentNode(input);
    storeManager.setState((prevState) => {
      return produce(prevState, (draft) => {
        draft.components.set(component.id, component);
      });
    });
    return component.id;
  },
  unregisterComponent(id: string) {
    storeManager.setState((prevState) => {
      return produce(prevState, (draft) => {
        draft.components.delete(id);
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
        draft.components.get(target.id)?.setInteractionState(interaction, value);
      });
      return producer;
    });
  },
});

export default storeManager;
