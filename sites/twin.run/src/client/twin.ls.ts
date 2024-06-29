import * as vscode from 'vscode';
// import { TextDocument } from 'vscode-languageserver-textdocument';
import { clientManager } from './client.manager';
import { CompletionsProvider, HoverProvider } from './language-service';

export function createLanguageClient() {
  // const languageService: any = {};
  // const pendingValidationRequests = new Map<string, number>();

  vscode.languages.registerCompletionItemProvider(
    clientManager.fileManager.languageId,
    new CompletionsProvider(),
  );

  vscode.languages.registerHoverProvider(
    clientManager.fileManager.languageId,
    new HoverProvider(),
  );

  // const validate = () => {
  //   const document = clientManager.fileManager.createDocument(
  //     clientManager.fileManager.focusDocument!,
  //   );
  //   cleanPendingValidation(document);
  //   pendingValidationRequests.set(
  //     document.uri,
  //     window.setTimeout(() => {
  //       pendingValidationRequests.delete(document.uri);
  //       doValidate(document);
  //     }),
  //   );
  // };

  // const cleanPendingValidation = (document: TextDocument) => {
  //   const request = pendingValidationRequests.get(document.uri);
  //   if (request !== undefined) {
  //     window.clearTimeout(request);
  //     pendingValidationRequests.delete(document.uri);
  //   }
  // };

  // const diagnosticCollection = vscode.languages.createDiagnosticCollection('json');
  // const doValidate = (document: TextDocument) => {
  //   if (document.getText().length === 0) {
  //     cleanDiagnostics();
  //     return;
  //   }
  //   const jsonDocument = document;

  //   languageService.doValidation(document, jsonDocument).then(async (pDiagnostics: any) => {
  //     const diagnostics =
  //       await clientManager.protocolConverter.asDiagnostics(pDiagnostics);
  //     diagnosticCollection.set(
  //       vscode.Uri.parse(clientManager.fileManager.codeUri),
  //       diagnostics,
  //     );
  //   });
  // };

  // const cleanDiagnostics = () => {
  //   diagnosticCollection.clear();
  // };

  // clientManager.wrapper.getTextModels()?.text?.onDidChangeContent(() => {
  //   validate();
  // });
}
