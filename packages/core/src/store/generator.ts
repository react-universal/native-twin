import { useSyncExternalStore } from 'react';

function createStore<StoreShape>(initialState: StoreShape) {
  let currentState = initialState;
  const listeners = new Set<(state: StoreShape) => void>();
  const subscribe = (listener: (state: StoreShape) => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };
  return {
    setState: (newState: StoreShape) => {
      currentState = newState;
      listeners.forEach((listener) => listener(currentState));
    },
    getState: () => {
      return Object.freeze(currentState);
    },
    emitChanges: () => {
      listeners.forEach((listener) => listener(currentState));
    },
    useStore: <SelectorOutput>(
      selector: (state: StoreShape) => SelectorOutput,
    ): SelectorOutput => {
      return useSyncExternalStore(
        subscribe,
        () => selector(currentState),
        () => selector(currentState),
      );
    },
  };
}

export { createStore };

// const interpreterLog = (...args: any) => console.log('INTERPRETER: ', ...args);
// const producerLog = (...args: any) => console.log('\tPRODUCER: ', ...args);

// // import { transformClassNames } from '../utils/styles.utils';

// function* stylesGenerator(state = new Map<string, IStyleType>()) {
//   let transition = '';
//   producerLog('ARGS: ', transition);
//   while (true) {
//     if (transition !== '' && !state.has('1')) {
//       state.set('1', { a: 1 });
//     } else {
//       console.log('CACHE_HIT');
//     }
//     transition = yield state;
//     parseClassNames(transition);
//   }
// }

// const testStyles = ['flex-1', 'bg-black'];

// const generator = stylesGenerator();

// console.log('START: ', generator.next());
// console.log('ADD_CLASSES: ', generator.next(testStyles.join(' ')));
// console.log('ADD_CLASSES: ', generator.next(testStyles.join(' ')));
