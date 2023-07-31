import { TextDocuments } from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { ExtensionSettings, globalConfig } from './_config-manager';
import { serverConnection } from './_connection-manager';

function createDocumentHandler() {
  const documentSettings: Map<string, Thenable<ExtensionSettings>> = new Map();
  // Create a simple text document manager.
  const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

  // Only keep settings for open documents
  documents.onDidClose((e) => {
    documentSettings.delete(e.document.uri);
  });

  // The content of a text document has changed. This event is emitted
  // when the text document first opened or when its content has changed.

  return { handler: documents, documentSettings, getDocumentSettings };

  function getDocumentSettings(resource: string): Thenable<ExtensionSettings> {
    if (!globalConfig.internalConfig.hasConfigurationCapability) {
      return Promise.resolve(globalConfig.extensionSettings);
    }
    let result = documentSettings.get(resource);
    if (!result) {
      result = serverConnection.workspace.getConfiguration({
        scopeUri: resource,
        section: 'styledLanguageTW',
      });
      documentSettings.set(resource, result);
    }
    return result;
  }
}

export const documents = createDocumentHandler();
