import { Config } from 'tailwindcss/types/config';
import { useStore } from '../store';

const setup = (twConfig: Config) => {
  useStore.getState().tailwind.setup(twConfig);
};

export default setup;
