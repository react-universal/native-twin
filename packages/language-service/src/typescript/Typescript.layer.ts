import * as ConfigProvider from 'effect/ConfigProvider';
import * as Layer from 'effect/Layer';
import path from 'path';
import { TypescriptApiLive } from './TypescriptApi';
import { TypescriptUtilsLive } from './TypescriptUtils.service';

const configProvider = (configPath = path.join(process.cwd(), 'tsconfig.json')) =>
  ConfigProvider.fromJson({
    config: configPath,
  });

export const TypescriptLayer = Layer.mergeAll(TypescriptApiLive, TypescriptUtilsLive);

export const withTsConfigPathLayer = (configPath: string) =>
  Layer.setConfigProvider(configProvider(configPath)).pipe(Layer.merge(TypescriptLayer));
