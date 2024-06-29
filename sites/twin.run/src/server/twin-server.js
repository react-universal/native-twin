import {
  ProposedFeatures,
  createConnection,
  TextDocuments,
} from 'vscode-languageserver/node.js';
import * as Option from 'effect/Option';
import Documents from '@native-twin/language-service/build/documents/index.js';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { NativeTwinManagerService } from '@native-twin/language-service';

const scriptExec = process.argv[2];
if (scriptExec === '--stdio') {
  const connection = createConnection(ProposedFeatures.all);
  const twinService = new NativeTwinManagerService();
  twinService.loadUserFile();
  const documentsHandler = new Documents.DocumentsService(
    new TextDocuments(TextDocument),
    {
      attributes: [],
      tags: ['css'],
    },
  );
  connection.onInitialize((x) => {
    console.log('XXXX: ', x);
    return {
      capabilities: {
        completionProvider: {
          resolveProvider: false,
        },
      },
    };
  });
  connection.onCompletion((x) => {
    console.log('COMPLETION_PARAMS: ', x);

    const doc = Option.Do.pipe(
      Option.bind('document', () => documentsHandler.getDocument(x.textDocument)),
      Option.let('regions', ({ document }) => document.getLanguageRegions()),

      Option.getOrElse(() => []),
    );
    console.log('DOC: ', doc);

    return {
      isIncomplete: true,
      items: [
        {
          label: 'asd',
        },
      ],
    };
  });
  documentsHandler.setupConnection(connection);
  connection.listen();
}
