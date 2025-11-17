import * as Constants from './utils/constants.utils.js';

export { DocumentLanguageRegion } from './documents/common/LanguageRegion.model.js';
export {
  type DocumentsServiceShape,
  extractLanguageRegions,
  TwinLSPDocumentContext,
  twinLSPDocumentLayer,
} from './documents/LSPDocuments.service.js';
/** Documents Service */
export { TwinLSPDocument } from './documents/node/TwinLSPDocument.model.js';
export { TemplateTokenData, TemplateTokenWithText } from './lsp/twin/template-token.model.js';
export { languagePrograms } from './programs/index.js';
export { LSPConfigService } from './services/LSPConfig.service.js';
/** Twin Services */
export { NativeTwinManagerService } from './services/NativeTwinManager.service.js';
export type {
  AnyInternalTwinRule,
  InternalTwFn,
  InternalTwinConfig,
  InternalTwinThemeContext,
  TwinRuleCompletion,
} from './twin/models/native-twin.types.js';
/** Language Service */
export {
  getDocumentTemplatesColors,
  templateTokenToColorInfo,
} from './utils/language/colorInfo.utils.js';
export { getCompletionsForTokens } from './utils/language/completion.pipes.js';
export { filterTokensFromRules } from './utils/language/completions.maps.js';
export {
  getCompletionEntryDetailsDisplayParts,
  getDocumentationMarkdown,
} from './utils/language/language.utils.js';
export { completionRuleToQuickInfo } from './utils/language/quickInfo.utils.js';
export { getSheetEntryStyles } from './utils/sheet.utils.js';
export { parseTemplate } from './utils/twin/native-twin.parser.js';

// export { NativeTwinManager } from './utils/twin/twin.manager.js';

/** Vscode Client */
export { getDocumentLanguageLocations } from './extension/index.js';
/** Connection Service */
export { LSPConnectionService } from './services/LSPConnection.service.js';
export type { NativeTwinPluginConfiguration } from './utils/constants.utils.js';
export { DEFAULT_PLUGIN_CONFIG } from './utils/constants.utils.js';
/** Logger */
export { createLspLogger, loggerUtils } from './utils/lsp.logger.service.js';
export { NativeTwinManager } from './utils/twin/twin.manager.js';

export { Constants };
export { ExtensionConfigSchema } from './schemas/index.js';
export { TwinParserContext, TwinParserContextLive } from './twin/TwinParser.service.js';
export { TwinRuntimeContext, TwinRuntimeContextLive } from './twin/TwinRuntime.service.js';
