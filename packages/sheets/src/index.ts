import { default as ComponentStyleSheet } from './sheets/ComponentStyleSheet';
import globalStyleSheet, { setTailwindConfig } from './sheets/GlobalStyleSheet';

export { mergeTWClasses } from './utils/mergeClasses';
export { setTailwindConfig, globalStyleSheet, ComponentStyleSheet };
export type { IStyleType, IStyleTuple } from './types';
