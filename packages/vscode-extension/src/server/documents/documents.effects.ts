import { ExtensionSettings } from "../../shared/extension.types";

function getDocumentSettings(resource: string): Promise<ExampleSettings> {
  if (!hasConfigurationCapability) {
    return Promise.resolve(globalSettings);
  }
  let result = documentSettings.get(resource);
  if (!result) {
    result = connection.workspace.getConfiguration({
      scopeUri: resource,
      section: 'languageServerExample',
    });
    documentSettings.set(resource, result);
  }
  return result;
}

/**
 * @category effects
 */
export function getDocumentSettings(resource: string, settings: ExtensionSettings, connection) {

}
