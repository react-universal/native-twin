import ts from 'typescript/lib/tsserverlibrary';
import { Suggestion } from './types';

export class LanguageServiceContext {
  completionEntries = new Map<string, Suggestion>();
  pluginInfo: ts.server.PluginCreateInfo;
  constructor(info: ts.server.PluginCreateInfo) {
    this.pluginInfo = info;
  }
}
