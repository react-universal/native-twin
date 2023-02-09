import { withLenses } from '@dhmk/zustand-lens';
import { create } from 'zustand';
import { componentsStoreSlice } from './components';
import type { ITailwindStore } from './store.types';
import { stylesStoreSlice } from './styles';
import tailwindStoreSlice from './tailwind/tailwind.store';

const useStore = create<ITailwindStore>()(
  withLenses({
    styles: stylesStoreSlice,
    tailwind: tailwindStoreSlice,
    components: componentsStoreSlice,
  }),
);

export { useStore };

// if (__DEV__) {
//   // @ts-expect-error
//   const connection = window?.__REDUX_DEVTOOLS_EXTENSION__?.connect({
//     name: 'Store',
//   });

//   connection?.init(useStore.getState());

//   useStore.subscribe((newState) => {
//     connection?.send('State', newState);
//   });
// }
