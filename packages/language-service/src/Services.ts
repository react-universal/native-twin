import { JSXParser, JSXParserLive } from './core/JSXParser.service';
import { LSPConfig, parseLSPConfigInput } from './core/LSPConfig.service';
import {
  createTwinCompletions,
  LSPContext,
  type LSPTwinCompletionsResult,
  type TwinLSPCompletionDefinition,
} from './core/LSPContext.service';
import { TwinGraph, TwinGraphLive } from './core/TwinGraph.service';
import { TwinParserContext, toTwinParserResult } from './core/TwinParser.service';
import { TwinRuntimeContext, TwinRuntimeContextLive } from './core/TwinRuntime.service';
import {
  TypeScriptApi,
  TypeScriptProgram,
} from './core/TypescriptAPI.service';
import { TypescriptUtils, TypescriptUtilsLive } from './core/TypescriptUtils.service';
import { BaseTwinTextDocument } from './documents/common/BaseTwinDocument';
import {
  type DocumentsServiceShape,
  TwinLSPDocumentContext,
  twinLSPDocumentLayer,
} from './documents/LSPDocuments.service';
import { createLSPAdapterExecutor } from './internal/LSPAdapterSpec';
import { LSPBaseLayerLive, type TwinLSPAdapterLayerIn } from './internal/RunnerLayer';

export { TypeScriptApi, TypeScriptProgram, TypescriptUtils };

export { LSPBaseLayerLive };

export { classNameCompletions } from './completions/jsxCompletions';
export {
  LSPConfig,
  TwinLSPDocumentContext,
  twinLSPDocumentLayer,
  TypescriptUtilsLive,
  LSPContext,
  BaseTwinTextDocument,
  parseLSPConfigInput,
  createLSPAdapterExecutor,
  createTwinCompletions,
};

export {
  JSXParser,
  TwinRuntimeContext,
  TwinParserContext,
  TwinRuntimeContextLive,
  toTwinParserResult,
  JSXParserLive,
  TwinGraph,
  TwinGraphLive,
};

export type {
  TwinLSPCompletionDefinition,
  LSPTwinCompletionsResult,
  DocumentsServiceShape,
  TwinLSPAdapterLayerIn,
};
