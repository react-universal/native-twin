import { Layer } from 'effect';
import { TwinGraphLive, TypescriptApiLive, TypescriptUtilsLive } from '../../src/TS';

export const TestLayer = TypescriptApiLive.pipe(
  Layer.provideMerge(TwinGraphLive),
  Layer.provideMerge(TypescriptUtilsLive),
);
