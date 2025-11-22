import { createLSPAdapterExecutor } from '#internal/LSPAdapterSpec.js';
import { JSXParser } from './core/JSXParser.service';
import { LSPConfig, parseLSPConfigInput } from './core/LanguageConfig.service';
import {
  createTwinCompletions,
  LSPContext,
  type LSPTwinCompletionsResult,
  type TwinLSPCompletionDefinition,
} from './core/LSP';
import { TwinGraph } from './core/TwinGraph.service';
import {
  type TwinParsedClasses,
  TwinParserContext,
  toTwinParserResult,
} from './core/TwinParser.service';
import { TwinRuntimeContext } from './core/TwinRuntime.service';
import {
  createCustomProgram,
  TypeScriptApi,
  TypeScriptProgram,
} from './core/TypescriptAPI.service';
import { TypescriptUtils } from './core/TypescriptUtils.service';
import { LSPBaseLayerLive } from './internal/RunnerLayer';

export const Typescript = {
  TypeScriptApi,
  TypeScriptProgram,
  createCustomProgram,
  TypescriptUtils,
};

export const LSP = {
  LSPConfig,
  LSPContext,
  LSPBaseLayerLive,
  parseLSPConfigInput,
  createLSPAdapterExecutor,
  createTwinCompletions,
};

export const Parsers = {
  JSXParser,
  TwinRuntimeContext,
  TwinParserContext,
  toTwinParserResult,
  TwinGraph,
};

export interface LSP {
  LSPTwinCompletionsResult: LSPTwinCompletionsResult;
  TwinLSPCompletionDefinition: TwinLSPCompletionDefinition;
}

export interface Parsers {
  TwinParsedClasses: TwinParsedClasses;
}
