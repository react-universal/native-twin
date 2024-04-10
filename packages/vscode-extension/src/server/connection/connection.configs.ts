import * as Data from 'effect/Data';

interface ServerConfig {
  readonly hasConfigurationCapability: boolean;
  readonly hasWorkspaceFolderCapability: boolean;
  readonly hasDiagnosticRelatedInformationCapability: boolean;
}

export class ServerConfigState extends Data.TaggedClass('ServerConfigState')<ServerConfig> {
  setConfig(values: ServerConfig) {
    return new ServerConfigState({ ...values });
  }
}
