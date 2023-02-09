import type { Config } from 'tailwindcss/types/config';
import { useStore } from '../store';
import '../twind';

const setup = (twConfig: Config) => {
  if (!useStore.getState().tailwind.config.theme) {
    useStore.getState().tailwind.setup(twConfig);
  }
};

export default setup;
