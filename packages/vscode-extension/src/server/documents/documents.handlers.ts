import * as Effect from 'effect/Effect';
import * as Option from 'effect/Option';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { Diagnostic, DiagnosticSeverity } from 'vscode-languageserver/node';
import { configurationSection } from '../../client/extension/extension.constants';
import { DocumentsService } from './documents.context';
import { ConnectionService } from '../connection/connection.service';

export const getDocument = (uri: string) => {
  return DocumentsService.pipe(Effect.flatMap((x) => Option.fromNullable(x.get(uri))));
};

export function getDocumentSettings(resource: string) {
  return Effect.gen(function* ($) {
    const connectionRef = yield* $(ConnectionService);
    const connection = yield* $(connectionRef.connectionRef.get)
    const result = yield* $(
      Effect.promise(() =>
        connection.workspace.getConfiguration({
          scopeUri: resource,
          section: configurationSection,
        }),
      ),
    );
    return result;
  });
}

export function validateTextDocument(textDocument: TextDocument) {
  return Effect.gen(function* ($) {
    const settings = yield* $(getDocumentSettings(textDocument.uri));

    // The validator creates diagnostics for all uppercase words length 2 and more
    const text = textDocument.getText();
    const pattern = /\b[A-Z]{2,}\b/g;
    let m: RegExpExecArray | null;

    let problems = 0;
    const diagnostics: Diagnostic[] = [];

    while ((m = pattern.exec(text)) && problems < settings.maxNumberOfProblems) {
      problems++;
      const diagnostic: Diagnostic = {
        severity: DiagnosticSeverity.Warning,
        range: {
          start: textDocument.positionAt(m.index),
          end: textDocument.positionAt(m.index + m[0].length),
        },
        message: `${m[0]} is all uppercase.`,
        source: 'ex',
      };
      diagnostic.relatedInformation = [
        {
          location: {
            uri: textDocument.uri,
            range: Object.assign({}, diagnostic.range),
          },
          message: 'Spelling matters',
        },
        {
          location: {
            uri: textDocument.uri,
            range: Object.assign({}, diagnostic.range),
          },
          message: 'Particularly for names',
        },
      ];
      diagnostics.push(diagnostic);
    }
    return diagnostics;
  });
}
