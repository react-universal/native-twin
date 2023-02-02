import { Platform } from 'react-native';
import rawCreate from './create';
import plugin from './plugin';
import type { TwConfig } from './tw-config';
import type { TailwindFn, RnColorScheme } from './types';

// Apply default config and inject RN Platform
const create = (twConfig: TwConfig = {}): TailwindFn => rawCreate(twConfig, Platform.OS);

export { create, plugin };
export type { TailwindFn, TwConfig, RnColorScheme };
export { useDeviceContext, useAppColorScheme } from './hooks';

const tailwind = create();

export default tailwind;
