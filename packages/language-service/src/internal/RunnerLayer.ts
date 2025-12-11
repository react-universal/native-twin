import * as Layer from 'effect/Layer';
import type { LSPConfig } from '../core/LSPConfig.service';
import { TwinGraphLive } from '../core/TwinGraph.service';
import { type TwinParserContext, TwinParserContextLive } from '../core/TwinParser.service';
import { type TwinRuntimeContext, TwinRuntimeContextLive } from '../core/TwinRuntime.service';
import { type JSXParser, JSXParserLive } from '../Typescript/JSXParser.service';
import { type TypescriptUtils, TypescriptUtilsLive } from '../Typescript/TypescriptUtils.service';

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
