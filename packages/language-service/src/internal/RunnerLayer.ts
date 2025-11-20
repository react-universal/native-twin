import * as Layer from 'effect/Layer';
import { type JSXParser, JSXParserLive } from '../core/JSXParser.service';
import type * as LSPConfig from '../core/LanguageConfig.service';
import type * as TsApi from '../core/TypescriptAPI.service';
import { type TypescriptUtils, TypescriptUtilsLive } from '../core/TypescriptUtils.service';
import { type TwinParserContext, TwinParserContextLive } from '../twin/TwinParser.service';
import { type TwinRuntimeContext, TwinRuntimeContextLive } from '../twin/TwinRuntime.service';

export type TwinPluginLayerReq =
  | LSPConfig.TypeScriptPluginConfig
  | TsApi.TypeScriptApi
  | TsApi.TypeScriptProgram
  | TypescriptUtils
  | TwinParserContext
  | TwinRuntimeContext
  | JSXParser;

export const LSPMainLayer = Layer.empty.pipe(
  Layer.provideMerge(JSXParserLive),
  Layer.provideMerge(TwinParserContextLive),
  Layer.provideMerge(TwinRuntimeContextLive),
  Layer.provideMerge(TypescriptUtilsLive),
);
