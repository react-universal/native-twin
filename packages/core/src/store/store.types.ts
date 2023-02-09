import type { IComponentsStore } from './components';
import type { IStylesStore } from './styles';
import type { ITailwindConfigStore } from './tailwind';

export type ITailwindStore = {
  tailwind: ITailwindConfigStore;
  styles: IStylesStore;
  components: IComponentsStore;
};
