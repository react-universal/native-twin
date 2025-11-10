import * as ConfigProvider from 'effect/ConfigProvider';
import * as Layer from 'effect/Layer';
import { TypescriptApiLive } from './TypescriptApi';
import { TypescriptUtilsLive } from './TypescriptUtils.service';

interface TwinTypescriptConfig {
  tsConfigPath: string;
  twinConfigPath: string;
}
const configProvider = (input: TwinTypescriptConfig) => ConfigProvider.fromJson(input);

export const TypescriptLayer = Layer.mergeAll(TypescriptApiLive, TypescriptUtilsLive);

export const createTSConfigLayer = (input: TwinTypescriptConfig) =>
  Layer.setConfigProvider(configProvider(input)).pipe(Layer.merge(TypescriptLayer));
