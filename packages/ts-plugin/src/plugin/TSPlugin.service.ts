import type { TwinConfigOptions } from '@native-twin/language-service';
import * as Context from 'effect/Context';
import * as Layer from 'effect/Layer';
import type ts from 'typescript';
import type {
  InternalTwFn,
  InternalTwinConfig,
  InternalTwinThemeContext,
} from '../native-twin/nativeTwin.config';

interface TSPluginContext {
  readonly plugin: {
    readonly ts: typeof ts;
    readonly info: ts.server.PluginCreateInfo;
    readonly config: TwinConfigOptions;
  };
  readonly tailwind: {
    readonly config: InternalTwinConfig;
    readonly tw: InternalTwFn;
    readonly context: InternalTwinThemeContext;
  };
}

export class TSPluginService extends Context.Tag('ts/template')<
  TSPluginService,
  TSPluginContext
>() {}

export const buildTSPluginService = (data: TSPluginContext) =>
  Layer.succeed(TSPluginService, TSPluginService.of(data));
