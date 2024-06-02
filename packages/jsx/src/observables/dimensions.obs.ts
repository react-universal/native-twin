import { Dimensions } from 'react-native';
import { INTERNAL_RESET, INTERNAL_SET } from '../constants';
import { Effect, observable } from '../utils/observable';

/**
 * Viewport Units
 */
const viewport = observable(Dimensions.get('window'));
let windowEventSubscription: ReturnType<typeof Dimensions.addEventListener>;
const viewportReset = (dimensions: Dimensions) => {
  viewport.set(dimensions.get('window'));
  windowEventSubscription?.remove();
  windowEventSubscription = dimensions.addEventListener('change', (size) => {
    return viewport.set(size.window);
  });
};
viewportReset(Dimensions);
export const vw = {
  get: (effect?: Effect) => viewport.get(effect).width,
  [INTERNAL_RESET]: viewportReset,
  [INTERNAL_SET](value: number) {
    viewport.set({ ...viewport.get(), width: value });
  },
};
export const vh = {
  get: (effect?: Effect) => viewport.get(effect).height,
  [INTERNAL_RESET]: viewportReset,
  [INTERNAL_SET](value: number) {
    viewport.set({ ...viewport.get(), height: value });
  },
};
