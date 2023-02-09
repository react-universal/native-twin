import { lens } from '@dhmk/zustand-lens';
import { produce } from 'immer';
import type { Config } from 'tailwindcss';
import resolveTwConfig from 'tailwindcss/resolveConfig';
import type { ITailwindStore } from '../store.types';
import type { ITailwindConfigStore } from './types';

const tailwindStoreSlice = lens<ITailwindConfigStore, ITailwindStore>((set) => ({
  config: { content: ['__'] },
  setConfig: () => {},
  setup: (twConfig: Config) => {
    // tw.setColorScheme(Appearance.getColorScheme());
    const tailwindConfig = resolveTwConfig(twConfig);
    set(
      produce((state: ITailwindConfigStore) => {
        state.config = tailwindConfig;
      }),
    );
  },
}));

export default tailwindStoreSlice;
