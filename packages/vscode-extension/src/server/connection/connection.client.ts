import * as Data from 'effect/Data';

export class GlobalState extends Data.TaggedClass('GlobalState')<{
  readonly hasConfigurationCapability: boolean;
  readonly hasWorkspaceFolderCapability: boolean;
  readonly hasDiagnosticRelatedInformationCapability: boolean;
}> {
  setState(running: GlobalState) {
    return new GlobalState({ ...this, ...running });
  }
}
