import type { Logger } from 'typescript-template-language-service-decorator';
import ts from 'typescript/lib/tsserverlibrary';
import { ConfigurationManager } from './configuration';

export class LanguageServiceLogger implements Logger {
  private readonly pluginInfo: ts.server.PluginCreateInfo;

  constructor(info: ts.server.PluginCreateInfo) {
    this.pluginInfo = info;
  }

  private sendMessage(message: string, kind: ts.server.Msg) {
    this.pluginInfo.project.projectService.logger.msg(
      `[${ConfigurationManager.pluginName}]: ${message}`,
      kind,
    );
  }

  log(message: string): void {
    this.sendMessage(message, ts.server.Msg.Info);
  }
  perf(message: string): void {
    this.sendMessage(message, ts.server.Msg.Perf);
  }
}
