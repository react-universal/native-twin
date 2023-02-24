import { observable } from '@legendapp/state';
import type { Config } from 'tailwindcss';
import type { TComponentsSnapshot } from '../modules';
import type { IStyleType } from '../types/styles.types';

interface ITailwindState {
  userConfig: Config;
  resolvedConfig: Config;
}
const tailwindConfig = observable<ITailwindState>({
  userConfig: { content: ['__'] },
  resolvedConfig: { content: ['__'] },
});

const componentsStore = observable<{
  componentsState: TComponentsSnapshot;
  stylesCollection: Map<string, { generated: IStyleType }>;
}>({
  componentsState: {},
  stylesCollection: new Map(),
});

export { tailwindConfig, componentsStore };
