import * as Layer from 'effect/Layer';
import { type JSXParser, JSXParserLive } from '../core/JSXParser.service';
import type { LSPConfig } from '../core/LanguageConfig.service';
import { TwinGraphLive } from '../core/TwinGraph.service';
import { type TwinParserContext, TwinParserContextLive } from '../core/TwinParser.service';
import { type TwinRuntimeContext, TwinRuntimeContextLive } from '../core/TwinRuntime.service';
import { type TypescriptUtils, TypescriptUtilsLive } from '../core/TypescriptUtils.service';

export type TwinLSPAdapterLayerIn =
  | TwinParserContext
  | TwinRuntimeContext
  | JSXParser
  | TypescriptUtils
  | LSPConfig;

export const LSPBaseLayerLive = Layer.empty.pipe(
  Layer.provideMerge(TwinGraphLive),
  Layer.provideMerge(JSXParserLive),
  Layer.provideMerge(TwinParserContextLive),
  Layer.provideMerge(TwinRuntimeContextLive),
  Layer.provideMerge(TypescriptUtilsLive),
);
