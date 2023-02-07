import type { IComponentsStore } from './components';
import type { IStylesStore } from './styles';
import { ITailwindConfigStore } from './tailwind';

export type ITailwindStore = {
  tailwind: ITailwindConfigStore;
  styles: IStylesStore;
  components: IComponentsStore;
};
