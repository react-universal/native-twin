import { Layer } from 'effect';
import { TypescriptApiLive, TypescriptUtilsLive } from '../../src/TS';

export const TestLayer = Layer.mergeAll(TypescriptApiLive, TypescriptUtilsLive);
