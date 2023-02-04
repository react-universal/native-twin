import resolveTwConfig from 'tailwindcss/resolveConfig';
import { Config } from 'tailwindcss/types/config';

let initialized = false;
const setup = (twConfig: Config) => {
  let config: Config = { content: ['__'] };
  if (!initialized) {
    config = resolveTwConfig(twConfig);
    initialized = true;
  }
  return config;
};

export default setup;
