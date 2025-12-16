import * as Layer from 'effect/Layer';
import type { LSPConfig } from '../core/LSPContext.service';
import { type TwinParserContext, TwinParserContextLive } from '../core/TwinParser.service';
import { type JSXParser, JSXParserLive } from '../Typescript/JSXParser.service';
import { TwinGraphLive } from '../Typescript/TwinGraph.service';
import { type TypescriptUtils, TypescriptUtilsLive } from '../Typescript/TypescriptUtils.service';

export type TwinLSPAdapterLayerIn =
  | TwinParserContext
  | JSXParser
  | TypescriptUtils
  | LSPConfig;

export const LSPBaseLayerLive = Layer.empty.pipe(
  Layer.provideMerge(TwinGraphLive),
  Layer.provideMerge(JSXParserLive),
  Layer.provideMerge(TwinParserContextLive),
  Layer.provideMerge(TypescriptUtilsLive),
);
