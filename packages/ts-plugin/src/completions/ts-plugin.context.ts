import * as Context from 'effect/Context';
// import * as Effect from 'effect/Effect';
import ts from 'typescript/lib/tsserverlibrary';

export class TSPluginContext extends Context.Tag('ts/template')<
  TSPluginContext,
  {
    readonly ts: typeof ts;
    readonly info: ts.server.PluginCreateInfo;
  }
>() {}
