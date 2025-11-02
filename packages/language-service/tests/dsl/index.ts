import { Layer } from 'effect';
import { TypescriptApiLive } from '../../src/TS';

export const TestLayer = Layer.mergeAll(TypescriptApiLive);
