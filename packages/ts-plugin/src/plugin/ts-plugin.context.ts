import * as Context from 'effect/Context';
// import * as Effect from 'effect/Effect';
import ts from 'typescript/lib/tsserverlibrary';

export class TSPluginService extends Context.Tag('ts/template')<
  TSPluginService,
  {
    readonly ts: typeof ts;
    readonly info: ts.server.PluginCreateInfo;
  }
>() {}
