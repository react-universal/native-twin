import { Appearance } from 'react-native';
import { lens } from '@dhmk/zustand-lens';
import { produce } from 'immer';
import { Config } from 'tailwindcss';
import resolveTwConfig from 'tailwindcss/resolveConfig';
import { create } from 'twrnc';
import type { ITailwindStore } from '../store.types';
import type { ITailwindConfigStore } from './types';

const tailwindStoreSlice = lens<ITailwindConfigStore, ITailwindStore>((set) => ({
  config: { content: ['__'] },
  setConfig: () => {},
  getStyles: create(),
  setup: (twConfig: Config) => {
    // @ts-expect-error
    const tw = create(twConfig);
    tw.setColorScheme(Appearance.getColorScheme());
    const tailwindConfig = resolveTwConfig(twConfig);
    console.log('TAILWIND_CONFIG: ', tailwindConfig);
    set(
      produce((state: ITailwindConfigStore) => {
        state.config = tailwindConfig;
        state.getStyles = tw;
      }),
    );
  },
}));

export default tailwindStoreSlice;
