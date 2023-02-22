import { observable } from '@legendapp/state';
import type { Config } from 'tailwindcss';

interface ITailwindState {
  userConfig: Config;
  resolvedConfig: Config;
}
const tailwindConfig = observable<ITailwindState>({
  userConfig: { content: ['__'] },
  resolvedConfig: { content: ['__'] },
});

export { tailwindConfig };
