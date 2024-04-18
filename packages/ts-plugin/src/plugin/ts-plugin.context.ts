import * as Context from 'effect/Context';
import * as Layer from 'effect/Layer';
// import * as Effect from 'effect/Effect';
import ts from 'typescript/lib/tsserverlibrary';
import {
  InternalTwFn,
  InternalTwinConfig,
  InternalTwinThemeContext,
} from '../intellisense/intellisense.config';
import { NativeTwinPluginConfiguration } from '../plugin.types';

interface TSPluginContext {
  readonly plugin: {
    readonly ts: typeof ts;
    readonly info: ts.server.PluginCreateInfo;
    readonly config: NativeTwinPluginConfiguration;
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
